import * as Device from "expo-device";
import Constants from "expo-constants";
import { Alert, Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigate } from "../navigation/navigationRef";
import { API_BASE_URL, EXPO_PROJECT_ID, STORAGE_KEYS } from "../config";
import { isExpoGo } from "../utils/runtime";
import i18n from "../i18n/i18n";
import api from "./api";
import { getAuthToken } from "./authStorage";

const NOTIFICATION_INBOX_LIMIT = 100;
const inboxListeners = new Set();
let inboxWriteQueue = Promise.resolve();
const BACKEND_INBOX_RETRY_AFTER_MS = 5 * 60 * 1000;
let backendInboxUnavailableUntil = 0;
const isBackendInboxUnavailable = () => Date.now() < backendInboxUnavailableUntil;
const markBackendInboxUnavailable = () => {
  backendInboxUnavailableUntil = Date.now() + BACKEND_INBOX_RETRY_AFTER_MS;
};
export const DEFAULT_NOTIFICATION_SETTINGS = {
  beforeClass: true,
  holiday: true,
  gradeDeadline: true,
  announcement: false,
};

const getNotifications = () => {
  if (Platform.OS === "web" || isExpoGo) return null;
  return require("expo-notifications");
};

const isMissingPushEntitlementError = (error) => {
  const message = String(error?.message ?? error ?? "").toLowerCase();
  return (
    Platform.OS === "ios" &&
    (message.includes("aps-environment") ||
      message.includes("valid 'aps-environment' entitlement"))
  );
};

const getExpoProjectId = () =>
  EXPO_PROJECT_ID ??
  Constants.expoConfig?.extra?.eas?.projectId ??
  Constants.easConfig?.projectId;

const getPushTokenPayload = (token) => ({
  push_token: token,
  provider: "expo",
  platform: Platform.OS,
  app_version: Constants.expoConfig?.version ?? "1.0.0",
  expo_project_id: getExpoProjectId(),
});

const getDeletePushTokenPayload = (token) => ({
  push_token: token,
  provider: "expo",
  platform: Platform.OS,
});

const configureAndroidNotificationChannels = async (Notifications) => {
  if (Platform.OS !== "android") return;

  const common = {
    sound: "default",
    vibrationPattern: [0, 250, 200, 250],
    lightColor: "#0f7a55",
  };

  await Promise.all([
    Notifications.setNotificationChannelAsync("default", {
      name: i18n.t("notif.channelGeneral"),
      description: i18n.t("notif.channelGeneralDescription"),
      importance: Notifications.AndroidImportance.HIGH,
      ...common,
    }),
    Notifications.setNotificationChannelAsync("announcements", {
      name: i18n.t("notif.channelAnnouncements"),
      description: i18n.t("notif.channelAnnouncementsDescription"),
      importance: Notifications.AndroidImportance.HIGH,
      ...common,
    }),
    Notifications.setNotificationChannelAsync("reminders", {
      name: i18n.t("notif.channelReminders"),
      description: i18n.t("notif.channelRemindersDescription"),
      importance: Notifications.AndroidImportance.HIGH,
      ...common,
    }),
    Notifications.setNotificationChannelAsync("updates", {
      name: i18n.t("notif.channelUpdates"),
      description: i18n.t("notif.channelUpdatesDescription"),
      importance: Notifications.AndroidImportance.DEFAULT,
      ...common,
    }),
  ]);
};

const getNotificationSettingsPayload = (settings) => ({
  settings: { ...DEFAULT_NOTIFICATION_SETTINGS, ...settings },
  platform: Platform.OS,
  app_version: Constants.expoConfig?.version ?? null,
  expo_project_id: getExpoProjectId(),
});

