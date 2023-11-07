package com.davidzhang.androidcasinouser;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

import io.socket.client.Socket;
import io.socket.emitter.Emitter;

public class LobbyListActivity extends ThemedActivity {
    private RecyclerView lobbiesRecyclerView;
    private List<Lobby> lobbyList = new ArrayList<>();
    private Socket mSocket;
    private User user;
    private String TAG = "Event";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_lobbylist);
        Intent intent = getIntent();
        user = intent.getParcelableExtra("user");
        //SocketHandler.setSocket();
        //SocketHandler.establishConnection();
        mSocket = SocketHandler.getSocket();
        //mSocket.emit("createLobby", "TestRoom", "qq", "4", "User1");

        lobbiesRecyclerView = findViewById(R.id.lobbiesRecyclerView);
        lobbiesRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        mSocket.emit("getAllLobby");
        // ChatGPT usage: No
        mSocket.on("AllLobby", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                JSONArray lobbies;
                lobbies = (JSONArray) args[0];
                Log.e(TAG, lobbies.toString());
                // Handle the new message
                for (int i = 0; i < lobbies.length(); i++) {
                    try {
                        JSONObject jsonObject = lobbies.getJSONObject(i);

                        String roomName = jsonObject.getString("roomName");  // Extracting a string
                        String gameType = jsonObject.getString("gameType");
                        Boolean gameStarted = jsonObject.getBoolean("gameStarted");
                        String maxPlayers = jsonObject.getString("maxPlayers");
                        int playerNumber = jsonObject.getJSONObject("players").length();
                        // Set currentUser = "Me" for now
                        lobbyList.add(new Lobby(roomName, gameType, gameStarted, maxPlayers, playerNumber, user));
                    }
                    catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        LobbyAdapter lobbyAdapter;
                        // This ensures that the adapter is set after the lobbyList is populated.
                        lobbyAdapter = new LobbyAdapter(LobbyListActivity.this, lobbyList);
                        lobbiesRecyclerView.setAdapter(lobbyAdapter);
                    }
                });
            }
        });
    }


    @Override
    protected void onDestroy() {
        super.onDestroy();
        mSocket = SocketHandler.getSocket();
        if(mSocket != null) {
            mSocket.disconnect();
        }
    }
}