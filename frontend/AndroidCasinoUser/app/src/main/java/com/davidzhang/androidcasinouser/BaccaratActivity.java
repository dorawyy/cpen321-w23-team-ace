package com.davidzhang.androidcasinouser;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.PopupWindow;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;

import io.socket.client.Socket;
import io.socket.emitter.Emitter;

//ChatGPT usage for this class: Partial - things related to queueing requests and popup windows, and socket handling
public class BaccaratActivity extends AppCompatActivity {
    private Socket mSocket;
    private String TAG = "BaccaratEvent";
    private boolean currentlyAnimating = false;
    private final Queue<Runnable> requestQueue = new LinkedList<>();
    private TextView playerScoreLabel, dealerScoreLabel, lobbyName;
    private int[] playerCardVals = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
    private int[] dealerCardVals = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
    private Map<String, Integer> cardValues = new HashMap<String, Integer>() {{
        put("Ace", 1); //or 11
        put("2", 2);
        put("3", 3);
        put("4", 4);
        put("5", 5);
        put("6", 6);
        put("7", 7);
        put("8", 8);
        put("9", 9);
        put("10", 0);
        put("Jack", 0);
        put("Queen", 0);
        put("King", 0);
    }};
    private TextView[] playerCardItems = new TextView[6];
    private TextView[] dealerCardItems = new TextView[6];
    private int dealerCardIdx = 0;
    private int dealerCardLastIdx = -1;
    private int playerCardIdx = 0;
    private int playerCardLastIdx = -1;

