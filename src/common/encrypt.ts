import crypto from "crypto";

// Encrypt function
export function encrypt(plainText: string, key: string): string {
  if (key.length !== 32) {
    throw new Error("Key must be 32 bytes");
  }

  const iv = crypto.randomBytes(16); // Generate a random IV
  const cipher = crypto.createCipheriv("aes-256-cfb", Buffer.from(key), iv);

  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);

  // Combine IV and encrypted text and encode in base64
  return Buffer.concat([iv, encrypted]).toString("base64");
}

export function decrypt(encryptedText: string, key: string): string {
  if (key.length !== 32) {
    throw new Error("Key must be 32 bytes");
  }

  const inputBuffer = Buffer.from(encryptedText, "base64");

  // Extract IV and encrypted text
  const iv = inputBuffer.subarray(0, 16);
  const encrypted = inputBuffer.subarray(16);

  const decipher = crypto.createDecipheriv("aes-256-cfb", Buffer.from(key), iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString("utf8");
}
