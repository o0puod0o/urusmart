// จัดการข้อมูลบทความวิจัย/วิชาการที่นำเสนอในงานประชุมวิชาการ (Proceeding)
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../../components/AppHeader";
import InlineDropdown from "../../../components/research/InlineDropdown";

const BASE_URL = "https://your-api.example.com";

// Design tokens
const COLORS = {
  primary: "#007a5a",
  primaryDark: "#005c44",
  primarySoft: "#e6f4ef",
  bg: "#f5f7f8",
  surface: "#ffffff",
  border: "#e3e7ea",
  text: "#1f2d30",
  textMuted: "#6b7a7e",
  warning: "#f59e0b",
  danger: "#ef4444",
  required: "#dc2626",
};

const GENERATED_YEAR_OPTIONS = [
  { id: "", label: "กรุณาเลือกปี" },
  ...Array.from({ length: 2569 - 2533 + 1 }, (_, index) => {
    const year = String(2569 - index);
    return { id: year, label: year };
  }),
];

const normalizeProceeding = (item) => ({
  id: String(item.id ?? item.proceeding_id ?? Date.now()),
  year: String(item.year ?? item.publication_year ?? ""),
  reference: item.reference ?? item.citation ?? item.title ?? "",
  url: item.url ?? item.link ?? "",
});

const normalizeOption = (item, fallbackLabelKey = "year") => {
  if (typeof item === "string" || typeof item === "number") {
    return { id: String(item), label: String(item) };
  }
  const value = item.id ?? item.value ?? item[fallbackLabelKey] ?? item.label;
  const label = item.label ?? item.name ?? item.title ?? value;
  return { id: String(value), label: String(label) };
};

