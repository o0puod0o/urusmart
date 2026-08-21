// URL ของ API — แก้ที่ .env เท่านั้น (EXPO_PUBLIC_API_URL)
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
export const EXPO_PROJECT_ID = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

// AsyncStorage keys — รวมไว้ที่นี่เพื่อป้องกัน typo
export const STORAGE_KEYS = {
  TOKEN: "token",
  TOKEN_TYPE: "token_type",
  USER: "user",
  PUSH_TOKEN: "push_token",
  NOTIF_SETTINGS: "@notif_settings",
  NOTIF_PERMISSION_PROMPTED: "@notif_permission_prompted",
  NOTIFICATION_INBOX: "@notification_inbox",
  LAST_NOTIFICATION_RESPONSE: "@last_notification_response",
  CHAT_HISTORY_PREFIX: "@chat_history:",
  BIOMETRIC: "@biometric_enabled",
  BIOMETRIC_FALLBACK: "@biometric_token_fallback",
};

// SecureStore keys — เก็บข้อมูล sensitive
export const SECURE_KEYS = {
  AUTH_TOKEN: "auth_token",
  BIOMETRIC_TOKEN: "biometric_token",
};
