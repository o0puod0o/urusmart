/**
 * hook/useResource.js
 *
 * Generic CRUD hook — ใช้กับทุก resource endpoint
 *
 * ─── วิธีใช้ ────────────────────────────────────────────────────
 *
 *   const {
 *     items,            // array ของข้อมูลทั้งหมด
 *     loading,          // กำลังโหลด list
 *     error,            // ข้อความ error (null ถ้าไม่มี)
 *     saving,           // กำลัง create หรือ update
 *     removing,         // กำลัง delete
 *     create,           // fn(data) → Promise
 *     update,           // fn(id, data) → Promise
 *     remove,           // fn(id) → Promise
 *     refetch,          // fn() โหลด list ใหม่
 *   } = useResource("/researches");
 *
 * ─── ตัวอย่าง ───────────────────────────────────────────────────
 *
 *   // สร้างใหม่
 *   await create({ title: "งานวิจัย A", year: 2567 });
 *
 *   // แก้ไข
 *   await update(item.id, { title: "งานวิจัย B" });
 *
 *   // ลบ
 *   await remove(item.id);
 *
 * ─── Map endpoint ↔ API route ───────────────────────────────────
 *
 *   "/researches"   →  GET /api/researches      (index)
 *                      POST /api/researches     (store)
 *                      PUT /api/researches/:id  (update)
 *                      DELETE /api/researches/:id (destroy)
 *
 *   "/journals"     →  เหมือนกัน
 *   "/awards"       →  เหมือนกัน
 *   "/books"        →  เหมือนกัน
 *   "/patents"      →  เหมือนกัน
 *   "/proceedings"  →  เหมือนกัน
 *   "/trainings"    →  เหมือนกัน
 *   "/interests"    →  เหมือนกัน
 *   "/educations"   →  เหมือนกัน
 *   "/academics"    →  เหมือนกัน (ประวัติบริหาร)
 *   "/workexes"     →  เหมือนกัน (ประวัติการทำงาน)
 *   "/boardexes"    →  เหมือนกัน (ประวัติกรรมการ)
 *   "/hsps"         →  เหมือนกัน (Human Subjects)
 *   "/lecturers"    →  GET เท่านั้น (ค้นหาผู้เชี่ยวชาญ)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";

const useResource = (endpoint, options = {}) => {
  const { params = {}, skip = false } = options;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // ── GET list ──────────────────────────────────────────────────
  const refetch = useCallback(async () => {
    if (skip) return;
    try {
      if (mounted.current) { setLoading(true); setError(null); }
      const res = await api.get(endpoint, { params });
      const result = res.data?.data ?? res.data;
      if (mounted.current) setItems(Array.isArray(result) ? result : []);
    } catch (err) {
      if (mounted.current) {
        setError(err.response?.data?.message ?? err.message ?? "โหลดข้อมูลไม่สำเร็จ");
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [endpoint, JSON.stringify(params), skip]);

  useEffect(() => { refetch(); }, [refetch]);

  // ── POST (create) ─────────────────────────────────────────────
  const create = useCallback(async (data) => {
    setSaving(true);
    try {
      const res = await api.post(endpoint, data);
      await refetch();
      return res.data?.data ?? res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message ?? err.message ?? "บันทึกไม่สำเร็จ");
    } finally {
      if (mounted.current) setSaving(false);
    }
  }, [endpoint, refetch]);

  // ── PUT (update) ──────────────────────────────────────────────
  const update = useCallback(async (id, data) => {
    setSaving(true);
    try {
      const res = await api.put(`${endpoint}/${id}`, data);
      await refetch();
      return res.data?.data ?? res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message ?? err.message ?? "แก้ไขไม่สำเร็จ");
    } finally {
      if (mounted.current) setSaving(false);
    }
  }, [endpoint, refetch]);

  // ── DELETE (remove) ───────────────────────────────────────────
  const remove = useCallback(async (id) => {
    setRemoving(true);
    try {
      await api.delete(`${endpoint}/${id}`);
      await refetch();
    } catch (err) {
      throw new Error(err.response?.data?.message ?? err.message ?? "ลบไม่สำเร็จ");
    } finally {
      if (mounted.current) setRemoving(false);
    }
  }, [endpoint, refetch]);

  return { items, loading, error, saving, removing, create, update, remove, refetch };
};

export default useResource;
