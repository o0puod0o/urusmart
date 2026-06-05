/**
 * hook/useRefs.js
 *
 * ดึง reference / dropdown data ทั้งหมดแบบ cache
 * ข้อมูลพวกนี้ไม่ค่อยเปลี่ยน จึง fetch ครั้งเดียวแล้วเก็บไว้
 *
 * ─── วิธีใช้ ────────────────────────────────────────────────────
 *
 *   const { degrees, departments, journalTypes,
 *           researchTypes, researchLevels,
 *           researchPmuTypes, loading } = useRefs();
 *
 * ─── Map endpoint ↔ API route ───────────────────────────────────
 *
 *   degrees          →  GET /api/ref/degrees
 *   departments      →  GET /api/ref/departments
 *   journalTypes     →  GET /api/ref/journal-types
 *   researchTypes    →  GET /api/ref/research-types
 *   researchLevels   →  GET /api/ref/research-levels
 *   researchPmuTypes →  GET /api/ref/research-pmu-types
 *
 * ─── ตัวอย่าง (ใน EducationForm) ───────────────────────────────
 *
 *   const { degrees, loading } = useRefs();
 *
 *   <InlineDropdown
 *     options={degrees}
 *     placeholder="เลือกระดับการศึกษา"
 *   />
 */

import { useEffect, useRef, useState } from "react";
import api from "../services/api";

// cache ระดับ module — fetch ครั้งเดียวต่อ session
const cache = {};

const fetchRef = async (path) => {
  if (cache[path]) return cache[path];
  const res = await api.get(path);
  const data = res.data?.data ?? res.data ?? [];
  cache[path] = Array.isArray(data) ? data : [];
  return cache[path];
};

const useRefs = () => {
  const [refs, setRefs] = useState({
    degrees: [],
    departments: [],
    journalTypes: [],
    researchTypes: [],
    researchLevels: [],
    researchPmuTypes: [],
  });
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [
          degrees,
          departments,
          journalTypes,
          researchTypes,
          researchLevels,
          researchPmuTypes,
        ] = await Promise.all([
          fetchRef("/ref/degrees"),
          fetchRef("/ref/departments"),
          fetchRef("/ref/journal-types"),
          fetchRef("/ref/research-types"),
          fetchRef("/ref/research-levels"),
          fetchRef("/ref/research-pmu-types"),
        ]);
        if (mounted.current) {
          setRefs({ degrees, departments, journalTypes, researchTypes, researchLevels, researchPmuTypes });
        }
      } catch (_) {
        // ใช้ array ว่างถ้า API ยังไม่พร้อม
      } finally {
        if (mounted.current) setLoading(false);
      }
    };
    load();
  }, []);

  return { ...refs, loading };
};

export default useRefs;
