plugins {
    id("com.android.application")
}

android {
    namespace = "com.davidzhang.androidcasinouser"
    compileSdk = 33

    defaultConfig {
        applicationId = "com.davidzhang.androidcasinouser"
        minSdk = 24
        targetSdk = 33
        versionCode = 2
        versionName = "2.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }



    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions {

        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    packagingOptions {
        exclude ("META-INF/DEPENDENCIES")
        exclude ("META-INF/LICENSE.md")
        exclude ("META-INF/NOTICE.md")
    }


}

dependencies {

    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.9.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    implementation("com.google.android.gms:play-services-maps:18.1.0")
    implementation("com.google.android.gms:play-services-auth:20.7.0")
    implementation ("com.google.api-client:google-api-client-android:2.2.0")
    implementation ("com.google.apis:google-api-services-gmail:v1-rev20231023-2.0.0")
    implementation ("io.socket:socket.io-client:2.1.0")
    implementation ("androidx.cardview:cardview:1.0.0")
    implementation ("androidx.recyclerview:recyclerview:1.3.2")
    implementation ("com.sun.mail:android-mail:1.6.7")
    implementation ("com.sun.mail:android-activation:1.6.7")
    implementation ("com.google.http-client:google-http-client-android:1.39.2")
    implementation ("com.google.code.gson:gson:2.10.1")
    implementation ("com.google.http-client:google-http-client-jackson2:1.39.2")

}