package com.davidzhang.androidcasinouser;

import io.socket.client.IO;
import io.socket.client.Socket;

import java.net.URISyntaxException;
import android.util.Log;

public class SocketHandler {

    private static final String TAG = "SocketHandler";
    private static Socket mSocket;

    private SocketHandler() { }

    // ChatGPT usage: Partial
    public synchronized static void setSocket() {
        //if (mSocket == null) {
            try {
                mSocket = IO.socket("http://10.0.2.2:443");
            } catch (URISyntaxException e) {
                Log.e(TAG, "Error initializing socket", e);
            }
        //}
    }

    // ChatGPT usage: Partial
    public synchronized static Socket getSocket() {
        turnoffAllListeners();
        establishConnection();
        return mSocket;
    }

    // ChatGPT usage: Partial
    public synchronized static void establishConnection() {
        //if (mSocket != null) {
            mSocket.connect();
        //}
    }

    // ChatGPT usage: Partial
    public synchronized static void closeConnection() {
        //if (mSocket != null) {
            mSocket.disconnect();
        //}
    }

    // ChatGPT usage: Partial
    public synchronized static void turnoffAllListeners() {
        //if (mSocket != null) {
        mSocket.off();
        //}
    }
}
