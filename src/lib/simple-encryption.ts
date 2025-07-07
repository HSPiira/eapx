/**
 * Simple encryption utilities compatible with Edge Runtime
 * Uses Web Crypto API for maximum compatibility
 */

// Simple XOR-based encryption for non-critical data
// Note: This is NOT suitable for highly sensitive data, use encryption.ts for that
export function simpleEncrypt(text: string, key: string): string {
  if (!text) return text;
  
  const keyBytes = new TextEncoder().encode(key);
  const textBytes = new TextEncoder().encode(text);
  const encrypted = new Uint8Array(textBytes.length);
  
  for (let i = 0; i < textBytes.length; i++) {
    encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return btoa(String.fromCharCode(...encrypted));
}

export function simpleDecrypt(encryptedText: string, key: string): string {
  if (!encryptedText) return encryptedText;
  
  try {
    const keyBytes = new TextEncoder().encode(key);
    const encryptedBytes = new Uint8Array(
      atob(encryptedText).split('').map(char => char.charCodeAt(0))
    );
    const decrypted = new Uint8Array(encryptedBytes.length);
    
    for (let i = 0; i < encryptedBytes.length; i++) {
      decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return new TextDecoder().decode(decrypted);
  } catch {
    return encryptedText; // Return as-is if decryption fails
  }
}

// For backwards compatibility during migration
export function encryptSensitiveDataSync(text: string): string {
  const key = process.env.ENCRYPTION_KEY || 'default-key';
  return simpleEncrypt(text, key);
}

export function decryptSensitiveDataSync(encryptedText: string): string {
  const key = process.env.ENCRYPTION_KEY || 'default-key';
  return simpleDecrypt(encryptedText, key);
}