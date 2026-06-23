// lib/auth.js — jose (Web Crypto) thay thế jsonwebtoken để tương thích Edge Runtime
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_STR = process.env.JWT_SECRET || 'taytragov_admin_secret_2026_xaTayTra';
const SECRET = new TextEncoder().encode(SECRET_STR);
const COOKIE_NAME = 'admin_token';
const MAX_AGE = 60 * 60 * 24; // 24 giờ

// ── JWT ──────────────────────────────────────────────────────────────────────
export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function createAuthCookie(token) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  };
}

export function clearAuthCookie() {
  return {
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  };
}

// ── Password hashing via Web Crypto (PBKDF2) ─────────────────────────────────
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' }, key, 256
  );
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `pbkdf2:${saltHex}:${hashHex}`;
}

export async function verifyPassword(password, stored) {
  if (!stored) return false;

  // PBKDF2 hash (D1 / mới)
  if (stored.startsWith('pbkdf2:')) {
    const parts = stored.split(':');
    if (parts.length !== 3) return false;
    const [, saltHex, hashHex] = parts;
    const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' }, key, 256
    );
    const computed = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
    return computed === hashHex;
  }

  // bcrypt hash từ MySQL cũ — dùng bcryptjs nếu có (local dev)
  if (stored.startsWith('$2')) {
    try {
      const bcrypt = await import('bcryptjs');
      return bcrypt.default.compare(password, stored);
    } catch {
      return false;
    }
  }

  return false;
}

// ── Authorization helper ──────────────────────────────────────────────────────
export function requireAuth(user, minRole = 'mod') {
  if (!user) return { error: 'Chưa đăng nhập', status: 401 };
  const roles = ['member', 'mod', 'admin'];
  const userLevel = roles.indexOf(user.role);
  const requiredLevel = roles.indexOf(minRole);
  if (userLevel < requiredLevel) return { error: 'Không có quyền', status: 403 };
  return null;
}
