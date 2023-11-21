const crypto = require('crypto');

class EncryptionUtils {
  static generateKey() {
    // AES-128-ECB uses 16 bytes key
    return crypto.randomBytes(16);
  }

  static encrypt(text, key) {
    const cipher = crypto.createCipheriv('aes-128-ecb', key, null);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  }

  static decrypt(encryptedText, key) {
    const decipher = crypto.createDecipheriv('aes-128-ecb', key, null);
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

module.exports = EncryptionUtils;
