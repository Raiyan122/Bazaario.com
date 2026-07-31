/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Bazaario Enterprise Authentication & Identity Pages
 * Inspired by Stripe, Shopify, Apple, and Notion.
 * Includes Login, Register, Forgot Password, Reset Password, Verify Email, Profile, Change Password,
 * and an Email Outbox Inspector for AI Studio previewing.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Key,
  ArrowLeft,
  LogOut,
  Sparkles,
  Check,
  RefreshCw,
  X,
  Store,
  Inbox,
  ExternalLink,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { AppRole, SentEmailMessage } from '../../types';

export type AuthViewType =
  | 'login'
  | 'register'
  | 'forgot_password'
  | 'reset_password'
  | 'verify_email'
  | 'profile'
  | 'change_password';

interface AuthContainerProps {
  initialView?: AuthViewType;
  onNavigateHome?: () => void;
  tokenParam?: string;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({
  initialView = 'login',
  onNavigateHome,
  tokenParam = '',
}) => {
  const [currentView, setCurrentView] = useState<AuthViewType>(initialView);
  const [resetToken, setResetToken] = useState<string>(tokenParam);
  const [verifyTokenInput, setVerifyTokenInput] = useState<string>(tokenParam);

  // When initialView prop changes, sync view
  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {currentView === 'login' && (
            <LoginView
              key="login"
              onSwitchView={(v) => setCurrentView(v)}
              onSuccess={onNavigateHome}
            />
          )}
          {currentView === 'register' && (
            <RegisterView
              key="register"
              onSwitchView={(v) => setCurrentView(v)}
              onSuccess={() => setCurrentView('login')}
            />
          )}
          {currentView === 'forgot_password' && (
            <ForgotPasswordView
              key="forgot"
              onSwitchView={(v) => setCurrentView(v)}
              onTokenReceived={(tk) => {
                setResetToken(tk);
                setCurrentView('reset_password');
              }}
            />
          )}
          {currentView === 'reset_password' && (
            <ResetPasswordView
              key="reset"
              token={resetToken}
              onSwitchView={(v) => setCurrentView(v)}
              onSuccess={() => setCurrentView('login')}
            />
          )}
          {currentView === 'verify_email' && (
            <VerifyEmailView
              key="verify"
              token={verifyTokenInput}
              onSwitchView={(v) => setCurrentView(v)}
              onSuccess={onNavigateHome}
            />
          )}
          {currentView === 'profile' && (
            <ProfileView
              key="profile"
              onSwitchView={(v) => setCurrentView(v)}
            />
          )}
          {currentView === 'change_password' && (
            <ChangePasswordView
              key="change_pwd"
              onSwitchView={(v) => setCurrentView(v)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ==========================================
 * 1. LOGIN PAGE
 * ========================================== */
const LoginView: React.FC<{
  onSwitchView: (view: AuthViewType) => void;
  onSuccess?: () => void;
}> = ({ onSwitchView, onSuccess }) => {
  const { login, demoLogin, user } = useMarketplace();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationNote, setVerificationNote] = useState<{ token: string; link: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setVerificationNote(null);
    setLoading(true);

    const res = await login({ identifier, password });
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Login failed');
      if (res.verificationPreview) {
        setVerificationNote(res.verificationPreview);
      }
      return;
    }

    if (onSuccess) onSuccess();
  };

  const handleDemoFill = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-[#E0D8CC] rounded-[24px] p-8 sm:p-10 shadow-sm space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-[#F5F2ED] border border-[#E0D8CC] flex items-center justify-center mx-auto text-[#5A5A40]">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#3D3D35]">Sign in to Bazaario</h1>
        <p className="text-xs text-[#A89F91]">
          Access your shopper wishlist, orders, or seller dashboard securely.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <div className="space-y-1">
            <p className="font-semibold">{error}</p>
            {verificationNote && (
              <div className="text-[11px] bg-white p-2 rounded border border-red-100 mt-1.5">
                <p className="font-semibold text-[#5A5A40]">Developer Verification Link:</p>
                <button
                  type="button"
                  onClick={() => onSwitchView('verify_email')}
                  className="text-blue-600 underline text-left break-all font-mono"
                >
                  {verificationNote.link}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Fill / Demo Accounts Bar */}
      <div className="bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B705C] flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Quick Test Credentials
          </span>
          <span className="text-[10px] text-[#A89F91]">One-click fill</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => handleDemoFill('customer@bazaario.com', 'customerPassword2026!')}
            className="px-2 py-1.5 rounded-lg bg-white border border-[#E0D8CC] hover:bg-[#F5F2ED] text-[11px] font-semibold text-[#5A5A40] text-center transition"
          >
            Shopper
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('seller@bazaario.com', 'sellerPassword2026!')}
            className="px-2 py-1.5 rounded-lg bg-white border border-[#E0D8CC] hover:bg-[#F5F2ED] text-[11px] font-semibold text-[#5A5A40] text-center transition"
          >
            Seller
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('admin@bazaario.com', 'adminPassword2026!')}
            className="px-2 py-1.5 rounded-lg bg-white border border-[#E0D8CC] hover:bg-[#F5F2ED] text-[11px] font-semibold text-[#5A5A40] text-center transition"
          >
            Admin
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
            Email or Username
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#A89F91]" />
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. customer@bazaario.com or alex_rivera"
              className="w-full pl-10 pr-4 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-medium text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
              Password
            </label>
            <button
              type="button"
              onClick={() => onSwitchView('forgot_password')}
              className="text-xs text-[#5A5A40] hover:underline font-medium"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#A89F91]" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your secure password"
              className="w-full pl-10 pr-10 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-medium text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-[#A89F91] hover:text-[#5A5A40]"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-[#E0D8CC] text-center">
        <p className="text-xs text-[#A89F91]">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => onSwitchView('register')}
            className="font-bold text-[#5A5A40] hover:underline"
          >
            Create Customer Account
          </button>
        </p>
      </div>
    </motion.div>
  );
};

/* ==========================================
 * 2. REGISTRATION PAGE
 * ========================================== */
const RegisterView: React.FC<{
  onSwitchView: (view: AuthViewType) => void;
  onSuccess: () => void;
}> = ({ onSwitchView, onSuccess }) => {
  const { register } = useMarketplace();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewLink, setPreviewLink] = useState<string | null>(null);

