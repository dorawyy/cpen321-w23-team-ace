package com.davidzhang.androidcasinouser;


import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.closeSoftKeyboard;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.action.ViewActions.scrollTo;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withClassName;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withParent;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.is;

import android.os.IBinder;
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
public class DailyPointTest {

    private UiDevice device;

    @Rule
    public ActivityScenarioRule<MainActivity> mActivityScenarioRule =
            new ActivityScenarioRule<>(MainActivity.class);

    @Before
    public void registerDevice() {
        device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());
    }

    //This test will sign in and create a new user then proceed to test the daily points redemption use case.
    //Note: We learned to test toast messages and copied the code for that from https://www.qaautomated.com/2016/01/how-to-test-toast-message-using-espresso.html
    @Test
    //ChatGPT usage: Partial
    public void dailyPointTest() throws UiObjectNotFoundException, InterruptedException {

        //Check Sign In Button Exists
        ViewInteraction button = onView(
                allOf(withText("Sign in"),
                        withParent(allOf(withId(R.id.sign_in_button),
                                withParent(IsInstanceOf.<View>instanceOf(ViewGroup.class)))),
                        isDisplayed()));
        button.check(matches(isDisplayed()));

        //Click Sign In Button
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

        //Assert New Account Name Line Exists
        onView(withId(R.id.accountNameEditText)).check(matches(isDisplayed()));


        //Assert New Account Button Exists
        onView(withId(R.id.createAccountButton)).check(matches(isDisplayed()));

        //Enter New Account Name - Test User
        ViewInteraction appCompatEditText = onView(
                allOf(withId(R.id.accountNameEditText),
                        childAtPosition(
                                childAtPosition(
                                        withClassName(is("android.widget.ScrollView")),
                                        0),
                                0)));
        appCompatEditText.perform(scrollTo(), replaceText("Test User"), closeSoftKeyboard());

        //Press create account button
        ViewInteraction materialButton = onView(
                allOf(withId(R.id.createAccountButton), withText("Create Account"),
                        childAtPosition(
                                childAtPosition(
                                        withClassName(is("android.widget.ScrollView")),
                                        0),
                                1)));
        materialButton.perform(scrollTo(), click());

        //Check account page button exists
        ViewInteraction button3 = onView(
                allOf(withId(R.id.userProfileButton), withText("Username: Test User"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.LinearLayout.class))),
                        isDisplayed()));
        button3.check(matches(isDisplayed()));

        //Click account page button
        ViewInteraction materialButton2 = onView(
                allOf(withId(R.id.userProfileButton), withText("Username: Test User"),
                        childAtPosition(
                                childAtPosition(
                                        withClassName(is("android.widget.LinearLayout")),
                                        0),
                                0),
                        isDisplayed()));
        materialButton2.perform(click());

        //Check that the balance is 100
        onView(withId(R.id.balanceTextView)).check(matches(withText("Balance: 100.0")));

        //Check that the redeem button exists
        ViewInteraction button4 = onView(
                allOf(withId(R.id.redemptionButton), withText("Request Daily Points"),
                        withParent(withParent(withId(android.R.id.content))),
                        isDisplayed()));
        button4.check(matches(isDisplayed()));

        //Click the redeem button
        ViewInteraction materialButton3 = onView(
                allOf(withId(R.id.redemptionButton), withText("Request Daily Points"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                2),
                        isDisplayed()));
        materialButton3.perform(click());

        Thread.sleep(1000);

        //Check the balance is now 150
        onView(withId(R.id.balanceTextView)).check(matches(withText("Balance: 150")));

        //Click the redeem button
        ViewInteraction materialButton4 = onView(
                allOf(withId(R.id.redemptionButton), withText("Request Daily Points"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                2),
                        isDisplayed()));
        materialButton4.perform(click());

        Thread.sleep(500);
        onView(withText("You have already requested points today! Come back to redeem tomorrow!")).inRoot(new ToastMatcher())
                .check(matches(isDisplayed()));
        Thread.sleep(2500);

        //Check the balance is still 150
        onView(withId(R.id.balanceTextView)).check(matches(withText("Balance: 150")));

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
