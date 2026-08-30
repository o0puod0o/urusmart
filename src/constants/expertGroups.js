// รายการกลุ่มความเชี่ยวชาญมาจาก GET /expertise-groups เท่านั้น (ดู
// src/hook/useExpertGroupOptions.js) — ไฟล์นี้เหลือแค่ helper สำหรับแปลง
// group_id เป็นชื่อกลุ่มในโค้ดที่ไม่ใช่ React component (เช่น sort/format
// รายการก่อน render) และ normalizer สำหรับ response ที่ไม่ตรง shape มาตรฐาน
import { getCachedExpertGroupOptions } from "../hook/useExpertGroupOptions";

export const getExpertGroupLabel = (groupId) => {
  if (!groupId && groupId !== 0) return "-";
  const match = getCachedExpertGroupOptions().find(
    (g) => g.id === String(groupId),
  );
  return match?.label ?? String(groupId);
};

export const normalizeExpertGroupRows = (rows = [], placeholder) => {
  const options = rows
    .map((row, index) => {
      const id =
        row.id ??
        row.group_id ??
        row.expertise_group_id ??
        row.expertise_group ??
        row.value ??
        index + 1;
      const label =
        row.name ??
        row.label ??
        row.title ??
        row.expertise_group_name ??
        row.group_name ??
        "";

      return { id: String(id), label: String(label || id) };
    })
    .filter((row) => row.id && row.label);

  return [{ id: "", label: placeholder }, ...options];
};
