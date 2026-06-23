import "./global.css";
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { handleNotificationResponse } from './src/services/notificationService';
import { initI18n } from './src/i18n/i18n';

const isExpoGo = Constants.appOwnership === 'expo';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setReady(true));
  }, []);

  useEffect(() => {
    // expo-notifications ไม่รองรับบน web
    if (Platform.OS === 'web') return;
    if (isExpoGo) return;

    let subscription;

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
      subscription = Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse,
      );
    } catch (error) {
      if (__DEV__) {
        console.warn('[Notifications] listener setup skipped:', error?.message);
      }
    }

    return () => subscription?.remove?.();
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
