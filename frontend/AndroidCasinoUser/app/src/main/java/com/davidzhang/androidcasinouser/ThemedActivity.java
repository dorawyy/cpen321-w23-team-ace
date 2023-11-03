package com.davidzhang.androidcasinouser;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

public class ThemedActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Apply the theme
        ThemeManager.getInstance(this).applyCurrentTheme(this);

        super.onCreate(savedInstanceState);
    }
}
