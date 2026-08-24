import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserScopedStorageKey } from "../services/userScopedStorage";

export default function useLocalResource(storageKey) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const mounted = useRef(true);
  const resolvedKey = useRef(null);

  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    setItems([]);
    getUserScopedStorageKey(storageKey)
      .then(async (scopedKey) => {
        resolvedKey.current = scopedKey;
        const stored = await AsyncStorage.getItem(scopedKey);
        if (mounted.current && stored) setItems(JSON.parse(stored));
      })
      .finally(() => { if (mounted.current) setLoading(false); });
    return () => { mounted.current = false; };
  }, [storageKey]);

  const persist = useCallback(async (nextItems) => {
    const scopedKey = resolvedKey.current || await getUserScopedStorageKey(storageKey);
    await AsyncStorage.setItem(scopedKey, JSON.stringify(nextItems));
    if (mounted.current) setItems(nextItems);
    return nextItems;
  }, [storageKey]);

  const run = useCallback(async (change) => {
    if (mounted.current) setSaving(true);
    try {
      const nextItems = change(items);
      await persist(nextItems);
      return nextItems;
    } finally {
      if (mounted.current) setSaving(false);
    }
  }, [items, persist]);

  const create = useCallback((data) => {
    const item = { ...data, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
    return run((current) => [...current, item]);
  }, [run]);
  const update = useCallback((id, data) => run((current) =>
    current.map((item) => String(item.id) === String(id) ? { ...item, ...data, id: item.id } : item)), [run]);
  const remove = useCallback((id) => run((current) =>
    current.filter((item) => String(item.id) !== String(id))), [run]);

  const reload = useCallback(async () => {
    const scopedKey = resolvedKey.current || await getUserScopedStorageKey(storageKey);
    const stored = await AsyncStorage.getItem(scopedKey);
    const nextItems = stored ? JSON.parse(stored) : [];
    if (mounted.current) setItems(nextItems);
    return nextItems;
  }, [storageKey]);

  return { items, loading, saving, create, update, remove, reload };
}
