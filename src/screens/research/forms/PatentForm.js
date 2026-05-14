//จัดการข้อมูลทรัพย์สินทางปัญญา
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

const COLORS = {
  primary: "#007a5a",
  primaryDark: "#00614a",
  primarySoft: "#e6f4ef",
  bg: "#f5f7f8",
  card: "#ffffff",
  rowAlt: "#fafbfc",
  border: "#e3e7eb",
  borderSoft: "#eef1f4",
  text: "#1f2a2e",
  textMuted: "#6b7a82",
  label: "#3f4d50",
  danger: "#df4c4b",
  dangerSoft: "#fdecec",
  warning: "#f7a23b",
  warningSoft: "#fff4e0",
  required: "#d83a36",
  placeholder: "#9aa6b1",
};

const GENERATED_YEAR_OPTIONS = [
  { id: "", label: "กรุณาเลือกปี" },
  ...Array.from({ length: 2569 - 2533 + 1 }, (_, index) => {
    const year = String(2569 - index);
    return { id: year, label: year };
  }),
];

const normalizePatent = (item) => ({
  id: String(item.id ?? item.patent_id ?? Date.now()),
  year: String(
    item.year ?? item.registration_year ?? item.publication_year ?? "",
  ),
  title: item.title ?? item.patent_title ?? item.name ?? "",
  fileUrl: item.fileUrl ?? item.file_url ?? item.drive_url ?? item.url ?? "",
});

const EditingPill = () => (
  <View style={styles.editingPill}>
    <Ionicons name="create-outline" size={12} color="#a8651b" />
    <Text style={styles.editingPillText}>กำลังแก้ไข</Text>
  </View>
);

