package com.davidzhang.androidcasinouser;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import androidx.annotation.NonNull;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;

import org.json.JSONException;
import org.json.JSONObject;

import io.socket.client.Socket;
import io.socket.emitter.Emitter;

public class Lounge extends ThemedActivity {
    private Socket mSocket;
    private User user;

    private String TAG= "Lounge";

    private GoogleSignInClient mGoogleSignInClient;

    //private String[] lobbies = {"Lobby 1", "Lobby 2", "Lobby 3"};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_lounge);
        Button userProfileButton;
        Button navigateToListButton;
        Button createLobbyButton;
        String username;
        Button signOutButton;
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .build();

        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);

        Intent intent = getIntent();
        user = intent.getParcelableExtra("user");

        username = user.getUsername();

        userProfileButton = findViewById(R.id.userProfileButton);
        navigateToListButton = findViewById(R.id.navigateToLobbiesButton);
        createLobbyButton = findViewById(R.id.createLobby);
        // Set the user name to the button
        userProfileButton.setText("Username: " + username);
        // ChatGPT usage: No
        userProfileButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(Lounge.this, UserProfile.class);
                intent.putExtra("user", user);
                startActivity(intent);
            }
        });

        signOutButton = findViewById(R.id.logoutButton);
        // ChatGPT usage: No
        signOutButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                signOut();
            }
        });

        // ChatGPT usage: No
        navigateToListButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(Lounge.this, LobbyListActivity.class);
                intent.putExtra("user", user);
                startActivity(intent);
            }
        });

        // ChatGPT usage: No
        createLobbyButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(Lounge.this, CreateLobby.class);
                intent.putExtra("user", user);
                startActivity(intent);
            }
        });
    }

    // ChatGPT usage: No
    private void signOut() {
        mGoogleSignInClient.signOut()
                .addOnCompleteListener(this, new OnCompleteListener<Void>() {
                    @Override
                    public void onComplete(@NonNull Task<Void> task) {
                        // ...
                        Log.d(TAG, "Log Out Successfully!");
                    }
                });
        Intent intent = new Intent(Lounge.this, MainActivity.class);
        startActivity(intent);

    }

    // ChatGPT usage: No
    private void setupSocketListeners() {
        mSocket.on("userAccountDetails", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                Log.d(TAG, "received user details");
                if (args[0] != null) {
                    JSONObject result = (JSONObject) args[0];
                    Log.d(TAG, "User Found: " + user.toString());
                    try {

                        user.setId(result.getString("_id"));
                        user.setUserId(result.getString("userId"));
                        user.setUsername(result.getString("username"));
                        user.setBalance(result.getDouble("balance"));
                        user.setAdmin(result.getBoolean("isAdmin"));
                        user.setChatBanned(result.getBoolean("isChatBanned"));
                        user.setLastRedemptionDate(result.getString("lastRedemptionDate"));


                    } catch (JSONException e) {
                        Log.e("JSON parsing failed", e.toString(), e);
                    }

                } else {
                    Log.d(TAG, "User not Found");
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
    protected void onStart() {
        super.onStart();
        // Your code here
       mSocket = SocketHandler.getSocket();
       setupSocketListeners();
       mSocket.emit("retrieveAccount", user.getUserId());
    }
}
