import { useCallback, useRef } from "react";

const useSubmitLock = () => {
  const lockedRef = useRef(false);

  return useCallback(async (callback) => {
    if (lockedRef.current) return false;
    lockedRef.current = true;
    try {
      await callback();
      return true;
    } finally {
      lockedRef.current = false;
    }
  }, []);
};

export default useSubmitLock;
