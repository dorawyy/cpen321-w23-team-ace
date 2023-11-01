package com.davidzhang.androidcasinouser;
import android.os.Parcel;
import android.os.Parcelable;

public class User implements Parcelable {
    private String id;
    private String userId;
    private String username;
    private int balance;
    private boolean isAdmin;
    private boolean isChatBanned;
    private String lastRedemptionDate;

    // ChatGPT usage: No
    public User() {
    }

    // ChatGPT usage: No
    public String getId() {
        return id;
    }

    // ChatGPT usage: No
    public String getUserId() {
        return userId;
    }

    // ChatGPT usage: No
    public String getUsername() {
        return username;
    }

    // ChatGPT usage: No
    public int getBalance() {
        return balance;
    }

    // ChatGPT usage: No
    public boolean isAdmin() {
        return isAdmin;
    }

    // ChatGPT usage: No
    public boolean isChatBanned() {
        return isChatBanned;
    }

    // ChatGPT usage: No
    public String getLastRedemptionDate() {
        return lastRedemptionDate;
    }

    // ChatGPT usage: No
    public void setId(String id) {
        this.id = id;
    }

    // ChatGPT usage: No
    public void setUserId(String userId) {
        this.userId = userId;
    }

    // ChatGPT usage: No
    public void setUsername(String username) {
        this.username = username;
    }

    // ChatGPT usage: No
    public void setBalance(int balance) {
        this.balance = balance;
    }

    // ChatGPT usage: No
    public void setAdmin(boolean admin) {
        isAdmin = admin;
    }

    // ChatGPT usage: No
    public void setChatBanned(boolean chatBanned) {
        isChatBanned = chatBanned;
    }

    // ChatGPT usage: No
    public void setLastRedemptionDate(String lastRedemptionDate) {
        this.lastRedemptionDate = lastRedemptionDate;
    }

    // ChatGPT usage: No
    protected User(Parcel in) {
        id = in.readString();
        userId = in.readString();
        username = in.readString();
        balance = in.readInt();
        isAdmin = in.readByte() != 0;
        isChatBanned = in.readByte() != 0;
        lastRedemptionDate = in.readString();
    }

    // ChatGPT usage: No
    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(id);
        dest.writeString(userId);
        dest.writeString(username);
        dest.writeInt(balance);
        dest.writeByte((byte) (isAdmin ? 1 : 0));
        dest.writeByte((byte) (isChatBanned ? 1 : 0));
        dest.writeString(lastRedemptionDate);
    }

    // ChatGPT usage: No
    @Override
    public int describeContents() {
        return 0;
    }

    // ChatGPT usage: No
    public static final Creator<User> CREATOR = new Creator<User>() {
        @Override
        public User createFromParcel(Parcel in) {
            return new User(in);
        }

        @Override
        public User[] newArray(int size) {
            return new User[size];
        }
    };
}
