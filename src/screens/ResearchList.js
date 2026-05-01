import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text,
  RefreshControl,
} from "react-native";
import AppHeader from "../components/AppHeader";
import ListItem from "../components/ListItem";
import EmptyState from "../components/EmptyState";

// ─────────────────────────────────────────
// API CONFIG
// ─────────────────────────────────────────
const BASE_URL = "https://your-api.example.com"; // TODO: ใส่ URL จริง

// สมมติ token มาจาก SSO (ปรับตาม auth system)
const getToken = () => null; // TODO: ดึงจาก AsyncStorage หรือ context

const authFetch = async (url, options = {}) => {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

export const researchApi = {
  // ดึงรายการตาม type  GET /api/research/:type
  getList: (type) => authFetch(`${BASE_URL}/api/research/${type}`),

  // ค้นหาผู้เชี่ยวชาญ  GET /api/experts/search?...
  search: (params) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v)),
    ).toString();
    return authFetch(`${BASE_URL}/api/experts/search?${query}`);
  },

  // ลบ  DELETE /api/research/:type/:id
  delete: (type, id) =>
    authFetch(`${BASE_URL}/api/research/${type}/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────
const ResearchList = ({ navigation, route }) => {
  const { type, title, icon, searchParams } = route.params;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      let data;

      if (type === "search") {
        // มาจากหน้า Search
        const res = await researchApi.search(searchParams);
        data = res.data ?? res;
      } else {
        // มาจากเมนูปกติ
        const res = await researchApi.getList(type);
        data = res.data ?? res;
      }

      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "โหลดข้อมูลไม่สำเร็จ");
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [type, searchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDelete = (id) => {
    Alert.alert("ลบข้อมูล", "ต้องการลบรายการนี้ใช่ไหม?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: async () => {
          try {
            await researchApi.delete(type, id);
            setItems((prev) => prev.filter((item) => item.id !== id));
          } catch (err) {
            Alert.alert("เกิดข้อผิดพลาด", err.message || "ลบไม่สำเร็จ");
          }
        },
      },
    ]);
  };

  const handleEdit = (item) => {
    navigation.navigate("ResearchForm", { type, title, icon, item });
  };

  const handleAdd = () => {
    navigation.navigate("ResearchForm", { type, title, icon, item: null });
  };

  const shortTitle = title
    .replace("จัดการข้อมูล", "")
    .replace("จัดการ", "")
    .trim();

  // ── Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title={shortTitle} onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1a6b3c" />
          <Text style={styles.loadingText}>กำลังโหลด...</Text>
        </View>
      </View>
    );
  }

  // ── Error state
  if (error) {
    return (
      <View style={styles.container}>
        <AppHeader title={shortTitle} onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryBtn} onPress={fetchData}>
            แตะเพื่อลองใหม่
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title={shortTitle}
        onBack={() => navigation.goBack()}
        // ซ่อนปุ่ม + เมื่อเป็นหน้า search
        rightIcon={type !== "search" ? "+" : undefined}
        onRightPress={type !== "search" ? handleAdd : undefined}
      />
      <ScrollView
        contentContainerStyle={[styles.body, items.length === 0 && { flex: 1 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1a6b3c"
          />
        }
      >
        {items.length === 0 ? (
          <EmptyState
            icon={icon}
            onAdd={type !== "search" ? handleAdd : undefined}
          />
        ) : (
          <View style={styles.card}>
            {items.map((item, index) => (
              <View key={item.id}>
                <ListItem
                  item={item}
                  onEdit={type !== "search" ? handleEdit : undefined}
                  onDelete={type !== "search" ? handleDelete : undefined}
                />
                {index < items.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2f7" },
  body: { padding: 14, paddingBottom: 30 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8ecf0",
    overflow: "hidden",
  },
  divider: { height: 1, backgroundColor: "#f0f4f7", marginLeft: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, color: "#888" },
  errorIcon: { fontSize: 40 },
  errorText: {
    fontSize: 14,
    color: "#e74c3c",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryBtn: {
    fontSize: 14,
    color: "#1a6b3c",
    fontWeight: "600",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#1a6b3c",
    borderRadius: 10,
  },
});

export default ResearchList;
