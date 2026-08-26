// กรองอักขระที่ไม่ควรอยู่ในข้อมูลวิชาการ (expert / e-research)
// อนุญาต (allowlist): ไทย, อังกฤษ, ตัวเลข, ช่องว่าง, เครื่องหมายวรรคตอน/สัญลักษณ์วิชาการ
// ที่จำเป็น ( . , ( ) - en/em dash : ; / % + _ & @ deg plusminus = ), อักษร Latin
// ที่มีวรรณยุกต์ (e-acute u-umlaut n-tilde), ตัวยก (superscript 2 3), วงเล็บเหลี่ยม,
// และ apostrophe/quote
// บล็อกทุกอย่างนอกเหนือจากนี้ — รวมถึงภาษาอื่นที่ไม่ใช่ไทย/อังกฤษ, emoji,
// และสัญลักษณ์ที่ไม่ใช่วรรคตอนวิชาการ (angle brackets, braces, pipe, backslash, caret, currency)
const ACADEMIC_TEXT_ALLOWLIST =
  /[^฀-๿a-zA-Z0-9\s.,()\-–—:;\/%+_&@°±=À-ſ²³⁰-⁹\[\]'"]/gu;

const normalizeText = (value) => {
  if (typeof value !== "string") return value;
  return value.normalize("NFC").replace(/\r\n?/gu, "\n");
};

export const sanitizeAcademicText = (value) => {
  const normalized = normalizeText(value);
  return typeof normalized === "string"
    ? normalized.replace(ACADEMIC_TEXT_ALLOWLIST, "").replace(/ {2,}/g, " ")
    : normalized;
};

// URL/Email: กันแค่ emoji, ช่องว่าง, และ HTML tag delimiter (< >)
// ไม่บังคับ charset แคบเหมือน academic text เพราะ URL อาจมี query string หลากหลายรูปแบบ
const INVALID_LINK_CHARACTERS = /[<>\s]|\p{Extended_Pictographic}/gu;

export const sanitizeLinkInput = (value) => {
  const normalized = normalizeText(value);
  return typeof normalized === "string"
    ? normalized.replace(INVALID_LINK_CHARACTERS, "")
    : normalized;
};

export const sanitizeEmailInput = sanitizeLinkInput;
