import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { GoogleGenAI } from '@google/genai';
import {
  findUserByEmail,
  findUserByUsername,
  findUserByEmailOrUsername,
  findUserById,
  createUser,
  updateUserProfile,
  upgradeUserToSeller,
  promoteUserToAdmin,
  getAllUsers,
  getAllSellers,
  createVerificationToken,
  createPasswordResetToken,
  consumeVerificationToken,
  createRefreshToken,
  consumeRefreshToken,
  getEmailOutbox,
  isAccountLocked,
  recordFailedLoginAttempt,
  clearFailedLoginAttempts,
} from './src/server/authDb';
import {
  generateToken,
  requireAuth,
  requireSeller,
  requireAdmin,
  validateSellerActivationCodeOnServer,
  AuthenticatedRequest,
  securityHeadersMiddleware,
  authRateLimiter,
} from './src/server/rbacMiddleware';


dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(cookieParser());
app.use(securityHeadersMiddleware);

// Helper to get GoogleGenAI client with required headers
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Bazaario Marketplace System Context
const BAZAARIO_MARKETPLACE_CONTEXT = `
You are an AI assistant inside Bazaario, a premier multi-vendor e-commerce marketplace connecting millions of customers with trusted independent sellers globally.

Key Platform Information:
- Categories: Electronics & Gadgets, Fashion & Apparel, Home & Living, Beauty & Health, Books & Collectibles, B2B Bulk Supplies.
- Payment Methods: Credit/Debit Cards (Stripe), Apple Pay / Google Pay, Mobile Banking (bKash, Easypaisa, GCash), and Cash on Delivery (COD).
- Shipping & Logistics: Standard Delivery (3-5 days), Express Air (1-2 days), and COD Courier. Free shipping on orders over $50.
- Customer Policies: 14-day hassle-free return window, instant refund to Wallet or source payment, verified buyer reviews.
- Seller / Vendor Features: Commission rates range from 5% to 15% depending on category. Sellers can use bulk CSV upload, flash sale promotions, and AI listing optimization.
`;

// 1. Multi-turn AI Chatbot Endpoint (Shopping Concierge, Seller Strategy Advisor, Fast Support)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, mode = 'concierge', userContext } = req.body;
    
    // Choose model based on PRD requirements:
    // - gemini-3.1-pro-preview for complex tasks (Seller Strategy & Market Analysis)
    // - gemini-3.5-flash for general tasks (Shopping Concierge & Stylist)
    // - gemini-3.1-flash-lite for fast tasks (Quick Support Triage & FAQ)
    let model = 'gemini-3.5-flash';
    let roleTitle = 'Bazaario Shopping Concierge';
    let systemInstruction = '';

    if (mode === 'seller_advisor') {
      model = 'gemini-3.1-pro-preview';
      roleTitle = 'Bazaario Enterprise Seller Strategy Consultant';
      systemInstruction = `${BAZAARIO_MARKETPLACE_CONTEXT}
Your role is the "Enterprise Seller Strategy Consultant" for Bazaario sellers and vendors.
- Help sellers write high-converting SEO titles and persuasive product descriptions.
- Analyze market pricing, offer discount strategy advice, and suggest bundle deals.
- Advise on reducing return rates, improving seller rating scorecards, and managing inventory.
- Provide data-driven, strategic e-commerce advice with clear bullet points.
- Model used: gemini-3.1-pro-preview (for complex reasoning).`;
    } else if (mode === 'fast_support') {
      model = 'gemini-3.1-flash-lite';
      roleTitle = 'Bazaario Fast Support Triage';
      systemInstruction = `${BAZAARIO_MARKETPLACE_CONTEXT}
Your role is "Bazaario Fast Support Triage" for quick, direct answers.
- Give crisp, accurate answers about Bazaario shipping policies, Cash on Delivery limits, returns, warranty, and order tracking.
- Keep answers under 120 words, well-structured, and helpful.
- Model used: gemini-3.1-flash-lite (for low-latency fast answers).`;
    } else {
      // default: concierge
      model = 'gemini-3.5-flash';
      roleTitle = 'Bazaario Shopping Concierge';
      systemInstruction = `${BAZAARIO_MARKETPLACE_CONTEXT}
Your role is the "Bazaario Shopping Concierge" for shoppers and gift hunters.
- Recommend products from Bazaario categories (Electronics, Fashion, Home & Living, Beauty, Books, B2B).
- Help compare specs, explain value for money, and suggest complementary items.
- Be enthusiastic, polite, and format recommendations clearly with bold item names and estimated prices.
- Model used: gemini-3.5-flash (for general conversational shopping).`;
    }

    const ai = getGenAIClient();
    if (!ai) {
      // Fallback demo response if API key is missing
      const lastUserMsg = messages?.[messages.length - 1]?.text || 'Hello';
      return res.json({
        text: getFallbackChatResponse(mode, lastUserMsg),
        modelUsed: `${model} (Demo Mode - Configure GEMINI_API_KEY for live AI)`,
        roleTitle,
      });
    }

    // Convert message history to prompt string or conversation text
    const conversationHistory = messages
      .map((m: { role: string; text: string }) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n\n');

    const fullPrompt = `${systemInstruction}\n\nHere is the conversation so far:\n${conversationHistory}\n\nAssistant:`;

    const response = await ai.models.generateContent({
      model,
      contents: fullPrompt,
      config: {
        temperature: mode === 'seller_advisor' ? 0.4 : 0.7,
      },
    });

    const replyText = response.text || 'I am here to help you navigate Bazaario! How can I assist you today?';
    res.json({
      text: replyText,
      modelUsed: model,
      roleTitle,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/chat:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate chat response',
      text: 'I apologize, but I encountered a momentary connection hiccup. Please try sending your message again!',
    });
  }
});

