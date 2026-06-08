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

// ── token เก็บใน SecureStore (encrypted) + fallback ────────────
export const saveBiometricToken = async (token) => {
  try {
    // พยายาม save ใน SecureStore ก่อน
    await SecureStore.setItemAsync(SECURE_KEYS.BIOMETRIC_TOKEN, token);
    console.log("[Biometric] บันทึก token ใน SecureStore สำเร็จ");
  } catch (error) {
    // ถ้า error ให้ fallback ไป AsyncStorage (less secure แต่ก็ได้)
    console.warn("[Biometric] SecureStore error, fallback ไป AsyncStorage:", error?.message);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN + "_biometric", token);
      console.log("[Biometric] บันทึก token ใน AsyncStorage สำเร็จ");
    } catch (fallbackError) {
      console.warn("[Biometric] fallback AsyncStorage error:", fallbackError?.message);
      // ไม่ throw - ให้ login ดำเนินการต่อได้
    }
  }
};

export const getBiometricToken = async () => {
  try {
    // พยายามดึงจาก SecureStore ก่อน
    const token = await SecureStore.getItemAsync(SECURE_KEYS.BIOMETRIC_TOKEN);
    if (token) {
      console.log("[Biometric] ดึง token จาก SecureStore สำเร็จ");
      return token;
    }
  } catch (error) {
    console.warn("[Biometric] SecureStore get error:", error?.message);
  }
  
  try {
    // fallback ไป AsyncStorage
    const token = await AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN + "_biometric");
    if (token) {
      console.log("[Biometric] ดึง token จาก AsyncStorage สำเร็จ");
      return token;
    }
  } catch (error) {
    console.warn("[Biometric] AsyncStorage get error:", error?.message);
  }
  
  return null;
};

export const clearBiometricToken = async () => {
  try {
    await SecureStore.deleteItemAsync(SECURE_KEYS.BIOMETRIC_TOKEN);
  } catch (error) {
    console.warn("[Biometric] SecureStore delete error:", error?.message);
  }
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PUSH_TOKEN + "_biometric");
  } catch (error) {
    console.warn("[Biometric] AsyncStorage delete error:", error?.message);
  }
};
