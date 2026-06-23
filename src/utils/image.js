import { API_BASE_URL } from "../config";

// แปลง relative path หรือ localhost URL → absolute URL ที่ device เข้าถึงได้
// /storage/photos/x.jpg → http://192.168.x.x:8001/storage/photos/x.jpg
export const fixPhotoUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const originMatch = API_BASE_URL?.match(/^(https?:\/\/[^/]+)/);
  const origin = originMatch?.[1] ?? "";
  if (url.startsWith("/")) return origin + url;
  return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, origin);
};
