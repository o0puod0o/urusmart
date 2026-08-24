import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, STORAGE_KEYS } from "../config";
import { navigate } from "../navigation/navigationRef";
import { clearBiometricToken, setBiometricEnabled } from "./biometricService";
import { clearAuthSession, getAuthToken } from "./authStorage";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// แนบ Bearer token ทุก request อัตโนมัติ
api.interceptors.request.use(
  async (config) => {
    const method = config.method?.toLowerCase();

    if (["put", "patch", "delete"].includes(method)) {
      const overrideMethod = method.toUpperCase();

      if (typeof config.headers?.set === "function") {
        config.headers.set("X-HTTP-Method-Override", overrideMethod);
      } else {
        config.headers = {
          ...config.headers,
          "X-HTTP-Method-Override": overrideMethod,
        };
      }

      config.method = "post";
      config.data ??= {};
    }

    try {
      const token = await getAuthToken();
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
    const errorLabel = status ?? error.code ?? "NETWORK_ERROR";

    if (status === 401 && !error.config?.suppressAuthRedirect) {
      await clearAuthSession();
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      // ลบ biometric token ด้วย ป้องกันการใช้ expired token วนซ้ำ
      await clearBiometricToken();
      await setBiometricEnabled(false);
      navigate("Login");
    }

    if (__DEV__ && !error.config?.suppressErrorLog) {
      console.warn(`[API] ${errorLabel} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.message);
      if (error.response?.data) console.warn("[API] response body:", JSON.stringify(error.response.data, null, 2));
    }

    return Promise.reject(error);
  },
);

export default api;
