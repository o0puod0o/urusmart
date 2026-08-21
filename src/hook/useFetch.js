// Hook สำหรับ GET-only endpoint ที่ไม่ต้องการ CRUD
// const { data, loading, error, refetch } = useFetch("/announcements", { params: {}, initialData: [] })

import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";

const useFetch = (endpoint, options = {}) => {
  const {
    params = {},
    initialData = null,
    skip = false,
    suppressAuthRedirect = true,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const fetchData = useCallback(async () => {
    if (skip) return;
    try {
      if (mounted.current) { setLoading(true); setError(null); }
      const res = await api.get(endpoint, { params, suppressAuthRedirect });
      const result = res.data?.data ?? res.data;
      if (mounted.current) setData(result);
    } catch (err) {
      if (mounted.current) setError(err.response?.data?.message ?? err.message ?? "เกิดข้อผิดพลาด");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [endpoint, JSON.stringify(params), skip]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetch;
