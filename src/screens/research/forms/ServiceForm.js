// จัดการข้อมูลการบริการวิชาการ/พันธกิจสัมพันธ์
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
  warning: "#f7a23b",
  warningSoft: "#fff4e0",
  required: "#d83a36",
  placeholder: "#9aa6b1",
};

const currentThaiYear = new Date().getFullYear() + 543;
const YEAR_OPTIONS = [
  { id: "", label: "กรุณาเลือกปี" },
  ...Array.from({ length: currentThaiYear - 2532 }, (_, i) => {
    const year = String(currentThaiYear - i);
    return { id: year, label: year };
  }),
];

const normalizeService = (item) => ({
  id: String(item.id ?? item.service_id ?? Date.now()),
  year: String(item.year ?? item.service_year ?? ""),
  title: item.title ?? item.topic ?? item.service_title ?? item.name ?? "",
  url: item.url ?? item.link ?? item.more_info_url ?? "",
  fileName: item.fileName ?? item.file_name ?? item.attachment_name ?? "",
});

const EditingPill = () => (
  <View style={styles.editingPill}>
    <Ionicons name="create-outline" size={13} color="#a8631a" />
    <Text style={styles.editingPillText}>กำลังแก้ไข</Text>
  </View>
);

const INIT_FORM = { year: "", title: "", url: "", fileName: "" };

