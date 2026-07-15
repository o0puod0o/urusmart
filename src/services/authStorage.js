import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { SECURE_KEYS, STORAGE_KEYS } from "../config";

const LEGACY_AUTH_KEYS = [STORAGE_KEYS.TOKEN, STORAGE_KEYS.TOKEN_TYPE];
const webSession = {
  get(key) {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage.getItem(key);
  },
  set(key, value) {
    if (typeof sessionStorage !== "undefined") sessionStorage.setItem(key, value);
  },
  remove(key) {
    if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(key);
  },
};

const removeLegacyAuth = () => AsyncStorage.multiRemove(LEGACY_AUTH_KEYS);

export async function saveAuthSession(token) {
  const value = String(token || "");
  if (!value) throw new Error("Auth token is missing");

  if (Platform.OS === "web") {
    webSession.set(SECURE_KEYS.AUTH_TOKEN, value);
  } else {
    await SecureStore.setItemAsync(SECURE_KEYS.AUTH_TOKEN, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }

  await removeLegacyAuth();
}

export async function getAuthToken() {
  const stored =
    Platform.OS === "web"
      ? webSession.get(SECURE_KEYS.AUTH_TOKEN)
      : await SecureStore.getItemAsync(SECURE_KEYS.AUTH_TOKEN);
  if (stored) return stored;

  // One-time migration for users upgrading from the AsyncStorage version.
  const legacyToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!legacyToken) return null;
  try {
    await saveAuthSession(legacyToken);
    return legacyToken;
  } catch (_) {
    await removeLegacyAuth();
    return null;
  }
}

export async function clearAuthSession() {
  if (Platform.OS === "web") {
    webSession.remove(SECURE_KEYS.AUTH_TOKEN);
  } else {
    await SecureStore.deleteItemAsync(SECURE_KEYS.AUTH_TOKEN).catch(() => {});
  }
  await removeLegacyAuth();
}
