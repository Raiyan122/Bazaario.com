/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Bazaario Enterprise Role-Based Access Control (RBAC) & Authentication Database
 * Implements Users Table, bcrypt Hashing, Verification & Reset Tokens, and Brute Force Protection.
 */

import bcrypt from 'bcryptjs';

export type RoleType = 'customer' | 'seller' | 'admin';

export interface UserRecord {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  password_hash: string;
  role: RoleType;
  seller_enabled: boolean;
  email_verified: boolean;
  profile_photo: string;
  created_at: string;
  updated_at: string;
  last_login: string;
  // Compatibility getter alias
  name: string;
}

export interface VerificationToken {
  token: string;
  userId: string;
  email: string;
  type: 'email_verification' | 'password_reset';
  expiresAt: number; // timestamp in ms
  created_at: string;
}

export interface SentEmailLog {
  id: string;
  to: string;
  subject: string;
  type: 'email_verification' | 'password_reset' | 'security_alert';
  verificationLink?: string;
  resetLink?: string;
  message: string;
  timestamp: string;
}

// In-Memory Database representing Bazaario's Users Table
const USERS_TABLE: Map<string, UserRecord> = new Map();
const VERIFICATION_TOKENS: Map<string, VerificationToken> = new Map();
const REFRESH_TOKENS: Map<string, { userId: string; expiresAt: number }> = new Map();

// Brute force failed attempt tracking (email or IP -> { count, lockUntil })
const FAILED_LOGIN_ATTEMPTS: Map<string, { count: number; lockUntil: number }> = new Map();

// Simulated outbox log so previewers in AI Studio can test verification links instantly
const EMAIL_OUTBOX: SentEmailLog[] = [];

/**
 * Helper: Create a full user record with required fields
 */
