import { 
  encryptSensitiveData, 
  decryptSensitiveData, 
  encryptStringArray, 
  decryptStringArray 
} from './encryption';

/**
 * Utility functions for encrypting/decrypting data before/after database operations
 */

export interface EncryptedUserData {
  mfaSecret?: string | null;
  mfaBackupCodes?: string[];
  [key: string]: any;
}

export interface EncryptedAccountData {
  access_token?: string | null;
  refresh_token?: string | null;
  id_token?: string | null;
  [key: string]: any;
}

/**
 * Encrypts sensitive fields in user data before database storage
 */
export async function encryptUserData(data: any): Promise<any> {
  const encrypted = { ...data };
  
  // Encrypt MFA secret
  if (encrypted.mfaSecret && typeof encrypted.mfaSecret === 'string') {
    encrypted.mfaSecret = await encryptSensitiveData(encrypted.mfaSecret);
  }
  
  // Encrypt MFA backup codes
  if (encrypted.mfaBackupCodes && Array.isArray(encrypted.mfaBackupCodes) && encrypted.mfaBackupCodes.length > 0) {
    encrypted.mfaBackupCodes = await encryptStringArray(encrypted.mfaBackupCodes);
  }
  
  return encrypted;
}

/**
 * Decrypts sensitive fields in user data after database retrieval
 */
export async function decryptUserData(data: any): Promise<any> {
  if (!data) return data;
  
  const decrypted = { ...data };
  
  // Decrypt MFA secret
  if (decrypted.mfaSecret && typeof decrypted.mfaSecret === 'string') {
    try {
      decrypted.mfaSecret = await decryptSensitiveData(decrypted.mfaSecret);
    } catch {
      // If decryption fails, assume it's already plaintext (for migration)
      // In production, you might want to log this
    }
  }
  
  // Decrypt MFA backup codes
  if (decrypted.mfaBackupCodes && Array.isArray(decrypted.mfaBackupCodes) && decrypted.mfaBackupCodes.length > 0) {
    try {
      decrypted.mfaBackupCodes = await decryptStringArray(decrypted.mfaBackupCodes);
    } catch {
      // If decryption fails, assume they're already plaintext (for migration)
    }
  }
  
  return decrypted;
}

/**
 * Encrypts sensitive fields in account data before database storage
 */
export async function encryptAccountData(data: any): Promise<any> {
  const encrypted = { ...data };
  
  // Encrypt tokens
  if (encrypted.access_token && typeof encrypted.access_token === 'string') {
    encrypted.access_token = await encryptSensitiveData(encrypted.access_token);
  }
  
  if (encrypted.refresh_token && typeof encrypted.refresh_token === 'string') {
    encrypted.refresh_token = await encryptSensitiveData(encrypted.refresh_token);
  }
  
  if (encrypted.id_token && typeof encrypted.id_token === 'string') {
    encrypted.id_token = await encryptSensitiveData(encrypted.id_token);
  }
  
  return encrypted;
}

/**
 * Decrypts sensitive fields in account data after database retrieval
 */
export async function decryptAccountData(data: any): Promise<any> {
  if (!data) return data;
  
  const decrypted = { ...data };
  
  // Decrypt tokens
  if (decrypted.access_token && typeof decrypted.access_token === 'string') {
    try {
      decrypted.access_token = await decryptSensitiveData(decrypted.access_token);
    } catch {
      // If decryption fails, assume it's already plaintext (for migration)
    }
  }
  
  if (decrypted.refresh_token && typeof decrypted.refresh_token === 'string') {
    try {
      decrypted.refresh_token = await decryptSensitiveData(decrypted.refresh_token);
    } catch {
      // If decryption fails, assume it's already plaintext (for migration)
    }
  }
  
  if (decrypted.id_token && typeof decrypted.id_token === 'string') {
    try {
      decrypted.id_token = await decryptSensitiveData(decrypted.id_token);
    } catch {
      // If decryption fails, assume it's already plaintext (for migration)
    }
  }
  
  return decrypted;
}

/**
 * Helper to check if data appears to be encrypted (base64 format with expected length)
 */
export function isEncrypted(data: string): boolean {
  if (!data || data.length < 64) return false;
  
  try {
    // Try to decode as base64
    const decoded = atob(data);
    // Should have at least salt + iv + some encrypted data
    return decoded.length >= 44; // 32 (salt) + 12 (iv) + minimal encrypted data
  } catch {
    return false;
  }
}

/**
 * Migration utility to encrypt existing data
 */
export async function migrateExistingData(prisma: any) {
  console.log('Starting encryption migration for existing sensitive data...');
  
  try {
    // Migrate user MFA data
    const usersWithMfa = await prisma.user.findMany({
      where: {
        OR: [
          { mfaSecret: { not: null } },
          { mfaBackupCodes: { isEmpty: false } }
        ]
      }
    });
    
    console.log(`Found ${usersWithMfa.length} users with MFA data to encrypt`);
    
    for (const user of usersWithMfa) {
      const updates: any = {};
      
      if (user.mfaSecret && !isEncrypted(user.mfaSecret)) {
        updates.mfaSecret = await encryptSensitiveData(user.mfaSecret);
        console.log(`Encrypted MFA secret for user ${user.id}`);
      }
      
      if (user.mfaBackupCodes.length > 0 && !isEncrypted(user.mfaBackupCodes[0])) {
        updates.mfaBackupCodes = await encryptStringArray(user.mfaBackupCodes);
        console.log(`Encrypted ${user.mfaBackupCodes.length} backup codes for user ${user.id}`);
      }
      
      if (Object.keys(updates).length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: updates
        });
      }
    }
    
    // Migrate account tokens
    const accountsWithTokens = await prisma.account.findMany({
      where: {
        OR: [
          { access_token: { not: null } },
          { refresh_token: { not: null } },
          { id_token: { not: null } }
        ]
      }
    });
    
    console.log(`Found ${accountsWithTokens.length} accounts with tokens to encrypt`);
    
    for (const account of accountsWithTokens) {
      const updates: any = {};
      
      if (account.access_token && !isEncrypted(account.access_token)) {
        updates.access_token = await encryptSensitiveData(account.access_token);
      }
      
      if (account.refresh_token && !isEncrypted(account.refresh_token)) {
        updates.refresh_token = await encryptSensitiveData(account.refresh_token);
      }
      
      if (account.id_token && !isEncrypted(account.id_token)) {
        updates.id_token = await encryptSensitiveData(account.id_token);
      }
      
      if (Object.keys(updates).length > 0) {
        await prisma.account.update({
          where: { id: account.id },
          data: updates
        });
        console.log(`Encrypted tokens for account ${account.id}`);
      }
    }
    
    console.log('Encryption migration completed successfully');
  } catch (error) {
    console.error('Failed to migrate existing data:', error);
    throw error;
  }
}