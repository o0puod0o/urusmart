// ลำดับสำคัญ: "นางสาว" ก่อน "นาง" เพื่อไม่ให้ตัดผิด
export const stripNamePrefix = (name) => {
  if (!name || typeof name !== "string") return "";
  return name
    .replace(/^นางสาว\s*/, "")
    .replace(/^นาง\s*/, "")
    .replace(/^นาย\s*/, "")
    .replace(/^เด็กหญิง\s*/, "")
    .replace(/^เด็กชาย\s*/, "")
    .replace(/^ผศ\.\s*/, "")
    .replace(/^รศ\.\s*/, "")
    .replace(/^ดร\.\s*/, "")
    .replace(/^ศ\.\s*/, "")
    .trim();
};
