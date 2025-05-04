import { FontAwesome } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { manageNotifications } from '../utils/notifications';

// Handle notification responses
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function TabsLayout() {
  const router = useRouter();
  const notificationListener = useRef();
  const responseListener = useRef();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Check if we should schedule notifications based on saved settings
    manageNotifications();

    // Set up notification listeners
    if (Platform.OS !== 'web') {
      // This listener is fired whenever a notification is received while the app is foregrounded
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        //console.log('Notification received:', notification);
      });

      // This listener is fired whenever a user taps on or interacts with a notification
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        
        // Navigate to the appropriate screen if specified in the notification
        if (data?.screen) {
          router.navigate(data.screen);
        }
      });
    }

    // Clean up listeners on unmount
    return () => {
      if (Platform.OS !== 'web') {
        Notifications.removeNotificationSubscription(notificationListener.current);
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4a86e8',
        tabBarInactiveTintColor: '#888',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null, // This hides the tab from the tab bar
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          title: "Today's Entry",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="pencil" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal History",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="book" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="cog" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <TabsLayout />
    </SafeAreaProvider>
  );
}