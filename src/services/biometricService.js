import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { STORAGE_KEYS, SECURE_KEYS } from "../config";
import { isExpoGo } from "../utils/runtime";

export async function checkSupport() {
  if (Platform.OS === "ios" && isExpoGo) {
    return { supported: false, reasonCode: "developmentBuildRequired" };
  }

  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return { supported: false, reasonCode: "noHardware" };

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) return { supported: false, reasonCode: "notEnrolled" };

  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const hasFaceId = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);

  return {
    supported: true,
    hasFaceId,
  };
}

export const setBiometricEnabled = (val) =>
  AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC, JSON.stringify(val));

export const isBiometricEnabled = async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC);
  return raw ? JSON.parse(raw) : false;
};

export const saveBiometricToken = async (token, authenticationPrompt) => {
  await SecureStore.setItemAsync(SECURE_KEYS.BIOMETRIC_TOKEN, token, {
    requireAuthentication: true,
    authenticationPrompt,
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  await AsyncStorage.removeItem(STORAGE_KEYS.BIOMETRIC_FALLBACK);
};

export const getBiometricToken = async (
  promptMessage = "ยืนยันตัวตนเพื่อเข้าสู่ระบบ",
) =>
  SecureStore.getItemAsync(SECURE_KEYS.BIOMETRIC_TOKEN, {
    requireAuthentication: true,
    authenticationPrompt: promptMessage,
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });

export const clearBiometricToken = async () => {
  try { await SecureStore.deleteItemAsync(SECURE_KEYS.BIOMETRIC_TOKEN); } catch (_) {}
  try { await AsyncStorage.removeItem(STORAGE_KEYS.BIOMETRIC_FALLBACK); } catch (_) {}
};
