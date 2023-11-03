package com.davidzhang.androidcasinouser;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

import io.socket.client.Socket;
import io.socket.emitter.Emitter;
public class LobbyActivityBlackJack extends ThemedActivity {
    private Socket mSocket;
    private String TAG = "BJ";

    private int counter = 0;
    private EditText etEmailInput;
    private Button btnInvite;

    private String roomName = "";



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_lobby_blackjack);

        mSocket = SocketHandler.getSocket();

        Intent intent = getIntent();
        roomName = intent.getStringExtra("roomName");
        String gameType = intent.getStringExtra("gameType");
        User currentPlayer = intent.getParcelableExtra("currentUser");
        final int[] playerCount = {0};

        setupSocketListeners(gameType, currentPlayer);

        TextView tvLobbyName = findViewById(R.id.tvLobbyName);
        TextView tvGameType = findViewById(R.id.tvGameType);
        TextView tvPlayersReady = findViewById(R.id.tvPlayersReady);





        tvLobbyName.setText("Lobby Name: " + roomName);
        tvGameType.setText("Game Type: " + gameType);
        tvPlayersReady.setText("Players Ready: " + 0 + "/" + playerCount[0]);

        // Button: Leave Lobby
        Button btnLeaveLobby = findViewById(R.id.btnLeaveLobby);
        // ChatGPT usage: No
        btnLeaveLobby.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                mSocket.emit("leaveLobby");
                finish();
            }
        });

        // Button: Place Bets and Ready Up
        Button btnPlaceBetsReadyUp = findViewById(R.id.btnPlaceBetsReadyUp);
        final EditText etBet = findViewById(R.id.etPlaceBet);
        // ChatGPT usage: No
        btnPlaceBetsReadyUp.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String betText = etBet.getText().toString();

                if (betText.isEmpty()) {
                    Toast.makeText(getApplicationContext(), "Bet cannot be empty", Toast.LENGTH_SHORT).show();
                } else {
                    try {
                        int bet = Integer.parseInt(betText);
                        if(currentPlayer.getBalance() < bet) {
                            Toast.makeText(getApplicationContext(), "Bet cannot be greater than balance", Toast.LENGTH_SHORT).show();
                        } else {
                            mSocket.emit("setBet", roomName, currentPlayer.getUsername(), bet);
                            mSocket.emit("setReady", roomName, currentPlayer.getUsername());
                        }
                    } catch (NumberFormatException e) {
                        Toast.makeText(getApplicationContext(), "Invalid bet. Please enter a valid integer", Toast.LENGTH_SHORT).show();
                    }
                }
            }
        });

        // Button: Send for Chat
        Button btnSend = findViewById(R.id.btnSend);
        final EditText etEnterMessage = findViewById(R.id.etEnterMessage);
        // ChatGPT usage: No
        btnSend.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String message = etEnterMessage.getText().toString();
                if (!message.isEmpty()) {
                    if (currentPlayer.isChatBanned()) {
                        Toast.makeText(getApplicationContext(), "You are banned from chat", Toast.LENGTH_SHORT).show();
                    }
                    else {
                        mSocket.emit("sendChatMessage", roomName, currentPlayer.getUsername(), message);
                        etEnterMessage.setText(""); // Clear the message input
                    }
                }
            }
        });

        etEmailInput = findViewById(R.id.etEmailInput);
        btnInvite = findViewById(R.id.btnInvite);
        // ChatGPT usage: No
        btnInvite.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String recipientEmail = etEmailInput.getText().toString().trim();

                if (!recipientEmail.isEmpty()) {
                    GmailUtility.setupContext(LobbyActivityBlackJack.this);

                    GmailUtility.sendEmail(recipientEmail, "Android Casino Invitation", "You are Invited to Play a Game of " + gameType +" in Room: " + roomName +"\nLog in on Android Casino to Play with your Friends!");
                    Toast.makeText(getApplicationContext(), "Successfully sent the Email", Toast.LENGTH_SHORT).show();
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            etEmailInput.setText("");
                        }
                    });
                } else {
                    Toast.makeText(getApplicationContext(), "Please enter a valid email", Toast.LENGTH_SHORT).show();
                }
            }
        });

        // ChatGPT usage: No
        mSocket.emit("getPlayerCount", roomName);
    }

    @Override
    //ChatGPT usage: No
    protected void onResume() {
        super.onResume();
        mSocket = SocketHandler.getSocket();
        Intent intent = getIntent();
        String gameType = intent.getStringExtra("gameType");
        User currentPlayer = intent.getParcelableExtra("currentUser");

        setupSocketListeners(gameType, currentPlayer);
        mSocket.emit("getPlayerCount", roomName);
    }

    @Override
    public void onBackPressed() {
        // Call your specific function here
        mSocket.emit("leaveLobby");
        // If you want to continue with the default back press action
        super.onBackPressed();
    }

    // ChatGPT usage: Partial
    private void setupSocketListeners(String gameType, User currentPlayer) {
        // ChatGPT usage: No
        mSocket.on("playerCount", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                Log.d(TAG, "Here");
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        JSONObject result = (JSONObject) args[0];
                        try {
                            int playersReady = result.getInt("pr");
                            int totalPlayers = result.getInt("tp");

                            TextView tvPlayersReady = findViewById(R.id.tvPlayersReady);
                            tvPlayersReady.setText("Players Ready: " + playersReady + "/" + totalPlayers);

                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }
                    }
                });
            }
        });

        // ChatGPT usage: No
        mSocket.on("receiveChatMessage", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                JSONObject data = (JSONObject) args[0];
                Log.e(TAG, data.toString());
                String user = "";
                String text = "";

                try{
                    user = data.getString("user");
                    text = data.getString("text");
                }
                catch (Exception e) {
                    e.printStackTrace();
                }
                String message = user + " : " + text;

                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        addChatMessage(message);
                    }
                });
            }
        });

        mSocket.on("gameStarted", new Emitter.Listener() {
            @Override
            //ChatGPT usage: No
            public void call(Object... args) {
                Log.d(TAG, "New Game Signal: " + gameType);

                Intent gameIntent = null;
                gameIntent = new Intent(LobbyActivityBlackJack.this, BlackJackActivity.class);
                gameIntent.putExtra("userName", currentPlayer.getUsername());
                gameIntent.putExtra("roomName", roomName);
                gameIntent.putExtra("isChatBanned", currentPlayer.isChatBanned());
                startActivity(gameIntent);
            }
        });
    }

    // ChatGPT usage: No
    // Add a chat message to the chat UI
    private void addChatMessage(String message) {
        LinearLayout llChatContainer = findViewById(R.id.llChatContainer);
        TextView tvMessage = new TextView(this);
        tvMessage.setText(message);
        llChatContainer.addView(tvMessage);
    }
}
