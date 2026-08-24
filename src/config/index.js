// URL ของ API — แก้ที่ .env เท่านั้น (EXPO_PUBLIC_API_URL)
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
export const LRD_API_BASE_URL =
  process.env.EXPO_PUBLIC_LRD_API_URL || "https://info.uru.ac.th/server";
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
  E_RESEARCH_PROFILE: "@e_research_profile",
  E_RESEARCH_EDUCATION: "@e_research_education",
  E_RESEARCH_EXPERTISE: "@e_research_expertise",
  E_RESEARCH_PUBLISH_SETTINGS: "@e_research_publish_settings",
  LRD_RESEARCHER_ID: "@lrd_researcher_id",
  BIOMETRIC: "@biometric_enabled",
  BIOMETRIC_FALLBACK: "@biometric_token_fallback",
};

// SecureStore keys — เก็บข้อมูล sensitive
export const SECURE_KEYS = {
  AUTH_TOKEN: "auth_token",
  BIOMETRIC_TOKEN: "biometric_token",
};