// 2. AI Image Analysis Endpoint (MUST use gemini-3.1-pro-preview)
app.post('/api/gemini/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', mode = 'visual_search', userPrompt } = req.body;

    // Requirement: "You MUST add image understanding to the app using model gemini-3.1-pro-preview"
    const model = 'gemini-3.1-pro-preview';

    const ai = getGenAIClient();
    if (!ai || !imageBase64) {
      // Return realistic fallback structured JSON for demo mode
      return res.json({
        success: true,
        modelUsed: `${model} (Demo Mode - Live key optional)`,
        analysis: getFallbackImageAnalysis(mode),
      });
    }

    // Clean base64 if it includes data URI prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    let promptText = '';
    if (mode === 'seller_listing') {
      promptText = `You are Bazaario's AI Seller Listing Assistant. Analyze this product photo and generate optimized e-commerce catalog metadata.
Return ONLY valid JSON matching this structure:
{
  "title": "SEO optimized product title (max 70 chars)",
  "category": "One of: Electronics & Gadgets, Fashion & Apparel, Home & Living, Beauty & Health, Books & Collectibles, B2B Bulk Supplies",
  "suggestedPriceUSD": 89.99,
  "description": "2-3 sentence compelling product description highlighting quality and utility",
  "keyAttributes": ["Attribute 1", "Attribute 2", "Attribute 3"],
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "imageQualityScore": 92,
  "imageQualityFeedback": "Brief comment on lighting, background, and clarity for seller"
}`;
    } else {
      // default: visual_search
      promptText = `You are Bazaario's AI Visual Product Search & Inspector. Analyze this product image uploaded by a user.
Identify the item, suggest matching Bazaario categories, estimate reasonable market price range, and provide keywords for searching our marketplace.
Return ONLY valid JSON matching this structure:
{
  "detectedProduct": "Clear name of the item (e.g., Wireless Noise-Canceling Headphones)",
  "category": "One of: Electronics & Gadgets, Fashion & Apparel, Home & Living, Beauty & Health, Books & Collectibles, B2B Bulk Supplies",
  "priceRangeUSD": "$45 - $120",
  "styleAttributes": ["Modern", "Matte Finish", "Ergonomic", "Premium"],
  "matchingKeywords": ["wireless", "headphones", "bluetooth", "audio", "noise-canceling"],
  "authenticityCheck": "Looks like an authentic, high-build-quality retail item with clean finishing.",
  "recommendationSummary": "We recommend searching Bazaario's Electronics & Gadgets category for top-rated sellers offering this exact specification with free 2-day shipping."
}`;
    }

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const textOutput = response.text || '{}';
    let parsedJson = {};
    try {
      parsedJson = JSON.parse(textOutput);
    } catch (e) {
      parsedJson = {
        rawOutput: textOutput,
        category: 'Electronics & Gadgets',
        detectedProduct: 'Detected Marketplace Item',
        priceRangeUSD: '$29 - $149',
        matchingKeywords: ['bazaario', 'top-rated', 'featured'],
      };
    }

    res.json({
      success: true,
      modelUsed: model,
      analysis: parsedJson,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/analyze-image:', err);
    res.status(500).json({
      error: err.message || 'Image analysis failed',
      analysis: getFallbackImageAnalysis('visual_search'),
    });
  }
});

