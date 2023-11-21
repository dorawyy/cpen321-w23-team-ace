package com.davidzhang.androidcasinouser;


import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.closeSoftKeyboard;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.contrib.RecyclerViewActions.actionOnItemAtPosition;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withClassName;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withParent;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.is;

import android.os.IBinder;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.WindowManager;

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
public class PlayingBaccaratGameTest {

    private UiDevice device;
    @Rule
    public ActivityScenarioRule<MainActivity> mActivityScenarioRule =
            new ActivityScenarioRule<>(MainActivity.class);

    @Before
    public void registerDevice() {
        device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());
    }

    //This test should be run after the creating game rooms test, as it uses that lobby.
    @Test
    //ChatGPT usage: Partial
    public void playingBaccaratGameTest() throws InterruptedException, UiObjectNotFoundException {
        //Sign in
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

        //Go to lobbies
        ViewInteraction materialButton = onView(
                allOf(withId(R.id.navigateToLobbiesButton), withText("Go to Lobbies"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                1),
                        isDisplayed()));
        materialButton.perform(click());

        //Pick room
        ViewInteraction recyclerView = onView(
                allOf(withId(R.id.lobbiesRecyclerView),
                        childAtPosition(
                                withClassName(is("android.widget.LinearLayout")),
                                0)));
        recyclerView.perform(actionOnItemAtPosition(0, click()));

        //Place bet
        ViewInteraction materialButton2 = onView(
                allOf(withId(R.id.btnPlaceBetsReadyUp), withText("Place Bets and Ready Up"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                7),
                        isDisplayed()));
        materialButton2.perform(click());

        Thread.sleep(1000);
        onView(withText("Bet cannot be empty")).inRoot(new PlayingBaccaratGameTest.ToastMatcher())
                .check(matches(isDisplayed()));
        Thread.sleep(2500);

        //set bet
        ViewInteraction appCompatEditText = onView(
                allOf(withId(R.id.etPlaceBet),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                4),
                        isDisplayed()));
        appCompatEditText.perform(replaceText("5"), closeSoftKeyboard());

        //place bet
        ViewInteraction materialButton3 = onView(
                allOf(withId(R.id.btnPlaceBetsReadyUp), withText("Place Bets and Ready Up"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                7),
                        isDisplayed()));
        materialButton3.perform(click());

        Thread.sleep(1000);
        onView(withText("Please select PlayerWin or DealerWin")).inRoot(new PlayingBaccaratGameTest.ToastMatcher())
                .check(matches(isDisplayed()));
        Thread.sleep(2500);

        //Select players win
        ViewInteraction materialButton4 = onView(
                allOf(withId(R.id.btnPlayersWin), withText("Players Win"),
                        childAtPosition(
                                childAtPosition(
                                        withClassName(is("android.widget.LinearLayout")),
                                        5),
                                0),
                        isDisplayed()));
        materialButton4.perform(click());

        Thread.sleep(3000);

        //Set bet to characters
        ViewInteraction appCompatEditText3 = onView(
                allOf(withId(R.id.etPlaceBet), withText("5"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                4),
                        isDisplayed()));
        appCompatEditText3.perform(replaceText("adaw"));

        //set bet
        ViewInteraction materialButton5 = onView(
                allOf(withId(R.id.btnPlaceBetsReadyUp), withText("Place Bets and Ready Up"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                7),
                        isDisplayed()));
        materialButton5.perform(click());

        Thread.sleep(1000);
        onView(withText("Invalid bet. Please enter a valid integer")).inRoot(new PlayingBaccaratGameTest.ToastMatcher())
                .check(matches(isDisplayed()));
        Thread.sleep(2500);


        //TODO: NEGATIVE BET TEST


        //Set bet to 200
        ViewInteraction appCompatEditText5 = onView(
                allOf(withId(R.id.etPlaceBet), withText("adaw"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                4),
                        isDisplayed()));
        appCompatEditText5.perform(replaceText("200"));


        //Set bet
        ViewInteraction materialButton6 = onView(
                allOf(withId(R.id.btnPlaceBetsReadyUp), withText("Place Bets and Ready Up"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                7),
                        isDisplayed()));
        materialButton6.perform(click());

        Thread.sleep(1000);
        onView(withText("Bet cannot be greater than balance")).inRoot(new PlayingBaccaratGameTest.ToastMatcher())
                .check(matches(isDisplayed()));
        Thread.sleep(2500);

        //Set bet to 10
        ViewInteraction appCompatEditText8 = onView(
                allOf(withId(R.id.etPlaceBet), withText("200"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                4),
                        isDisplayed()));
        appCompatEditText8.perform(replaceText("10"));

        //Place bet
        ViewInteraction materialButton7 = onView(
                allOf(withId(R.id.btnPlaceBetsReadyUp), withText("Place Bets and Ready Up"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                7),
                        isDisplayed()));
        materialButton7.perform(click());

        Thread.sleep(2000);

        //Check lobby name
        ViewInteraction textView = onView(
                allOf(withId(R.id.lobbyNameLabel), withText("Lobby Name: Test Lobby"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.view.ViewGroup.class))),
                        isDisplayed()));
        textView.check(matches(withText("Lobby Name: Test Lobby")));

        //Check game type
        ViewInteraction textView2 = onView(
                allOf(withId(R.id.gameTypeLabel), withText("Game Type: Baccarat"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.view.ViewGroup.class))),
                        isDisplayed()));
        textView2.check(matches(withText("Game Type: Baccarat")));

        //Check dealer card 1
        ViewInteraction textView3 = onView(
                allOf(withId(R.id.dealer_card_1), withText("\n"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.LinearLayout.class))),
                        isDisplayed()));
        textView3.check(matches(isDisplayed()));

        //Check dealer card 2
        ViewInteraction textView4 = onView(
                allOf(withId(R.id.dealer_card_2), withText("\n"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.LinearLayout.class))),
                        isDisplayed()));
        textView4.check(matches(isDisplayed()));

        //Check dealer card 3
        ViewInteraction textView5 = onView(
                allOf(withId(R.id.dealer_card_3), withText("\n"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.LinearLayout.class))),
                        isDisplayed()));
        textView5.check(matches(isDisplayed()));

        //Check dealer card 4
        ViewInteraction textView6 = onView(
                allOf(withId(R.id.dealer_card_4), withText("\n"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.LinearLayout.class))),
                        isDisplayed()));
        textView6.check(matches(isDisplayed()));

        //Check dealer card 5
        ViewInteraction textView7 = onView(
                allOf(withId(R.id.dealer_card_5), withText("\n"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.LinearLayout.class))),
                        isDisplayed()));
        textView7.check(matches(isDisplayed()));

        //Check dealer card 6
        ViewInteraction textView8 = onView(
                allOf(withId(R.id.dealer_card_6), withText("\n"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.LinearLayout.class))),
                        isDisplayed()));
        textView8.check(matches(isDisplayed()));

        //Check player card 1
        ViewInteraction textView9 = onView(
                allOf(withId(R.id.player_card_1), withText("\n"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.LinearLayout.class))),
                        isDisplayed()));
        textView9.check(matches(isDisplayed()));

        //Check player card 2
        ViewInteraction textView10 = onView(
                allOf(withId(R.id.player_card_2), withText("\n"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.LinearLayout.class))),
                        isDisplayed()));
        textView10.check(matches(isDisplayed()));

        //Check player card 3
        ViewInteraction textView11 = onView(
                allOf(withId(R.id.player_card_3), withText("\n"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.LinearLayout.class))),
                        isDisplayed()));
        textView11.check(matches(isDisplayed()));

        //Check player card 4
        ViewInteraction textView12 = onView(
                allOf(withId(R.id.player_card_4), withText("\n"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.LinearLayout.class))),
                        isDisplayed()));
        textView12.check(matches(isDisplayed()));

        //Check player card 5
        ViewInteraction textView13 = onView(
                allOf(withId(R.id.player_card_5), withText("\n"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.LinearLayout.class))),
                        isDisplayed()));
        textView13.check(matches(isDisplayed()));

        //Check player card 6
        ViewInteraction textView14 = onView(
                allOf(withId(R.id.player_card_6), withText("\n"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.LinearLayout.class))),
                        isDisplayed()));
        textView14.check(matches(isDisplayed()));

        //Check dealer score label
        ViewInteraction textView15 = onView(
                allOf(withId(R.id.dealerScoreLabel), withText("Dealer Score:"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.LinearLayout.class))),
                        isDisplayed()));
        textView15.check(matches(withText("Dealer Score:")));

        //Check player score label
        ViewInteraction textView16 = onView(
                allOf(withId(R.id.playerScoreLabel), withText("Table Score:"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.LinearLayout.class))),
                        isDisplayed()));
        textView16.check(matches(withText("Table Score:")));

        Thread.sleep(12000);//Give time for all cards to come from server and get dealt

        //Check OK button
        ViewInteraction button = onView(
                allOf(withId(R.id.okButton), withText("OK"),
                        withParent(allOf(withId(R.id.popupContainer),
                                withParent(IsInstanceOf.<View>instanceOf(android.view.ViewGroup.class)))),
                        isDisplayed()));
        button.check(matches(isDisplayed()));

        //Click OK
        ViewInteraction materialButton8 = onView(
                allOf(withId(R.id.okButton), withText("OK"),
                        childAtPosition(
                                allOf(withId(R.id.popupContainer),
                                        childAtPosition(
                                                withClassName(is("androidx.constraintlayout.widget.ConstraintLayout")),
                                                0)),
                                2),
                        isDisplayed()));
        materialButton8.perform(click());

        //Check place bets button exists
        ViewInteraction button2 = onView(
                allOf(withId(R.id.btnPlaceBetsReadyUp), withText("Place Bets and Ready Up"),
                        withParent(withParent(withId(android.R.id.content))),
                        isDisplayed()));
        button2.check(matches(isDisplayed()));
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

    public class ToastMatcher extends TypeSafeMatcher<Root> {

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