const getInboxIcon = (type) => {
  switch (type) {
    case "announcement":
      return { icon: "megaphone-outline", iconColor: "#0f7a55", iconBg: "#e8f5ee" };
    case "beforeClass":
    case "before_class":
      return { icon: "alarm-outline", iconColor: "#2167b2", iconBg: "#e8f1fb" };
    case "holiday":
      return { icon: "calendar-clear-outline", iconColor: "#c95b05", iconBg: "#fff4e0" };
    case "gradeDeadline":
    case "grade_deadline":
      return { icon: "document-text-outline", iconColor: "#7c3aed", iconBg: "#f1eafe" };
    default:
      return { icon: "notifications-outline", iconColor: "#0f7a55", iconBg: "#e8f5ee" };
  }
};

const emitInbox = (items) => {
  inboxListeners.forEach((listener) => listener(items));
};

const parseNotificationData = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_) {
    return {};
  }
};

const normalizeServerNotification = (row) => {
  const data = parseNotificationData(row.data ?? row.payload ?? row.meta);
  const serverId = row.id ?? row.notification_id ?? data.notification_id;
  if (serverId == null) return null;
  const type = row.type ?? data.type;
  const readFlag = row.read ?? row.is_read;
  const isRead =
    readFlag != null
      ? readFlag === true ||
        readFlag === 1 ||
        readFlag === "1" ||
        (typeof readFlag === "string" &&
          readFlag !== "" &&
          readFlag !== "0" &&
          readFlag !== "false")
      : Boolean(row.read_at);
  return {
    id: String(serverId),
    serverId: String(serverId),
    title:
      row.title ?? data.title ?? i18n.t("notifications.defaultTitle"),
    body: row.body ?? row.message ?? data.body ?? "",
    receivedAt:
      row.created_at ?? row.sent_at ?? row.received_at ?? Date.now(),
    read: isRead,
    data: { ...data, ...(type ? { type } : {}) },
    ...getInboxIcon(type),
  };
};

const extractServerNotifications = (responseData) => {
  const payload = responseData?.data ?? responseData;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  return [];
};

const updateNotificationInbox = (updater) => {
  inboxWriteQueue = inboxWriteQueue
    .catch(() => {})
    .then(async () => {
      const current = await loadNotificationInbox();
      const next = updater(current);
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_INBOX,
        JSON.stringify(next),
      );
      emitInbox(next);
      return next;
    })
    .catch((error) => {
      if (__DEV__) {
        console.warn("[Notifications] บันทึก inbox ไม่สำเร็จ:", error.message);
      }
      return [];
    });
  return inboxWriteQueue;
};

export async function loadNotificationInbox() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_INBOX);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

export function subscribeNotificationInbox(listener) {
  inboxListeners.add(listener);
  return () => inboxListeners.delete(listener);
}

export async function syncNotificationInboxFromBackend() {
  if (isBackendInboxUnavailable()) return loadNotificationInbox();

  const authToken = await getAuthToken();
  if (!authToken) return loadNotificationInbox();

  try {
    const response = await api.get("/notifications", {
      params: { page: 1, per_page: NOTIFICATION_INBOX_LIMIT },
      suppressErrorLog: true,
      suppressAuthRedirect: true,
    });
    const serverItems = extractServerNotifications(response.data)
      .map(normalizeServerNotification)
      .filter(Boolean);

    return updateNotificationInbox((current) => {
      const serverIds = new Set(serverItems.map((item) => item.id));
      const localOnly = current.filter((item) => !serverIds.has(item.id));
      return [...serverItems, ...localOnly]
        .sort(
          (a, b) =>
            new Date(b.receivedAt).getTime() -
            new Date(a.receivedAt).getTime(),
        )
        .slice(0, NOTIFICATION_INBOX_LIMIT);
    });
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 405) {
      markBackendInboxUnavailable();
    }
    if (
      __DEV__ &&
      error.response?.status !== 404 &&
      error.response?.status !== 405
    ) {
      console.warn(
        "[Notifications] sync inbox ไม่สำเร็จ ใช้ local cache แทน:",
        error.response?.status ?? error.message,
      );
    }
    return loadNotificationInbox();
  }
}

