/**
 * crypto.js — AES-256-GCM encryption utility for MongoDB data protection.
 * Encrypts sensitive business data before storing in MongoDB.
 * Even if someone accesses the database directly, data is unreadable.
 * 
 * Format: "iv:authTag:ciphertext" (all hex encoded)
 */

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;  // 128-bit IV for GCM
const KEY_LENGTH = 32; // 256-bit key

/**
 * Get or derive the encryption key from environment variable.
 * If ENCRYPTION_KEY is not 32 bytes, we derive one using SHA-256.
 */
const getKey = () => {
    const envKey = process.env.ENCRYPTION_KEY;
    if (!envKey) {
        throw new Error('ENCRYPTION_KEY not set in environment variables!');
    }
    // Always derive a proper 32-byte key using SHA-256
    return crypto.createHash('sha256').update(envKey).digest();
};

/**
 * Encrypt a JavaScript object or string into an encrypted string.
 * @param {any} data - Data to encrypt (will be JSON.stringify'd if not a string)
 * @returns {string} Encrypted string in format "iv:authTag:ciphertext"
 */
const encrypt = (data) => {
    try {
        const key = getKey();
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag().toString('hex');
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (err) {
        console.error('Encryption error:', err);
        throw err;
    }
};

/**
 * Decrypt an encrypted string back to its original data.
 * @param {string} encryptedStr - Encrypted string in format "iv:authTag:ciphertext"
 * @param {boolean} parseJson - If true, parse the decrypted string as JSON (default: true)
 * @returns {any} Decrypted data
 */
const decrypt = (encryptedStr, parseJson = true) => {
    try {
        if (!encryptedStr || typeof encryptedStr !== 'string') return null;

        const parts = encryptedStr.split(':');
        if (parts.length !== 3) {
            // Not encrypted (legacy plain data), return as-is
            return encryptedStr;
        }

        const key = getKey();
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const ciphertext = parts[2];

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return parseJson ? JSON.parse(decrypted) : decrypted;
    } catch (err) {
        console.error('Decryption error:', err);
        return null;
    }
};

module.exports = { encrypt, decrypt };
