// ─── API Base URL ─────────────────────────────────────────────
// แก้แค่บรรทัดนี้บรรทัดเดียว ทุกไฟล์จะอัปเดตตาม
export const API_BASE_URL = "http://10.1.72.38/api";

// ─── AsyncStorage Keys ────────────────────────────────────────
// รวม key ทั้งหมดไว้ที่นี่ — ป้องกัน typo และ inconsistency
export const STORAGE_KEYS = {
  TOKEN: "token",
  TOKEN_TYPE: "token_type",
  USER: "user",
  PUSH_TOKEN: "push_token",
  NOTIF_SETTINGS: "@notif_settings",
  BIOMETRIC: "@biometric_enabled",
};

// ─── SecureStore Keys (sensitive data) ───────────────────────
export const SECURE_KEYS = {
  BIOMETRIC_TOKEN: "biometric_token",
};
