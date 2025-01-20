import {encrypt, decrypt} from "./encrypt.js";

it("test", () => {
  try {
    const key = "thisis32byteslongpassphrase12345"; // 32-byte key
    const plainText = "Hello, Encryption!";

    // Encrypt the plain text
    const encryptedText = encrypt(plainText, key);
    console.log("Encrypted Text:", encryptedText);

    // Decrypt the text
    const decryptedText = decrypt(encryptedText, key);
    console.log("Decrypted Text:", decryptedText);
  } catch (err) {
    console.error("Error:", (err as Error).message);
  }
});
