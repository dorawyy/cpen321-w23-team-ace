package com.davidzhang.androidcasinouser;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

public class EncryptionUtils {

    private static final String ALGORITHM = "AES/ECB/PKCS5Padding";
    private static SecretKey encryptionKey = null;

    // Generates or retrieves the existing AES key
    public static SecretKey generateKey() {
        if (encryptionKey == null) {
            try {
                KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
                keyGenerator.init(128); // AES key size
                encryptionKey = keyGenerator.generateKey();
            } catch (Exception e) {
                throw new RuntimeException("Error generating key", e);
            }
        }
        return encryptionKey;
    }

    public static byte[] encrypt(String input, SecretKey key) throws Exception {
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, key);
        return cipher.doFinal(input.getBytes(StandardCharsets.UTF_8));
    }

    public static String decrypt(byte[] encryptionBytes, SecretKey key) throws Exception {
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, key);
        byte[] decryptedBytes = cipher.doFinal(encryptionBytes);
        return new String(decryptedBytes, StandardCharsets.UTF_8);
    }
}