const ProceedingForm = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ year: "", reference: "", url: "" });
  const [yearOptions, setYearOptions] = useState(GENERATED_YEAR_OPTIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [proceedingRes, yearRes] = await Promise.allSettled([
          fetch(`${BASE_URL}/api/proceedings`),
          fetch(`${BASE_URL}/api/proceeding-years`),
        ]);

        let nextItems = [];
        if (proceedingRes.status === "fulfilled" && proceedingRes.value.ok) {
          const data = await proceedingRes.value.json();
          const rows = Array.isArray(data) ? data : (data.data ?? []);
          nextItems = rows.map(normalizeProceeding);
          setItems(nextItems);
        }

        if (yearRes.status === "fulfilled" && yearRes.value.ok) {
          setYearOptions(GENERATED_YEAR_OPTIONS);
        } else if (nextItems.length > 0) {
          setYearOptions(GENERATED_YEAR_OPTIONS);
        }
      } catch {
        console.log("Proceeding API not ready");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const tableItems = useMemo(
    () => [...items].sort((a, b) => Number(b.year) - Number(a.year)),
    [items],
  );

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const openEdit = (entry) => {
    setEditingItem(entry);
    setForm({ year: entry.year, reference: entry.reference, url: entry.url });
  };

  const openNew = () => {
    setEditingItem(null);
    setForm({ year: "", reference: "", url: "" });
  };

  const persistProceeding = async (payload) => {
    const isEditing = Boolean(editingItem);
    const endpoint = isEditing
      ? `${BASE_URL}/api/proceedings/${editingItem.id}`
      : `${BASE_URL}/api/proceedings`;
    const res = await fetch(endpoint, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("save proceeding failed");
    return res.json();
  };

  const handleSave = async () => {
    if (!form.year || !form.reference.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณาเลือกปีและกรอกอ้างอิง");
      return;
    }
    const payload = {
      year: form.year,
      reference: form.reference.trim(),
      url: form.url.trim(),
    };
    try {
      setSaving(true);
      const savedData = await persistProceeding(payload);
      const saved = normalizeProceeding(savedData.data ?? savedData ?? payload);
      const safeSaved = { ...saved, id: editingItem?.id ?? saved.id };

      if (editingItem) {
        setItems((prev) =>
          prev.map((e) => (e.id === editingItem.id ? safeSaved : e)),
        );
        Alert.alert("แก้ไขสำเร็จ", "ข้อมูลถูกบันทึกแล้ว");
      } else {
        setItems((prev) => [safeSaved, ...prev]);
        Alert.alert("เพิ่มสำเร็จ", "เพิ่มข้อมูลเรียบร้อยแล้ว");
      }
      openNew();
    } catch {
      Alert.alert(
        "บันทึกไม่สำเร็จ",
        "ยังเชื่อมต่อ API ไม่ได้ กรุณาตรวจสอบ BASE_URL และ endpoint proceeding",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (entry) => {
    Alert.alert("ลบข้อมูล", "ต้องการลบรายการนี้ใช่ไหม?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(`${BASE_URL}/api/proceedings/${entry.id}`, {
              method: "DELETE",
            });
            if (!res.ok) throw new Error("delete proceeding failed");
            setItems((prev) => prev.filter((i) => i.id !== entry.id));
          } catch {
            Alert.alert("ลบไม่สำเร็จ", "ยังเชื่อมต่อ API ไม่ได้");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Proceeding" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="document-text" size={22} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroEyebrow}>งานวิจัย / วิชาการ</Text>
            <Text style={styles.pageTitle}>
              บทความที่นำเสนอในงานประชุมวิชาการ
            </Text>
            <Text style={styles.pageSubtitle}>Proceeding</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeNum}>{items.length}</Text>
            <Text style={styles.countBadgeLabel}>รายการ</Text>
          </View>
        </View>

        {/* Table card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="list" size={16} color={COLORS.primary} />
            <Text style={styles.cardHeaderText}>รายการ Proceeding ทั้งหมด</Text>
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
            </View>
          ) : tableItems.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="folder-open-outline" size={42} color="#c5cdd0" />
              <Text style={styles.emptyText}>ยังไม่มีข้อมูล Proceeding</Text>
              <Text style={styles.emptyHint}>
                เพิ่มข้อมูลแรกของคุณได้ที่ฟอร์มด้านล่าง
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.table}>
                <View style={styles.tableHead}>
                  <Text style={[styles.thText, styles.colNo]}>#</Text>
                  <Text style={[styles.thText, styles.colYear]}>ปี</Text>
                  <Text style={[styles.thText, styles.colReference]}>
                    อ้างอิง
                  </Text>
                  <Text style={[styles.thText, styles.colAction]}>จัดการ</Text>
                </View>

                {tableItems.map((entry, index) => (
                  <View
                    key={entry.id}
                    style={[
                      styles.tableRow,
                      index % 2 === 1 && styles.tableRowAlt,
                    ]}
                  >
                    <Text style={[styles.tdNo, styles.colNo]}>{index + 1}</Text>
                    <View style={styles.colYear}>
                      <View style={styles.yearChip}>
                        <Text style={styles.yearChipText}>{entry.year}</Text>
                      </View>
                    </View>
                    <Text style={[styles.referenceText, styles.colReference]}>
                      {entry.reference}
                    </Text>
                    <View style={[styles.actionCell, styles.colAction]}>
                      <TouchableOpacity
                        style={[styles.iconBtn, styles.editBtn]}
                        onPress={() => openEdit(entry)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="create-outline"
                          size={16}
                          color="#fff"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.iconBtn, styles.deleteBtn]}
                        onPress={() => handleDelete(entry)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="trash-outline" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Form card */}
        <View style={[styles.card, styles.formCard]}>
          <View style={styles.cardHeader}>
            <Ionicons
              name={editingItem ? "create" : "add-circle"}
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.cardHeaderText}>
              {editingItem
                ? "แก้ไขรายการ Proceeding"
                : "เพิ่มรายการ Proceeding"}
            </Text>
            {editingItem && (
              <View style={styles.editingPill}>
                <Text style={styles.editingPillText}>กำลังแก้ไข</Text>
              </View>
            )}
          </View>

          <View style={styles.formBody}>
            <InlineDropdown
              label="ปี:"
              value={form.year}
              options={yearOptions}
              onSelect={(v) => setField("year", v)}
              required
              searchable
            />

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>
                อ้างอิง<Text style={styles.required}> *</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.referenceInput]}
                value={form.reference}
                onChangeText={(v) => setField("reference", v)}
                placeholder="กรอกข้อมูลอ้างอิงบทความ..."
                placeholderTextColor="#9aa6aa"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>URL</Text>
              <TextInput
                style={[styles.input, styles.urlInput]}
                value={form.url}
                onChangeText={(v) => setField("url", v)}
                placeholder="https://..."
                placeholderTextColor="#9aa6aa"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.disabledBtn]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name={editingItem ? "checkmark-circle" : "add-circle"}
                      size={18}
                      color="#fff"
                    />
                    <Text style={styles.saveBtnText}>
                      {editingItem ? "บันทึกการแก้ไข" : "เพิ่มข้อมูล"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={openNew}
                activeOpacity={0.85}
              >
                <Ionicons name="refresh" size={18} color={COLORS.primary} />
                <Text style={styles.resetBtnText}>รีเซ็ต</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  body: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 40 },

  // Hero
  hero: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  heroEyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  pageTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
  },
  pageSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  countBadge: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
  },
  countBadgeNum: { color: "#fff", fontSize: 18, fontWeight: "900" },
  countBadgeLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 10,
    fontWeight: "700",
    marginTop: -2,
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  cardHeaderText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
    flex: 1,
  },
  editingPill: {
    backgroundColor: "#fff4e0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  editingPillText: {
    color: "#b86c00",
    fontSize: 11,
    fontWeight: "800",
  },

  // Table
  table: { minWidth: 760, paddingVertical: 4 },
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f3f4",
  },
  tableRowAlt: { backgroundColor: "#fafbfc" },
  thText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    paddingHorizontal: 4,
  },
  tdNo: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  referenceText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  yearChip: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  yearChipText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  colNo: { width: 40, textAlign: "center" },
  colYear: { width: 80 },
  colReference: { width: 460 },
  colAction: { width: 110, textAlign: "center" },
  actionCell: { flexDirection: "row", justifyContent: "center", gap: 6 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  editBtn: { backgroundColor: COLORS.warning },
  deleteBtn: { backgroundColor: COLORS.danger },

  // Empty / loading
  emptyWrap: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  emptyHint: { color: "#9aa6aa", fontSize: 12 },
  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 10,
  },
  loadingText: { color: COLORS.textMuted, fontSize: 13 },

  // Form
  formCard: {},
  formBody: { padding: 16 },
  fieldWrap: { paddingVertical: 8 },
  fieldLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },
  required: { color: COLORS.required },
  input: {
    backgroundColor: "#f8fafa",
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  referenceInput: { minHeight: 120 },
  urlInput: { minHeight: 80 },

  btnRow: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 18,
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minHeight: 52,
    paddingHorizontal: 16,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  disabledBtn: { opacity: 0.6 },
  saveBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 12,
    minHeight: 52,
    paddingHorizontal: 18,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  resetBtnText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "900",
  },
});

export default ProceedingForm;
