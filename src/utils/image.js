import { API_BASE_URL } from "../config";

// แปลง relative path หรือ localhost URL → absolute URL ที่ device เข้าถึงได้
// /storage/photos/x.jpg → https://aritapp.uru.ac.th/urusmart/storage/photos/x.jpg
export const fixPhotoUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  // ตัด /api หรือ /api/... ออกเพื่อได้ base path รวม subfolder
  // https://aritapp.uru.ac.th/urusmart/api → https://aritapp.uru.ac.th/urusmart
  const base = API_BASE_URL?.replace(/\/api(\/.*)?$/, "") ?? "";
  const originMatch = base.match(/^(https?:\/\/[^/]+)/);
  const origin = originMatch?.[1] ?? "";
  if (url.startsWith("/")) return base + url;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(url))
    return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, base);
  return url;
};