// Helper for fallback chat responses when API key is not set
function getFallbackChatResponse(mode: string, lastUserMsg: string): string {
  const q = lastUserMsg.toLowerCase();
  if (mode === 'seller_advisor') {
    if (q.includes('title') || q.includes('seo') || q.includes('description')) {
      return `Here is an SEO-optimized title suggestion for your listing:\n\n**"Ultra-Slim Wireless Mechanical Keyboard – RGB Backlit, Hot-Swappable Switches, Multi-Device Bluetooth 5.2"**\n\n**Why this converts well on Bazaario:**\n• Front-loads high-intent search terms ("Ultra-Slim", "Wireless Mechanical Keyboard").\n• Highlights key differentiators ("Hot-Swappable", "Bluetooth 5.2") which increase click-through rate by up to 24% in Electronics.`;
    }
    return `Welcome to Bazaario Seller Advisor! To maximize your GMV this quarter, I recommend:
1. **Enroll in our Weekend Flash Sale** – listings with discounts over 15% get 3.2x more home feed impressions.
2. **Optimize SKU Photos** – use white or neutral studio backgrounds to boost conversion by 18%.
3. **Offer COD (Cash on Delivery)** – in emerging markets, COD increases checkout completion by 41%.`;
  } else if (mode === 'fast_support') {
    if (q.includes('return') || q.includes('refund')) {
      return `**Bazaario Return Policy:**\n• **14-Day Window:** Return any item within 14 days of delivery.\n• **Free Pickup:** Schedule courier pickup from your Orders page.\n• **Fast Refund:** Refunds process instantly to your Bazaario Wallet or within 3-5 days to original card/bank account.`;
    }
    return `**Bazaario Fast Support:**\n• **Standard Shipping:** 3-5 business days ($3.99, free over $50).\n• **Express Air:** 1-2 business days ($8.99).\n• **Cash on Delivery (COD):** Supported up to $500 per order across all major delivery zones.`;
  } else {
    // concierge
    if (q.includes('recommend') || q.includes('best') || q.includes('headphone') || q.includes('watch')) {
      return `Here are our top-rated recommendations on **Bazaario** right now:

1. **AeroSound Pro ANC Wireless Headphones** ($129.99) – ★ 4.9 (420 reviews)
   • *Why you'll love it:* 40-hour battery life, studio-grade noise cancellation, and instant pairing.
2. **Chronos Horizon Smartwatch 45mm** ($189.00) – ★ 4.8 (190 reviews)
   • *Why you'll love it:* Sapphire glass, AMOLED always-on display, and 10-day battery.
3. **Nordic Minimalist Oak Desk Lamp** ($49.99) – ★ 4.7 (88 reviews)
   • *Why you'll love it:* Touch dimming, wireless phone charger base, warm ambient light.

Would you like me to apply our **WELCOME20** promo code to your cart for 20% off?`;
    }
    return `Welcome to Bazaario! I'm your **Shopping Concierge**. Whether you're looking for flagship electronics, artisanal home goods, fashion apparel, or B2B bulk supplies, I can help you find top-rated sellers, compare specs, or check delivery times. What are you shopping for today?`;
  }
}

