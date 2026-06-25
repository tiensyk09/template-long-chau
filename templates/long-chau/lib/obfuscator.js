// lib/obfuscator.js — Bộ mã hóa/giải mã ID tệp tránh scan dò quét URL (IDOR)
const SALT = 9821734;
const TOKEN_SECRET = "commandcode_secure_download_salt_2026";

export function encodeId(type, id) {
  if (!id) return '';
  const num = (parseInt(id) * 127 + 98765) ^ SALT;
  return `${type}_${num.toString(36)}`;
}

export function decodeId(hash) {
  if (!hash) return null;
  const parts = hash.split('_');
  if (parts.length !== 2) return null;
  const [type, obfuscated] = parts;
  try {
    const num = parseInt(obfuscated, 36) ^ SALT;
    const id = (num - 98765) / 127;
    if (id % 1 !== 0 || id <= 0) return null; // Phải là số nguyên dương
    return { type, id: Math.round(id) };
  } catch {
    return null;
  }
}

// Sinh mã token tải tạm thời có thời hạn (ví dụ: 5 phút)
export function generateDownloadToken(id, expires) {
  const str = `${id}_${expires}_${TOKEN_SECRET}`;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

// Xác minh token tải tạm thời
export function verifyDownloadToken(id, expires, token) {
  const now = Date.now();
  if (now > parseInt(expires)) {
    return false; // Đã hết hạn
  }
  const expected = generateDownloadToken(id, expires);
  return expected === token;
}
