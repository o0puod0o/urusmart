// กรองอักขระที่ไม่ควรอยู่ในข้อมูลวิชาการ (expert / e-research)
// อนุญาต (allowlist): ไทย, อังกฤษ, ตัวเลข, ช่องว่าง, เครื่องหมายวรรคตอน/สัญลักษณ์วิชาการ
// ที่จำเป็น ( . , ( ) - en/em dash : ; / % + _ & @ deg plusminus = ), อักษร Latin
// ที่มีวรรณยุกต์ (e-acute u-umlaut n-tilde), ตัวยก (superscript 0-9), วงเล็บเหลี่ยม,
// และ apostrophe/quote
// บล็อกทุกอย่างนอกเหนือจากนี้ — รวมถึงภาษาอื่นที่ไม่ใช่ไทย/อังกฤษ, emoji,
// และสัญลักษณ์ที่ไม่ใช่วรรคตอนวิชาการ (angle brackets, braces, pipe, backslash,
// caret, currency, multiplication/division sign)
// หมายเหตุ: ช่วง Latin Extended แบ่งเป็น À-Ö / Ø-ö / ø-ſ โดยเจตนา เพื่อไม่ให้ครอบคลุม
// × (U+00D7) และ ÷ (U+00F7) ซึ่งอยู่ในช่องว่างระหว่างช่วงตัวอักษรของ Latin-1 Supplement
const ACADEMIC_TEXT_ALLOWLIST =
  /[^\u0E01-\u0E3A\u0E40-\u0E5Ba-zA-Z0-9\s.,()\-–—:;\/%+_&@°±=À-ÖØ-öø-ſ¹²³⁰-⁹\[\]'"]/gu;

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

// URL/Email: อนุญาตเฉพาะอักขระมาตรฐานของ URL เพื่อกัน emoji, อักษรไทย,
// สกุลเงิน และสัญลักษณ์ที่ไม่สามารถอยู่ในลิงก์ได้
const INVALID_LINK_CHARACTERS = /[^a-zA-Z0-9\-._~:\/?#[\]@!$&'()*+,;=%]/gu;

export const sanitizeLinkInput = (value) => {
  const normalized = normalizeText(value);
  return typeof normalized === "string"
    ? normalized.replace(INVALID_LINK_CHARACTERS, "")
    : normalized;
};

export const sanitizeEmailInput = sanitizeLinkInput;

// เบอร์โทรศัพท์อนุญาตเฉพาะรูปแบบที่ใช้จริง เช่น +66, 02-123-4567 และ (02) 123 4567
// เพื่อกัน emoji และตัวอักษรที่ถูกวางจากคลิปบอร์ดลงในช่อง phone-pad
const INVALID_PHONE_CHARACTERS = /[^0-9+()\-\s]/gu;

export const sanitizePhoneInput = (value) => {
  const normalized = normalizeText(value);
  return typeof normalized === "string"
    ? normalized.replace(INVALID_PHONE_CHARACTERS, "").replace(/ {2,}/g, " ")
    : normalized;
};
