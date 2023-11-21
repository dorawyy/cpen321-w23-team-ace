package com.davidzhang.androidcasinouser;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import java.nio.charset.StandardCharsets;

public class EncryptionUtils {

    private static final String ALGORITHM = "AES/ECB/PKCS5Padding";
    private static final byte[] FIXED_KEY = {
            // 16 bytes for AES-128. Example key (in hexadecimal format):
            (byte) 0x01, (byte) 0x23, (byte) 0x45, (byte) 0x67,
            (byte) 0x89, (byte) 0xab, (byte) 0xcd, (byte) 0xef,
            (byte) 0x01, (byte) 0x23, (byte) 0x45, (byte) 0x67,
            (byte) 0x89, (byte) 0xab, (byte) 0xcd, (byte) 0xef
    };

    public static SecretKey generateKey() {
        return new SecretKeySpec(FIXED_KEY, "AES");
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
