import { Injectable } from '@angular/core';

export type CipherMethod = 'caesar' | 'aes';

@Injectable({
  providedIn: 'root',
})
export class CipherService {
  /** Caesar cipher — shifts A–Z / a–z by `shift` positions. */
  caesarEncrypt(plaintext: string, shift: number): string {
    return this.caesarTransform(plaintext, this.normalizeShift(shift));
  }

  caesarDecrypt(ciphertext: string, shift: number): string {
    return this.caesarTransform(ciphertext, -this.normalizeShift(shift));
  }

  /** Password-based AES-GCM (Web Crypto API). Output is base64(iv + ciphertext). */
  async aesEncrypt(plaintext: string, password: string): Promise<string> {
    if (!password.trim()) {
      throw new Error('Password is required for AES encryption.');
    }

    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(password);
    const cipherBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(plaintext)
    );

    const combined = new Uint8Array(iv.length + cipherBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(cipherBuffer), iv.length);
    return this.toBase64(combined);
  }

  async aesDecrypt(ciphertext: string, password: string): Promise<string> {
    if (!password.trim()) {
      throw new Error('Password is required for AES decryption.');
    }

    try {
      const data = this.fromBase64(ciphertext.trim());
      if (data.length < 13) {
        throw new Error('Invalid ciphertext.');
      }

      const iv = data.slice(0, 12);
      const encrypted = data.slice(12);
      const key = await this.deriveKey(password);
      const plainBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );
      return new TextDecoder().decode(plainBuffer);
    } catch {
      throw new Error('Decryption failed. Check the ciphertext and password.');
    }
  }

  private caesarTransform(text: string, shift: number): string {
    return text
      .split('')
      .map((char) => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + shift + 26) % 26) + 65);
        }
        if (code >= 97 && code <= 122) {
          return String.fromCharCode(((code - 97 + shift + 26) % 26) + 97);
        }
        return char;
      })
      .join('');
  }

  private normalizeShift(shift: number): number {
    const n = Math.trunc(Number(shift));
    if (Number.isNaN(n)) {
      return 0;
    }
    return ((n % 26) + 26) % 26;
  }

  private async deriveKey(password: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // Fixed salt keeps encrypt/decrypt deterministic for this school app.
    const salt = encoder.encode('encrypt-decrypt-midterm-salt');

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private toBase64(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    return btoa(binary);
  }

  private fromBase64(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
