import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../config";
import { clearBiometricToken, setBiometricEnabled } from "../services/biometricService";

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

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEYS.USER).then((raw) => {
      if (!mounted || !raw) return;
      try { setUser(normalizeUser(JSON.parse(raw))); } catch (_) {}
    });
    return () => { mounted = false; };
  }, []);

  const logout = useCallback(() => {
    Alert.alert("ออกจากระบบ", "คุณต้องการออกจากระบบใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ออกจากระบบ",
        style: "destructive",
        onPress: async () => {
          // ล้าง token ทั้งหมด รวม biometric
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.TOKEN,
            STORAGE_KEYS.TOKEN_TYPE,
            STORAGE_KEYS.USER,
            STORAGE_KEYS.PUSH_TOKEN,
          ]);
          await clearBiometricToken();
          await setBiometricEnabled(false);
          getRootNavigation(navigation).reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  }, [navigation]);

  return { user, logout };
}
