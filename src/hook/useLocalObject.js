import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserScopedStorageKey } from "../services/userScopedStorage";

export default function useLocalObject(storageKey, initialValue = {}) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);
  const resolvedKey = useRef(null);

  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    setValue(initialValue);
    getUserScopedStorageKey(storageKey)
      .then(async (scopedKey) => {
        resolvedKey.current = scopedKey;
        const stored = await AsyncStorage.getItem(scopedKey);
        if (mounted.current && stored) setValue({ ...initialValue, ...JSON.parse(stored) });
      })
      .finally(() => { if (mounted.current) setLoading(false); });
    return () => { mounted.current = false; };
  }, [storageKey]);

  const save = useCallback(async (nextValue) => {
    const resolvedValue = typeof nextValue === "function" ? nextValue(value) : nextValue;
    const scopedKey = resolvedKey.current || await getUserScopedStorageKey(storageKey);
    await AsyncStorage.setItem(scopedKey, JSON.stringify(resolvedValue));
    if (mounted.current) setValue(resolvedValue);
    return resolvedValue;
  }, [storageKey, value]);

  const reload = useCallback(async () => {
    const scopedKey = resolvedKey.current || await getUserScopedStorageKey(storageKey);
    const stored = await AsyncStorage.getItem(scopedKey);
    const next = stored ? { ...initialValue, ...JSON.parse(stored) } : initialValue;
    if (mounted.current) setValue(next);
    return next;
  }, [storageKey]);

  return { value, loading, save, reload };
}