export function saveNotificationToInbox(notification) {
  const request = notification?.request;
  const content = request?.content;
  if (!content) return Promise.resolve([]);

  const data = content.data ?? {};
  const id = String(
    data.notification_id ??
      request.identifier ??
      `${Date.now()}-${Math.random()}`,
  );
  const icon = getInboxIcon(data.type);
  const item = {
    id,
    serverId:
      data.notification_id == null ? null : String(data.notification_id),
    title: content.title ?? i18n.t("notifications.defaultTitle"),
    body: content.body ?? "",
    receivedAt: notification.date ?? Date.now(),
    read: false,
    data,
    ...icon,
  };

  return updateNotificationInbox((current) => {
    if (current.some((entry) => entry.id === id)) return current;
    return [item, ...current].slice(0, NOTIFICATION_INBOX_LIMIT);
  });
}

export function markNotificationRead(id) {
  let serverId = null;
  return updateNotificationInbox((current) =>
    current.map((item) => {
      if (item.id !== id) return item;
      serverId = item.serverId;
      return { ...item, read: true };
    }),
  ).then(async (items) => {
    if (!serverId || isBackendInboxUnavailable()) return items;
    try {
      await api.patch(`/notifications/${encodeURIComponent(serverId)}/read`, null, {
        suppressAuthRedirect: true,
      });
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        markBackendInboxUnavailable();
      }
    }
    return items;
  });
}

export function markAllNotificationsRead() {
  return updateNotificationInbox((current) =>
    current.map((item) => ({ ...item, read: true })),
  ).then(async (items) => {
    if (isBackendInboxUnavailable()) return items;
    try {
      await api.post("/notifications/read-all", null, {
        suppressAuthRedirect: true,
      });
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        markBackendInboxUnavailable();
      }
    }
    return items;
  });
}

const requestPermissionWithRationale = async (Notifications) => {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === "granted") return current.status;

  const prompted = await AsyncStorage.getItem(
    STORAGE_KEYS.NOTIF_PERMISSION_PROMPTED,
  );
  if (prompted === "true") return current.status;

  if (current.status === "denied") {
    return new Promise((resolve) => {
      const finish = async (openSettings) => {
        try {
          await AsyncStorage.setItem(
            STORAGE_KEYS.NOTIF_PERMISSION_PROMPTED,
            "true",
          );
          if (openSettings) await Linking.openSettings();
        } catch (_) {}
        resolve(current.status);
      };

      Alert.alert(
        i18n.t("notif.permissionTitle"),
        i18n.t("notif.permissionMessage"),
        [
          {
            text: i18n.t("notif.notNow"),
            style: "cancel",
            onPress: () => finish(false),
          },
          {
            text: i18n.t("notif.openSettings"),
            onPress: () => finish(true),
          },
        ],
        { cancelable: false },
      );
    });
  }

  return new Promise((resolve) => {
    Alert.alert(
      i18n.t("notif.permissionTitle"),
      i18n.t("notif.permissionMessage"),
      [
        {
          text: i18n.t("notif.notNow"),
          style: "cancel",
          onPress: async () => {
            try {
              await AsyncStorage.setItem(
                STORAGE_KEYS.NOTIF_PERMISSION_PROMPTED,
                "true",
              );
            } catch (_) {}
            resolve(current.status);
          },
        },
        {
          text: i18n.t("notif.allow"),
          onPress: async () => {
            try {
              await AsyncStorage.setItem(
                STORAGE_KEYS.NOTIF_PERMISSION_PROMPTED,
                "true",
              );
              const result = await Notifications.requestPermissionsAsync();
              resolve(result.status);
            } catch (_) {
              resolve("denied");
            }
          },
        },
      ],
      { cancelable: false },
    );
  });
};

