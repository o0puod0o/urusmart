/** แปลง ISO date string (ค.ศ.) เป็น Date object — parse แบบ local time เพื่อหลีกเลี่ยง UTC offset */
export const parseISOToDate = (str) => {
  if (!str || str.startsWith("0000")) return new Date();
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
    return isNaN(d.getTime()) ? new Date() : d;
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
};

/** แปลง Date object เป็น ISO date string YYYY-MM-DD (ค.ศ.) — ใช้ส่ง API */
export const toISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/** แสดงวันที่เป็น วว/ดด/ปปปป พ.ศ. หรือ ค.ศ. — ใช้แสดงผลเท่านั้น ไม่เก็บ */
export const formatThaiDate = (isoDateStr, language = "th") => {
  if (!isoDateStr || isoDateStr.startsWith("0000")) return "";
  const isEnglish = String(language).toLowerCase().startsWith("en");
  const m = isoDateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const year = parseInt(m[1], 10) + (isEnglish ? 0 : 543);
    return `${m[3]}/${m[2]}/${year}`;
  }
  const d = new Date(isoDateStr);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear() + (isEnglish ? 0 : 543);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${year}`;
};

const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const ENGLISH_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** แสดงวันที่แบบไทยเต็ม เช่น 22 สิงหาคม 2569 */
export const formatThaiDateLong = (isoDateStr, language = "th") => {
  if (!isoDateStr || isoDateStr.startsWith("0000")) return "";
  const date = parseISOToDate(isoDateStr);
  if (isNaN(date.getTime())) return "";
  const isEnglish = String(language).toLowerCase().startsWith("en");
  const months = isEnglish ? ENGLISH_MONTHS : THAI_MONTHS;
  const year = date.getFullYear() + (isEnglish ? 0 : 543);
  return `${date.getDate()} ${months[date.getMonth()]} ${year}`;
};
