package com.davidzhang.androidcasinouser;

public class Lobby {
    private String roomName;
    private String gameType;
    private Boolean gameStarted;
    private String maxPlayer;
    private int playNumber;
    private User currentUser;

    // ChatGPT usage: Partial
    public Lobby(String roomName, String gameType, Boolean gameStarted, String maxPlayer, int playNumber, User currentUser) {
        this.roomName = roomName;
        this.gameType = gameType;
        this.gameStarted = gameStarted;
        this.maxPlayer = maxPlayer;
        this.playNumber = playNumber;
        this.currentUser = currentUser;
    }

    // ChatGPT usage: No
    public String getName() {
        return roomName;
    }

    // ChatGPT usage: No
    public String getGameType() {
        return gameType;
    }

    // ChatGPT usage: No
    public Boolean getGameStarted() {return gameStarted;}

    // ChatGPT usage: No
    public String getMaxPlayer() {return maxPlayer;}

    // ChatGPT usage: No
    public int getPlayNumber() {return playNumber;}

    // ChatGPT usage: No
    public User getCurrentUser() {
        return currentUser;
    }
}
