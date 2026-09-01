import { API_BASE_URL } from "../config";

// แปลง relative path หรือ localhost URL → absolute URL ที่ device เข้าถึงได้
// /storage/photos/x.jpg → https://aritapp.uru.ac.th/urusmart/storage/photos/x.jpg
export const fixPhotoUrl = (url, sourceBaseUrl = API_BASE_URL) => {
  if (!url || typeof url !== "string") return "";
  const cleanUrl = url.trim();
  if (
    !cleanUrl ||
    cleanUrl === "null" ||
    cleanUrl === "undefined" ||
    cleanUrl === "-"
  ) {
    return "";
  }
  // ตัด /api หรือ /api/... ออกเพื่อได้ base path รวม subfolder
  // https://aritapp.uru.ac.th/urusmart/api → https://aritapp.uru.ac.th/urusmart
  const base = sourceBaseUrl?.replace(/\/api(\/.*)?$/, "") ?? "";
  const originMatch = base.match(/^(https?:\/\/[^/]+)/);
  const origin = originMatch?.[1] ?? base;
  if (cleanUrl.startsWith("/")) return base + cleanUrl;
  if (/^(storage|public\/storage|uploads|images|profile|photos)\//.test(cleanUrl))
    return `${base}/${cleanUrl}`;
  // Info API returns null for legacy bare filenames. Never pass a bare
  // filename through to React Native: it is resolved as a bundled file:// URI.
  if (/^[^/\\]+\.(?:jpe?g|png|webp|gif)$/i.test(cleanUrl)) return "";
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(cleanUrl))
    return cleanUrl.replace(
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/,
      origin,
    );
  if (/^https?:\/\//i.test(cleanUrl)) return cleanUrl;
  // Unknown relative values are not valid profile-photo URLs.
  return "";
};
