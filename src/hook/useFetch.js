/**
 * hooks/useFetch.js
 *
 * Custom hook สำหรับดึงข้อมูลจาก API
 * ใช้ได้กับทุกหน้า ทุก endpoint
 *
 * วางไฟล์นี้ที่: src/hooks/useFetch.js
 *
 * ─── วิธีใช้ ──────────────────────────────────────────────────
 *
 * const { data, loading, error, refetch } = useFetch("/research");
 *
 * - data     → ข้อมูลที่ได้จาก API (array หรือ object)
 * - loading  → true ขณะกำลังโหลด
 * - error    → ข้อความ error ถ้ามี
 * - refetch  → เรียกใหม่ได้ทุกเมื่อ เช่น กด refresh
 *
 * ─── Options ─────────────────────────────────────────────────
 *
 * useFetch("/research", {
 *   params:      { semester: 1, year: 2568 },  // query string
 *   initialData: [],                            // ค่าเริ่มต้นก่อน API ตอบ
 *   skip:        false,                         // true = ยังไม่ดึงก่อน
 * })
 */

import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";

const useFetch = (endpoint, options = {}) => {
  const { params = {}, initialData = null, skip = false } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  // ป้องกัน setState หลัง component unmount
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (skip) return;
    try {
      if (mounted.current) {
        setLoading(true);
        setError(null);
      }

      const res = await api.get(endpoint, { params });

      // รองรับ response แบบ { data: [...] } หรือ [...] โดยตรง
      const result = res.data?.data ?? res.data;

      if (mounted.current) setData(result);
    } catch (err) {
      if (mounted.current) {
        // axios error message
        const msg =
          err.response?.data?.message ?? err.message ?? "เกิดข้อผิดพลาด";
        setError(msg);
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [endpoint, JSON.stringify(params), skip]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetch;
