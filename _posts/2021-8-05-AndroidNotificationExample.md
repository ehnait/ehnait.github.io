---
title: 'Android Notification Example (兼容8.0)'
categories: 
  - 移动端
tags:
  - Android
---

Demonstration of using channels to categorize notifications by topic. This feature was added in Android O, and allows users to have fine-grained control over their notificatin preferences.

## MainActivity.kt

```java
class MainActivity : AppCompatActivity() {

    private lateinit var ui: MainUi

    /*
     * Class for managing notifications
     */
    private lateinit var helper: NotificationHelper

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        ui = MainUi(activity_main)
        helper = NotificationHelper(this)
    }

    /**
     * Send activity notifications.
     * @param id The ID of the notification to create
     * *
     * @param title The title of the notification
     */
    fun sendNotification(id: Int, title: String) {
        when (id) {
            NOTI_PRIMARY1 -> helper.notify(
                id, helper.getNotification1(title, getString(R.string.primary1_body)))
            NOTI_PRIMARY2 -> helper.notify(
                id, helper.getNotification1(title, getString(R.string.primary2_body)))
            NOTI_SECONDARY1 -> helper.notify(
                id, helper.getNotification2(title, getString(R.string.secondary1_body)))
            NOTI_SECONDARY2 -> helper.notify(
                id, helper.getNotification2(title, getString(R.string.secondary2_body)))
        }
    }

    /**
     * Send Intent to load system Notification Settings for this app.
     */
    fun goToNotificationSettings() {
        val i = Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
        i.putExtra(Settings.EXTRA_APP_PACKAGE, packageName)
        startActivity(i)
    }

    /**
     * Send intent to load system Notification Settings UI for a particular channel.
     * @param channel Name of channel to configure
     */
    fun goToNotificationSettings(channel: String) {
        val i = Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS)
        i.putExtra(Settings.EXTRA_APP_PACKAGE, packageName)
        i.putExtra(Settings.EXTRA_CHANNEL_ID, channel)
        startActivity(i)
    }

    /**
     * View model for interacting with Activity UI elements. (Keeps core logic for sample
     * seperate.)
     */
    internal inner class MainUi (root: View) : View.OnClickListener {

        init {
            main_primary_send1.setOnClickListener(this)
            main_primary_send2.setOnClickListener(this)
            main_primary_config.setOnClickListener(this)

            main_secondary_send1.setOnClickListener(this)
            main_secondary_send2.setOnClickListener(this)
            main_secondary_config.setOnClickListener(this)

            (root.findViewById<View>(R.id.btnA) as Button).setOnClickListener(this)
        }

        private val titlePrimaryText: String
            get() {
                if (main_primary_title != null) {
                    return main_primary_title.text.toString()
                }
                return ""
            }

        private val titleSecondaryText: String
            get() {
                if (main_primary_title != null) {
                    return main_secondary_title.text.toString()
                }
                return ""
            }

        override fun onClick(view: View) {
            when (view.id) {
                R.id.main_primary_send1 -> sendNotification(NOTI_PRIMARY1, titlePrimaryText)
                R.id.main_primary_send2 -> sendNotification(NOTI_PRIMARY2, titlePrimaryText)
                R.id.main_primary_config -> goToNotificationSettings(NotificationHelper.PRIMARY_CHANNEL)

                R.id.main_secondary_send1 -> sendNotification(NOTI_SECONDARY1, titleSecondaryText)
                R.id.main_secondary_send2 -> sendNotification(NOTI_SECONDARY2, titleSecondaryText)
                R.id.main_secondary_config -> goToNotificationSettings(NotificationHelper.SECONDARY_CHANNEL)
                R.id.btnA -> goToNotificationSettings()
                else -> Log.e(TAG, "Unknown click event.")
            }
        }
    }

    companion object {
        private val TAG = MainActivity::class.java.simpleName

        private const val NOTI_PRIMARY1 = 1100
        private const val NOTI_PRIMARY2 = 1101
        private const val NOTI_SECONDARY1 = 1200
        private const val NOTI_SECONDARY2 = 1201
    }
}
```

## NotificationHelper.kt

