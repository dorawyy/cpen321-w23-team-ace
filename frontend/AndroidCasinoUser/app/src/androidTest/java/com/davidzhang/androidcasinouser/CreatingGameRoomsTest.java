package com.davidzhang.androidcasinouser;

import static androidx.test.espresso.Espresso.onData;
import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.Espresso.pressBack;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.closeSoftKeyboard;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.contrib.RecyclerViewActions.actionOnItemAtPosition;
import static androidx.test.espresso.matcher.ViewMatchers.hasDescendant;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withClassName;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withParent;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.anything;
import static org.hamcrest.Matchers.is;

import android.os.IBinder;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.WindowManager;

import androidx.test.espresso.DataInteraction;
import androidx.test.espresso.Root;
import androidx.test.espresso.ViewInteraction;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.UiObject;
import androidx.test.uiautomator.UiObjectNotFoundException;
import androidx.test.uiautomator.UiSelector;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;
import org.hamcrest.core.IsInstanceOf;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

@LargeTest
@RunWith(AndroidJUnit4.class)

//ChatGPT usage: Partial
public class CreatingGameRoomsTest {

    private UiDevice device;

    @Rule
    public ActivityScenarioRule<MainActivity> mActivityScenarioRule =
            new ActivityScenarioRule<>(MainActivity.class);

