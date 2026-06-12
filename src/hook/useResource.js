// Generic CRUD hook — ใช้กับทุก expert form
// const { items, loading, saving, create, update, remove, refetch } = useResource("/awards")
// year ต้องเป็น string ทุก endpoint ยกเว้น /researches ที่ต้องเป็น integer

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

  const refetch = useCallback(async () => {
    if (skip) return;
    try {
      if (mounted.current) { setLoading(true); setError(null); }
      const res = await api.get(endpoint, { params });
      const result = res.data?.data ?? res.data;
      if (mounted.current) setItems(Array.isArray(result) ? result : []);
      if (__DEV__ && Array.isArray(result) && result.length > 0) console.log(`[useResource] GET ${endpoint} fields:`, Object.keys(result[0]));
    } catch (err) {
      if (__DEV__) console.warn(`[useResource] GET ${endpoint} ล้มเหลว:`, err?.response?.status, err.message);
      if (mounted.current) setError(err.response?.data?.message ?? err.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [endpoint, JSON.stringify(params), skip]);

  useEffect(() => { refetch(); }, [refetch]);

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
