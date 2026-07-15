import "./global.css";
import React, { useCallback, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { flushPendingNavigation, navigate, navigationRef } from './src/navigation/navigationRef';
import {
  handleNotificationResponse,
  handlePushTokenChange,
  saveNotificationToInbox,
  syncNotificationInboxFromBackend,
} from './src/services/notificationService';
import { initI18n } from './src/i18n/i18n';
import { isExpoGo } from './src/utils/runtime';
import NotificationToast, { showToast } from './src/components/NotificationToast';

const handleToastPress = (notification) => {
  const data = notification?.request?.content?.data ?? {};
  if (data.type === "announcement") {
    navigate("Announcements", { highlightId: data.announcement_id });
    return;
  }
  navigate("Notifications");
};

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    syncNotificationInboxFromBackend().catch(() => {});
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        syncNotificationInboxFromBackend().catch(() => {});
      }
    });
    return () => subscription.remove();
  }, [ready]);

  useEffect(() => {
    // expo-notifications ไม่รองรับบน web
    if (Platform.OS === 'web') return;
    if (isExpoGo) return;

    let responseSubscription;
    let receivedSubscription;
    let tokenSubscription;

    try {
      const Notifications = require('expo-notifications');

      // ผู้ใช้แตะ notification ขณะ app ปิดอยู่ (killed state)
      Notifications.getLastNotificationResponseAsync()
        .then((response) => {
          if (response) handleNotificationResponse(response);
        })
        .catch((error) => {
          if (__DEV__) {
            console.warn('[Notifications] get last response failed:', error?.message);
          }
        });

      // ผู้ใช้แตะ notification ขณะ app อยู่ background
      responseSubscription = Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse,
      );

      receivedSubscription = Notifications.addNotificationReceivedListener(
        (notification) => {
          saveNotificationToInbox(notification);
          showToast(notification);
        },
      );

      tokenSubscription = Notifications.addPushTokenListener(
        handlePushTokenChange,
      );
    } catch (error) {
      if (__DEV__) {
        console.warn('[Notifications] listener setup skipped:', error?.message);
      }
    }

    return () => {
      responseSubscription?.remove?.();
      receivedSubscription?.remove?.();
      tokenSubscription?.remove?.();
    };
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef} onReady={flushPendingNavigation}>
        <AppNavigator />
      </NavigationContainer>
      <NotificationToast onPress={handleToastPress} />
    </SafeAreaProvider>
  );
}
