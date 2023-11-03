package com.davidzhang.androidcasinouser;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.SharedPreferences;

public class ThemeManager {

    private static final String MyPREFERENCES = "ACEMyThemePref" ;
    private static final String Theme = "ACEThemeKey";
    private SharedPreferences sharedpreferences;

    private static ThemeManager instance;

    private static final int[] themeIdList = {
            R.style.HolidayStorm,
            R.style.FrostNova,
            R.style.Victoria,
            R.style.Merchant,
            R.style.GameReady
    };

    private static final String[] themeNameList = {
            "Holiday Storm",
            "Frost Nova",
            "Victoria",
            "Merchant",
            "Game Ready"
    };

    //ChatGPT usage: No
    private ThemeManager(Context context) {
        sharedpreferences = context.getSharedPreferences(MyPREFERENCES, Context.MODE_PRIVATE);
    }

    //ChatGPT usage: No
    public static synchronized ThemeManager getInstance(Context context) {
        if(instance == null)
            instance = new ThemeManager(context.getApplicationContext()); // Use application context to avoid leaks
        return instance;
    }

    //ChatGPT usage: No
    public void setTheme(int themeIndex) {
        SharedPreferences.Editor editor = sharedpreferences.edit();
        editor.putString(Theme, String.valueOf(themeIndex));
        editor.apply();
    }

    //ChatGPT usage: No
    public int getTheme() {
        return Integer.parseInt(sharedpreferences.getString(Theme, "1"));
    }

    //ChatGPT usage: No
    /**
     * @return the a list of theme Names and ids
     */
    static public String[] getThemeList(boolean reversed) {
        if (reversed) {
            String[] reversedThemeNameList = new String[themeNameList.length];
            for (int i = 0; i < themeNameList.length; i++) {
                reversedThemeNameList[i] = themeNameList[themeNameList.length - i - 1];
            }
            return reversedThemeNameList;
        }
        return themeNameList;
    }

    //ChatGPT usage: No
    public void applyCurrentTheme(Activity activity) {
        // no valid theme, go default
        if (getTheme() < 0 || getTheme() >= themeIdList.length) {
            activity.setTheme(themeIdList[0]);
        } else {
            activity.setTheme(themeIdList[getTheme()]);
        }
    }
}