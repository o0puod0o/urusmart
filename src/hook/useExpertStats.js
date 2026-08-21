// ดึงจำนวนผลงานสำหรับ Homepage stats card
// ถ้า backend มี GET /api/expert/my-stats ให้เปลี่ยนมาใช้แทน — จะลดเหลือ 1 request

import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";

const ENDPOINTS = [
  { key: "researches", path: "/researches" },
  { key: "journals",   path: "/journals"   },
  { key: "patents",    path: "/patents"     },
  { key: "awards",     path: "/awards"      },
];

const useExpertStats = () => {
  const [stats, setStats] = useState({ researches: 0, journals: 0, patents: 0, awards: 0 });
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const refetch = useCallback(async () => {
    try {
      if (mounted.current) setLoading(true);
      const results = await Promise.allSettled(
        ENDPOINTS.map((e) => api.get(e.path, { suppressAuthRedirect: true })),
      );
      const newStats = {};
      results.forEach((result, i) => {
        const key = ENDPOINTS[i].key;
        if (result.status === "fulfilled") {
          const data = result.value.data?.data ?? result.value.data ?? [];
          // รองรับทั้ง array response และ { total: n }
          newStats[key] = Array.isArray(data) ? data.length : (result.value.data?.total ?? result.value.data?.count ?? 0);
        } else {
          newStats[key] = 0;
        }
      });
      if (mounted.current) setStats(newStats);
    } catch (_) {
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { stats, loading, refetch };
};

export default useExpertStats;
