import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../config";

// PIN/Biometric ต้องผูกกับบัญชีผู้ใช้ปัจจุบันเสมอ (per-account) ไม่ใช่ทั้งเครื่อง
// (device-level) — มิฉะนั้น User B ที่ login ต่อจาก User A บนเครื่องเดียวกัน
// จะเห็นว่า "เครื่องนี้มี PIN แล้ว" ทั้งที่เป็น PIN ของ User A

// เก็บ user id ปัจจุบันไว้แยกต่างหาก อ่านเร็วกว่า parse STORAGE_KEYS.USER
// ทั้งก้อนทุกครั้ง — เรียกจาก Login.js ทันทีหลัง SSO success
export const setCurrentUserId = (userId) =>
  AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, String(userId));

export const getCurrentUserId = () =>
  AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

export const clearCurrentUserId = () =>
  AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);

// resolve identifier จาก user object ดิบที่ backend ส่งมา (data.user จาก SSO
// หรือ /me) — ยืนยันจาก log จริงแล้วว่า field "id" มีค่าเสมอ (เช่น 16, เป็น
// number) เป็น backend primary key ที่แท้จริง ใช้ email เป็น fallback เท่านั้น
// ถ้า id หายไปจริงๆ (ผิดปกติ) — ห้าม fallback ไปใช้ชื่อหรือค่าที่เปลี่ยนได้
export const resolveUserId = (user) => {
  const id = user?.id;
  if (id !== undefined && id !== null && String(id).trim()) return String(id);
  const email = user?.email;
  if (typeof email === "string" && email.trim()) return email.trim().toLowerCase();
  return null;
};

// SecureStore key rule: เฉพาะ alphanumeric, ".", "-", "_" เท่านั้น (ตรวจจาก
// expo-secure-store/build/SecureStore.js: /^[\w.-]+$/) — ":" หรือ "@" (จาก
// email fallback) ทำให้ SecureStore.setItemAsync throw "Invalid key" ทันที
// sanitize identifier ให้เหลือแต่อักขระที่อนุญาตก่อนต่อเป็น key เสมอ
const sanitizeForKey = (value) => String(value).replace(/[^\w.-]/g, "_");

// ต่อ user identifier เข้ากับ key เดิม เช่น userScopedKey("pin_hash", "16")
// -> "pin_hash_16" ใช้ทั้งกับ AsyncStorage prefix และ SecureStore key
export const userScopedKey = (prefix, userId) => `${prefix}_${sanitizeForKey(userId)}`;
