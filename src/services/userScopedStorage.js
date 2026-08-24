import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../config";

const getUserIdentity = (user = {}) =>
  user.id ?? user.code ?? user.username ?? user.email ?? user.citizen_id;

export async function getUserScopedStorageKey(baseKey) {
  const rawUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
  if (!rawUser) throw new Error("ไม่พบข้อมูลผู้ใช้ที่เข้าสู่ระบบ");

  let user;
  try {
    user = JSON.parse(rawUser);
  } catch (_) {
    throw new Error("ข้อมูลผู้ใช้ที่เข้าสู่ระบบไม่ถูกต้อง");
  }

  const identity = getUserIdentity(user);
  if (identity === undefined || identity === null || String(identity).trim() === "") {
    throw new Error("ไม่สามารถระบุบัญชีผู้ใช้สำหรับจัดเก็บข้อมูลได้");
  }
  return `${baseKey}:user:${encodeURIComponent(String(identity))}`;
}

export async function getUserScopedValue(baseKey) {
  return AsyncStorage.getItem(await getUserScopedStorageKey(baseKey));
}

export async function setUserScopedValue(baseKey, value) {
  await AsyncStorage.setItem(await getUserScopedStorageKey(baseKey), String(value));
}
