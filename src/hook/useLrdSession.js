import { useCallback, useEffect, useRef, useState } from "react";
import { getLrd, getLrdErrorMessage, LRD_ENDPOINTS, registerLrdResearcher } from "../services/lrdApi";
import { STORAGE_KEYS } from "../config";
import { getUserScopedValue, setUserScopedValue } from "../services/userScopedStorage";

export default function useLrdSession() {
  const mounted = useRef(true);
  const [session, setSession] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [researcherId, setResearcherId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const [connectError, setConnectError] = useState(null);

  useEffect(() => () => { mounted.current = false; }, []);

  const refetch = useCallback(async () => {
    if (mounted.current) { setLoading(true); setSessionError(null); }
    try {
      const response = await getLrd(LRD_ENDPOINTS.session);
      if (!response.data?.authenticated) throw new Error(response.data?.message || "ไม่พบ session ของผู้ใช้");
      const sessionResearcherId = response.data?.user?.lrd_researcher_id;
      const resolvedResearcherId = sessionResearcherId || await getUserScopedValue(STORAGE_KEYS.LRD_RESEARCHER_ID);
      if (sessionResearcherId) {
        await setUserScopedValue(STORAGE_KEYS.LRD_RESEARCHER_ID, sessionResearcherId);
      }
      if (mounted.current) {
        setSession(response.data);
        setResearcherId(resolvedResearcherId || null);
      }
      return response.data;
    } catch (requestError) {
      if (mounted.current) setSessionError(getLrdErrorMessage(requestError));
      return null;
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const connect = useCallback(async () => {
    if (mounted.current) { setConnecting(true); setConnectError(null); }
    try {
      // A non-empty body avoids IIS 411 Length Required in production.
      const response = await registerLrdResearcher();
      if (!response.data?.registered) throw new Error(response.data?.message || "ลงทะเบียนนักวิจัยไม่สำเร็จ");
      if (!response.data?.researcher_id) throw new Error("ระบบไม่ส่งรหัสนักวิจัยกลับมา");
      await setUserScopedValue(STORAGE_KEYS.LRD_RESEARCHER_ID, response.data.researcher_id);
      if (mounted.current) {
        setRegistration(response.data);
        setResearcherId(response.data.researcher_id);
      }
      await refetch();
      return response.data;
    } catch (requestError) {
      const message = getLrdErrorMessage(requestError, "เชื่อมต่อข้อมูลนักวิจัยไม่สำเร็จ");
      if (mounted.current) setConnectError(message);
      throw new Error(message);
    } finally {
      if (mounted.current) setConnecting(false);
    }
  }, [refetch]);

  const connected = Boolean(researcherId);
  return {
    session,
    registration,
    researcherId,
    connected,
    loading,
    connecting,
    error: sessionError,
    connectError,
    refetch,
    connect,
  };
}