// Helper for fallback image analysis when API key is not set
function getFallbackImageAnalysis(mode: string): any {
  if (mode === 'seller_listing') {
    return {
      title: 'AeroSound Pro Wireless ANC Headphones - Matte Slate',
      category: 'Electronics & Gadgets',
      suggestedPriceUSD: 129.99,
      description: 'Experience studio-quality audio with hybrid active noise cancellation, 40-hour battery life, and ultra-plush memory foam earcups. Designed for commuters and audiophiles alike.',
      keyAttributes: ['Active Noise Cancellation', '40-Hour Battery', 'Bluetooth 5.3', 'USB-C Fast Charging'],
      tags: ['headphones', 'wireless', 'anc', 'audio', 'bluetooth'],
      imageQualityScore: 94,
      imageQualityFeedback: 'Excellent lighting and clean background contrast. High readiness for featured Bazaario homepage listing.',
    };
  }
  return {
    detectedProduct: 'Premium Wireless Over-Ear Headphones (Matte Black/Slate)',
    category: 'Electronics & Gadgets',
    priceRangeUSD: '$99 - $149',
    styleAttributes: ['Matte Finish', 'Ergonomic Earcups', 'Minimalist Scandinavian Design', 'Premium Build'],
    matchingKeywords: ['wireless headphones', 'active noise canceling', 'bluetooth headset', 'over-ear audio'],
    authenticityCheck: 'High-quality retail finish detected with genuine branding accents and clean molding.',
    recommendationSummary: 'We found 4 matching Bazaario sellers offering this style with Free 2-Day Express Delivery and Cash on Delivery (COD) available.',
  };
}

// ==========================================
// BAZAARIO ENTERPRISE RBAC & AUTHENTICATION APIs
// ==========================================

// Password strength validation helper
function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number.' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&* etc).' };
  }
  return { valid: true };
}

// 1. User Registration -> Always defaults to 'customer' role, sends verification email
app.post('/api/auth/register', authRateLimiter, (req, res) => {
  const { full_name, name, username, email, phone, password, confirmPassword, acceptTerms } = req.body || {};
  const actualName = (full_name || name || '').trim();
  const actualUser = (username || '').trim().toLowerCase();
  const actualEmail = (email || '').trim().toLowerCase();

  if (!actualName || !actualUser || !actualEmail || !password) {
    res.status(400).json({ error: 'Full name, username, email, and password are required.' });
    return;
  }

  if (!acceptTerms) {
    res.status(400).json({ error: 'You must accept the Bazaario Terms & Conditions to register.' });
    return;
  }

  if (password !== confirmPassword && confirmPassword !== undefined) {
    res.status(400).json({ error: 'Passwords do not match.' });
    return;
  }

  if (!/^[a-zA-Z0-9_-]{3,20}$/.test(actualUser)) {
    res.status(400).json({ error: 'Username must be 3-20 alphanumeric characters, underscores, or hyphens.' });
    return;
  }

  const strength = validatePasswordStrength(password);
  if (!strength.valid) {
    res.status(400).json({ error: strength.message });
    return;
  }

  if (findUserByEmail(actualEmail)) {
    res.status(409).json({ error: 'An account with this email address already exists.' });
    return;
  }

  if (findUserByUsername(actualUser)) {
    res.status(409).json({ error: 'This username is already taken. Please choose another username.' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);

  // createUser guarantees role='customer' and seller_enabled=false, email_verified=false
  const newUser = createUser({
    full_name: actualName,
    username: actualUser,
    email: actualEmail,
    phone: phone || '',
    password_hash,
  });

  const verificationToken = createVerificationToken(newUser.id, newUser.email);

  res.status(201).json({
    status: 'success',
    message: 'Account registered successfully. We have sent a verification link to your email address.',
    verificationPreview: {
      token: verificationToken.token,
      link: `/verify-email?token=${verificationToken.token}`,
      note: 'Developer Preview: In AI Studio without external SMTP, use this token/link to complete email verification instantly!',
    },
    user: {
      id: newUser.id,
      full_name: newUser.full_name,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      seller_enabled: newUser.seller_enabled,
      email_verified: newUser.email_verified,
      created_at: newUser.created_at,
    },
  });
});

// 2. Email Verification Endpoint
app.post('/api/auth/verify-email', (req, res) => {
  const { token } = req.body || {};
  if (!token) {
    res.status(400).json({ error: 'Verification token is required.' });
    return;
  }

  const consumed = consumeVerificationToken(token, 'email_verification');
  if (!consumed) {
    res.status(400).json({ error: 'Invalid or expired email verification token. Please request a new verification link.' });
    return;
  }

  const updated = updateUserProfile(consumed.userId, { email_verified: true });
  if (!updated) {
    res.status(404).json({ error: 'User account not found.' });
    return;
  }

  const jwtToken = generateToken(updated);
  const refreshToken = createRefreshToken(updated.id);

  res.cookie('bazaario_token', jwtToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400000,
  });
  res.cookie('bazaario_refresh', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 86400000,
  });

  res.json({
    status: 'success',
    message: 'Your email address has been verified successfully!',
    token: jwtToken,
    refreshToken,
    user: {
      id: updated.id,
      full_name: updated.full_name,
      name: updated.name,
      username: updated.username,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      seller_enabled: updated.seller_enabled,
      email_verified: updated.email_verified,
      profile_photo: updated.profile_photo,
      created_at: updated.created_at,
    },
  });
});

