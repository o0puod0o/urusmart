import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS, SECURE_KEYS } from "../config";

// ── ตรวจว่าอุปกรณ์รองรับ Biometric ──────────────────────────
export async function checkSupport() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return { supported: false, reason: "อุปกรณ์นี้ไม่รองรับ Biometric" };

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) return { supported: false, reason: "ยังไม่ได้ตั้งค่า Face ID / ลายนิ้วมือในอุปกรณ์" };

  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const hasFaceId      = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
  const hasFingerprint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);

  return {
    supported: true,
    hasFaceId,
    hasFingerprint,
    label: hasFaceId ? "Face ID" : "ลายนิ้วมือ",
  };
}

// ── ยืนยันตัวตนด้วย Biometric ────────────────────────────────
export async function authenticate(promptMessage = "ยืนยันตัวตนเพื่อเข้าสู่ระบบ") {
  return LocalAuthentication.authenticateAsync({
    promptMessage,
    fallbackLabel: "ใช้รหัสผ่าน",
    cancelLabel: "ยกเลิก",
    disableDeviceFallback: false,
  });
}

// ── preference (enabled/disabled) ────────────────────────────
export const setBiometricEnabled = (val) =>
  AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC, JSON.stringify(val));

export const isBiometricEnabled = async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC);
  return raw ? JSON.parse(raw) : false;
};

// ── token เก็บใน SecureStore (encrypted) ─────────────────────
export const saveBiometricToken = (token) =>
  SecureStore.setItemAsync(SECURE_KEYS.BIOMETRIC_TOKEN, token);

export const getBiometricToken = () =>
  SecureStore.getItemAsync(SECURE_KEYS.BIOMETRIC_TOKEN);

export const clearBiometricToken = () =>
  SecureStore.deleteItemAsync(SECURE_KEYS.BIOMETRIC_TOKEN);
