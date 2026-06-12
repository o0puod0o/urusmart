import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS, SECURE_KEYS } from "../config";

export async function checkSupport() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return { supported: false, reason: "อุปกรณ์นี้ไม่รองรับ Biometric" };

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) return { supported: false, reason: "ยังไม่ได้ตั้งค่า Face ID / ลายนิ้วมือในอุปกรณ์" };

  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const hasFaceId = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);

  return {
    supported: true,
    hasFaceId,
    label: hasFaceId ? "Face ID" : "ลายนิ้วมือ",
  };
}

export async function authenticate(promptMessage = "ยืนยันตัวตนเพื่อเข้าสู่ระบบ") {
  return LocalAuthentication.authenticateAsync({
    promptMessage,
    fallbackLabel: "ใช้รหัสผ่าน",
    cancelLabel: "ยกเลิก",
    disableDeviceFallback: false,
  });
}

export const setBiometricEnabled = (val) =>
  AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC, JSON.stringify(val));

export const isBiometricEnabled = async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC);
  return raw ? JSON.parse(raw) : false;
};

export const saveBiometricToken = async (token) => {
  try {
    await SecureStore.setItemAsync(SECURE_KEYS.BIOMETRIC_TOKEN, token);
  } catch (_) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_FALLBACK, token);
    } catch (_) {}
  }
};

export const getBiometricToken = async () => {
  try {
    const token = await SecureStore.getItemAsync(SECURE_KEYS.BIOMETRIC_TOKEN);
    if (token) return token;
  } catch (_) {}
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_FALLBACK);
    if (token) return token;
  } catch (_) {}
  return null;
};

export const clearBiometricToken = async () => {
  try { await SecureStore.deleteItemAsync(SECURE_KEYS.BIOMETRIC_TOKEN); } catch (_) {}
  try { await AsyncStorage.removeItem(STORAGE_KEYS.BIOMETRIC_FALLBACK); } catch (_) {}
};