// 3. Resend Email Verification
app.post('/api/auth/resend-verification', (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    res.status(400).json({ error: 'Email address is required.' });
    return;
  }

  const user = findUserByEmail(email);
  if (!user) {
    // For security against email enumeration, return generic success
    res.json({ status: 'success', message: 'If an account exists with that email, a new verification link has been sent.' });
    return;
  }

  if (user.email_verified) {
    res.status(400).json({ error: 'This email address is already verified. You can log in.' });
    return;
  }

  const tokenObj = createVerificationToken(user.id, user.email);
  res.json({
    status: 'success',
    message: 'A new verification email has been sent.',
    verificationPreview: {
      token: tokenObj.token,
      link: `/verify-email?token=${tokenObj.token}`,
    },
  });
});

// 4. User Login -> Supports Email OR Username, Brute Force protection, bcrypt check, email verification check
app.post('/api/auth/login', authRateLimiter, (req, res) => {
  const { identifier, email, username, password } = req.body || {};
  const loginId = (identifier || email || username || '').trim();

  if (!loginId || !password) {
    res.status(400).json({ error: 'Please enter your email/username and password.' });
    return;
  }

  const lockStatus = isAccountLocked(loginId);
  if (lockStatus.locked) {
    const minLeft = Math.ceil((lockStatus.lockUntil! - Date.now()) / 60000);
    res.status(429).json({
      error: `Account temporarily locked due to multiple failed login attempts. Try again in ${minLeft} minute(s).`,
      code: 'ACCOUNT_LOCKED',
    });
    return;
  }

  const user = findUserByEmailOrUsername(loginId);
  if (!user) {
    recordFailedLoginAttempt(loginId);
    res.status(401).json({ error: 'Invalid email/username or password.' });
    return;
  }

  // Verify password with bcrypt
  const validPassword = bcrypt.compareSync(password, user.password_hash);
  if (!validPassword) {
    const attempt = recordFailedLoginAttempt(loginId);
    res.status(401).json({
      error: 'Invalid email/username or password.',
      attemptsLeft: attempt.attemptsLeft,
    });
    return;
  }

  // Clear failed attempts upon successful password check
  clearFailedLoginAttempts(loginId);

  // Check email verification
  if (!user.email_verified) {
    const tokenObj = createVerificationToken(user.id, user.email);
    res.status(403).json({
      error: 'Please verify your email address before logging in.',
      code: 'EMAIL_NOT_VERIFIED',
      email: user.email,
      verificationPreview: {
        token: tokenObj.token,
        link: `/verify-email?token=${tokenObj.token}`,
      },
    });
    return;
  }

  updateUserProfile(user.id, { last_login: new Date().toISOString() });

  const jwtToken = generateToken(user);
  const refreshToken = createRefreshToken(user.id);

  res.cookie('bazaario_token', jwtToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400000,
  });
  res.cookie('bazaario_refresh', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 86400000,
  });

  res.json({
    status: 'success',
    token: jwtToken,
    refreshToken,
    user: {
      id: user.id,
      full_name: user.full_name,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      seller_enabled: user.seller_enabled,
      email_verified: user.email_verified,
      profile_photo: user.profile_photo,
      created_at: user.created_at,
      last_login: user.last_login,
    },
  });
});

