import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request notification permissions
export async function registerForPushNotificationsAsync() {
  let token;
  
  // Check if we're on a device (not an emulator) and what platform
  if (Platform.OS === 'android') {
    // Set notification channel for Android
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4a86e8',
    });
  }

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  // Only ask if permissions have not already been determined
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  // If permission not granted, exit with null token
  if (finalStatus !== 'granted') {
    return null;
  }
  
  // Get Expo Push Token
  token = (await Notifications.getExpoPushTokenAsync({
    projectId: Notifications.getExperienceId,
  })).data;
  
  return token;
}

// Schedule a daily notification
export async function scheduleDailyNotification(time: Date) {
  // Cancel any existing notifications first
  await cancelAllScheduledNotifications();
  
  // Get notification hour and minute
  const hours = time.getHours();
  const minutes = time.getMinutes();
  
  // Create trigger for specified time
  const trigger = {
    hour: hours,
    minute: minutes,
    repeats: true,
  };
  
  // Schedule the notification
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily Reflection",
      body: "Take a moment to reflect on your day. What positive thing happened today?",
      data: { screen: 'today' },
    },
    trigger,
  });
  
  // Store the notification ID for later management
  await AsyncStorage.setItem('@notification_id', notificationId);
  
  return notificationId;
}

// Cancel all scheduled notifications
export async function cancelAllScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}


// In your notifications.ts/js utility file
export const manageNotifications = async (enabled?: boolean, time?: Date) => {
  try {
    // Cancel any existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // If notifications not enabled, just return
    if (enabled === false) {
      console.log("Notifications disabled - none scheduled");
      await AsyncStorage.setItem('@notification_enabled', JSON.stringify(false));
      return null;
    }
    
    // Get the notification time
    let notificationDate = new Date();
    if (time instanceof Date && !isNaN(time.getTime())) {
      notificationDate = time;
      console.log("Using provided time:", notificationDate.toLocaleTimeString());
    } else {
      // Default to 6 PM
      notificationDate.setHours(18, 0, 0, 0);
      console.log("Using default time (6 PM)");
    }
    
    const hours = notificationDate.getHours();
    const minutes = notificationDate.getMinutes();
    
    // Format time string with consistent format
    const timeString = `${hours}:${minutes}`;
    
    // Store settings in AsyncStorage as simple values
    await AsyncStorage.setItem('@notification_enabled', JSON.stringify(true));
    await AsyncStorage.setItem('@notification_time', JSON.stringify(timeString));
    
    console.log(`Setting up notification for ${hours}:${minutes}`);
    
    // Schedule the notification using a daily trigger
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Reminder",
        body: "Time to check your app!",
        data: { screen: '/' },
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
    
    // Verify the scheduled notifications
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log("Total scheduled notifications:", scheduledNotifications.length);
    for (const notification of scheduledNotifications) {
      console.log("Scheduled notification:", {
        id: notification.identifier,
        trigger: notification.trigger,
      });
    }
    
    console.log("Notification scheduled successfully with ID:", notificationId);
    return notificationId;
  } catch (error) {
    console.error("Error managing notifications:", error);
    return null;
  }
};

// Check if notification permissions are granted
export async function checkNotificationPermissions() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error("Error checking notification permissions:", error);
    return false;
  }
}
