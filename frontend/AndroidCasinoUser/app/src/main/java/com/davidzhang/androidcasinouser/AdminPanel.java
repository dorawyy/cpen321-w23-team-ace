package com.davidzhang.androidcasinouser;


import android.os.Bundle;
import android.text.InputFilter;
import android.text.Spanned;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import org.json.JSONObject;

import io.socket.client.Socket;
import io.socket.emitter.Emitter;

public class AdminPanel extends ThemedActivity {
    private EditText editUserNameEditText;


    private String TAG = "AdminPanel";
    private Socket mSocket;

    // ChatGPT usage: No
    InputFilter filter = new InputFilter() {
        @Override
        public CharSequence filter(CharSequence source, int start, int end, Spanned dest, int dstart, int dend) {
            for (int i = start; i < end; i++) {
                if (!Character.isDigit(source.charAt(i))) {
                    return "";
                }
            }
            return null;
        }
    };
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_admin_panel);
        Button addPointsButton;
        Button banFromChatButton;
        Button setAsAdminButton;
        Button unbanFromChatButton;
        EditText pointValueEditText;
        Button unsetAsAdminButton;
        mSocket = SocketHandler.getSocket();
        setupSocketListeners();
        editUserNameEditText = findViewById(R.id.editUserNameEditText);
        pointValueEditText = findViewById(R.id.pointValueEditText);
        pointValueEditText.setFilters(new InputFilter[]{filter});
        banFromChatButton = findViewById(R.id.banFromChatButton);
        setAsAdminButton = findViewById(R.id.setAsAdminButton);
        addPointsButton = findViewById(R.id.addPointsButton);
        unbanFromChatButton = findViewById(R.id.unbanFromChatButton);
        unsetAsAdminButton = findViewById(R.id.unsetAsAdminButton);

        // ChatGPT usage: No
        banFromChatButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                mSocket.emit("updateChatBanned", editUserNameEditText.getText().toString(), true);
            }
        });

        // ChatGPT usage: No
        setAsAdminButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                mSocket.emit("updateAdminStatus", editUserNameEditText.getText().toString(), true);
            }
        });

        // ChatGPT usage: No
        unbanFromChatButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                mSocket.emit("updateChatBanned", editUserNameEditText.getText().toString(), false);
            }
        });

        // ChatGPT usage: No
        unsetAsAdminButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                mSocket.emit("updateAdminStatus", editUserNameEditText.getText().toString(), false);
            }
        });

        // ChatGPT usage: No
        addPointsButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String value = pointValueEditText.getText().toString();
                int intValue;
                try {
                    intValue = Integer.parseInt(value);
                    Log.d(TAG, "Entered user Name: " + editUserNameEditText.getText().toString());
                    mSocket.emit("depositbyname", editUserNameEditText.getText().toString(), intValue);
                } catch (NumberFormatException e) {
                }

            }
        });
    }

    // ChatGPT usage: No
    private void setupSocketListeners() {
        mSocket.on("balanceUpdate", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                Log.d(TAG, "received new balance details");
                if (args[0] != null) {
                    int newbalance = (int) args[0];

                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {

                            Toast.makeText(AdminPanel.this, "Updated Balance for " + editUserNameEditText.getText().toString() + " is "+ newbalance, Toast.LENGTH_LONG).show();
                        }
                    });
                } else {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {

                            Toast.makeText(AdminPanel.this, "Add Balance for " + editUserNameEditText.getText().toString() + " Failed! Please Try Again!", Toast.LENGTH_LONG).show();

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
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            Toast.makeText(AdminPanel.this, "Updated User Info Successfully for " + editUserNameEditText.getText().toString(), Toast.LENGTH_LONG).show();

                        }
                    });
                } else {
                    Log.d(TAG, "Edited User Failed! Please Try Again");

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
        mSocket = SocketHandler.getSocket();
        setupSocketListeners();
    }
    /*
    @Override
    protected void onStop() {
        super.onStop();
        SocketHandler.turnoffAllListeners();
    }

     */




}