// 5. Refresh JWT Session
app.post('/api/auth/refresh', (req, res) => {
  const refreshToken = req.cookies?.bazaario_refresh || req.body?.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ error: 'Refresh token required.' });
    return;
  }

  const userId = consumeRefreshToken(refreshToken);
  if (!userId) {
    res.status(401).json({ error: 'Refresh token expired or invalid.' });
    return;
  }

  const user = findUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User account not found.' });
    return;
  }

  const jwtToken = generateToken(user);
  const newRefreshToken = createRefreshToken(user.id);

  res.cookie('bazaario_token', jwtToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400000,
  });
  res.cookie('bazaario_refresh', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 86400000,
  });

  res.json({
    status: 'success',
    token: jwtToken,
    refreshToken: newRefreshToken,
  });
});

// 6. Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('bazaario_token');
  res.clearCookie('bazaario_refresh');
  res.json({ status: 'success', message: 'Logged out successfully.' });
});

// 7. Forgot Password (generates 30-min reset token)
app.post('/api/auth/forgot-password', authRateLimiter, (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    res.status(400).json({ error: 'Please provide your account email address.' });
    return;
  }

  const user = findUserByEmail(email);
  if (!user) {
    res.json({ status: 'success', message: 'If an account is associated with that email, we have sent a password reset link.' });
    return;
  }

  const resetToken = createPasswordResetToken(user.id, user.email);

  res.json({
    status: 'success',
    message: 'We have sent a password reset instructions link to your email address.',
    resetPreview: {
      token: resetToken.token,
      link: `/reset-password?token=${resetToken.token}`,
      note: 'Developer Preview: In AI Studio without external SMTP, use this link to reset your password instantly!',
    },
  });
});

