// รายการความสนใจจาก /ref/search-options ไม่ค่อยเปลี่ยน — cache ไว้ใน module
// เพื่อไม่ให้หน้า ExpertHome (ค้นหา) กับ InterestForm (จัดการข้อมูล) ต้อง fetch ซ้ำ
import { useEffect, useRef, useState } from "react";
import apiService from "../services/api";

let cache = null;
let inflight = null;

const normalizeInterestOptions = (rows) =>
  (Array.isArray(rows) ? rows : [])
    .map((interest) => {
      if (typeof interest === "string") {
        return { id: interest, label: interest };
      }

      const label =
        interest?.name ??
        interest?.label ??
        interest?.interest_name ??
        interest?.interest_name_th ??
        interest?.interest_name_en ??
        interest?.title;
      const id =
        interest?.id ??
        interest?.interest_id ??
        interest?.value ??
        label;

      return label ? { id, label } : null;
    })
    .filter(Boolean);

const fetchInterestOptions = async () => {
  if (cache) return cache;
  if (!inflight) {
    inflight = apiService
      .get("/ref/search-options")
      .then((res) => {
        const rows = res.data?.interests ?? res.data?.data ?? [];
        cache = normalizeInterestOptions(rows);
        return cache;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
};

const useInterestOptions = () => {
  const [options, setOptions] = useState(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (cache) return;
    fetchInterestOptions()
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

export default useInterestOptions;
