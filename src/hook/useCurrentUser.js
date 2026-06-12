import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { STORAGE_KEYS } from "../config";
import { clearBiometricToken, setBiometricEnabled } from "../services/biometricService";
import api from "../services/api";

const normalizeUser = (data = {}) => ({
  name:     data.name ?? data.full_name ?? data.teacher_name ?? data.username ?? "",
  faculty:  data.faculty ?? data.faculty_name ?? data.department ?? data.position ?? "",
  photoUrl: data.photoUrl ?? data.photo_url ?? data.avatar ?? data.profile_image ?? data.image ?? "",
});

const getRootNavigation = (navigation) => {
  let current = navigation;
  while (current?.getParent?.()) current = current.getParent();
  return current ?? navigation;
};

export default function useCurrentUser(navigation) {
  const [user, setUser] = useState(normalizeUser());
  const { t } = useTranslation();

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEYS.USER).then((raw) => {
      if (!mounted || !raw) return;
      try { setUser(normalizeUser(JSON.parse(raw))); } catch (_) {}
    });
    return () => { mounted = false; };
  }, []);

  const logout = useCallback(() => {
    Alert.alert(t("settings.logoutTitle"), t("settings.logoutMsg"), [
      { text: t("settings.logoutCancel"), style: "cancel" },
      {
        text: t("settings.logoutConfirm"),
        style: "destructive",
        onPress: async () => {
          try { await api.post("/auth/logout"); } catch (_) {}
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.TOKEN,
            STORAGE_KEYS.TOKEN_TYPE,
            STORAGE_KEYS.USER,
            STORAGE_KEYS.PUSH_TOKEN,
          ]);
          // ลบ biometric token ด้วย เพื่อป้องกัน Face ID เข้าบัญชีเก่าหลัง logout
          await clearBiometricToken();
          await setBiometricEnabled(false);
          getRootNavigation(navigation).reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  }, [navigation, t]);

  return { user, logout };
}
