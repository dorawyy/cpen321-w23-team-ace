package com.davidzhang.androidcasinouser;

import android.content.Context;
import android.os.AsyncTask;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.util.ExponentialBackOff;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.GmailScopes;
import com.google.api.services.gmail.model.Message;
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.Base64;
import javax.mail.internet.MimeMessage;
import javax.mail.Session;
import javax.mail.internet.InternetAddress;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Properties;

public class GmailUtility {

    private static Context context;
    private static GoogleSignInAccount account;

    public GmailUtility() {}

    public synchronized static void setupContext(Context ctx) {
        context = ctx;
    }

    public synchronized static void setupUser(GoogleSignInAccount acc) {
        account = acc;
    }

    public synchronized static void sendEmail(String recipientEmail, String subject, String body) {
        if (context == null) {
            System.err.println("Context is not set up. Please set the context before calling sendEmail.");
            return;
        }

        if (account == null || account.getAccount() == null) {
            System.err.println("GoogleSignInAccount is not set up or invalid. Please set the account before calling sendEmail.");
            return;
        }

        // Use AsyncTask to send the email
        new SendEmailTask(recipientEmail, subject, body).execute();
    }

    private static class SendEmailTask extends AsyncTask<Void, Void, Void> {
        private String recipientEmail;
        private String subject;
        private String body;

        SendEmailTask(String recipientEmail, String subject, String body) {
            this.recipientEmail = recipientEmail;
            this.subject = subject;
            this.body = body;
        }

        @Override
        protected Void doInBackground(Void... voids) {
            try {
                // Build the GoogleAccountCredential for OAuth2 authentication.
                GoogleAccountCredential credential = GoogleAccountCredential.usingOAuth2(
                        context, Collections.singleton(GmailScopes.GMAIL_SEND));
                credential.setSelectedAccount(account.getAccount());

                // Build the Gmail service.
                Gmail service = new Gmail.Builder(GoogleNetHttpTransport.newTrustedTransport(), new GsonFactory(), credential)
                        .setApplicationName("Android Casino")
                        .build();

                // Create the MIME message.
                MimeMessage mimeMessage = createEmail(recipientEmail, account.getEmail(), subject, body);
                if (mimeMessage == null) {
                    System.err.println("Failed to create MimeMessage.");
                    return null;
                }

                // Convert the MIME message to the Gmail API's Message format.
                Message message = createMessageWithEmail(mimeMessage);
                if (message == null) {
                    System.err.println("Failed to convert MimeMessage to Gmail's Message format.");
                    return null;
                }

                // Send the email.
                service.users().messages().send("me", message).execute();
                System.out.println("Email sent successfully!");

            } catch (Exception e) {
                System.err.println("Error while sending email: " + e.getMessage());
                e.printStackTrace();
            }
            return null;
        }
    }

    private synchronized static MimeMessage createEmail(String to, String from, String subject, String bodyText) {
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);
        MimeMessage email = new MimeMessage(session);
        try {
            email.setFrom(new InternetAddress(from));
            email.addRecipient(javax.mail.Message.RecipientType.TO, new InternetAddress(to));
            email.setSubject(subject);
            email.setText(bodyText);
            return email;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private synchronized static Message createMessageWithEmail(MimeMessage emailContent) {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        try {
            emailContent.writeTo(buffer);
            byte[] bytes = buffer.toByteArray();
            String encodedEmail = Base64.encodeBase64URLSafeString(bytes);
            Message message = new Message();
            message.setRaw(encodedEmail);
            return message;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