function buildUserRecord(data: {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  password_hash: string;
  role: RoleType;
  seller_enabled?: boolean;
  email_verified?: boolean;
  profile_photo?: string;
  created_at?: string;
}): UserRecord {
  const now = new Date().toISOString();
  const record: UserRecord = {
    id: data.id,
    full_name: data.full_name,
    username: data.username.trim().toLowerCase(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone || '+1 (555) 019-2834',
    password_hash: data.password_hash,
    role: data.role,
    seller_enabled: data.seller_enabled ?? false,
    email_verified: data.email_verified ?? true,
    profile_photo:
      data.profile_photo ||
      `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    created_at: data.created_at || now,
    updated_at: now,
    last_login: now,
    get name() {
      return this.full_name;
    },
    set name(val: string) {
      this.full_name = val;
    },
  };
  return record;
}

// Seed initial default accounts for demonstration & verification
function seedDefaultAccounts() {
  const salt = bcrypt.genSaltSync(10);
  
  const defaults = [
    buildUserRecord({
      id: 'usr_admin_001',
      full_name: 'Elena Vance (System Admin)',
      username: 'admin',
      email: 'admin@bazaario.com',
      password_hash: bcrypt.hashSync('adminPassword2026!', salt),
      role: 'admin',
      seller_enabled: true,
      email_verified: true,
      profile_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      created_at: '2025-01-01T00:00:00.000Z',
    }),
    buildUserRecord({
      id: 'usr_seller_001',
      full_name: 'TechNova Official Store',
      username: 'seller_technova',
      email: 'seller@bazaario.com',
      password_hash: bcrypt.hashSync('sellerPassword2026!', salt),
      role: 'seller',
      seller_enabled: true,
      email_verified: true,
      profile_photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      created_at: '2025-06-15T12:00:00.000Z',
    }),
    buildUserRecord({
      id: 'usr_customer_001',
      full_name: 'Alex Rivera (Verified Customer)',
      username: 'alex_rivera',
      email: 'customer@bazaario.com',
      password_hash: bcrypt.hashSync('customerPassword2026!', salt),
      role: 'customer',
      seller_enabled: false,
      email_verified: true,
      profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      created_at: '2026-03-10T08:30:00.000Z',
    }),
  ];

  for (const user of defaults) {
    USERS_TABLE.set(user.id, user);
  }
}

seedDefaultAccounts();

/**
 * Find user by email address (case-insensitive)
 */
export function findUserByEmail(email: string): UserRecord | undefined {
  const normalized = email.trim().toLowerCase();
  for (const user of USERS_TABLE.values()) {
    if (user.email.toLowerCase() === normalized) {
      return user;
    }
  }
  return undefined;
}

/**
 * Find user by username (case-insensitive)
 */
export function findUserByUsername(username: string): UserRecord | undefined {
  const normalized = username.trim().toLowerCase();
  for (const user of USERS_TABLE.values()) {
    if (user.username.toLowerCase() === normalized) {
      return user;
    }
  }
  return undefined;
}

/**
 * Find user by email OR username (allows login with either)
 */
export function findUserByEmailOrUsername(identifier: string): UserRecord | undefined {
  const normalized = identifier.trim().toLowerCase();
  for (const user of USERS_TABLE.values()) {
    if (
      user.email.toLowerCase() === normalized ||
      user.username.toLowerCase() === normalized
    ) {
      return user;
    }
  }
  return undefined;
}

/**
 * Find user by ID
 */
export function findUserById(id: string): UserRecord | undefined {
  return USERS_TABLE.get(id);
}

/**
 * Create a new user account.
 * IMPORTANT: Every newly registered account MUST be a 'customer' by default.
 * Admin accounts CANNOT be created from registration or seller upgrade.
 */
export function createUser(data: {
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  password_hash: string;
}): UserRecord {
  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newUser = buildUserRecord({
    id,
    full_name: data.full_name.trim(),
    username: data.username.trim().toLowerCase(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone || '',
    password_hash: data.password_hash,
    role: 'customer', // Always Customer by default
    seller_enabled: false,
    email_verified: false, // Must verify email before logging in
  });

  USERS_TABLE.set(id, newUser);
  return newUser;
}

/**
 * Update user profile
 */
export function updateUserProfile(
  userId: string,
  data: Partial<Pick<UserRecord, 'full_name' | 'phone' | 'profile_photo' | 'email_verified' | 'password_hash' | 'last_login'>>
): UserRecord | null {
  const user = USERS_TABLE.get(userId);
  if (!user) return null;

  if (data.full_name !== undefined) user.full_name = data.full_name.trim();
  if (data.phone !== undefined) user.phone = data.phone.trim();
  if (data.profile_photo !== undefined) user.profile_photo = data.profile_photo;
  if (data.email_verified !== undefined) user.email_verified = data.email_verified;
  if (data.password_hash !== undefined) user.password_hash = data.password_hash;
  if (data.last_login !== undefined) user.last_login = data.last_login;
  
  user.updated_at = new Date().toISOString();
  USERS_TABLE.set(userId, user);
  return user;
}

/**
 * Upgrade a customer account to seller role upon secure server-side activation code verification.
 */
export function upgradeUserToSeller(userId: string): UserRecord | null {
  const user = USERS_TABLE.get(userId);
  if (!user) return null;

  if (user.role === 'admin') {
    user.seller_enabled = true;
    user.updated_at = new Date().toISOString();
    USERS_TABLE.set(userId, user);
    return user;
  }

  user.role = 'seller';
  user.seller_enabled = true;
  user.updated_at = new Date().toISOString();
  USERS_TABLE.set(userId, user);
  return user;
}

/**
 * Promote an existing user to Admin role.
 * IMPORTANT: Can ONLY be invoked by an existing Admin from the secure Admin Dashboard.
 */
export function promoteUserToAdmin(userId: string): UserRecord | null {
  const user = USERS_TABLE.get(userId);
  if (!user) return null;

  user.role = 'admin';
  user.seller_enabled = true;
  user.updated_at = new Date().toISOString();
  USERS_TABLE.set(userId, user);
  return user;
}

/**
 * Retrieve all registered users (Admin only)
 */
export function getAllUsers(): UserRecord[] {
  return Array.from(USERS_TABLE.values()).map((u) => ({
    ...u,
    password_hash: '[PROTECTED_BCRYPT_HASH]',
  }));
}

/**
 * Retrieve all active sellers
 */
export function getAllSellers(): UserRecord[] {
  return Array.from(USERS_TABLE.values())
    .filter((u) => u.role === 'seller' || u.seller_enabled)
    .map((u) => ({
      ...u,
      password_hash: '[PROTECTED_BCRYPT_HASH]',
    }));
}

/**
 * Create a secure email verification token (expires in 24 hours)
 */
export function createVerificationToken(userId: string, email: string): VerificationToken {
  const token = `vfy_${Date.now()}_${Math.random().toString(36).substring(2, 10)}_${Math.random().toString(36).substring(2, 8)}`;
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const item: VerificationToken = {
    token,
    userId,
    email,
    type: 'email_verification',
    expiresAt,
    created_at: new Date().toISOString(),
  };
  VERIFICATION_TOKENS.set(token, item);

  // Add to EMAIL_OUTBOX for instant preview in AI Studio
  EMAIL_OUTBOX.unshift({
    id: `msg_${Date.now()}`,
    to: email,
    subject: 'Bazaario Security: Please Verify Your Email Address',
    type: 'email_verification',
    verificationLink: `/verify-email?token=${token}`,
    message: `Welcome to Bazaario! Click the verification link to activate your account. This link expires in 24 hours.`,
    timestamp: new Date().toISOString(),
  });

  return item;
}

/**
 * Create a secure password reset token (expires in 30 minutes)
 */
export function createPasswordResetToken(userId: string, email: string): VerificationToken {
  const token = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 10)}_${Math.random().toString(36).substring(2, 8)}`;
  const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes
  const item: VerificationToken = {
    token,
    userId,
    email,
    type: 'password_reset',
    expiresAt,
    created_at: new Date().toISOString(),
  };
  VERIFICATION_TOKENS.set(token, item);

  // Add to EMAIL_OUTBOX for instant preview in AI Studio
  EMAIL_OUTBOX.unshift({
    id: `msg_${Date.now()}`,
    to: email,
    subject: 'Bazaario Security: Password Reset Requested',
    type: 'password_reset',
    resetLink: `/reset-password?token=${token}`,
    message: `We received a request to reset your Bazaario password. Click the reset link below. This link expires in 30 minutes.`,
    timestamp: new Date().toISOString(),
  });

  return item;
}

/**
 * Verify and consume a token
 */
export function consumeVerificationToken(token: string, expectedType: 'email_verification' | 'password_reset'): VerificationToken | null {
  const found = VERIFICATION_TOKENS.get(token);
  if (!found || found.type !== expectedType) {
    return null;
  }
  if (Date.now() > found.expiresAt) {
    VERIFICATION_TOKENS.delete(token);
    return null;
  }
  VERIFICATION_TOKENS.delete(token);
  return found;
}

/**
 * Refresh Token Management
 */
export function createRefreshToken(userId: string): string {
  const token = `rsh_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  REFRESH_TOKENS.set(token, { userId, expiresAt });
  return token;
}

export function consumeRefreshToken(token: string): string | null {
  const found = REFRESH_TOKENS.get(token);
  if (!found) return null;
  if (Date.now() > found.expiresAt) {
    REFRESH_TOKENS.delete(token);
    return null;
  }
  return found.userId;
}

/**
 * Get all sent email outbox messages (for testing in AI Studio preview)
 */
export function getEmailOutbox(): SentEmailLog[] {
  return EMAIL_OUTBOX;
}

/**
 * Brute force login attempt checks
 */
export function isAccountLocked(identifier: string): { locked: boolean; lockUntil?: number } {
  const record = FAILED_LOGIN_ATTEMPTS.get(identifier.toLowerCase());
  if (!record) return { locked: false };
  if (record.lockUntil && Date.now() < record.lockUntil) {
    return { locked: true, lockUntil: record.lockUntil };
  }
  if (record.lockUntil && Date.now() >= record.lockUntil) {
    FAILED_LOGIN_ATTEMPTS.delete(identifier.toLowerCase());
  }
  return { locked: false };
}

export function recordFailedLoginAttempt(identifier: string): { locked: boolean; lockUntil?: number; attemptsLeft: number } {
  const key = identifier.toLowerCase();
  const existing = FAILED_LOGIN_ATTEMPTS.get(key) || { count: 0, lockUntil: 0 };
  existing.count += 1;
  
  if (existing.count >= 5) {
    existing.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minute lockout
    FAILED_LOGIN_ATTEMPTS.set(key, existing);
    return { locked: true, lockUntil: existing.lockUntil, attemptsLeft: 0 };
  }
  
  FAILED_LOGIN_ATTEMPTS.set(key, existing);
  return { locked: false, attemptsLeft: 5 - existing.count };
}

export function clearFailedLoginAttempts(identifier: string): void {
  FAILED_LOGIN_ATTEMPTS.delete(identifier.toLowerCase());
}