// แสดง notification ขณะ app เปิดอยู่ (foreground) — mobile only
if (Platform.OS !== "web" && !isExpoGo) {
  try {
    const Notifications = getNotifications();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: false,
        shouldShowBanner: false,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (error) {
    if (__DEV__) {
      console.warn("[Notifications] handler setup skipped:", error?.message);
    }
  }
}

// ── ขอ permission + ดึง push token ───────────────────────────
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "web") return null;
  if (isExpoGo) {
    if (__DEV__) {
      console.warn("[Notifications] Push notification ต้องทดสอบด้วย development build ไม่ใช่ Expo Go");
    }
    return null;
  }
  if (!Device.isDevice) {
    if (__DEV__) console.warn("[Notifications] ต้องใช้อุปกรณ์จริง ไม่รองรับ Simulator");
    return null;
  }

  try {
    const Notifications = getNotifications();
    if (!Notifications) return null;

    await configureAndroidNotificationChannels(Notifications);

    const finalStatus = await requestPermissionWithRationale(Notifications);
    if (__DEV__) console.log("NOTIFICATION PERMISSION:", finalStatus);
    if (finalStatus !== "granted") {
      if (__DEV__) console.warn("[Notifications] ผู้ใช้ปฏิเสธ permission");
      return null;
    }

    const projectId = getExpoProjectId();
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;
    if (__DEV__) console.log("EXPO PUSH TOKEN:", token);
    await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
    return token;
  } catch (e) {
    // A free Apple Personal Team cannot sign an app with Push Notifications.
    // Keep local development usable; distribution builds retain this flow.
    if (isMissingPushEntitlementError(e)) {
      if (__DEV__) {
        console.warn(
          "[Notifications] iOS build นี้ไม่มี Push Notifications entitlement; ข้ามการลงทะเบียน push token",
        );
      }
      return null;
    }
    if (__DEV__) console.warn("EXPO PUSH TOKEN ERROR:", e);
    throw e;
  }
}

export async function getNotificationPermissionStatus() {
  const Notifications = getNotifications();
  if (!Notifications) return "unavailable";
  try {
    const permission = await Notifications.getPermissionsAsync();
    return permission.status;
  } catch (_) {
    return "unavailable";
  }
}

export async function openNotificationSystemSettings() {
  if (Platform.OS === "web") return;
  await Linking.openSettings();
}

// ── ส่ง token ไปที่ backend ───────────────────────────────────
export async function sendTokenToBackend(token, sanctumToken) {
  if (!token) throw new Error("Expo push token is missing");
  const authToken =
    sanctumToken ?? (await getAuthToken());
  if (!authToken) throw new Error("Sanctum token is missing");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const endpoint = `${API_BASE_URL}/push-token`;
    if (__DEV__) console.log("PUSH TOKEN ENDPOINT:", endpoint);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(getPushTokenPayload(token)),
      signal: controller.signal,
    });
    const result = await response.text();
    if (__DEV__) console.log("PUSH TOKEN API:", response.status, result);

    if (!response.ok) throw new Error(result || `HTTP ${response.status}`);
    return true;
  } finally {
    clearTimeout(timeout);
  }
}

export async function handlePushTokenChange(tokenData) {
  const token = tokenData?.data ?? tokenData;
  if (!token) return;

  await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, String(token));
  const authToken = await getAuthToken();
  if (!authToken) return;
  try {
    await sendTokenToBackend(String(token), authToken);
  } catch (error) {
    console.error("PUSH TOKEN ROTATION ERROR:", error);
  }
}

export async function removeTokenFromBackend(token) {
  if (!token) return false;
  try {
    await api.delete("/push-token", {
      data: getDeletePushTokenPayload(token),
    });
    if (__DEV__) console.log("[Notifications] ลบ push token สำเร็จ");
    return true;
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "[Notifications] ลบ push token ไม่สำเร็จ:",
        error.response?.status ?? error.message,
      );
    }
    return false;
  }
}

