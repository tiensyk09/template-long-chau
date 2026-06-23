// lib/auth.js — jose (Web Crypto) for Edge Runtime compatibility
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { query } from './db';

const SECRET_STR = process.env.JWT_SECRET || 'commandcode_secret_key_2026_premium_agent';
const SECRET = new TextEncoder().encode(SECRET_STR);
const COOKIE_NAME = 'admin_token';
const MAX_AGE = 60 * 60 * 24; // 24 hours

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
    { name: 'PBKDF2', salt, iterations: 10000, hash: 'SHA-256' }, key, 256
  );
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `pbkdf2:${saltHex}:${hashHex}`;
}

export async function verifyPassword(password, stored) {
  if (!stored) return false;

  if (stored.startsWith('pbkdf2:')) {
    const parts = stored.split(':');
    if (parts.length !== 3) return false;
    const [, saltHex, hashHex] = parts;
    const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 10000, hash: 'SHA-256' }, key, 256
    );
    const computed = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
    return computed === hashHex;
  }

  // bcrypt fallback if any exists
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
  if (!user) return { error: 'Unauthorized', status: 401 };
  const roles = ['member', 'mod', 'admin'];
  const userLevel = roles.indexOf(user.role);
  const requiredLevel = roles.indexOf(minRole);
  if (userLevel < requiredLevel) return { error: 'Forbidden', status: 403 };
  return null;
}

// ── API Key Authentication (WordPress REST API compatibility) ──────────────
export async function authenticateApiKey(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) return null;

  try {
    const base64Credentials = authHeader.substring(6);
    // Use Web API atob for Edge compatibility
    const decoded = atob(base64Credentials);
    const [username, apiKey] = decoded.split(':');
    if (!username || !apiKey) return null;

    // Fetch key and user details from DB
    const keys = await query(
      `SELECT k.*, u.id as u_id, u.username as u_username, u.role as u_role, u.display_name as u_display_name
       FROM api_keys k
       JOIN users u ON k.user_id = u.id
       WHERE k.api_key = ?`,
      [apiKey]
    );

    if (keys.length === 0) return null;
    const keyRecord = keys[0];

    // Verify username matches the owner of the key
    if (keyRecord.u_username !== username) return null;

    return {
      id: keyRecord.u_id,
      username: keyRecord.u_username,
      role: keyRecord.u_role,
      displayName: keyRecord.u_display_name
    };
  } catch (err) {
    console.error('Basic authentication parse error:', err);
    return null;
  }
}