```java
/**
 * Helper class to manage notification channels, and create notifications.
 */
internal class NotificationHelper
/**
 * Registers notification channels, which can be used later by individual notifications.
 * @param ctx The application context
 */
(ctx: Context) : ContextWrapper(ctx) {
    private val manager: NotificationManager by lazy {
        getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    }

    init {

        val chan1 = NotificationChannel(PRIMARY_CHANNEL,
                getString(R.string.noti_channel_default), NotificationManager.IMPORTANCE_DEFAULT)
        chan1.lightColor = Color.GREEN
        chan1.lockscreenVisibility = Notification.VISIBILITY_PRIVATE
        manager.createNotificationChannel(chan1)

        val chan2 = NotificationChannel(SECONDARY_CHANNEL,
                getString(R.string.noti_channel_second), NotificationManager.IMPORTANCE_HIGH)
        chan2.lightColor = Color.BLUE
        chan2.lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        manager.createNotificationChannel(chan2)
    }

    /**
     * Get a notification of type 1
     * Provide the builder rather than the notification it's self as useful for making notification
     * changes.
     * @param title the title of the notification
     * *
     * @param body the body text for the notification
     * *
     * @return the builder as it keeps a reference to the notification (since API 24)
     */
    fun getNotification1(title: String, body: String): Notification.Builder {
        return Notification.Builder(applicationContext, PRIMARY_CHANNEL)
                .setContentTitle(title)
                .setContentText(body)
                .setSmallIcon(smallIcon)
                .setAutoCancel(true)
    }

    /**
     * Build notification for secondary channel.
     * @param title Title for notification.
     * *
     * @param body Message for notification.
     * *
     * @return A Notification.Builder configured with the selected channel and details
     */
    fun getNotification2(title: String, body: String): Notification.Builder {
        return Notification.Builder(applicationContext, SECONDARY_CHANNEL)
                .setContentTitle(title)
                .setContentText(body)
                .setSmallIcon(smallIcon)
                .setAutoCancel(true)
    }

    /**
     * Send a notification.
     * @param id The ID of the notification
     * *
     * @param notification The notification object
     */
    fun notify(id: Int, notification: Notification.Builder) {
        manager.notify(id, notification.build())
    }

    /**
     * Get the small icon for this app
     * @return The small icon resource id
     */
    private val smallIcon: Int
        get() = android.R.drawable.stat_notify_chat


    companion object {
        val PRIMARY_CHANNEL = "default"
        val SECONDARY_CHANNEL = "second"
    }
}
```

## activity_main.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:id="@+id/activity_main"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:paddingBottom="@dimen/activity_vertical_margin"
    android:paddingLeft="@dimen/activity_horizontal_margin"
    android:paddingRight="@dimen/activity_horizontal_margin"
    android:paddingTop="@dimen/activity_vertical_margin"
    tools:context=".MainActivity">

    <GridLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:rowCount="7"
        android:columnCount="2"
        android:orientation="horizontal">

        <EditText
            android:id="@+id/main_primary_title"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_columnSpan="2"
            android:layout_gravity="fill_horizontal"
            android:hint="@string/main_primary_title"
            android:text="@string/main_primary_title" />

        <Button
            android:id="@+id/main_primary_send1"
            android:layout_columnWeight="1"
            android:layout_height="wrap_content"

            android:text="@string/main_primary_send1" />

        <Button
            android:id="@+id/main_primary_send2"
            android:layout_columnWeight="1"
            android:layout_height="wrap_content"

            android:text="@string/main_primary_send2" />

        <ImageButton
            android:id="@+id/main_primary_config"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_columnSpan="2"
            android:layout_gravity="fill_horizontal"

            android:src="@android:drawable/ic_menu_preferences"
            android:contentDescription="@string/main_primary_config" />

        <Space
            android:layout_width="match_parent"
            android:layout_height="48dp"
            android:layout_columnSpan="2"
            android:layout_gravity="fill_horizontal" />

        <EditText
            android:id="@+id/main_secondary_title"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_columnSpan="2"
            android:layout_gravity="fill_horizontal"
            android:hint="@string/main_secondary_title"
            android:text="@string/main_secondary_title" />

        <Button
            android:id="@+id/main_secondary_send1"
            android:layout_columnWeight="1"
            android:layout_height="wrap_content"

            android:text="@string/main_secondary_send1" />

        <Button
            android:id="@+id/main_secondary_send2"
            android:layout_columnWeight="1"
            android:layout_height="wrap_content"

            android:text="@string/main_secondary_send2"/>


        <ImageButton
            android:id="@+id/main_secondary_config"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_columnSpan="2"
            android:layout_gravity="fill_horizontal"

            android:src="@android:drawable/ic_menu_preferences"
            android:contentDescription="@string/main_secondary_config" />

    </GridLayout>

    <LinearLayout
        android:id="@+id/main_footer"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:layout_alignParentBottom="true">

        <Button
            android:text="@string/btnA_title"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:id="@+id/btnA"
            android:layout_weight="1" />
    </LinearLayout>


</RelativeLayout>
```

## strings.xml

```xml
<resources>
    <string name="btn1_description">Start foreground service</string>
    <string name="btn1_title" >Start</string>
    <string name="simple_service_title">Simple Service</string>
    <string name="simple_service_desc">Simple Service from the OTest app</string>

    <string name="main_create_noti2_btn">Send</string>

    <string name="btnA_title">Go to Settings</string>
    <string name="noti_channel_default">Primary Channel</string>
    <string name="noti1_title">Notification 1 Title</string>
    <string name="primary1_body">The content</string>
    <string name="noti2_title">Second notification</string>
    <string name="secondary1_body">Notification body text.</string>
    <string name="noti_channel_second">Secondary Channel</string>

    <string name="main_primary_title">Primary Channel</string>
    <string name="main_primary_send1">Send 1</string>
    <string name="main_primary_send2">Send 2</string>
    <string name="main_primary_config">Go to primary settings</string>

    <string name="main_secondary_title">Secondary Channel</string>
    <string name="main_secondary_send1">Send 1</string>
    <string name="main_secondary_send2">Send 2</string>
    <string name="main_secondary_config">Go to secondary settings</string>
    <string name="primary2_body">Second Notification for Primary Channel</string>
    <string name="secondary2_body">Second Notification for Secondary Channel</string>
</resources>
```

## 预览

![20210805_1](/assets/images/20210805_1.gif)
