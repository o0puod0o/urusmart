/**
 * services/api.js
 *
 * Axios instance กลาง — ทุกไฟล์ในโปรเจกต์ import จากที่นี่
 * ไม่ต้องใส่ token / BASE_URL ซ้ำในทุกหน้า
 *
 * วางไฟล์นี้ที่: src/services/api.js
 */

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── ① แก้ BASE_URL ให้ตรงกับ server จริง ────────────────────
const BASE_URL = "http://10.6.131.3:8001/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 วินาที ถ้าเกินนี้ถือว่า error
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ──────────────────────────────────────
// ทุก request จะแนบ token อัตโนมัติ ไม่ต้องใส่เองทุกครั้ง
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("@auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {}
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────
// จัดการ error กลาง — 401 = หมดเวลา session, 500 = server error
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // TODO: navigate ไปหน้า Login เมื่อ token หมดอายุ
      // navigationRef.current?.reset({ index: 0, routes: [{ name: "Login" }] });
      console.warn("Session หมดอายุ กรุณา login ใหม่");
    }

    if (status === 500) {
      console.warn("Server error กรุณาลองใหม่ภายหลัง");
    }

    return Promise.reject(error);
  },
);

export default api;
