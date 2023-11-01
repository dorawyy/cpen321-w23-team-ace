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

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.GmailScopes;

import org.json.JSONObject;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

import io.socket.client.Socket;
import io.socket.emitter.Emitter;
public class LobbyActivityBaccarat extends AppCompatActivity {
    private Socket mSocket;
    private Button btnPlayersWin;
    private Button btnDealerWins;
    private String selectedBetChoice = "";
    private String TAG = "LEvent";

    private int counter = 0;
    private String roomName = "";

    private EditText etEmailInput;
    private Button btnInvite;





    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_lobby_baccarat);

        mSocket = SocketHandler.getSocket();

        Intent intent = getIntent();
        roomName = intent.getStringExtra("roomName");
        String gameType = intent.getStringExtra("gameType");
        Boolean gameStarted = intent.getBooleanExtra("gameStarted", false); // default value is false
        String maxPlayer = intent.getStringExtra("maxPlayer");
        int playNumber = intent.getIntExtra("playNumber", 0);
        User currentPlayer = intent.getParcelableExtra("currentUser");
        final int[] playerCount = {0};

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

        // Button: PlayersWin or DealerWins
        btnPlayersWin = findViewById(R.id.btnPlayersWin);
        btnDealerWins = findViewById(R.id.btnDealerWins);

        // ChatGPT usage: No
        btnPlayersWin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                selectedBetChoice = "PlayersWin";
                Toast.makeText(getApplicationContext(), "Set bet to PlayersWin", Toast.LENGTH_SHORT).show();
            }
        });

        // ChatGPT usage: No
        btnDealerWins.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                selectedBetChoice = "DealerWins";
                Toast.makeText(getApplicationContext(), "Set bet to DealerWins", Toast.LENGTH_SHORT).show();
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
                } else if (selectedBetChoice.isEmpty()) {
                    Toast.makeText(getApplicationContext(), "Please select PlayerWin or DealerWin", Toast.LENGTH_SHORT).show();
                } else {
                    try {
                        int bet = Integer.parseInt(betText);
                        JSONObject betObject = new JSONObject();
                        betObject.put("win", selectedBetChoice);
                        betObject.put("amount", bet);

                        if(currentPlayer.getBalance() < bet) {
                            Toast.makeText(getApplicationContext(), "Bet cannot be greater than balance", Toast.LENGTH_SHORT).show();
                        } else {
                            mSocket.emit("setBet", roomName, currentPlayer.getUsername(), betObject);
                            mSocket.emit("setReady", currentPlayer.getUsername());
                        }
                    } catch (Exception e) {
                        Toast.makeText(getApplicationContext(), "Invalid bet. Please enter a valid integer", Toast.LENGTH_SHORT).show();
                    }
                }
            }
        });

        // ChatGPT usage: No
        mSocket.emit("getPlayerCount", roomName);

        // ChatGPT usage: No
        mSocket.on("playerCount", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                Log.d(TAG, "Here");
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        playerCount[0] = (Integer) args[0];
                        tvPlayersReady.setText("Players Ready: " + counter + "/" + playerCount[0]);
                    }
                });
            }
        });

        // ChatGPT usage: No
        // Update the player ready UI
        mSocket.on("playerReady", new Emitter.Listener() {
            @Override
            public void call(Object... args) {

                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        tvPlayersReady.setText("Players Ready: " + ++counter + "/" + playerCount[0]);
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
                if (gameType == "roulette") {
                    gameIntent = new Intent(LobbyActivityBaccarat.this, RouletteActivity.class);
                } else if (gameType == "baccarat") {
                    gameIntent = new Intent(LobbyActivityBaccarat.this, BaccaratActivity.class);
                } else if (gameType == "blackjack") {
                    gameIntent = new Intent(LobbyActivityBaccarat.this, BlackJackActivity.class);
                } else {
                    Log.e(TAG, "No matching game type to: " + gameType);
                    return;
                }
                gameIntent.putExtra("userName", currentPlayer.getUsername());
                gameIntent.putExtra("roomName", roomName);
                startActivity(gameIntent);
            }
        });

        // ChatGPT usage: No
        // Button: Send for Chat
        Button btnSend = findViewById(R.id.btnSend);
        final EditText etEnterMessage = findViewById(R.id.etEnterMessage);
        btnSend.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String message = etEnterMessage.getText().toString();
                if (!message.isEmpty()) {
                    mSocket.emit("sendChatMessage", message);
                    etEnterMessage.setText(""); // Clear the message input
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
                    GmailUtility.setupContext(LobbyActivityBaccarat.this);

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
    }

    @Override
    //ChatGPT usage: No
    protected void onResume() {
        super.onResume();
        mSocket.emit("getPlayerCount", roomName);
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
