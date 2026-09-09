/**
 * Web Crypto API for client-side AES-256-GCM encryption
 * Zero external libraries needed; standard in modern browsers and offline PWAs.
 * Matches SQLCipher 256-bit AES encryption standard used on Raspberry Pi.
 */

const SALT = new TextEncoder().encode('KidCoinVault_RaspberryPi_Offline_Salt_2025');

// Derive AES-GCM 256-bit Key from Master Passphrase using PBKDF2 (100,000 rounds)
async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(plainText: string, passphrase: string): Promise<string> {
  const key = await deriveKey(passphrase);
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
  const encodedData = new TextEncoder().encode(plainText);

  const cipherBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedData
  );

  // Combine IV + Ciphertext
  const combined = new Uint8Array(iv.length + cipherBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuffer), iv.length);

  // Base64 encode for safe JSON/storage
  let binary = '';
  const len = combined.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary);
}

export async function decryptData(encryptedBase64: string, passphrase: string): Promise<string> {
  const key = await deriveKey(passphrase);
  const binary = atob(encryptedBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  // Extract 12-byte IV
  const iv = bytes.slice(0, 12);
  const cipherBytes = bytes.slice(12);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    cipherBytes
  );

  return new TextDecoder().decode(decryptedBuffer);
}
