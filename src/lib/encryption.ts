// Encryption configuration
const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12; // 96 bits for GCM
const SALT_LENGTH = 32;
const ITERATIONS = 100000;

// Get encryption key from environment
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  if (key.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
  }
  return key;
}

// Get crypto implementation (Node.js or Web Crypto API)
function getCrypto(): any {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto;
  }
  // Fallback to Node.js crypto (will be tree-shaken in Edge Runtime)
  try {
    return require('crypto').webcrypto || require('crypto');
  } catch {
    throw new Error('No crypto implementation available');
  }
}

// Derive key from password and salt using Web Crypto API
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const crypto = getCrypto();
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-512',
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Generate random bytes
function getRandomBytes(length: number): Uint8Array {
  const crypto = getCrypto();
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Encrypts sensitive data using AES-256-GCM
 * @param text - The plaintext to encrypt
 * @returns Encrypted data as base64 string
 */
export async function encryptSensitiveData(text: string): Promise<string> {
  if (!text) return text;

  try {
    const password = getEncryptionKey();
    const salt = getRandomBytes(SALT_LENGTH);
    const iv = getRandomBytes(IV_LENGTH);

    const key = await deriveKey(password, salt);
    const crypto = getCrypto();
    const encoder = new TextEncoder();

    const encrypted = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
        additionalData: encoder.encode('sensitive-data'),
      },
      key,
      encoder.encode(text)
    );

    // Combine salt, iv, and encrypted data (includes auth tag)
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    throw new Error('Failed to encrypt sensitive data');
  }
}

/**
 * Decrypts sensitive data encrypted with encryptSensitiveData
 * @param encryptedData - The encrypted data as base64 string
 * @returns Decrypted plaintext
 */
export async function decryptSensitiveData(encryptedData: string): Promise<string> {
  if (!encryptedData) return encryptedData;

  try {
    const password = getEncryptionKey();

    // Convert from base64
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );

    // Extract components
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH);

    const key = await deriveKey(password, salt);
    const crypto = getCrypto();
    const encoder = new TextEncoder();

    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
        additionalData: encoder.encode('sensitive-data'),
      },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    throw new Error('Failed to decrypt sensitive data');
  }
}

/**
 * Encrypts an array of strings (for backup codes)
 * @param items - Array of strings to encrypt
 * @returns Array of encrypted strings
 */
export async function encryptStringArray(items: string[]): Promise<string[]> {
  return Promise.all(items.map(encryptSensitiveData));
}

/**
 * Decrypts an array of encrypted strings
 * @param encryptedItems - Array of encrypted strings
 * @returns Array of decrypted strings
 */
export async function decryptStringArray(encryptedItems: string[]): Promise<string[]> {
  return Promise.all(encryptedItems.map(decryptSensitiveData));
}

/**
 * Hashes a password using Web Crypto API (for password storage)
 * @param password - The password to hash
 * @returns Hashed password as hex string
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + getSalt());
  const crypto = getCrypto();
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies a password against its hash
 * @param password - The plaintext password
 * @param hash - The stored hash
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}

/**
 * Get a consistent salt for password hashing
 */
function getSalt(): string {
  const key = getEncryptionKey();
  return key.substring(0, 16); // Use first 16 chars of encryption key as salt
}

// Type guard to check if data needs encryption
export function isSensitiveField(fieldName: string): boolean {
  const sensitiveFields = [
    'mfaSecret',
    'mfaBackupCodes',
    'access_token',
    'refresh_token',
    'id_token',
    'password'
  ];
  return sensitiveFields.includes(fieldName);
}