  // Password strength checklist metrics
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const strengthScore =
    (hasMinLength ? 1 : 0) +
    (hasUppercase ? 1 : 0) +
    (hasLowercase ? 1 : 0) +
    (hasNumber ? 1 : 0) +
    (hasSpecial ? 1 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setPreviewLink(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (strengthScore < 5) {
      setError('Please satisfy all password strength requirements below.');
      return;
    }

    setLoading(true);
    const res = await register({
      full_name: fullName,
      username,
      email,
      phone,
      password,
      confirmPassword,
      acceptTerms,
    });
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Registration failed.');
      return;
    }

    setSuccessMsg('Account registered successfully! Please verify your email to continue.');
    if (res.verificationPreview?.link) {
      setPreviewLink(res.verificationPreview.link);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-[#E0D8CC] rounded-[24px] p-8 sm:p-10 shadow-sm space-y-6"
    >
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-serif font-bold text-[#3D3D35]">Create Your Customer Account</h1>
        <p className="text-xs text-[#A89F91]">
          Join Bazaario to browse millions of products, track orders, and unlock verified reviews.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          {previewLink && (
            <div className="bg-white p-2.5 rounded border border-emerald-100 text-[11px]">
              <p className="font-semibold text-[#5A5A40] mb-1">AI Studio Email Verification Link:</p>
              <button
                type="button"
                onClick={() => onSwitchView('verify_email')}
                className="text-blue-600 underline font-mono break-all text-left"
              >
                {previewLink}
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-[#A89F91]" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full pl-10 pr-3 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-medium text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
              Username * (Unique)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs text-[#A89F91] font-bold">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="alex_rivera"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-medium text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
              Email Address * (Unique)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#A89F91]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-medium text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-[#A89F91]" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-3 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-medium text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#A89F91]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, A-Z, a-z, 0-9, !@#"
                className="w-full pl-10 pr-10 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-medium text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#A89F91] hover:text-[#5A5A40]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#A89F91]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-3 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-medium text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
          </div>
        </div>

        {/* Password Strength Meter & Live Checklist */}
        <div className="bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#5A5A40]">Password Security:</span>
            <span
              className={`text-[11px] font-bold uppercase ${
                strengthScore === 5 ? 'text-emerald-600' : strengthScore >= 3 ? 'text-amber-600' : 'text-red-500'
              }`}
            >
              {strengthScore === 5
                ? 'Strong & Compliant'
                : strengthScore >= 3
                ? 'Moderate'
                : 'Weak'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-[#E0D8CC] rounded-full overflow-hidden flex gap-1">
            <div
              className={`h-full transition-all duration-300 ${
                strengthScore === 5
                  ? 'w-full bg-emerald-500'
                  : strengthScore >= 3
                  ? 'w-3/5 bg-amber-500'
                  : 'w-1/5 bg-red-500'
              }`}
            />
          </div>

          {/* Requirement Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1 text-[10px]">
            <div className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 font-semibold' : 'text-[#A89F91]'}`}>
              {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              <span>8+ characters</span>
            </div>
            <div className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-600 font-semibold' : 'text-[#A89F91]'}`}>
              {hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              <span>1 Uppercase (A-Z)</span>
            </div>
            <div className={`flex items-center gap-1 ${hasLowercase ? 'text-emerald-600 font-semibold' : 'text-[#A89F91]'}`}>
              {hasLowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              <span>1 Lowercase (a-z)</span>
            </div>
            <div className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-600 font-semibold' : 'text-[#A89F91]'}`}>
              {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              <span>1 Number (0-9)</span>
            </div>
            <div className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-600 font-semibold' : 'text-[#A89F91]'}`}>
              {hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              <span>1 Special (!@#$)</span>
            </div>
          </div>
        </div>

        {/* Terms and conditions checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            required
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 rounded border-[#E0D8CC] text-[#5A5A40] focus:ring-[#5A5A40]"
          />
          <span className="text-xs text-[#6B705C]">
            I accept the <strong className="text-[#3D3D35]">Bazaario Customer Terms of Service</strong>, Privacy Policy, and Agree to receive order notifications.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || strengthScore < 5 || !acceptTerms}
          className="w-full py-3 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Registering Account...</span>
            </>
          ) : (
            <span>Create Customer Account</span>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-[#E0D8CC] text-center">
        <p className="text-xs text-[#A89F91]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onSwitchView('login')}
            className="font-bold text-[#5A5A40] hover:underline"
          >
            Sign In Here
          </button>
        </p>
      </div>
    </motion.div>
  );
};

/* ==========================================
 * 3. FORGOT PASSWORD PAGE
 * ========================================== */
const ForgotPasswordView: React.FC<{
  onSwitchView: (view: AuthViewType) => void;
  onTokenReceived: (token: string) => void;
}> = ({ onSwitchView, onTokenReceived }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewToken, setPreviewToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'Request failed.');
        return;
      }

      setMessage(data.message);
      if (data.resetPreview?.token) {
        setPreviewToken(data.resetPreview.token);
      }
    } catch (err: any) {
      setLoading(false);
      setError('Network error. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-[#E0D8CC] rounded-[24px] p-8 sm:p-10 shadow-sm space-y-6"
    >
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-full bg-[#F5F2ED] border border-[#E0D8CC] flex items-center justify-center mx-auto text-[#5A5A40]">
          <Key className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#3D3D35]">Forgot Your Password?</h1>
        <p className="text-xs text-[#A89F91]">
          Enter your registered email address and we will send you a secure 30-minute reset link.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2">
          <p className="font-semibold">{message}</p>
          {previewToken && (
            <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-2">
              <p className="font-bold text-[#5A5A40] text-[11px]">Developer Instant Preview:</p>
              <button
                type="button"
                onClick={() => onTokenReceived(previewToken)}
                className="w-full py-2 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-lg text-xs font-semibold transition"
              >
                Proceed to Reset Password Now →
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#A89F91]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@bazaario.com"
              className="w-full pl-10 pr-3 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-medium text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
        >
          {loading ? 'Sending Reset Link...' : 'Send Password Reset Link'}
        </button>
      </form>

      <div className="pt-4 border-t border-[#E0D8CC] text-center">
        <button
          type="button"
          onClick={() => onSwitchView('login')}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#5A5A40] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </button>
      </div>
    </motion.div>
  );
};

/* ==========================================
 * 4. RESET PASSWORD PAGE
 * ========================================== */
const ResetPasswordView: React.FC<{
  token: string;
  onSwitchView: (view: AuthViewType) => void;
  onSuccess: () => void;
}> = ({ token: initialToken, onSwitchView, onSuccess }) => {
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const strengthScore =
    (hasMinLength ? 1 : 0) +
    (hasUppercase ? 1 : 0) +
    (hasLowercase ? 1 : 0) +
    (hasNumber ? 1 : 0) +
    (hasSpecial ? 1 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (strengthScore < 5) {
      setError('Please satisfy all password strength requirements.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'Password reset failed.');
        return;
      }
      setSuccess(true);
    } catch (err: any) {
      setLoading(false);
      setError('Network error. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-[#E0D8CC] rounded-[24px] p-8 sm:p-10 shadow-sm space-y-6"
    >
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-serif font-bold text-[#3D3D35]">Reset Your Password</h1>
        <p className="text-xs text-[#A89F91]">
          Choose a new secure password for your Bazaario account.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {error}
        </div>
      )}

      {success ? (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="font-serif font-bold text-base text-emerald-900">
            Password Updated Successfully!
          </h3>
          <p className="text-xs text-emerald-700">
            Your account password has been changed. You can now log in securely.
          </p>
          <button
            type="button"
            onClick={onSuccess}
            className="w-full py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-semibold transition"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
              Reset Token *
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token or click link from email outbox"
              className="w-full px-3.5 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-mono text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
              New Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#A89F91]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full pl-10 pr-10 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-medium text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#A89F91]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
              Confirm New Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#A89F91]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full pl-10 pr-3 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-medium text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || strengthScore < 5}
            className="w-full py-3 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'Resetting Password...' : 'Save New Password'}
          </button>
        </form>
      )}
    </motion.div>
  );
};

/* ==========================================
 * 5. VERIFY EMAIL PAGE
 * ========================================== */
const VerifyEmailView: React.FC<{
  token: string;
  onSwitchView: (view: AuthViewType) => void;
  onSuccess: () => void;
}> = ({ token: initialToken, onSwitchView, onSuccess }) => {
  const { verifyEmail } = useMarketplace();
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput) {
      setError('Please enter a verification token.');
      return;
    }
    setError(null);
    setLoading(true);

    const res = await verifyEmail(tokenInput.trim());
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Verification failed.');
      return;
    }
    setSuccess(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-[#E0D8CC] rounded-[24px] p-8 sm:p-10 shadow-sm space-y-6"
    >
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-full bg-[#F5F2ED] border border-[#E0D8CC] flex items-center justify-center mx-auto text-[#5A5A40]">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#3D3D35]">Verify Your Email Address</h1>
        <p className="text-xs text-[#A89F91]">
          Paste the verification token sent to your inbox to activate your Bazaario account.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {error}
        </div>
      )}

      {success ? (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="font-serif font-bold text-base text-emerald-900">
            Email Verified Successfully!
          </h3>
          <p className="text-xs text-emerald-700">
            Your Bazaario account is now active. You have full customer access!
          </p>
          <button
            type="button"
            onClick={onSuccess}
            className="w-full py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-semibold transition"
          >
            Continue to Marketplace
          </button>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
              Verification Token *
            </label>
            <input
              type="text"
              required
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="e.g. vfy_1738... or click link from email outbox"
              className="w-full px-3.5 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-mono text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Email & Activate Account'}
          </button>
        </form>
      )}

      <div className="pt-4 border-t border-[#E0D8CC] text-center">
        <button
          type="button"
          onClick={() => onSwitchView('login')}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#5A5A40] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </button>
      </div>
    </motion.div>
  );
};

/* ==========================================
 * 6. USER PROFILE & SECURITY PAGE
 * ========================================== */
const ProfileView: React.FC<{
  onSwitchView: (view: AuthViewType) => void;
}> = ({ onSwitchView }) => {
  const { user, updateProfile, logout, role } = useMarketplace();
  const [fullName, setFullName] = useState(user?.full_name || user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profile_photo || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [verificationNote, setVerificationNote] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setProfilePhoto(user.profile_photo || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setVerificationNote(null);
    setLoading(true);

    const res = await updateProfile({
      full_name: fullName,
      phone,
      email,
      profile_photo: profilePhoto,
    });
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Profile update failed.');
      return;
    }

    setSuccessMsg('Your profile has been saved successfully.');
    if (res.verificationPreview) {
      setVerificationNote(res.verificationPreview);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center bg-white border border-[#E0D8CC] rounded-[24px] space-y-4">
        <p className="text-sm font-medium text-[#5A5A40]">Please sign in to view your profile.</p>
        <button
          onClick={() => onSwitchView('login')}
          className="px-5 py-2.5 bg-[#5A5A40] text-white rounded-full text-xs font-semibold"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-[#E0D8CC] rounded-[24px] p-8 sm:p-10 shadow-sm space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E0D8CC] pb-6">
        <div className="flex items-center gap-4">
          <img
            src={
              profilePhoto ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            }
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#5A5A40]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-bold text-[#3D3D35]">{fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#E0D8CC] text-[#5A5A40]">
                {role}
              </span>
            </div>
            <p className="text-xs text-[#A89F91]">@{user.username || 'user'} • {user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSwitchView('change_password')}
            className="px-4 py-2 rounded-xl border border-[#E0D8CC] hover:bg-[#F5F2ED] text-[#5A5A40] text-xs font-semibold transition"
          >
            Change Password
          </button>
          <button
            type="button"
            onClick={() => logout()}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          {verificationNote && (
            <div className="bg-white p-2.5 rounded border border-emerald-100 text-[11px]">
              <p className="font-semibold text-[#5A5A40]">Email Verification Required:</p>
              <button
                type="button"
                onClick={() => onSwitchView('verify_email')}
                className="text-blue-600 underline font-mono break-all text-left mt-1"
              >
                {verificationNote.link}
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-medium text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-medium text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
              Account Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-medium text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
              Profile Avatar URL
            </label>
            <input
              type="url"
              value={profilePhoto}
              onChange={(e) => setProfilePhoto(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-medium text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
        >
          {loading ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </form>
    </motion.div>
  );
};

/* ==========================================
 * 7. CHANGE PASSWORD PAGE
 * ========================================== */
const ChangePasswordView: React.FC<{
  onSwitchView: (view: AuthViewType) => void;
}> = ({ onSwitchView }) => {
  const { changePassword } = useMarketplace();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const strengthScore =
    (hasMinLength ? 1 : 0) +
    (hasUppercase ? 1 : 0) +
    (hasLowercase ? 1 : 0) +
    (hasNumber ? 1 : 0) +
    (hasSpecial ? 1 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (strengthScore < 5) {
      setError('Please satisfy all password strength rules.');
      return;
    }

    setLoading(true);
    const res = await changePassword({ currentPassword, newPassword, confirmPassword });
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Password change failed.');
      return;
    }
    setSuccess(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-[#E0D8CC] rounded-[24px] p-8 sm:p-10 shadow-sm space-y-6"
    >
      <div className="flex items-center justify-between border-b border-[#E0D8CC] pb-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-[#3D3D35]">Change Security Password</h1>
          <p className="text-xs text-[#A89F91]">
            Update your account password using bcrypt-validated security.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSwitchView('profile')}
          className="text-xs font-bold text-[#5A5A40] hover:underline"
        >
          ← Back to Profile
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {error}
        </div>
      )}

      {success ? (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="font-serif font-bold text-base text-emerald-900">
            Password Changed Successfully!
          </h3>
          <p className="text-xs text-emerald-700">
            Your new password is now active across all Bazaario sessions.
          </p>
          <button
            type="button"
            onClick={() => onSwitchView('profile')}
            className="w-full py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-semibold transition"
          >
            Return to Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-3.5 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-medium text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
              New Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#A89F91]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full pl-10 pr-10 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-medium text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#A89F91]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
              Confirm New Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-3.5 py-2.5 bg-[#FDFCF8] border border-[#E0D8CC] rounded-xl text-xs font-medium text-[#3D3D35] focus:outline-none focus:border-[#5A5A40]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || strengthScore < 5}
            className="w-full py-3 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      )}
    </motion.div>
  );
};

/* ==========================================
 * 8. EMAIL OUTBOX INSPECTOR MODAL (FOR AI STUDIO PREVIEW)
 * ========================================== */
export const EmailOutboxModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectLink: (link: string) => void;
}> = ({ isOpen, onClose, onSelectLink }) => {
  const [messages, setMessages] = useState<SentEmailMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOutbox = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/email-outbox');
      const data = await res.json();
      if (data.outbox) {
        setMessages(data.outbox);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOutbox();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#FDFCF8] border border-[#E0D8CC] rounded-[24px] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-xl"
      >
        <div className="p-6 bg-white border-b border-[#E0D8CC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5A5A40] text-white flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#3D3D35]">
                Bazaario Security Email Inbox
              </h2>
              <p className="text-xs text-[#A89F91]">
                Developer preview simulator — inspect sent verification &amp; reset links.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOutbox}
              className="p-2 rounded-full hover:bg-[#F5F2ED] text-[#5A5A40]"
              title="Refresh inbox"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#F5F2ED] text-[#A89F91] hover:text-[#3D3D35]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {messages.length === 0 ? (
            <div className="p-12 text-center text-[#A89F91] space-y-2">
              <Inbox className="w-12 h-12 mx-auto opacity-30" />
              <p className="text-sm font-semibold">No emails sent yet</p>
              <p className="text-xs">Register an account or trigger a password reset to see sent emails here.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-white border border-[#E0D8CC] rounded-xl p-4 space-y-3 shadow-sm hover:border-[#5A5A40]/50 transition"
              >
                <div className="flex items-center justify-between border-b border-[#E0D8CC] pb-2">
                  <span className="text-xs font-bold text-[#5A5A40] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> To: {msg.to}
                  </span>
                  <span className="text-[10px] text-[#A89F91] font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#3D3D35]">{msg.subject}</h4>
                  <p className="text-xs text-[#6B705C] mt-1">{msg.message}</p>
                </div>

                {(msg.verificationLink || msg.resetLink) && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectLink(msg.verificationLink || msg.resetLink || '');
                        onClose();
                      }}
                      className="px-4 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>
                        {msg.type === 'email_verification'
                          ? 'Open Verification Link'
                          : 'Open Password Reset Link'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};
