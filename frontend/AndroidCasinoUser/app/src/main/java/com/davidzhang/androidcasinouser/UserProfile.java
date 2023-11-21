package com.davidzhang.androidcasinouser;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

import io.socket.emitter.Emitter;

import java.text.ParseException;
import java.util.Date;

import io.socket.client.Socket;

public class UserProfile extends ThemedActivity {

    private TextView usernameTextView;
    private TextView balanceTextView;
    private Button adminButton;
    private boolean isAdmin = false;

    private Date lastRedemptionDate;
    private User thisuser;
    private String TAG = "UserProfile";
    private Socket mSocket;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user_profile);
        Button redemptionButton;
        Intent intent = getIntent();
        thisuser = intent.getParcelableExtra("user");
        mSocket = SocketHandler.getSocket();
        setupSocketListeners();
        mSocket.emit("retrieveAccount", thisuser.getUserId());

        usernameTextView = findViewById(R.id.usernameTextView);
        balanceTextView = findViewById(R.id.balanceTextView);
        redemptionButton = findViewById(R.id.redemptionButton);
        adminButton = findViewById(R.id.adminButton);

        // Set the username and balance for the logged-in user
        usernameTextView.setText(thisuser.getUsername());
        balanceTextView.setText("Balance: " + thisuser.getBalance());

        // ChatGPT usage: No
        redemptionButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Handle redemption points logic
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                       handleRedemptionPoints();
                    }
                });
            }
        });

        // ChatGPT usage: No
        adminButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Navigate to Admin Panel if the user is an admin
                Intent intent = new Intent(UserProfile.this, AdminPanel.class);
                intent.putExtra("userId", thisuser.getUserId());
                startActivity(intent);
            }
        });
        Log.d(TAG, "LoginID: " + thisuser.getUserId());
        Log.d(TAG, "Defaultid: "+ getResources().getString(R.string.DefaultAdminID));
        if (isAdmin || thisuser.getUserId().equals(getResources().getString(R.string.DefaultAdminID))) {
            adminButton.setVisibility(View.VISIBLE);
        }
    }

    // ChatGPT usage: No
    private void setupSocketListeners() {
        mSocket.on("userAccountDetails", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                Log.d(TAG, "received user details");
                if (args[0] != null) {
                    JSONObject user = (JSONObject) args[0];
                    Log.d(TAG, "User Found: " + user.toString());

                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                try {
                                    String username = user.getString("username");
                                    usernameTextView.setText("Username: " + username);
                                    double balance = user.getDouble("balance");
                                    balanceTextView.setText("Balance: " + balance);
                                    isAdmin = user.getBoolean("isAdmin");
                                    if (isAdmin || thisuser.getUserId().equals(getResources().getString(R.string.DefaultAdminID))) {
                                        adminButton.setVisibility(View.VISIBLE);
                                    }
                                    lastRedemptionDate = DateHandler.stringToDate(user.getString("lastRedemptionDate"));
                                } catch (Exception e) {
                                    e.printStackTrace();
                                }
                            }
                        });
                } else {
                    Log.d(TAG, "User not Found, we need to retrieve again");
                }
            }
            // ChatGPT usage: No
        }).on("balanceUpdate", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                Log.d(TAG, "received new balance details");
                if (args[0] != null) {
                    Integer newbalance = (Integer) args[0];

                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            balanceTextView.setText("Balance: " + newbalance);
                            thisuser.setBalance(newbalance);
                            mSocket.emit("updateLastRedemptionDate", thisuser.getUserId(), DateHandler.dateToString(new Date()));

                        }
                    });
                } else {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            Toast.makeText(UserProfile.this, "Add Points to Balance Failed! Please Try Again!", Toast.LENGTH_LONG).show();

                        }
                    });

                }
            }
            // ChatGPT usage: No
        }).on("accountUpdated", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                Log.d(TAG, "received user details");
                if (args[0] != null) {
                    JSONObject user = (JSONObject) args[0];
                    Log.d(TAG, "User Found: " + user.toString());
                    try {
                        thisuser.setId(user.getString("_id"));
                        thisuser.setUserId(user.getString("userId"));
                        thisuser.setUsername(user.getString("username"));
                        thisuser.setBalance(user.getDouble("balance"));
                        thisuser.setAdmin(user.getBoolean("isAdmin"));
                        thisuser.setChatBanned(user.getBoolean("isChatBanned"));
                        thisuser.setLastRedemptionDate(user.getString("lastRedemptionDate"));
                        lastRedemptionDate = DateHandler.stringToDate(thisuser.getLastRedemptionDate());
                    } catch (JSONException e) {
                        Log.e("JSON parsing Error", e.toString());
                    } catch (ParseException e) {
                        Log.e("Parsing Error", e.toString());
                    }
                } else {
                    Log.d(TAG, "User not Found, we need to create an account");
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
    // ChatGPT usage: No
    private void handleRedemptionPoints() {
        Log.d(TAG, "lastredemptiondate: " + lastRedemptionDate);
        if (DateHandler.isSameDay(lastRedemptionDate, new Date())){
            Toast.makeText(UserProfile.this, "You have already requested points today! Come back to redeem tomorrow!", Toast.LENGTH_LONG).show();
        }else if (lastRedemptionDate!=null){
            mSocket.emit("deposit", thisuser.getUserId(), 50);
        }
    }

    @Override
    protected void onStart() {
        super.onStart();
        mSocket = SocketHandler.getSocket();
        setupSocketListeners();
        mSocket.emit("retrieveAccount", thisuser.getUserId());
    }
    /*
    @Override
    protected void onStop() {
        super.onStop();
        // Your code here
        Log.d("AdminPanel", "turn off listeners");
        SocketHandler.turnoffAllListeners();
    }
    */

}
