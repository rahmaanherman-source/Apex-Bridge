/**
 * AES-256 Encryption Utility
 *
 * Wraps crypto-js to provide AES-256-CBC encryption/decryption.
 * Credentials NEVER leave the device in plaintext.
 * Every secret is wrapped in the strongest mathematics available.
 *
 * Architecture: Keys are derived from a user-provided passphrase using
 * PBKDF2 (100,000 iterations, SHA-256) with a random salt, ensuring
 * brute-force resistance even if the encrypted blob is extracted.
 */

import CryptoJS from 'crypto-js';

/** Configuration for key derivation */
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_SIZE = 256 / 32; // 256-bit key → 8 words
const SALT_SIZE = 128 / 32; // 128-bit salt → 4 words
const IV_SIZE = 128 / 32; // 128-bit IV → 4 words

export interface EncryptedPayload {
  /** Base64-encoded ciphertext */
  ciphertext: string;
  /** Base64-encoded salt used for key derivation */
  salt: string;
  /** Base64-encoded initialization vector */
  iv: string;
  /** Algorithm identifier — for future migration */
  algorithm: 'AES-256-CBC-PBKDF2';
}

/**
 * Encrypts plaintext using AES-256-CBC with PBKDF2 key derivation.
 *
 * @param plaintext - The string to encrypt
 * @param passphrase - The user-controlled passphrase (never stored)
 * @returns An EncryptedPayload object safe for local storage
 */
export function encrypt(plaintext: string, passphrase: string): EncryptedPayload {
  const salt = CryptoJS.lib.WordArray.random(SALT_SIZE);
  const iv = CryptoJS.lib.WordArray.random(IV_SIZE);

  const key = CryptoJS.PBKDF2(passphrase, salt, {
    keySize: PBKDF2_KEY_SIZE,
    iterations: PBKDF2_ITERATIONS,
    hasher: CryptoJS.algo.SHA256,
  });

  const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return {
    ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
    salt: salt.toString(CryptoJS.enc.Base64),
    iv: iv.toString(CryptoJS.enc.Base64),
    algorithm: 'AES-256-CBC-PBKDF2',
  };
}

/**
 * Decrypts an EncryptedPayload back to plaintext.
 *
 * @param payload - The EncryptedPayload from encrypt()
 * @param passphrase - The same passphrase used during encryption
 * @returns The original plaintext, or null if decryption fails
 */
export function decrypt(payload: EncryptedPayload, passphrase: string): string | null {
  try {
    const salt = CryptoJS.enc.Base64.parse(payload.salt);
    const iv = CryptoJS.enc.Base64.parse(payload.iv);
    const ciphertext = CryptoJS.enc.Base64.parse(payload.ciphertext);

    const key = CryptoJS.PBKDF2(passphrase, salt, {
      keySize: PBKDF2_KEY_SIZE,
      iterations: PBKDF2_ITERATIONS,
      hasher: CryptoJS.algo.SHA256,
    });

    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8) || null;
  } catch {
    return null;
  }
}

/**
 * Serializes an EncryptedPayload to a single Base64-encoded string
 * suitable for storage in SecureStore.
 */
export function serializePayload(payload: EncryptedPayload): string {
  return CryptoJS.enc.Base64.stringify(
    CryptoJS.enc.Utf8.parse(JSON.stringify(payload)),
  );
}

/**
 * Deserializes a stored string back to an EncryptedPayload.
 */
export function deserializePayload(stored: string): EncryptedPayload | null {
  try {
    const json = CryptoJS.enc.Base64.parse(stored).toString(CryptoJS.enc.Utf8);
    return JSON.parse(json) as EncryptedPayload;
  } catch {
    return null;
  }
}

/**
 * Generates a cryptographically random key string.
 * Useful for generating vault master keys or session tokens.
 */
export function generateRandomKey(bytes: number = 32): string {
  return CryptoJS.lib.WordArray.random(bytes).toString(CryptoJS.enc.Hex);
}

/**
 * Computes a SHA-256 hash of the input.
 * Used for integrity verification.
 */
export function sha256(input: string): string {
  return CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
}
