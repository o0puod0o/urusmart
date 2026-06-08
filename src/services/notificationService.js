import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigate } from "../navigation/navigationRef";
import { API_BASE_URL, STORAGE_KEYS } from "../config";

// แสดง notification ขณะ app เปิดอยู่ (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ── ขอ permission + ดึง push token ───────────────────────────
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    if (__DEV__) console.warn("[Notifications] ต้องใช้อุปกรณ์จริง ไม่รองรับ Simulator");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "URU Smart",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0f7a55",
      sound: "default",
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return null;

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenData.data;
    await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
    return token;
  } catch (e) {
    if (__DEV__) console.warn("[Notifications] ดึง token ไม่สำเร็จ:", e.message);
    return null;
  }
}

// ── ส่ง token ไปที่ backend ───────────────────────────────────
export async function sendTokenToBackend(token) {
  if (!token) return;
  try {
    const authToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!authToken) return;

    await fetch(`${API_BASE_URL}/push-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ push_token: token }),
    });
  } catch (_) {
    // backend ยังไม่พร้อม — token เก็บไว้ใน AsyncStorage แล้ว
  }
}

// ── เรียกตอน login สำเร็จ ────────────────────────────────────
export async function onLoginSuccess() {
  const token = await registerForPushNotificationsAsync();
  if (token) await sendTokenToBackend(token);
}

// ── handle เมื่อผู้ใช้แตะ notification ──────────────────────
export function handleNotificationResponse(response) {
  const data = response?.notification?.request?.content?.data;
  if (!data) return;

  const screen = data.screen ?? "Notifications";
  const params = data.params ?? {};

  setTimeout(() => navigate(screen, params), 500);
}
