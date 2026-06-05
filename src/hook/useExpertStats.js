/**
 * hook/useExpertStats.js
 *
 * ดึงจำนวนผลงานของผู้ใช้ สำหรับ Homepage stats card
 *
 * ─── วิธีใช้ ────────────────────────────────────────────────────
 *
 *   const { stats, loading, refetch } = useExpertStats();
 *
 *   stats = {
 *     researches: 5,   // งานวิจัย     ← GET /api/researches
 *     journals:   12,  // บทความ       ← GET /api/journals
 *     patents:    0,   // สิทธิบัตร    ← GET /api/patents
 *     awards:     1,   // รางวัล       ← GET /api/awards
 *   }
 *
 * ─── TODO ──────────────────────────────────────────────────────
 *   ถ้า backend มี endpoint สำหรับ stats โดยตรง เช่น
 *   GET /api/expert/my-stats → { researches: 5, journals: 12, ... }
 *   ให้เปลี่ยนมาใช้แทนได้เลย จะเร็วกว่า (1 request แทน 4)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";

const ENDPOINTS = [
  { key: "researches", path: "/researches" },
  { key: "journals",   path: "/journals"   },
  { key: "patents",    path: "/patents"     },
  { key: "awards",     path: "/awards"      },
];

const useExpertStats = () => {
  const [stats, setStats] = useState({
    researches: 0,
    journals: 0,
    patents: 0,
    awards: 0,
  });
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
        ENDPOINTS.map((e) => api.get(e.path))
      );

      const newStats = {};
      results.forEach((result, i) => {
        const key = ENDPOINTS[i].key;
        if (result.status === "fulfilled") {
          const data = result.value.data?.data ?? result.value.data ?? [];
          // รองรับทั้ง array และ { total: n }
          newStats[key] = Array.isArray(data)
            ? data.length
            : (result.value.data?.total ?? result.value.data?.count ?? 0);
        } else {
          newStats[key] = 0;
        }
      });

      if (mounted.current) setStats(newStats);
    } catch (_) {
      // คง 0 ไว้ถ้า API ยังไม่พร้อม
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { stats, loading, refetch };
};

export default useExpertStats;
