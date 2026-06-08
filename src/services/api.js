import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, STORAGE_KEYS } from "../config";
import { navigate } from "../navigation/navigationRef";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ── Request: แนบ token ทุก request อัตโนมัติ ─────────────────
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

// ── Response: จัดการ error กลาง ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token หมดอายุ → ล้าง storage แล้ว redirect ไป Login
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.TOKEN_TYPE,
        STORAGE_KEYS.USER,
      ]);
      navigate("Login");
    }

    if (__DEV__) {
      console.warn(`[API] ${status} ${error.config?.url}`, error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
