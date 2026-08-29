import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS, SECURE_KEYS } from "../config";
import { userScopedKey } from "./userSecurityKeys";

// PIN เก็บเป็น salted hash verifier เท่านั้น ไม่เก็บ PIN ดิบที่ไหนเลย
// (ไม่ใช่การเข้ารหัส — เป็น one-way hash แบบเดียวกับรหัสผ่านทั่วไป)
// ทุก key ผูกกับ userId เสมอ (per-account) — PIN ของบัญชีหนึ่งต้องไม่ปนกับอีกบัญชี
// บนเครื่องเดียวกัน ห้ามเรียกฟังก์ชันในไฟล์นี้โดยไม่มี userId
const bytesToHex = (bytes) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const hashPin = (pin, saltHex) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, saltHex + pin, {
    encoding: Crypto.CryptoEncoding.HEX,
  });

const requireUserId = (userId) => {
  if (!userId) {
    // ไม่มี userId แปลว่า resolve ตัวตนไม่ได้ — ต้องไม่ถือว่ามี PIN หรือ verify
    // ผ่านโดยไม่มีเจ้าของที่ชัดเจน ผู้เรียกต้อง fallback ไป SSO อย่างปลอดภัย
    if (__DEV__) console.error("[pinService] missing userId — refusing to proceed");
    return false;
  }
  return true;
};

export const isPinSet = async (userId) => {
  if (!requireUserId(userId)) return false;
  const raw = await AsyncStorage.getItem(userScopedKey(STORAGE_KEYS.PIN_ENABLED_PREFIX, userId));
  return raw ? JSON.parse(raw) : false;
};

const PIN_PATTERN = /^\d{6}$/;

export const setPin = async (userId, pin) => {
  if (!requireUserId(userId)) throw new Error("Missing userId for setPin");
  if (!PIN_PATTERN.test(String(pin))) {
    throw new Error("PIN must be exactly 6 digits");
  }

  const saltBytes = await Crypto.getRandomBytesAsync(16);
  const saltHex = bytesToHex(saltBytes);
  const hash = await hashPin(pin, saltHex);

  await SecureStore.setItemAsync(userScopedKey(SECURE_KEYS.PIN_HASH_PREFIX, userId), hash, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  await SecureStore.setItemAsync(userScopedKey(SECURE_KEYS.PIN_SALT_PREFIX, userId), saltHex, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  await AsyncStorage.setItem(userScopedKey(STORAGE_KEYS.PIN_ENABLED_PREFIX, userId), JSON.stringify(true));
};

export const verifyPin = async (userId, pin) => {
  if (!requireUserId(userId)) return false;

  const [hash, saltHex] = await Promise.all([
    SecureStore.getItemAsync(userScopedKey(SECURE_KEYS.PIN_HASH_PREFIX, userId)),
    SecureStore.getItemAsync(userScopedKey(SECURE_KEYS.PIN_SALT_PREFIX, userId)),
  ]);
  if (!hash || !saltHex) return false;

  const candidate = await hashPin(pin, saltHex);
  return candidate === hash;
};

export const clearPin = async (userId) => {
  if (!requireUserId(userId)) return;
  try { await SecureStore.deleteItemAsync(userScopedKey(SECURE_KEYS.PIN_HASH_PREFIX, userId)); } catch (_) {}
  try { await SecureStore.deleteItemAsync(userScopedKey(SECURE_KEYS.PIN_SALT_PREFIX, userId)); } catch (_) {}
  try { await AsyncStorage.removeItem(userScopedKey(STORAGE_KEYS.PIN_ENABLED_PREFIX, userId)); } catch (_) {}
};