    @Before
    public void registerDevice() {
        device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());
    }

    //This should be run after the DailyPointTest so that the account exists that we want to use.
    //Note: We learned to test toast messages and copied the code for that from https://www.qaautomated.com/2016/01/how-to-test-toast-message-using-espresso.html
    //Note: We learned to test recycler views and copied the code for that from https://spin.atomicobject.com/2016/04/15/espresso-testing-recyclerviews/
    @Test
    //ChatGPT usage: Partial
    public void creatingGameRoomsTest() throws InterruptedException, UiObjectNotFoundException {
        //Click Sign in Button
        ViewInteraction id = onView(
                allOf(withText("Sign in"),
                        childAtPosition(
                                allOf(withId(R.id.sign_in_button),
                                        childAtPosition(
                                                withClassName(is("androidx.constraintlayout.widget.ConstraintLayout")),
                                                1)),
                                0),
                        isDisplayed()));
        id.perform(click());



        //Sleep for loading login page
        Thread.sleep(3000);
        //Use UI Automator to sign into the aj's google account
        device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());
        UiObject account = device.findObject(new UiSelector().textContains("ajreiter13@gmail.com"));
        if (account.exists() && account.isEnabled()) {
            account.click();
        }

        //Sleep for leaving login page
        Thread.sleep(3000);

        //Check create lobby button exists
        ViewInteraction button2 = onView(
                allOf(withId(R.id.createLobby), withText("Create Lobby"),
                        withParent(withParent(withId(android.R.id.content))),
                        isDisplayed()));
        button2.check(matches(isDisplayed()));

        //Click create lobby button
        ViewInteraction materialButton = onView(
                allOf(withId(R.id.createLobby), withText("Create Lobby"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                2),
                        isDisplayed()));
        materialButton.perform(click());

        //Check Enter Room Name Text box exists
        onView(withId(R.id.roomNameEditText)).check(matches(isDisplayed()));

        //Check game type spinner exists
        onView(withId(R.id.gameTypeSpinner)).check(matches(isDisplayed()));

        //Check max players text box exists
        onView(withId(R.id.maxPlayersEditText)).check(matches(isDisplayed()));

        //Click on the game type spinner
        ViewInteraction appCompatSpinner = onView(
                allOf(withId(R.id.gameTypeSpinner),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                1),
                        isDisplayed()));
        appCompatSpinner.perform(click());

        //Select baccarat
        DataInteraction appCompatCheckedTextView = onData(anything())
                .inAdapterView(childAtPosition(
                        withClassName(is("android.widget.PopupWindow$PopupBackgroundView")),
                        0))
                .atPosition(2);
        appCompatCheckedTextView.perform(click());

        //Try to create lobby
        ViewInteraction materialButton2 = onView(
                allOf(withId(R.id.createLobbyButton), withText("Create Lobby"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                3),
                        isDisplayed()));
        materialButton2.perform(click());


        //Check create lobby button still exists
        onView(withId(R.id.createLobbyButton)).check(matches(isDisplayed()));

        Thread.sleep(1000);
        onView(withText("Please enter valid info!")).inRoot(new CreatingGameRoomsTest.ToastMatcher())
                .check(matches(isDisplayed()));
        Thread.sleep(2500);

        //Set room name to Test Lobby
        ViewInteraction appCompatEditText = onView(
                allOf(withId(R.id.roomNameEditText),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                0),
                        isDisplayed()));
        appCompatEditText.perform(replaceText("Test Lobby"), closeSoftKeyboard());

        //Try to create the lobby
        ViewInteraction materialButton3 = onView(
                allOf(withId(R.id.createLobbyButton), withText("Create Lobby"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                3),
                        isDisplayed()));
        materialButton3.perform(click());

        //Check the create lobby button still exists
        onView(withId(R.id.createLobbyButton)).check(matches(isDisplayed()));

        Thread.sleep(1000);
        onView(withText("Please enter valid info!")).inRoot(new CreatingGameRoomsTest.ToastMatcher())
                .check(matches(isDisplayed()));
        Thread.sleep(2500);

        //Set room name to back to nothing
        onView(
                allOf(withId(R.id.roomNameEditText),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                0),
                        isDisplayed())).perform(replaceText(""), closeSoftKeyboard());

        //Set max players to 5
        onView(
                allOf(withId(R.id.maxPlayersEditText),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                2),
                        isDisplayed())).perform(replaceText("5"), closeSoftKeyboard());

        //Try to create the lobby
        onView(
                allOf(withId(R.id.createLobbyButton), withText("Create Lobby"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                3),
                        isDisplayed())).perform(click());

        //Check the create lobby button still exists
        onView(withId(R.id.createLobbyButton)).check(matches(isDisplayed()));

        Thread.sleep(1000);
        onView(withText("Please enter valid info!")).inRoot(new CreatingGameRoomsTest.ToastMatcher())
                .check(matches(isDisplayed()));
        Thread.sleep(2500);

        //Set room name to Test Lobby
        onView(
                allOf(withId(R.id.roomNameEditText),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                0),
                        isDisplayed())).perform(replaceText("Test Lobby"), closeSoftKeyboard());


        //Set max players to 0
        ViewInteraction appCompatEditText2 = onView(
                allOf(withId(R.id.maxPlayersEditText),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                2),
                        isDisplayed()));
        appCompatEditText2.perform(replaceText("0"), closeSoftKeyboard());

        //Try to create the lobby
        ViewInteraction materialButton4 = onView(
                allOf(withId(R.id.createLobbyButton), withText("Create Lobby"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                3),
                        isDisplayed()));
        materialButton4.perform(click());

        //Check the create lobby button still exists
        onView(withId(R.id.createLobbyButton)).check(matches(isDisplayed()));

        Thread.sleep(1000);
        onView(withText("Please enter valid info!")).inRoot(new CreatingGameRoomsTest.ToastMatcher())
                .check(matches(isDisplayed()));
        Thread.sleep(2500);

        //Set max players to 5
        ViewInteraction appCompatEditText4 = onView(
                allOf(withId(R.id.maxPlayersEditText), withText("0"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                2),
                        isDisplayed()));
        appCompatEditText4.perform(replaceText("5"));

        //Set room name to Test Lobby
        appCompatEditText = onView(
                allOf(withId(R.id.roomNameEditText),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                0),
                        isDisplayed()));
        appCompatEditText.perform(replaceText("Test Lobby"), closeSoftKeyboard());


        //Try to create lobby
        ViewInteraction materialButton5 = onView(
                allOf(withId(R.id.createLobbyButton), withText("Create Lobby"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                3),
                        isDisplayed()));
        materialButton5.perform(click());


        Thread.sleep(5000);
        //Go back to create lobby
        onView(withId(R.id.createLobby)).perform(click());

        //Re enter old name
        ViewInteraction appCompatEditText6 = onView(
                allOf(withId(R.id.roomNameEditText),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                0),
                        isDisplayed()));
        appCompatEditText6.perform(replaceText("Test Lobby"), closeSoftKeyboard());

        //Set max players to 5
        ViewInteraction appCompatEditText7 = onView(
                allOf(withId(R.id.maxPlayersEditText),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                2),
                        isDisplayed()));
        appCompatEditText7.perform(replaceText("5"), closeSoftKeyboard());

        //Try to create lobby again
        ViewInteraction materialButton7 = onView(
                allOf(withId(R.id.createLobbyButton), withText("Create Lobby"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                3),
                        isDisplayed()));
        materialButton7.perform(click());

        //Check create lobby button still exists
        onView(withId(R.id.createLobbyButton)).check(matches(isDisplayed()));

        Thread.sleep(1000);
        onView(withText("Room already exist, please use a new name!")).inRoot(new CreatingGameRoomsTest.ToastMatcher())
                .check(matches(isDisplayed()));
        Thread.sleep(2500);

        //Go back
        pressBack();

        //Check go to lobbies button exists
        onView(withId(R.id.navigateToLobbiesButton)).check(matches(isDisplayed()));

        //Click go to lobbies
        ViewInteraction materialButton8 = onView(
                allOf(withId(R.id.navigateToLobbiesButton), withText("Go to Lobbies"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                1),
                        isDisplayed()));
        materialButton8.perform(click());

        //Check our lobby exists
        ViewInteraction textView = onView(
                allOf(withId(R.id.textViewLobbyName), withText("Lobby Name: Test Lobby"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.FrameLayout.class))),
                        isDisplayed()));
        textView.check(matches(withText("Lobby Name: Test Lobby")));

        //Click on it
        ViewInteraction recyclerView = onView(
                allOf(withId(R.id.lobbiesRecyclerView),
                        childAtPosition(
                                withClassName(is("android.widget.LinearLayout")),
                                0)));
        recyclerView.perform(actionOnItemAtPosition(0, click()));


        //Check that the leave lobby button exists
        onView(withId(R.id.btnLeaveLobby)).check(matches(isDisplayed()));

        //Check the players ready count
        ViewInteraction textView2 = onView(
                allOf(withId(R.id.tvPlayersReady), withText("Players Ready: 0/1"),
                        withParent(withParent(withId(android.R.id.content))),
                        isDisplayed()));
        textView2.check(matches(withText("Players Ready: 0/1")));

        //Check game type
        ViewInteraction textView3 = onView(
                allOf(withId(R.id.tvGameType), withText("Game Type: Baccarat"),
                        withParent(withParent(withId(android.R.id.content))),
                        isDisplayed()));
        textView3.check(matches(withText("Game Type: Baccarat")));

        //Check lobby name
        ViewInteraction textView4 = onView(
                allOf(withId(R.id.tvLobbyName), withText("Lobby Name: Test Lobby"),
                        withParent(withParent(withId(android.R.id.content))),
                        isDisplayed()));
        textView4.check(matches(withText("Lobby Name: Test Lobby")));

        //Click leave lobby
        ViewInteraction materialButton9 = onView(
                allOf(withId(R.id.btnLeaveLobby), withText("Leave Lobby"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                0),
                        isDisplayed()));
        materialButton9.perform(click());

        //Check our lobby is still on the list
        ViewInteraction textView5 = onView(
                allOf(withId(R.id.textViewLobbyName), withText("Lobby Name: Test Lobby"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.FrameLayout.class))),
                        isDisplayed()));
        textView5.check(matches(withText("Lobby Name: Test Lobby")));

        //Go back
        pressBack();
    }

    private static Matcher<View> childAtPosition(
            final Matcher<View> parentMatcher, final int position) {

        return new TypeSafeMatcher<View>() {
            @Override
            public void describeTo(Description description) {
                description.appendText("Child at position " + position + " in parent ");
                parentMatcher.describeTo(description);
            }

            @Override
            public boolean matchesSafely(View view) {
                ViewParent parent = view.getParent();
                return parent instanceof ViewGroup && parentMatcher.matches(parent)
                        && view.equals(((ViewGroup) parent).getChildAt(position));
            }
        };
    }

    public static class ToastMatcher extends TypeSafeMatcher<Root> {

        @Override
        public void describeTo(Description description) {
            description.appendText("is toast");
        }

        @Override
        public boolean matchesSafely(Root root) {
            int type = root.getWindowLayoutParams().get().type;
            if ((type == WindowManager.LayoutParams.TYPE_TOAST)) {
                IBinder windowToken = root.getDecorView().getWindowToken();
                IBinder appToken = root.getDecorView().getApplicationWindowToken();
                if (windowToken == appToken) {
                    return true;
                }
            }
            return false;
        }
    }
}
