// กรองอักขระที่ไม่ควรอยู่ในข้อมูลวิชาการ (expert / e-research)
// อนุญาต: ไทย, อังกฤษ, ตัวเลข, ช่องว่าง, เครื่องหมายวรรคตอน/สัญลักษณ์วิชาการพื้นฐาน
// บล็อก: emoji, อักขระควบคุม, และ HTML/script tag (< >)
const ACADEMIC_TEXT_PATTERN = /[^฀-๿a-zA-Z0-9\s.,()\-–—:;\/%+_&@°±]/gu;

export const sanitizeAcademicText = (value) => {
  if (typeof value !== "string") return value;
  return value.replace(ACADEMIC_TEXT_PATTERN, "").replace(/ {2,}/g, " ");
};

// URL/Email: กันแค่ emoji, ช่องว่าง, และ HTML tag delimiter (< >)
// ไม่บังคับ charset แคบเหมือน academic text เพราะ URL อาจมี query string หลากหลายรูปแบบ
const UNSAFE_LINK_CHARS_PATTERN = /[<>\s]|\p{Extended_Pictographic}/gu;

export const sanitizeLinkInput = (value) => {
  if (typeof value !== "string") return value;
  return value.replace(UNSAFE_LINK_CHARS_PATTERN, "");
};

export const sanitizeEmailInput = sanitizeLinkInput;
