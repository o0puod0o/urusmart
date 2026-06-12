import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, STORAGE_KEYS } from "../config";
import { navigate } from "../navigation/navigationRef";
import { clearBiometricToken, setBiometricEnabled } from "./biometricService";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// แนบ Bearer token ทุก request อัตโนมัติ
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (_) {}
    return config;
  },
  (error) => Promise.reject(error),
);

// 401 → ล้าง session และ redirect ไป Login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.TOKEN_TYPE, STORAGE_KEYS.USER]);
      // ลบ biometric token ด้วย ป้องกันการใช้ expired token วนซ้ำ
      await clearBiometricToken();
      await setBiometricEnabled(false);
      navigate("Login");
    }

    if (__DEV__) {
      console.warn(`[API] ${status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.message);
      if (error.response?.data) console.warn("[API] response body:", JSON.stringify(error.response.data, null, 2));
    }

    return Promise.reject(error);
  },
);

export default api;
