// จัดการข้อมูลผลงานวิจัย
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import AppHeader from "../../../components/AppHeader";
import InlineDropdown from "../../../components/expert/InlineDropdown";

const BASE_URL = "https://your-api.example.com";

const BASE_YEAR_LIST = Array.from({ length: 2569 - 2533 + 1 }, (_, i) => {
  const y = 2569 - i;
  return { id: String(y), label: String(y) };
});

// Mock data — ลบออกเมื่อมี API
const INITIAL_ITEMS = [
  {
    id: "1",
    year: "2562",
    title:
      "การจัดการศูนย์ข้อมูลเพื่อการพัฒนาเชิงพื้นที่สำหรับเครือข่ายมหาวิทยาลัยราชภัฏอุตรดิตถ์",
    type: "กองทุนวิจัยใน",
    pmu: "",
    level: "",
  },
  {
    id: "2",
    year: "2561",
    title: "การถ่ายทอดเทคโนโลยีระบบสารสนเทศทวนสอบคุณภาพสินค้าสับปะรด",
    type: "PMU",
    pmu: "",
    level: "",
  },
];

const ResearchForm = ({ navigation }) => {
  const { t } = useTranslation();
  const YEAR_OPTIONS = useMemo(
    () => [
      { id: "", label: t("research.common.selectYear") },
      ...BASE_YEAR_LIST,
    ],
    [t],
  );
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    year: "",
    title: "",
    type: "",
    pmu: "",
    level: "",
  });
  const [typeOptions, setTypeOptions] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingTypes(true);
        const res = await fetch(`${BASE_URL}/api/research-types`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setTypeOptions([
          { id: "", label: t("research.researchForm.typePlaceholder") },
          ...data.map((d) => ({ id: String(d.id), label: d.name })),
        ]);
      } catch {
        console.log("API not ready");
      } finally {
        setLoadingTypes(false);
      }
    })();
  }, []);

  const setField = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const openEdit = (entry) => {
    setEditingItem(entry);
    setForm({
      year: entry.year,
      title: entry.title,
      type: entry.type,
      pmu: entry.pmu,
      level: entry.level,
    });
  };

  const openNew = () => {
    setEditingItem(null);
    setForm({ year: "", title: "", type: "", pmu: "", level: "" });
  };

  const handleSave = () => {
    if (!form.year || !form.title.trim()) {
      Alert.alert(
        t("research.common.warning"),
        t("research.researchForm.validation"),
      );
      return;
    }
    const saved = {
      id: editingItem?.id || String(Date.now()),
      year: form.year,
      title: form.title,
      type: form.type,
      pmu: form.pmu,
      level: form.level,
    };
    if (editingItem) {
      setItems((prev) =>
        prev.map((i) => (i.id === editingItem.id ? saved : i)),
      );
      Alert.alert(
        t("research.common.editSuccess"),
        t("research.common.savedMsg"),
      );
    } else {
      setItems((prev) => [saved, ...prev]);
      Alert.alert(
        t("research.common.addSuccess"),
        t("research.common.addSuccessMsg"),
      );
    }
    openNew();
    // TODO: POST/PUT /api/research
  };

  const handleDelete = (entry) => {
    Alert.alert(
      t("research.common.deleteTitle"),
      t("research.common.deleteConfirm"),
      [
        { text: t("research.common.cancel"), style: "cancel" },
        {
          text: t("research.common.deleteBtn"),
          style: "destructive",
          onPress: () => {
            setItems((prev) => prev.filter((i) => i.id !== entry.id));
            // TODO: DELETE /api/research/:id
          },
        },
      ],
    );
  };

  // ── column widths ──────────────────────────────────────────
  const COL = {
    no: 28,
    year: 40,
    type: 76,
    pmu: 36,
    level: 40,
    edit: 44,
    del: 32,
  };

  return (
    <View style={s.container}>
      <AppHeader
        title={t("research.researchForm.title")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={s.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── ตารางรายการ ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardHeaderText}>
              {t("research.researchForm.editForm")}
            </Text>
          </View>

          {/* horizontal scroll เฉพาะตาราง */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* head */}
              <View style={s.tableHead}>
                <Text style={[s.th, { width: COL.no }]}>
                  {t("research.common.no")}
                </Text>
                <Text style={[s.th, { width: COL.year }]}>
                  {t("research.common.year")}
                </Text>
                <Text style={[s.th, { flex: 1, minWidth: 160 }]}>
                  {t("research.researchForm.colTitle")}
                </Text>
                <Text style={[s.th, { width: COL.type }]}>
                  {t("research.researchForm.colType")}
                </Text>
                <Text style={[s.th, { width: COL.pmu }]}>
                  {t("research.researchForm.colPmu")}
                </Text>
                <Text style={[s.th, { width: COL.level }]}>
                  {t("research.researchForm.colLevel")}
                </Text>
                <Text style={[s.th, { width: COL.edit }]}>
                  {t("research.common.editBtn")}
                </Text>
                <Text style={[s.th, { width: COL.del }]}>
                  {t("research.common.deleteBtn")}
                </Text>
              </View>

              {/* rows */}
              {items.length === 0 ? (
                <Text style={s.emptyText}>
                  {t("research.researchForm.noData")}
                </Text>
              ) : (
                items.map((entry, index) => (
                  <View
                    key={entry.id}
                    style={[
                      s.tableRow,
                      index % 2 === 0 && { backgroundColor: "#f8fafb" },
                    ]}
                  >
                    <Text
                      style={[s.td, { width: COL.no, textAlign: "center" }]}
                    >
                      {index + 1}
                    </Text>
                    <Text
                      style={[s.td, { width: COL.year, textAlign: "center" }]}
                    >
                      {entry.year}
                    </Text>
                    <Text
                      style={[s.td, { flex: 1, minWidth: 160 }]}
                      numberOfLines={3}
                    >
                      {entry.title}
                    </Text>
                    <Text
                      style={[
                        s.td,
                        {
                          width: COL.type,
                          color: "#0f7a55",
                          textAlign: "center",
                        },
                      ]}
                    >
                      {entry.type}
                    </Text>
                    <Text
                      style={[s.td, { width: COL.pmu, textAlign: "center" }]}
                    >
                      {entry.pmu}
                    </Text>
                    <Text
                      style={[s.td, { width: COL.level, textAlign: "center" }]}
                    >
                      {entry.level}
                    </Text>
                    <TouchableOpacity
                      style={[s.actionBtn, s.editBtn, { width: COL.edit }]}
                      onPress={() => openEdit(entry)}
                    >
                      <Text style={s.editBtnText}>
                        {t("research.common.editBtn")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.actionBtn, s.delBtn, { width: COL.del }]}
                      onPress={() => handleDelete(entry)}
                    >
                      <Text style={s.delBtnText}>
                        {t("research.common.deleteBtn")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>

        {/* ── ฟอร์มเพิ่ม/แก้ไข ── */}
        <View style={s.formCard}>
          <Text style={s.formTitle}>
            {editingItem
              ? t("research.researchForm.editForm")
              : t("research.researchForm.addForm")}
          </Text>

          {/* ปี */}
          <InlineDropdown
            label={t("research.common.year") + ":"}
            value={form.year}
            options={YEAR_OPTIONS}
            onSelect={(v) => setField("year", v)}
            required
          />

          <View style={s.divider} />

          {/* ชื่องานวิจัย */}
          <View style={s.fieldWrap}>
            <Text style={s.fieldLabel}>
              {t("research.researchForm.fieldTitle")}{" "}
              <Text style={s.required}>*</Text>
            </Text>
            <TextInput
              style={s.textarea}
              placeholder={t("research.researchForm.placeholderTitle")}
              placeholderTextColor="#bbb"
              value={form.title}
              onChangeText={(v) => setField("title", v)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={s.divider} />

          {/* ประเภท */}
          {loadingTypes ? (
            <View style={s.loadingWrap}>
              <ActivityIndicator size="small" color="#0f7a55" />
              <Text style={s.loadingText}>
                {t("research.researchForm.loadingTypes")}
              </Text>
            </View>
          ) : (
            <InlineDropdown
              label={t("research.researchForm.fieldType")}
              value={form.type}
              options={[
                { id: "", label: t("research.researchForm.typePlaceholder") },
                ...typeOptions.filter((o) => o.id !== ""),
              ]}
              onSelect={(v) => setField("type", v)}
            />
          )}

          {/* ปุ่ม */}
          <View style={s.btnRow}>
            <TouchableOpacity
              style={s.saveBtn}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={s.saveBtnText}>
                {editingItem
                  ? t("research.common.saveEdit")
                  : t("research.researchForm.addForm")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.resetBtn}
              onPress={openNew}
              activeOpacity={0.8}
            >
              <Text style={s.resetBtnText}>{t("research.common.reset")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2f7" },
  body: { padding: 14, paddingBottom: 40, rowGap: 14 },

  // ── ตาราง ──
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8ecf0",
    overflow: "hidden",
  },
  cardHeader: {
    backgroundColor: "#f8fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecf0",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardHeaderText: { fontSize: 14, fontWeight: "700", color: "#0f7a55" },
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0faf4",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecf0",
    gap: 4,
  },
  th: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0f7a55",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f7",
    gap: 4,
  },
  td: { fontSize: 11, color: "#1a1a2e" },
  emptyText: { textAlign: "center", color: "#aaa", fontSize: 13, padding: 24 },
  actionBtn: {
    borderRadius: 6,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  editBtn: { backgroundColor: "#fff3cd" },
  editBtnText: { fontSize: 10, fontWeight: "700", color: "#856404" },
  delBtn: { backgroundColor: "#fde2e6" },
  delBtnText: { fontSize: 10, fontWeight: "700", color: "#c0392b" },

  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8ecf0",
    overflow: "hidden",
  },
  formTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a2e",
    textAlign: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f7",
  },
  divider: { height: 1, backgroundColor: "#f0f4f7" },
  fieldWrap: { paddingHorizontal: 16, paddingVertical: 12 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a6b3c",
    marginBottom: 6,
  },
  required: { color: "#e74c3c" },

  textarea: {
    backgroundColor: "#f8fafb",
    borderColor: "#e8ecf0",
    borderRadius: 10,
    borderWidth: 1,
    color: "#1a1a2e",
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingTop: 10,
    minHeight: 110,
    textAlignVertical: "top",
  },

  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  loadingText: { fontSize: 13, color: "#888" },

  btnRow: { flexDirection: "row", gap: 10, padding: 16 },
  saveBtn: {
    flex: 1,
    backgroundColor: "#1a6b3c",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1a6b3c",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  resetBtn: {
    backgroundColor: "#e8f5ee",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1a6b3c",
  },
  resetBtnText: { color: "#1a6b3c", fontSize: 13, fontWeight: "700" },
});

export default ResearchForm;