const PatentForm = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ year: "", title: "", fileUrl: "" });
  const [yearOptions, setYearOptions] = useState(GENERATED_YEAR_OPTIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [patentRes] = await Promise.allSettled([
          fetch(`${BASE_URL}/api/patents`),
          fetch(`${BASE_URL}/api/patent-years`),
        ]);

        if (patentRes.status === "fulfilled" && patentRes.value.ok) {
          const data = await patentRes.value.json();
          const rows = Array.isArray(data) ? data : (data.data ?? []);
          setItems(rows.map(normalizePatent));
        }
        setYearOptions(GENERATED_YEAR_OPTIONS);
      } catch {
        console.log("Patent API not ready");
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

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openEdit = (entry) => {
    setEditingItem(entry);
    setForm({ year: entry.year, title: entry.title, fileUrl: entry.fileUrl });
  };

  const openNew = () => {
    setEditingItem(null);
    setForm({ year: "", title: "", fileUrl: "" });
  };

  const persistPatent = async (payload) => {
    const isEditing = Boolean(editingItem);
    const endpoint = isEditing
      ? `${BASE_URL}/api/patents/${editingItem.id}`
      : `${BASE_URL}/api/patents`;
    const res = await fetch(endpoint, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("save patent failed");
    return res.json();
  };

  const handleSave = async () => {
    if (!form.year || !form.title.trim() || !form.fileUrl.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณาเลือกปี กรอกชื่อ และใส่ลิงก์ไฟล์ข้อมูล");
      return;
    }
    const payload = {
      year: form.year,
      title: form.title.trim(),
      fileUrl: form.fileUrl.trim(),
    };
    try {
      setSaving(true);
      const savedData = await persistPatent(payload);
      const saved = normalizePatent(savedData.data ?? savedData ?? payload);
      const safeSaved = { ...saved, id: editingItem?.id ?? saved.id };
      if (editingItem) {
        setItems((prev) =>
          prev.map((entry) =>
            entry.id === editingItem.id ? safeSaved : entry,
          ),
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
        "ยังเชื่อมต่อ API ไม่ได้ กรุณาตรวจสอบ BASE_URL และ endpoint patent",
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
            const res = await fetch(`${BASE_URL}/api/patents/${entry.id}`, {
              method: "DELETE",
            });
            if (!res.ok) throw new Error("delete patent failed");
            setItems((prev) => prev.filter((item) => item.id !== entry.id));
          } catch {
            Alert.alert(
              "ลบไม่สำเร็จ",
              "ยังเชื่อมต่อ API ไม่ได้ กรุณาตรวจสอบ endpoint patent",
            );
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="สิทธิบัตร/อนุสิทธิบัตร"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="bulb" size={22} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>ทรัพย์สินทางปัญญา</Text>
            <Text style={styles.pageTitle}>สิทธิบัตร/อนุสิทธิบัตร</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{items.length}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.tableCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="list" size={16} color={COLORS.primaryDark} />
            <Text style={styles.cardHeaderText}>
              รายการสิทธิบัตร/อนุสิทธิบัตร
            </Text>
          </View>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
            </View>
          ) : tableItems.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons
                name="folder-open-outline"
                size={42}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyText}>
                ยังไม่มีข้อมูลสิทธิบัตร/อนุสิทธิบัตร
              </Text>
              <Text style={styles.emptyHint}>เพิ่มรายการแรกของคุณด้านล่าง</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.table}>
                <View style={styles.tableHead}>
                  <Text style={[styles.thText, styles.colNo]}>ที่</Text>
                  <Text style={[styles.thText, styles.colYear]}>ปี</Text>
                  <Text style={[styles.thText, styles.colTitle]}>
                    ชื่อสิทธิบัตร/อนุสิทธิบัตร
                  </Text>
                  <Text style={[styles.thText, styles.colFile]}>ลิงก์ไฟล์</Text>
                  <Text style={[styles.thText, styles.colAction]}>จัดการ</Text>
                </View>

                {tableItems.map((entry, index) => (
                  <View
                    key={entry.id}
                    style={[
                      styles.tableRow,
                      index % 2 === 1 && { backgroundColor: COLORS.rowAlt },
                    ]}
                  >
                    <Text style={[styles.tdText, styles.colNo]}>
                      {index + 1}
                    </Text>
                    <View style={styles.colYear}>
                      <View style={styles.yearChip}>
                        <Text style={styles.yearChipText}>{entry.year}</Text>
                      </View>
                    </View>
                    <Text style={[styles.titleText, styles.colTitle]}>
                      {entry.title}
                    </Text>
                    <Text
                      style={[styles.fileText, styles.colFile]}
                      numberOfLines={2}
                    >
                      {entry.fileUrl}
                    </Text>
                    <View style={[styles.actionRow, styles.colAction]}>
                      <TouchableOpacity
                        style={[
                          styles.iconBtn,
                          { backgroundColor: COLORS.warningSoft },
                        ]}
                        onPress={() => openEdit(entry)}
                      >
                        <Ionicons
                          name="create-outline"
                          size={16}
                          color={COLORS.warning}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.iconBtn,
                          { backgroundColor: COLORS.dangerSoft },
                        ]}
                        onPress={() => handleDelete(entry)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color={COLORS.danger}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Ionicons
              name={editingItem ? "create" : "add-circle"}
              size={18}
              color={COLORS.primary}
            />
            <Text style={styles.formTitle}>
              {editingItem
                ? "แก้ไขข้อมูล"
                : "เพิ่มข้อมูลสิทธิบัตร/อนุสิทธิบัตร"}
            </Text>
            {editingItem && <EditingPill />}
          </View>

          <InlineDropdown
            label="ปี:"
            value={form.year}
            options={yearOptions}
            onSelect={(value) => setField("year", value)}
            required
            searchable
          />

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>
              ชื่อสิทธิบัตร/อนุสิทธิบัตร:<Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(value) => setField("title", value)}
              placeholder="กรอกชื่อสิทธิบัตร/อนุสิทธิบัตร"
              placeholderTextColor={COLORS.placeholder}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>
              ลิงก์ไฟล์ข้อมูล (Google Drive หรือแหล่งอื่น):
              <Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, { minHeight: 52 }]}
              value={form.fileUrl}
              onChangeText={(value) => setField("fileUrl", value)}
              placeholder="https://..."
              placeholderTextColor={COLORS.placeholder}
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
              <Ionicons name="refresh" size={16} color={COLORS.primary} />
              <Text style={styles.resetBtnText}>รีเซ็ต</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  body: { paddingHorizontal: 14, paddingTop: 18, paddingBottom: 60 },

  hero: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: COLORS.borderSoft,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  heroIconWrap: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    marginRight: 12,
    width: 44,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  pageTitle: {
    color: COLORS.label,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    minWidth: 32,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },

  tableCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.borderSoft,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 1,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardHeader: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderBottomColor: COLORS.borderSoft,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cardHeaderText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: "800",
  },

  table: { minWidth: 820 },
  tableHead: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tableRow: {
    alignItems: "center",
    borderBottomColor: COLORS.borderSoft,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  thText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    paddingHorizontal: 4,
    textTransform: "uppercase",
  },
  tdText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 4,
  },
  titleText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  fileText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  colNo: { textAlign: "center", width: 40 },
  colYear: { width: 80 },
  colTitle: { width: 360 },
  colFile: { width: 200 },
  colAction: { width: 110 },
  yearChip: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  yearChipText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "800",
  },
  actionRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
  },
  iconBtn: {
    alignItems: "center",
    borderRadius: 8,
    height: 34,
    justifyContent: "center",
    width: 34,
  },

  emptyWrap: { alignItems: "center", paddingVertical: 44 },
  emptyText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10,
  },
  emptyHint: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  loadingWrap: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 44,
  },
  loadingText: { color: COLORS.textMuted, fontSize: 13, marginLeft: 10 },

  formCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.borderSoft,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 1,
    paddingBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  formHeader: {
    alignItems: "center",
    borderBottomColor: COLORS.borderSoft,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  formTitle: {
    color: COLORS.label,
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
  },
  editingPill: {
    alignItems: "center",
    backgroundColor: COLORS.warningSoft,
    borderRadius: 999,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  editingPillText: { color: "#a8651b", fontSize: 11, fontWeight: "800" },

  fieldWrap: { paddingHorizontal: 16, paddingVertical: 8 },
  fieldLabel: {
    color: COLORS.label,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },
  required: { color: COLORS.required },
  input: {
    backgroundColor: "#fff",
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 14,
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  btnRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  saveBtn: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    elevation: 2,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  disabledBtn: { opacity: 0.6 },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "900" },
  resetBtn: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: COLORS.primary,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 18,
  },
  resetBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: "900" },
});

export default PatentForm;
