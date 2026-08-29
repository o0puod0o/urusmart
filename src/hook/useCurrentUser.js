import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { STORAGE_KEYS } from "../config";
import { clearBiometricToken } from "../services/biometricService";
import { clearAuthSession } from "../services/authStorage";
import { getCurrentUserId, clearCurrentUserId } from "../services/userSecurityKeys";
import { removeTokenFromBackend } from "../services/notificationService";
import api from "../services/api";
import { stripNamePrefix } from "../utils/name";
import { fixPhotoUrl } from "../utils/image";

const normalizeUser = (data = {}) => {
  const raw = data.full_name_th ?? data.full_name_en ?? data.name ?? data.full_name ?? data.teacher_name ?? data.username ?? "";
  const rawPhoto = data.picture ?? data.photo_url ?? data.photoUrl ?? data.avatar ?? data.profile_image ?? data.image ?? "";
  return {
    name:     stripNamePrefix(raw),
    faculty:  data.faculty_name_th ?? data.faculty_name ?? data.faculty ?? data.department ?? "",
    photoUrl: fixPhotoUrl(rawPhoto),
  };
};

const getRootNavigation = (navigation) => {
  let current = navigation;
  while (current?.getParent?.()) current = current.getParent();
  return current ?? navigation;
};

export default function useCurrentUser(navigation) {
  const [user, setUser] = useState(normalizeUser());
  const { t } = useTranslation();
  const appState = useRef(AppState.currentState);

  const refresh = useCallback(async () => {
    // อ่าน AsyncStorage ก่อน (เร็ว)
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (raw) setUser(normalizeUser(JSON.parse(raw)));
    } catch (_) {}
    // fetch /me เพื่อให้ได้ picture ล่าสุดเสมอ
    try {
      const res = await api.get("/me");
      const data = res.data?.data ?? res.data;
      if (data) {
        setUser(normalizeUser(data));
        // อัปเดต AsyncStorage ด้วย เพื่อให้ครั้งต่อไปอ่านได้ทันที
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        const stored = raw ? JSON.parse(raw) : {};
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ ...stored, ...data }));
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    refresh();
    // refresh เมื่อ app กลับมา foreground
    const sub = AppState.addEventListener("change", (next) => {
      if (appState.current.match(/inactive|background/) && next === "active") refresh();
      appState.current = next;
    });
    return () => sub.remove();
  }, [refresh]);

  // refresh ทุกครั้งที่ navigate กลับมาหน้านี้ (เช่น กลับจาก ProfileForm หลังเปลี่ยนรูป)
  useEffect(() => {
    if (!navigation) return;
    const unsub = navigation.addListener("focus", refresh);
    return unsub;
  }, [navigation, refresh]);

  const logout = useCallback(() => {
    Alert.alert(t("settings.logoutTitle"), t("settings.logoutMsg"), [
      { text: t("settings.logoutCancel"), style: "cancel" },
      {
        text: t("settings.logoutConfirm"),
        style: "destructive",
        onPress: async () => {
          // อ่าน userId ก่อนล้างอะไรทั้งนั้น — ต้องใช้ scope การลบ biometric
          // token ให้ตรงบัญชีที่กำลัง logout เท่านั้น ไม่กระทบบัญชีอื่นบนเครื่อง
          const userId = await getCurrentUserId();

          const pushToken = await AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN);
          await removeTokenFromBackend(pushToken);
          try { await api.post("/auth/logout"); } catch (_) {}
          await clearAuthSession();
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.USER,
            STORAGE_KEYS.PUSH_TOKEN,
            STORAGE_KEYS.NOTIFICATION_INBOX,
          ]);
          // ลบเฉพาะ biometric token ของบัญชีนี้ (ผูกกับ session ที่ logout ไปแล้ว
          // ต้องลบ ป้องกัน Face ID เข้าบัญชีเก่า) — ไม่ลบ flag "เคยเปิด biometric
          // ไว้" ของบัญชีนี้ เพื่อให้ login ครั้งถัดไปด้วยบัญชีเดิมไม่ต้องถาม popup ซ้ำ
          if (userId) await clearBiometricToken(userId);
          // ไม่ลบ PIN ของบัญชีนี้ตอน logout — PIN เป็น per-account security
          // preference ที่ต้องคงอยู่ให้บัญชีเดิม login กลับมาแล้วเข้าแอปได้ทันที
          // โดยไม่ต้องตั้ง PIN ซ้ำ — ไม่กระทบบัญชีอื่นเพราะ key แยกตาม userId แล้ว
          await clearCurrentUserId();
          await AsyncStorage.multiRemove([STORAGE_KEYS.PIN_ATTEMPTS, STORAGE_KEYS.LAST_BACKGROUND_AT]);
          getRootNavigation(navigation).reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  }, [navigation, t]);

  return { user, logout };
}
