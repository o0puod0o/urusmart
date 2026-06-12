// Hook สำหรับ dropdown reference data (degrees, departments, journalTypes ฯลฯ)
// ข้อมูลพวกนี้ไม่ค่อยเปลี่ยน — cache ไว้ใน module เพื่อไม่ให้ fetch ซ้ำทุกครั้งที่เปิดฟอร์ม
//
// Endpoints: GET /api/ref/degrees, /ref/departments, /ref/journal-types,
//            /ref/research-types, /ref/research-levels, /ref/research-pmu-types

import { useEffect, useRef, useState } from "react";
import api from "../services/api";

const cache = {};

const fetchRef = async (path) => {
  if (cache[path]) return cache[path];
  const res = await api.get(path);
  const data = res.data?.data ?? res.data ?? [];
  const arr = Array.isArray(data) ? data : [];
  if (__DEV__ && arr.length > 0 && arr[0].id === undefined) {
    console.warn(`[useRefs] ${path}: items มีไม่มี field 'id' — fields ที่มี:`, Object.keys(arr[0]));
  }
  cache[path] = arr;
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
      const keys = ["degrees", "departments", "journalTypes", "researchTypes", "researchLevels", "researchPmuTypes"];
      const paths = ["/ref/degrees", "/ref/departments", "/ref/journal-types", "/ref/research-types", "/ref/research-levels", "/ref/research-pmu-types"];
      const results = await Promise.allSettled(paths.map((p) => fetchRef(p)));
      if (!mounted.current) return;
      const merged = {};
      results.forEach((r, i) => {
        merged[keys[i]] = r.status === "fulfilled" ? r.value : [];
        if (r.status === "rejected" && __DEV__) console.warn(`[useRefs] โหลด ${paths[i]} ไม่สำเร็จ:`, r.reason?.message);
      });
      setRefs((prev) => ({ ...prev, ...merged }));
      setLoading(false);
    };
    load();
  }, []);

  return { ...refs, loading };
};

export default useRefs;