const ServiceForm = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(INIT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/services`);
        if (!res.ok) throw new Error("fetch services failed");
        const data = await res.json();
        const rows = Array.isArray(data) ? data : (data.data ?? []);
        setItems(rows.map(normalizeService));
      } catch {
        console.log("Service API not ready");
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
    setForm({
      year: entry.year,
      title: entry.title,
      url: entry.url,
      fileName: entry.fileName,
    });
  };

  const openNew = () => {
    setEditingItem(null);
    setForm(INIT_FORM);
  };

  const handleSave = async () => {
    if (!form.year || !form.title.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณาเลือกปีและกรอกหัวข้อการบริการวิชาการ");
      return;
    }
    const payload = {
      year: form.year,
      title: form.title.trim(),
      url: form.url.trim(),
      fileName: form.fileName.trim(),
    };
    try {
      setSaving(true);
      const isEditing = Boolean(editingItem);
      const endpoint = isEditing
        ? `${BASE_URL}/api/services/${editingItem.id}`
        : `${BASE_URL}/api/services`;
      const res = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save failed");
      const savedData = await res.json();
      const saved = normalizeService(savedData.data ?? savedData ?? payload);
      const safeSaved = { ...saved, id: editingItem?.id ?? saved.id };

      if (isEditing) {
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
        "ยังเชื่อมต่อ API ไม่ได้ กรุณาตรวจสอบ BASE_URL",
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
            const res = await fetch(`${BASE_URL}/api/services/${entry.id}`, {
              method: "DELETE",
            });
            if (!res.ok) throw new Error("delete failed");
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
      <AppHeader
        title="การบริการวิชาการ/พันธกิจสัมพันธ์"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="people" size={22} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroEyebrow}>ข้อมูลผลงาน</Text>
            <Text style={styles.heroTitle}>
              การบริการวิชาการ/พันธกิจสัมพันธ์
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{items.length}</Text>
          </View>
        </View>

        {/* ── ตารางรายการ ── */}
        <View style={styles.tableCard}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="list-outline"
              size={16}
              color={COLORS.primaryDark}
            />
            <Text style={styles.cardHeaderText}>
              รายการการบริการวิชาการ/พันธกิจสัมพันธ์
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
                color={COLORS.placeholder}
              />
              <Text style={styles.emptyText}>
                ยังไม่มีข้อมูลการบริการวิชาการ/พันธกิจสัมพันธ์
              </Text>
              <Text style={styles.emptyHint}>
                เพิ่มข้อมูลใหม่ในแบบฟอร์มด้านล่าง
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.table}>
                <View style={styles.tableHead}>
                  <Text style={[styles.th, styles.col_no]}>ที่</Text>
                  <Text style={[styles.th, styles.col_year]}>ปี</Text>
                  <Text style={[styles.th, styles.col_title]}>
                    หัวข้อการบริการวิชาการ/พันธกิจสัมพันธ์
                  </Text>
                  <Text style={[styles.th, styles.col_link]}>ลิงก์</Text>
                  <Text style={[styles.th, styles.col_file]}>ไฟล์แนบ</Text>
                  <Text style={[styles.th, styles.col_act]}>จัดการ</Text>
                </View>
                {tableItems.map((entry, index) => (
                  <View
                    key={entry.id}
                    style={[
                      styles.tableRow,
                      index % 2 === 1 && { backgroundColor: COLORS.rowAlt },
                    ]}
                  >
                    <Text style={[styles.td, styles.col_no]}>{index + 1}</Text>
                    <View style={styles.col_year}>
                      <View style={styles.yearChip}>
                        <Text style={styles.yearChipText}>{entry.year}</Text>
                      </View>
                    </View>
                    <Text
                      style={[styles.tdTitle, styles.col_title]}
                      numberOfLines={3}
                    >
                      {entry.title}
                    </Text>
                    <Text
                      style={[styles.linkText, styles.col_link]}
                      numberOfLines={2}
                    >
                      {entry.url}
                    </Text>
                    <Text
                      style={[styles.td, styles.col_file]}
                      numberOfLines={2}
                    >
                      {entry.fileName}
                    </Text>
                    <View style={[styles.col_act, styles.actionRow]}>
                      <TouchableOpacity
                        style={[
                          styles.iconBtn,
                          { backgroundColor: COLORS.warningSoft },
                        ]}
                        onPress={() => openEdit(entry)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="create-outline"
                          size={17}
                          color="#a8631a"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: "#fde7e7" }]}
                        onPress={() => handleDelete(entry)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={17}
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

        {/* ── Form เพิ่ม/แก้ไข ── */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <View style={styles.formHeaderLeft}>
              <Ionicons
                name={editingItem ? "create" : "add-circle"}
                size={18}
                color={COLORS.primary}
              />
              <Text style={styles.formTitle}>
                {editingItem
                  ? "แก้ไขข้อมูลการบริการวิชาการ/พันธกิจสัมพันธ์"
                  : "เพิ่มข้อมูลการบริการวิชาการ/พันธกิจสัมพันธ์"}
              </Text>
            </View>
            {editingItem && <EditingPill />}
          </View>

          <InlineDropdown
            label="ปี:"
            value={form.year}
            options={YEAR_OPTIONS}
            onSelect={(v) => setField("year", v)}
            required
          />

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>
              หัวข้อการบริการวิชาการ/พันธกิจสัมพันธ์:
              <Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(v) => setField("title", v)}
              placeholder="ระบุหัวข้อการบริการวิชาการ/พันธกิจสัมพันธ์"
              placeholderTextColor={COLORS.placeholder}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>ลิงก์ข้อมูลเพิ่มเติม:</Text>
            <TextInput
              style={styles.input}
              value={form.url}
              onChangeText={(v) => setField("url", v)}
              placeholder="http://"
              placeholderTextColor={COLORS.placeholder}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>ไฟล์แนบ:</Text>
            <TouchableOpacity
              style={styles.fileInput}
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert("ไฟล์แนบ", "เชื่อมต่อ file picker ในขั้นตอนต่อไป")
              }
            >
              <View style={styles.fileButton}>
                <Text style={styles.fileButtonText}>เลือกไฟล์</Text>
              </View>
              <Text style={styles.fileNameText}>
                {form.fileName || "ไม่ได้เลือกไฟล์"}
              </Text>
            </TouchableOpacity>
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
                    {editingItem ? "บันทึกข้อมูล" : "เพิ่มข้อมูล"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={openNew}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh" size={17} color={COLORS.primary} />
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

  // Hero
  hero: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: COLORS.borderSoft,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    marginRight: 12,
    width: 44,
  },
  heroEyebrow: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: COLORS.label,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  countBadge: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    minWidth: 36,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  countBadgeText: { color: "#fff", fontSize: 13, fontWeight: "900" },

  // Table Card
  tableCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.borderSoft,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderBottomColor: COLORS.borderSoft,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  cardHeaderText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 8,
  },

  // Table
  table: { minWidth: 900 },
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
  th: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    paddingHorizontal: 4,
    textTransform: "uppercase",
  },
  td: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 4,
  },
  tdTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  linkText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  col_no: { textAlign: "center", width: 40 },
  col_year: { width: 90 },
  col_title: { width: 440 },
  col_link: { width: 100 },
  col_file: { width: 100 },
  col_act: { width: 90 },

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

  // Empty / Loading
  emptyWrap: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
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
    paddingVertical: 36,
  },
  loadingText: { color: COLORS.textMuted, fontSize: 13, marginLeft: 10 },

  // Form Card
  formCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.borderSoft,
    borderRadius: 16,
    borderWidth: 1,
    paddingBottom: 18,
    paddingTop: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  formHeader: {
    alignItems: "center",
    borderBottomColor: COLORS.borderSoft,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  formHeaderLeft: { alignItems: "center", flexDirection: "row" },
  formTitle: {
    color: COLORS.label,
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
    flex: 1,
  },
  editingPill: {
    alignItems: "center",
    backgroundColor: "#fff4e0",
    borderRadius: 999,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  editingPillText: {
    color: "#a8631a",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 4,
  },

  // Fields
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
  fileInput: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 46,
    paddingHorizontal: 12,
  },
  fileButton: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fileButtonText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: "800",
  },
  fileNameText: {
    color: COLORS.textMuted,
    flex: 1,
    fontSize: 13,
    marginLeft: 12,
  },

  // Buttons
  btnRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
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
    paddingHorizontal: 18,
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

export default ServiceForm;
