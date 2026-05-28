/**
 * notificationService.js
 *
 * การทำงาน:
 *  1. ขอ permission + ดึง Expo Push Token
 *  2. ส่ง token ไปเก็บที่ backend (POST /api/push-token)
 *  3. กำหนดว่าจะแสดง notification ยังไงตอน app เปิดอยู่
 *  4. จัดการ navigate เมื่อผู้ใช้แตะ notification
 *
 * Backend ส่ง notification ผ่าน Expo Push Service:
 *   POST https://exp.host/--/api/v2/push/send
 *   Body: { to: "ExponentPushToken[xxx]", title: "...", body: "...", data: { screen: "Notifications" } }
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigate } from "../navigation/navigationRef";

// TODO: เปลี่ยนเป็น URL จริง
const BASE_URL = "http://10.6.131.15:8001/api";

// ── กำหนดพฤติกรรมการแสดง notification ขณะ app เปิดอยู่ (foreground) ──────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ── ขอ permission + ดึง push token ────────────────────────────────────────
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.warn("[Notifications] ต้องใช้อุปกรณ์จริง ไม่รองรับ Simulator");
    return null;
  }

  // สร้าง Android Notification Channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "URU Smart",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0f7a55",
      sound: "default",
    });
  }

  // ตรวจสอบ / ขอ permission
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("[Notifications] ผู้ใช้ไม่อนุญาต push notification");
    return null;
  }

  // ดึง Expo Push Token
  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );

    const token = tokenData.data;
    console.log("[Notifications] Push Token:", token);
    await AsyncStorage.setItem("push_token", token);
    return token;
  } catch (e) {
    console.warn("[Notifications] ดึง token ไม่สำเร็จ:", e.message);
    return null;
  }
}

// ── ส่ง push token ไปเก็บที่ backend ────────────────────────────────────
export async function sendTokenToBackend(token) {
  if (!token) return;
  try {
    const authToken = await AsyncStorage.getItem("token");
    if (!authToken) return;

    await fetch(`${BASE_URL}/push-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ push_token: token }),
    });

    console.log("[Notifications] ส่ง token ไปที่ backend เรียบร้อย");
  } catch (e) {
    // backend ยังไม่พร้อม — เก็บ token ไว้ใน AsyncStorage ไปก่อน
    console.warn("[Notifications] ส่ง token ไปที่ backend ไม่ได้:", e.message);
  }
}

// ── เรียกตอน login สำเร็จ ───────────────────────────────────────────────
export async function onLoginSuccess() {
  const token = await registerForPushNotificationsAsync();
  if (token) {
    await sendTokenToBackend(token);
  }
}

// ── handle เมื่อผู้ใช้แตะ notification (app อยู่ background/killed) ──────
export function handleNotificationResponse(response) {
  const data = response?.notification?.request?.content?.data;
  if (!data) return;

  const screen = data.screen ?? "Notifications";
  const params = data.params ?? {};

  setTimeout(() => {
    navigate(screen, params);
  }, 500); // รอให้ navigation พร้อมก่อน
}