// 8. Reset Password Endpoint
app.post('/api/auth/reset-password', (req, res) => {
  const { token, newPassword, confirmPassword } = req.body || {};
  if (!token || !newPassword) {
    res.status(400).json({ error: 'Reset token and new password are required.' });
    return;
  }

  if (newPassword !== confirmPassword && confirmPassword !== undefined) {
    res.status(400).json({ error: 'Passwords do not match.' });
    return;
  }

  const strength = validatePasswordStrength(newPassword);
  if (!strength.valid) {
    res.status(400).json({ error: strength.message });
    return;
  }

  const consumed = consumeVerificationToken(token, 'password_reset');
  if (!consumed) {
    res.status(400).json({ error: 'This password reset link is invalid or has expired (30 minute limit).' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(newPassword, salt);

  const updated = updateUserProfile(consumed.userId, { password_hash });
  if (!updated) {
    res.status(404).json({ error: 'User account not found.' });
    return;
  }

  res.json({
    status: 'success',
    message: 'Your password has been reset successfully. You can now log in with your new password.',
  });
});

// 9. Get Current Authenticated User (Protected via requireAuth)
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = findUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  res.json({
    user: {
      id: user.id,
      full_name: user.full_name,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      seller_enabled: user.seller_enabled,
      email_verified: user.email_verified,
      profile_photo: user.profile_photo,
      created_at: user.created_at,
      last_login: user.last_login,
    },
  });
});

// 10. Update User Profile (Protected via requireAuth)
app.put('/api/auth/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  const { full_name, name, phone, profile_photo, email } = req.body || {};
  const user = findUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ error: 'User account not found.' });
    return;
  }

  const updates: Partial<Pick<typeof user, 'full_name' | 'phone' | 'profile_photo' | 'email_verified'>> = {};
  if (full_name !== undefined) updates.full_name = full_name;
  else if (name !== undefined) updates.full_name = name;
  if (phone !== undefined) updates.phone = phone;
  if (profile_photo !== undefined) updates.profile_photo = profile_photo;

  // Prompt: "Email cannot be changed unless re-verified."
  let verificationPreview = undefined;
  if (email && email.trim().toLowerCase() !== user.email.toLowerCase()) {
    const existingEmail = findUserByEmail(email);
    if (existingEmail && existingEmail.id !== user.id) {
      res.status(409).json({ error: 'That email address is already taken by another account.' });
      return;
    }
    updates.email_verified = false;
    const tokenObj = createVerificationToken(user.id, email.trim().toLowerCase());
    verificationPreview = {
      token: tokenObj.token,
      link: `/verify-email?token=${tokenObj.token}`,
      note: 'Email address updated. Please verify your new email address.',
    };
  }

  const updated = updateUserProfile(user.id, updates);
  res.json({
    status: 'success',
    message: 'Profile updated successfully.',
    verificationPreview,
    user: {
      id: updated!.id,
      full_name: updated!.full_name,
      name: updated!.name,
      username: updated!.username,
      email: updated!.email,
      phone: updated!.phone,
      role: updated!.role,
      seller_enabled: updated!.seller_enabled,
      email_verified: updated!.email_verified,
      profile_photo: updated!.profile_photo,
      created_at: updated!.created_at,
      last_login: updated!.last_login,
    },
  });
});

// 11. Change Password (Protected via requireAuth)
app.put('/api/auth/change-password', requireAuth, (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required.' });
    return;
  }

  if (newPassword !== confirmPassword && confirmPassword !== undefined) {
    res.status(400).json({ error: 'New passwords do not match.' });
    return;
  }

  const user = findUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ error: 'User account not found.' });
    return;
  }

  // Validate current password with bcrypt
  const matches = bcrypt.compareSync(currentPassword, user.password_hash);
  if (!matches) {
    res.status(401).json({ error: 'Incorrect current password.' });
    return;
  }

  const strength = validatePasswordStrength(newPassword);
  if (!strength.valid) {
    res.status(400).json({ error: strength.message });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(newPassword, salt);

  updateUserProfile(user.id, { password_hash });
  res.json({
    status: 'success',
    message: 'Your password has been changed securely.',
  });
});

// 12. Email Outbox Log (Developer/Preview Helper to inspect sent verification/reset links)
app.get('/api/auth/email-outbox', (_req, res) => {
  res.json({
    status: 'success',
    outbox: getEmailOutbox(),
  });
});

// 13. Seamless 1-Click Demo Login (For AI Studio Instant Role Testing)
app.post('/api/auth/demo-login', (req, res) => {
  const { role } = req.body || {};
  const targetEmail =
    role === 'admin'
      ? 'admin@bazaario.com'
      : role === 'seller'
      ? 'seller@bazaario.com'
      : 'customer@bazaario.com';

  const user = findUserByEmail(targetEmail);
  if (!user) {
    res.status(404).json({ error: 'Seeded demo user not found.' });
    return;
  }

  const jwtToken = generateToken(user);
  const refreshToken = createRefreshToken(user.id);

  res.cookie('bazaario_token', jwtToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400000,
  });
  res.cookie('bazaario_refresh', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 86400000,
  });

  res.json({
    status: 'success',
    token: jwtToken,
    refreshToken,
    user: {
      id: user.id,
      full_name: user.full_name,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      seller_enabled: user.seller_enabled,
      email_verified: user.email_verified,
      profile_photo: user.profile_photo,
      created_at: user.created_at,
      last_login: user.last_login,
    },
  });
});

