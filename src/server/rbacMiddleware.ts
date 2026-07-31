import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { findUserById, UserRecord, RoleType } from './authDb';

// Secret key for JWT signing & verification
export const JWT_SECRET = process.env.JWT_SECRET || 'bazaario-enterprise-secure-jwt-secret-2026';

// Server-side ONLY activation code for upgrading from Customer to Seller.
// This is never exposed to frontend JavaScript, HTML, local storage, cookies, or API responses.
const VALID_SELLER_ACTIVATION_CODES = new Set([
  'SELLER-2026-PRO',
  'BAZAARIO-SELLER-99',
  'SELL-ON-BAZAARIO',
]);

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    name: string;
    full_name: string;
    role: RoleType;
    seller_enabled: boolean;
    email_verified: boolean;
  };
  cookies: any;
}

/**
 * Generate a secure JWT containing user ID, role, seller status, and email verified status.
 */
export function generateToken(user: UserRecord): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.full_name,
      role: user.role,
      seller_enabled: user.seller_enabled,
      email_verified: user.email_verified,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Server-side activation code validation.
 * Must be checked exclusively on the backend.
 */
export function validateSellerActivationCodeOnServer(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const normalized = code.trim().toUpperCase();
  return VALID_SELLER_ACTIVATION_CODES.has(normalized);
}

/**
 * Enterprise Security Headers Middleware (XSS, CSRF protection headers, NoSniff, FrameGuard)
 */
export function securityHeadersMiddleware(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  next();
}

/**
 * Rate Limiter for Authentication Endpoints (Brute Force Protection)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many authentication attempts from this IP address. Please wait 15 minutes before retrying.',
  },
});

/**
 * requireAuth middleware:
 * Verifies JWT token from HTTP-only cookie (bazaario_token), Authorization header (Bearer <token>), or x-auth-token.
 * Returns 401 Unauthorized if token is missing or invalid.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const altHeader = req.headers['x-auth-token'];
  const cookieToken = req.cookies?.bazaario_token;

  let token = '';
  if (cookieToken && typeof cookieToken === 'string') {
    token = cookieToken;
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (typeof altHeader === 'string' && altHeader) {
    token = altHeader;
  }

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token required to access this resource.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      username: string;
      name: string;
      role: RoleType;
      seller_enabled: boolean;
      email_verified?: boolean;
    };

    // Confirm user still exists in database and role hasn't been revoked
    const dbUser = findUserById(decoded.id);
    if (!dbUser) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Account no longer exists.',
      });
      return;
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      name: dbUser.full_name,
      full_name: dbUser.full_name,
      role: dbUser.role,
      seller_enabled: dbUser.seller_enabled,
      email_verified: dbUser.email_verified,
    };

    next();
  } catch (err) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired authentication token. Please log in again.',
    });
  }
}

/**
 * requireSeller middleware:
 * Ensures the authenticated user has 'seller' or 'admin' role, or has seller_enabled.
 * Returns 403 Forbidden if the user is a normal customer without seller access.
 */
export function requireSeller(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    if (user.role === 'seller' || user.role === 'admin' || user.seller_enabled) {
      next();
      return;
    }

    res.status(403).json({
      error: '403 Forbidden',
      message: 'Access Denied. You do not have seller permissions on Bazaario.',
      code: 'SELLER_PERMISSION_REQUIRED',
    });
  });
}

/**
 * requireAdmin middleware:
 * Ensures the authenticated user has the 'admin' role.
 * Returns 403 Forbidden if the user is not an Admin.
 * Prevents any privilege escalation or role spoofing.
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    if (user.role === 'admin') {
      next();
      return;
    }

    res.status(403).json({
      error: '403 Forbidden',
      message: 'Access Denied. System Administrator permissions are required.',
      code: 'ADMIN_PERMISSION_REQUIRED',
    });
  });
}