    @Override
    //ChatGPT usage: Partial - things related to queueing requests and popup windows, and socket handling
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_baccarat);

        mSocket = SocketHandler.getSocket();

        Intent intent = getIntent();
        String userName = intent.getStringExtra("userName");
        String roomName = intent.getStringExtra("roomName");
        Boolean isChatBanned = intent.getBooleanExtra("isChatBanned", false);

        playerScoreLabel = findViewById(R.id.playerScoreLabel);
        dealerScoreLabel = findViewById(R.id.dealerScoreLabel);

        lobbyName = findViewById(R.id.lobbyNameLabel);
        lobbyName.setText("Lobby Name: " + roomName);

        playerCardItems[0] = findViewById(R.id.player_card_1);
        playerCardItems[1] = findViewById(R.id.player_card_2);
        playerCardItems[2] = findViewById(R.id.player_card_3);
        playerCardItems[3] = findViewById(R.id.player_card_4);
        playerCardItems[4] = findViewById(R.id.player_card_5);
        playerCardItems[5] = findViewById(R.id.player_card_6);

        dealerCardItems[0] = findViewById(R.id.dealer_card_1);
        dealerCardItems[1] = findViewById(R.id.dealer_card_2);
        dealerCardItems[2] = findViewById(R.id.dealer_card_3);
        dealerCardItems[3] = findViewById(R.id.dealer_card_4);
        dealerCardItems[4] = findViewById(R.id.dealer_card_5);
        dealerCardItems[5] = findViewById(R.id.dealer_card_6);

        mSocket.on("receiveChatMessage", new Emitter.Listener() {
            @Override
            //ChatGPT usage: No
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

        mSocket.on("gameOver", new Emitter.Listener() {
            @Override
            //ChatGPT usage: Partial - for things related to to the popup window and queueing requests
            public void call(Object... args) {
                if (args[0] != null) {
                    JSONObject gameResults = (JSONObject) args[0];
                    Log.d(TAG, "Game Results: " + gameResults.toString());

                    JSONObject gameData = null;
                    JSONObject gameItems = null;
                    JSONObject globalItems = null;

                    JSONArray playerHandJsonArray = null;
                    JSONArray dealerHandJsonArray = null;

                    JSONObject gameResult = null;
                    double earnings = 0;

                    try {
                        gameResult = gameResults.getJSONObject("gameResult");
                        earnings = gameResult.getDouble(userName);

                        gameData = gameResults.getJSONObject("gameData");
                        gameItems = gameData.getJSONObject("gameItems");
                        globalItems = gameItems.getJSONObject("globalItems");

                        playerHandJsonArray = globalItems.getJSONArray("playerHand");
                        dealerHandJsonArray = globalItems.getJSONArray("bankerHand");
                    }
                    catch (JSONException e) {
                        throw new RuntimeException(e);
                    }

                    playerCardLastIdx = playerHandJsonArray.length();
                    dealerCardLastIdx = dealerHandJsonArray.length();

                    earnings = Math.round(earnings * 100.0) / 100.0;
                    mSocket.emit("depositbyname", userName, earnings);

                    performFinalAnimations(playerHandJsonArray, dealerHandJsonArray, earnings);
                }
                else {
                    Log.e(TAG, "No data sent in gameEnded signal.");
                }
            }
        });

        mSocket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                Log.d(TAG, "Socket connected");
            }
        });
        mSocket.on(Socket.EVENT_DISCONNECT, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                Log.d(TAG, "Socket disconnected");
            }
        });
        mSocket.on(Socket.EVENT_CONNECT_ERROR, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                Log.e(TAG, "Socket connection error");
            }
        });

        // Button: Send for Chat
        Button btnSend = findViewById(R.id.btnSend);
        final EditText etEnterMessage = findViewById(R.id.etEnterMessage);
        btnSend.setOnClickListener(new View.OnClickListener() {
            @Override
            // ChatGPT usage: No
            public void onClick(View view) {
                String message = etEnterMessage.getText().toString();
                if (!message.isEmpty()) {
                    if (isChatBanned) {
                        Toast.makeText(getApplicationContext(), "You are banned from chat", Toast.LENGTH_SHORT).show();
                    }
                    else {
                        mSocket.emit("sendChatMessage", roomName, userName, message);
                        etEnterMessage.setText(""); // Clear the message input
                    }
                }
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


    //ChatGPT usage: Yes
    private void showWinningsPopup(double winningsValue) {
        LayoutInflater inflater = (LayoutInflater) getSystemService(LAYOUT_INFLATER_SERVICE);
        View popupView = inflater.inflate(R.layout.popup_layout, null);

        TextView winningsValueTextView = popupView.findViewById(R.id.winningsValueTextView);
        Button okButton = popupView.findViewById(R.id.okButton);

        winningsValueTextView.setText("$" + winningsValue); // Display the calculated winnings value

        PopupWindow popupWindow = new PopupWindow(
                popupView,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                true
        );

        // Set an elevation to the popup to make it appear above other views
        popupWindow.setElevation(10);

        // Show the popup centered on the screen
        popupWindow.showAtLocation(popupView, Gravity.CENTER, 0, 0);

        // Dismiss the popup when the "OK" button is clicked
        okButton.setOnClickListener(new View.OnClickListener() {
            @Override
            //ChatGPT usage: Yes
            public void onClick(View v) {

                popupWindow.dismiss();

                //Return to the LobbyActivity
                finish();
            }
        });
    }

    //ChatGPT usage: No
    private String dealNewCard(String card, String type) {
        String[] cardDetails = getCardDetails(card);

        String value = cardDetails[0];
        String suit = cardDetails[1];

        Log.d(TAG, "NEW CARD: " + value + " : " + suit);

        int cardIdx;
        TextView cardUI;

        if (type.equals("player")) {
            cardIdx = playerCardIdx;
            cardUI = playerCardItems[playerCardIdx];
            playerCardVals[playerCardIdx] = cardValues.get(value);
            playerCardIdx++;
        } else {
            cardIdx = dealerCardIdx;
            cardUI = dealerCardItems[dealerCardIdx];
            dealerCardVals[dealerCardIdx] = cardValues.get(value);
            dealerCardIdx++;
        }

        if (cardIdx <= 5) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    cardUI.setText(value+ "\n" + suit);
                }
            });
        }

        return value;
    }

    //ChatGPT usage: No
    private void updateScores() {
        int playerScore = 0;
        int dealerScore = 0;

        for (int i = 0; i < playerCardIdx; i++) {
            playerScore += playerCardVals[i];
        }

        for (int j = 0; j < dealerCardIdx; j++) {
            dealerScore += dealerCardVals[j];
        }

        playerScore = playerScore % 10;
        dealerScore = dealerScore % 10;

        Log.d(TAG, "NEW DEALER SCORE: " + dealerScore);
        Log.d(TAG, "NEW PLAYER SCORE: " + playerScore);

        int finalDealerScore = dealerScore;
        int finalPlayerScore = playerScore;
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                dealerScoreLabel.setText("Dealer Score: " + finalDealerScore);
                playerScoreLabel.setText("Player Score: " + finalPlayerScore);
            }
        });
    }

    //ChatGPT usage: No
    private String[] getCardDetails(String card) {
        String val = "";
        String valAbbrv = "";
        String suitAbbrv = "";
        String suit = "";

        if (card.startsWith("10")) {
            valAbbrv = "10";
            suitAbbrv = String.valueOf(card.charAt(2));
        } else {
            valAbbrv = String.valueOf(card.charAt(0));
            suitAbbrv = String.valueOf(card.charAt(1));
        }

        if (suitAbbrv.equals("H")) {
            suit = "Heart";
        } else if (suitAbbrv.equals("D")) {
            suit = "Diamond";
        } else if (suitAbbrv.equals("C")) {
            suit = "Club";
        } else if (suitAbbrv.equals("S")) {
            suit = "Spade";
        } else {
            suit = "None";
        }

        if (valAbbrv.equals("A")) {
            val = "Ace";
        } else if (valAbbrv.equals("J")) {
            val = "Jack";
        } else if (valAbbrv.equals("Q")) {
            val = "Queen";
        } else if (valAbbrv.equals("K")) {
            val = "King";
        } else {
            val = valAbbrv;
        }

        String[] returnObj = {val, suit};
        return returnObj;
    }


    private void performFinalAnimations(JSONArray playerHandJSON, JSONArray dealerHandJSON, double earnings) {
        Handler handler = new Handler(Looper.getMainLooper());
        Log.d(TAG, "Final animations");

        //Finish dealing cards, allow the popup to run
        Runnable popupEnding = new Runnable() {
            @Override
            public void run() {
                //Send User to Results Popup
                runOnUiThread(new Runnable() {
                    @Override
                    //ChatGPT usage: Partial - The call to showWinningsPopup
                    public void run() {
                        showWinningsPopup(earnings);
                    }
                });
            }
        };

        // Define the logic to update player cards.
        Runnable updateDealerCards = new Runnable() {
            @Override
            public void run() {
                String card;
                String value;
                try {
                    card = dealerHandJSON.getString(dealerCardIdx);

                    dealNewCard(card, "dealer");
                    updateScores();

                    if (dealerCardIdx < dealerCardLastIdx) {
                        handler.postDelayed(this, 500);
                    } else {
                        handler.postDelayed(popupEnding, 3000); // Move to dealer cards once all player cards are shown.
                    }

                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        };
        Runnable updatePlayerCards = new Runnable() {
            @Override
            public void run() {
                Log.d(TAG, "Update player cards");
                String card;
                String value;
                try {
                    card = playerHandJSON.getString(playerCardIdx);

                    dealNewCard(card, "player");
                    updateScores();

                    if (playerCardIdx < playerCardLastIdx) {
                        handler.postDelayed(this, 1000);
                    } else {
                        handler.postDelayed(updateDealerCards, 500); // Move to dealer cards once all player cards are shown.
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        };

        handler.post(updatePlayerCards); // Start with player cards.
    }
}