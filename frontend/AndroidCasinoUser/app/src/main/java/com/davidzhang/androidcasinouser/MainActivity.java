package com.davidzhang.androidcasinouser;



import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.SignInButton;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.tasks.Task;
import com.google.api.services.gmail.GmailScopes;

import io.socket.client.IO;
import org.json.JSONException;
import org.json.JSONObject;

import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

public class MainActivity extends AppCompatActivity {
    private GoogleSignInClient mGoogleSignInClient;
    final static String TAG = "MainActivity";
    private Socket mSocket;

    private static final int RC_SIGN_IN = 9001;

    private String loginuserid;
    private String username;

    private String balance;

    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
       //connect the socket
        SocketHandler.setSocket();
        SocketHandler.establishConnection();
        mSocket = SocketHandler.getSocket();
        setupSocketListeners();

        // ChatGPT usage: Partial
        //set up sign button
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .requestScopes(new Scope(GmailScopes.GMAIL_SEND))
                .build();

        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);

        // ChatGPT usage: Partial
        findViewById(R.id.sign_in_button).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                signIn();
            }
        });
    }

    // ChatGPT usage: Partial
    // Start sign-in intent
    private void signIn() {
        Intent signInIntent = mGoogleSignInClient.getSignInIntent();
        startActivityForResult(signInIntent, RC_SIGN_IN);
    }

    // ChatGPT usage: Partial
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == RC_SIGN_IN) {
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            handleSignInResult(task);
        }
    }

    // ChatGPT usage: Partial
    private void handleSignInResult(Task<GoogleSignInAccount> completedTask) {
        try {
            GoogleSignInAccount account = completedTask.getResult(ApiException.class);
             GmailUtility.setupUser(account);
            checkUserinDB(account);
        } catch (ApiException e) {
            Log.w(TAG, "signInResult:failed code=" + e.getStatusCode());
            checkUserinDB(null);
        }
    }
    /*
    @Override
    protected void onStart() {
        super.onStart();
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(this);
        checkUserinDB(account);
    }
    */

    // ChatGPT usage: No
    private void checkUserinDB(GoogleSignInAccount account) {
        if (account == null){
            Log.d(TAG, "There is no user signed in!");
        }else{
            Log.d(TAG, "Pref Name: " + account.getDisplayName());
            Log.d(TAG, "Userid: " + account.getId());
            //String username = account.getDisplayName();
            loginuserid = account.getId();
            // Send token to your back-end

            Log.d(TAG, "Socket status: " + mSocket.connected());
            //if (mSocket != null && mSocket.connected()) {
            Log.d(TAG, "Socket is connected " + mSocket);
            mSocket.emit("retrieveAccount", loginuserid);

            //}else{
               // Log.d(TAG, "Socket is not connected");
           // }
            //Intent LoginIntent = new Intent(MainActivity.this, LoginDetails.class);
            //LoginIntent.putExtra("accountName", "Logged in: " + account.getGivenName() + " "+ account.getFamilyName());
            //startActivity(LoginIntent);


        }
    }

    // ChatGPT usage: Partial
    private void setupSocketListeners() {
        mSocket.on("userAccountDetails", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                Log.d(TAG, "received user details");
                if (args[0] != null) {
                    JSONObject user = (JSONObject) args[0];
                    Log.d(TAG, "User Found: " + user.toString());
                    try {
                        User currentUser = new User();
                        currentUser.setId(user.getString("_id"));
                        currentUser.setUserId(user.getString("userId"));
                        currentUser.setUsername(user.getString("username"));
                        currentUser.setBalance(user.getInt("balance"));
                        currentUser.setAdmin(user.getBoolean("isAdmin"));
                        currentUser.setChatBanned(user.getBoolean("isChatBanned"));
                        currentUser.setLastRedemptionDate(user.getString("lastRedemptionDate"));

                        Intent intent = new Intent(MainActivity.this, Lounge.class);
                        intent.putExtra("user", currentUser);
                        startActivity(intent);

                    } catch (JSONException e) {
                        throw new RuntimeException(e);
                    }

                } else {
                    Log.d(TAG, "User not Found, we need to create an account");
                    Intent intent = new Intent(MainActivity.this, CreateAccount.class);
                    intent.putExtra("USER_ID_KEY", loginuserid);
                    startActivity(intent);
                }
            }
        });
        // ChatGPT usage: No
        mSocket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                Log.d(TAG, "Socket connected");
            }
        });
        // ChatGPT usage: No
        mSocket.on(Socket.EVENT_DISCONNECT, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                Log.d(TAG, "Socket disconnected");
            }
        });
        // ChatGPT usage: No
        mSocket.on(Socket.EVENT_CONNECT_ERROR, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                Log.e(TAG, "Socket connection error");
            }
        });


    }


    @Override
    protected void onDestroy() {
        super.onDestroy();
        SocketHandler.closeConnection();
    }
/*
    @Override
    protected void onStop() {
        super.onStop();
        // Your code here
        SocketHandler.turnoffAllListeners();
    }

 */
@Override
    protected void onStart() {
    super.onStart();
    // Your code here
    mSocket = SocketHandler.getSocket();
    setupSocketListeners();
}



}