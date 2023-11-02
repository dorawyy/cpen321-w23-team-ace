package com.davidzhang.androidcasinouser;


import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import java.text.SimpleDateFormat;
import java.util.Date;
import org.json.JSONException;
import org.json.JSONObject;

import io.socket.client.Socket;
import io.socket.emitter.Emitter;

public class CreateAccount extends AppCompatActivity {

    private EditText accountNameEditText;
    private Socket mSocket;
    private String userId;
    private String TAG = "CreateAccount";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_account);
        //SocketHandler.setSocket();
        //SocketHandler.establishConnection();
        mSocket = SocketHandler.getSocket();
        setupSocketListeners();

        Intent intent = getIntent();
        userId = intent.getStringExtra("USER_ID_KEY");
        // Initialize UI components
        accountNameEditText = findViewById(R.id.accountNameEditText);

        // ChatGPT usage: No
        findViewById(R.id.createAccountButton).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String accountName = accountNameEditText.getText().toString().trim();
                if (!accountName.isEmpty()) {
                    JSONObject accountData = new JSONObject();
                    try {
                        accountData.put("userId", userId);
                        accountData.put("username", accountName);
                        accountData.put("balance", 100);
                        accountData.put("isAdmin", false);
                        accountData.put("isChatBanned", false);
                        accountData.put("lastRedemptionDate",  DateHandler.dateToString(DateHandler.yesterday()));

                        mSocket.emit("createAccount", accountData);

                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                } else {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            Toast.makeText(CreateAccount.this, "Please enter a valid name!", Toast.LENGTH_SHORT).show();
                        }
                    });
                }
            }
        });
    }

    // ChatGPT usage: No
    private void setupSocketListeners() {
        mSocket.on("accountCreated", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                Log.d(TAG, "received new created user details");
                if (args[0] != null) {
                    JSONObject user = (JSONObject) args[0];
                    Log.d(TAG, "New user: " + user.toString());
                    try {
                        User currentUser = new User();
                        currentUser.setId(user.getString("_id"));
                        currentUser.setUserId(user.getString("userId"));
                        currentUser.setUsername(user.getString("username"));
                        currentUser.setBalance(user.getInt("balance"));
                        currentUser.setAdmin(user.getBoolean("isAdmin"));
                        currentUser.setChatBanned(user.getBoolean("isChatBanned"));
                        currentUser.setLastRedemptionDate(user.getString("lastRedemptionDate"));

                        Intent intent = new Intent(CreateAccount.this, Lounge.class);
                        intent.putExtra("user", currentUser);
                        startActivity(intent);

                    } catch (JSONException e) {
                        throw new RuntimeException(e);
                    }
                } else {
                    // User Create Failed
                    // prompt the user to enter the name again that does not already exist
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            Toast.makeText(CreateAccount.this, "Username already exist, please enter a new one!", Toast.LENGTH_SHORT).show();
                        }
                    });
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
    }
    /*
    @Override
    protected void onStop() {
        super.onStop();
        // Your code here
        SocketHandler.turnoffAllListeners();
    }

     */
}
