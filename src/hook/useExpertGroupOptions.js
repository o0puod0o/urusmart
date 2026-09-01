// รายการกลุ่มความเชี่ยวชาญจาก GET /expertise-groups — master list กลางตัวเดียว
// ใช้ร่วมกันทั้งหน้า ExpertHome (dropdown ค้นหา) กับ ExpertiseForm (จัดการข้อมูล)
// id ที่ endpoint นี้คืนมาคือค่าเดียวกับ group_id ที่ /expertises และ
// /profile-search ใช้ — cache ไว้ใน module กัน fetch ซ้ำเหมือน useInterestOptions
import { useEffect, useRef, useState } from "react";
import infoApi from "../services/infoApi";

let cache = null;
let inflight = null;

const normalizeExpertGroupOptions = (rows) =>
  (Array.isArray(rows) ? rows : [])
    .map((group) => {
      const label = group?.name ?? group?.label ?? group?.title;
      const id = group?.id ?? group?.group_id ?? group?.value;
      return id !== undefined && id !== null && label
        ? { id: String(id), label: String(label) }
        : null;
    })
    .filter(Boolean);

const fetchExpertGroupOptions = async () => {
  if (cache) return cache;
  if (!inflight) {
    inflight = infoApi
      .get("/info/expert/expertise-groups")
      .then((res) => {
        const rows = res.data?.data ?? res.data ?? [];
        cache = normalizeExpertGroupOptions(rows);
        return cache;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
};

// อ่าน cache แบบ sync (ไม่ fetch) — ใช้ในโค้ดที่ไม่ใช่ React component เช่น
// การแปลง group_id เป็นชื่อกลุ่มตอน render รายการ ถ้ายังไม่เคย fetch มาก่อน
// (module อื่นยังไม่เคยเรียก useExpertGroupOptions) จะได้ [] กลับไป
export const getCachedExpertGroupOptions = () => cache ?? [];

const useExpertGroupOptions = () => {
  const [options, setOptions] = useState(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (cache) return;
    fetchExpertGroupOptions()
      .then((result) => {
        if (mounted.current) setOptions(result);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted.current) setLoading(false);
      });
  }, []);

  return { options, loading };
};

export default useExpertGroupOptions;
