const EncryptionUtils = require('../EncryptionUtils'); // Adjust the path as needed

describe('Encryption with same length', () => {
  test('encrypted user ID should have consistent length', () => {
    const userId = 'sampleUserId';
    const encryptionKey = EncryptionUtils.generateKey(); // Method to generate key

    const encryptedUserId = EncryptionUtils.encrypt(userId, encryptionKey);
    const encryptedUserIdBase64 = Buffer.from(encryptedUserId).toString('base64');

    // Define the expected length of the encrypted user ID
    const expectedLength = 32; 

    expect(encryptedUserIdBase64.length).toBe(expectedLength);
  });
});

describe('Encryption id should be different from the raw id', () => {
    test('Encryption should differ from true id', () => {
        const userId = 'sampleUserId';
        const encryptionKey = EncryptionUtils.generateKey(); // Method to generate key
    
        const encryptedUserId = EncryptionUtils.encrypt(userId, encryptionKey);
        const encryptedUserIdBase64 = Buffer.from(encryptedUserId).toString('base64');
    
        // Check if encrypted user ID differs from the original user ID
        expect(encryptedUserIdBase64).not.toBe(userId);
      });
  });

  
describe('Encryption and decryption functionality', () => {
    test('Decrypted user ID should match the original user ID', () => {
      const userId = 'sampleUserId';
      const encryptionKey = EncryptionUtils.generateKey(); // Method to generate key
  
      const encryptedUserId = EncryptionUtils.encrypt(userId, encryptionKey);
      // Assuming the encryptedUserId is in Base64 format
      const decryptedUserId = EncryptionUtils.decrypt(encryptedUserId, encryptionKey);
  
      // Check if decrypted user ID matches the original user ID
      expect(decryptedUserId).toBe(userId);
    });
  });