// 4. Secure Seller Activation (Server-side validation ONLY)
app.post('/api/seller/activate', requireAuth, (req: AuthenticatedRequest, res) => {
  const { code } = req.body || {};
  
  // Validate activation code securely on server
  if (!validateSellerActivationCodeOnServer(code)) {
    res.status(400).json({
      error: 'Invalid activation code.',
      message: 'Invalid activation code.',
    });
    return;
  }

  const upgraded = upgradeUserToSeller(req.user!.id);
  if (!upgraded) {
    res.status(404).json({ error: 'User account not found.' });
    return;
  }

  // Issue new JWT with updated seller role & permissions
  const newToken = generateToken(upgraded);
  res.json({
    message: 'Seller mode activated successfully.',
    token: newToken,
    user: {
      id: upgraded.id,
      name: upgraded.name,
      email: upgraded.email,
      role: upgraded.role,
      seller_enabled: upgraded.seller_enabled,
      created_at: upgraded.created_at,
    },
  });
});

// ==========================================
// PROTECTED SELLER ENDPOINTS (requireSeller)
// ==========================================
app.get('/api/seller/dashboard', requireSeller, (req: AuthenticatedRequest, res) => {
  res.json({
    status: 'success',
    sellerId: req.user!.id,
    storeName: req.user!.name,
    role: req.user!.role,
    metrics: {
      totalRevenueUSD: 124850.75,
      activeOrdersCount: 28,
      inventorySKUs: 142,
      sellerRating: 4.9,
    },
  });
});

app.get('/api/seller/analytics', requireSeller, (req: AuthenticatedRequest, res) => {
  res.json({
    status: 'success',
    dailyRevenue: [1200, 1850, 1420, 2100, 3400, 2900, 4100],
    topCategories: ['Electronics & Gadgets', 'Home & Living', 'Fashion & Apparel'],
  });
});

app.get('/api/seller/orders', requireSeller, (req: AuthenticatedRequest, res) => {
  res.json({
    status: 'success',
    orders: [
      { id: 'ORD-8821', customer: 'Elena Rostova', totalUSD: 149.99, status: 'Processing', date: '2026-07-30' },
      { id: 'ORD-8820', customer: 'Marcus Vance', totalUSD: 319.50, status: 'Shipped', date: '2026-07-29' },
    ],
  });
});

// Protect any other /api/seller/* route against customer/unauthorized access
app.all('/api/seller/*', requireSeller, (req: AuthenticatedRequest, res) => {
  res.json({ status: 'ok', route: req.path, accessedByRole: req.user!.role });
});

// ==========================================
// PROTECTED ADMIN ENDPOINTS (requireAdmin)
// ==========================================
app.get('/api/admin/users', requireAdmin, (req: AuthenticatedRequest, res) => {
  res.json({
    status: 'success',
    users: getAllUsers(),
  });
});

app.get('/api/admin/sellers', requireAdmin, (req: AuthenticatedRequest, res) => {
  res.json({
    status: 'success',
    sellers: getAllSellers(),
  });
});

app.post('/api/admin/promote', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { targetUserId } = req.body || {};
  if (!targetUserId) {
    res.status(400).json({ error: 'targetUserId is required to promote a user to Admin.' });
    return;
  }

  const promoted = promoteUserToAdmin(targetUserId);
  if (!promoted) {
    res.status(404).json({ error: 'Target user not found.' });
    return;
  }

  res.json({
    status: 'success',
    message: `User ${promoted.name} (${promoted.email}) has been promoted to Admin by ${req.user!.email}.`,
    user: {
      id: promoted.id,
      name: promoted.name,
      email: promoted.email,
      role: promoted.role,
      seller_enabled: promoted.seller_enabled,
    },
  });
});

// Protect any other /api/admin/* route against non-admin access (Customer/Seller)
app.all('/api/admin/*', requireAdmin, (req: AuthenticatedRequest, res) => {
  res.json({ status: 'ok', route: req.path, accessedByRole: req.user!.role });
});

// Mount Vite middleware for development or serve dist for production
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupViteOrStatic().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bazaario Server running on http://0.0.0.0:${PORT}`);
  });
});