export async function loadNotificationSettings() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.NOTIF_SETTINGS);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
  } catch (_) {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export async function saveNotificationSettings(settings) {
  const next = { ...DEFAULT_NOTIFICATION_SETTINGS, ...settings };
  await AsyncStorage.setItem(STORAGE_KEYS.NOTIF_SETTINGS, JSON.stringify(next));
  return next;
}

export async function syncNotificationSettingsToBackend(settings) {
  try {
    await api.put(
      "/notification-settings",
      getNotificationSettingsPayload(settings),
      { suppressErrorLog: true, suppressAuthRedirect: true },
    );
    if (__DEV__) console.log("[Notifications] บันทึก settings สำเร็จ");
    return true;
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "[Notifications] บันทึก settings ไม่สำเร็จ:",
        error.response?.status ?? error.message,
      );
    }
    return false;
  }
}

// ── เรียกตอน login สำเร็จ ────────────────────────────────────
export async function onLoginSuccess() {
  if (Platform.OS === "web") {
    syncNotificationInboxFromBackend().catch(() => {});
    return;
  }

  const registerPushToken = async () => {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      const sanctumToken = await getAuthToken();
      await sendTokenToBackend(token, sanctumToken);
    } else if (!isExpoGo && Device.isDevice) {
      console.warn(
        "PUSH TOKEN SKIPPED: permission, device หรือ build ยังไม่พร้อม",
      );
    }
  };

  const [pushResult, settingsResult] = await Promise.allSettled([
    registerPushToken(),
    loadNotificationSettings().then(syncNotificationSettingsToBackend),
  ]);
  if (pushResult.status === "rejected") {
    console.warn("PUSH NOTIFICATION SETUP ERROR:", pushResult.reason);
  }
  if (settingsResult.status === "rejected") {
    console.warn("NOTIFICATION SETTINGS ERROR:", settingsResult.reason);
  }

  syncNotificationInboxFromBackend().catch((error) => {
    if (__DEV__) console.warn("NOTIFICATION INBOX ERROR:", error?.message);
  });
}

// หน้าที่อนุญาตให้ push notification นำทางได้ — ป้องกัน navigation injection
const ALLOWED_NOTIFICATION_SCREENS = ["Notifications", "Announcements", "MainTabs"];

const getNotificationResponseKey = (response) => {
  const request = response?.notification?.request;
  const identifier = request?.identifier;
  const actionIdentifier = response?.actionIdentifier;
  if (!identifier && !actionIdentifier) return null;
  return `${identifier ?? "unknown"}:${actionIdentifier ?? "default"}`;
};

const shouldHandleNotificationResponse = async (response) => {
  const authToken = await getAuthToken();
  if (!authToken) return false;

  const key = getNotificationResponseKey(response);
  if (!key) return true;

  const previousKey = await AsyncStorage.getItem(
    STORAGE_KEYS.LAST_NOTIFICATION_RESPONSE,
  );
  if (previousKey === key) return false;

  await AsyncStorage.setItem(STORAGE_KEYS.LAST_NOTIFICATION_RESPONSE, key);
  return true;
};

// ── handle เมื่อผู้ใช้แตะ notification ──────────────────────
export async function handleNotificationResponse(response) {
  saveNotificationToInbox(response?.notification).catch(() => {});
  const shouldNavigate = await shouldHandleNotificationResponse(response);
  if (!shouldNavigate) return;

  const data = response?.notification?.request?.content?.data;
  if (!data) return;

  if (data.type === "announcement") {
    setTimeout(
      () => navigate("Announcements", { highlightId: data.announcement_id }),
      500,
    );
    return;
  }

  const screen = ALLOWED_NOTIFICATION_SCREENS.includes(data.screen)
    ? data.screen
    : "Notifications";
  const params = data.params ?? {};
  setTimeout(() => navigate(screen, params), 500);
}
