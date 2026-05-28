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
import { useTranslation } from "react-i18next";
import AppHeader from "../../../components/AppHeader";
import InlineDropdown from "../../../components/expert/InlineDropdown";

const BASE_URL = "https://your-api.example.com";

const BASE_YEAR_LIST = Array.from({ length: 2569 - 2533 + 1 }, (_, index) => {
  const year = String(2569 - index);
  return { id: year, label: year };
});

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
  const { t } = useTranslation();
  const yearOptions = useMemo(
    () => [
      { id: "", label: t("research.common.selectYear") },
      ...BASE_YEAR_LIST,
    ],
    [t],
  );
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ year: "", reference: "", url: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/proceedings`);
        if (res.ok) {
          const data = await res.json();
          const rows = Array.isArray(data) ? data : (data.data ?? []);
          setItems(rows.map(normalizeProceeding));
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

  const handleSave = async () => {
    if (!form.year || !form.reference.trim()) {
      Alert.alert(
        t("research.common.warning"),
        t("research.proceeding.validation"),
      );
      return;
    }
    const payload = {
      year: form.year,
      reference: form.reference.trim(),
      url: form.url.trim(),
    };
    try {
      setSaving(true);
      const isEditing = Boolean(editingItem);
      const endpoint = isEditing
        ? `${BASE_URL}/api/proceedings/${editingItem.id}`
        : `${BASE_URL}/api/proceedings`;
      const res = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save failed");
      const savedData = await res.json();
      const saved = normalizeProceeding(savedData.data ?? savedData ?? payload);
      const safeSaved = { ...saved, id: editingItem?.id ?? saved.id };

      if (isEditing) {
        setItems((prev) =>
          prev.map((e) => (e.id === editingItem.id ? safeSaved : e)),
        );
        Alert.alert(
          t("research.common.editSuccess"),
          t("research.common.savedMsg"),
        );
      } else {
        setItems((prev) => [safeSaved, ...prev]);
        Alert.alert(
          t("research.common.addSuccess"),
          t("research.common.addSuccessMsg"),
        );
      }
      openNew();
    } catch {
      Alert.alert(t("research.common.saveFail"), t("research.common.apiError"));
    } finally {
      setSaving(false);
    }
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
          onPress: async () => {
            try {
              const res = await fetch(
                `${BASE_URL}/api/proceedings/${entry.id}`,
                {
                  method: "DELETE",
                },
              );
              if (!res.ok) throw new Error("delete failed");
              setItems((prev) => prev.filter((i) => i.id !== entry.id));
            } catch {
              Alert.alert(
                t("research.common.deleteFail"),
                t("research.common.deleteFailMsg"),
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Proceeding" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── ตารางรายการ ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={16} color="#1a6b3c" />
            <Text style={styles.cardHeaderText}>
              {" "}
              {t("research.proceeding.listTitle")}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color="#1a6b3c" />
              <Text style={styles.loadingText}>
                {t("research.common.loading")}
              </Text>
            </View>
          ) : tableItems.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="documents-outline" size={36} color="#ccc" />
              <Text style={styles.emptyText}>
                {t("research.proceeding.noData")}
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View style={styles.tableHead}>
                  <Text style={[styles.th, styles.col_no]}>
                    {t("research.common.no")}
                  </Text>
                  <Text style={[styles.th, styles.col_year]}>
                    {t("research.common.year")}
                  </Text>
                  <Text style={[styles.th, styles.col_ref]}>
                    {t("research.journal.colRef")}
                  </Text>
                  <Text style={[styles.th, styles.col_act]}>
                    {t("research.common.editBtn")}
                  </Text>
                  <Text style={[styles.th, styles.col_act]}>
                    {t("research.common.deleteBtn")}
                  </Text>
                </View>
                {tableItems.map((entry, index) => (
                  <View
                    key={entry.id}
                    style={[
                      styles.tableRow,
                      index % 2 === 1 && styles.tableRowAlt,
                    ]}
                  >
                    <Text style={[styles.td, styles.col_no]}>{index + 1}</Text>
                    <Text style={[styles.td, styles.col_year]}>
                      {entry.year}
                    </Text>
                    <Text style={[styles.td, styles.col_ref]} numberOfLines={4}>
                      {entry.reference}
                    </Text>
                    <View style={[styles.col_act, styles.actionCell]}>
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => openEdit(entry)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.btnText}>
                          {t("research.common.editBtn")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.col_act, styles.actionCell]}>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(entry)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.btnText}>
                          {t("research.common.deleteBtn")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* ── Form เพิ่ม/แก้ไข ── */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>
            {editingItem
              ? t("research.proceeding.editForm")
              : t("research.proceeding.addForm")}
          </Text>

          {/* ปี */}
          <InlineDropdown
            label="ปี:"
            value={form.year}
            options={yearOptions}
            onSelect={(v) => setField("year", v)}
            required
            searchable
          />
          <View style={styles.divider} />

          {/* อ้างอิง */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>
              {t("research.journal.fieldRef")}
              <Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={form.reference}
              onChangeText={(v) => setField("reference", v)}
              placeholder={t("research.journal.placeholderRef")}
              placeholderTextColor="#bbb"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>
          <View style={styles.divider} />

          {/* URL */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>URL:</Text>
            <TextInput
              style={[styles.input, styles.inputUrl]}
              value={form.url}
              onChangeText={(v) => setField("url", v)}
              placeholder="https://..."
              placeholderTextColor="#bbb"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.65 }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {editingItem
                    ? t("research.proceeding.saveEdit")
                    : t("research.proceeding.saveAdd")}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={openNew}
              activeOpacity={0.85}
            >
              <Text style={styles.resetBtnText}>
                {t("research.common.reset")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2f7" },
  body: { padding: 14, paddingBottom: 40, gap: 14 },

  // Card ── ตรงกับ JournalForm
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8ecf0",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f8fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecf0",
  },
  cardHeaderText: { fontSize: 13, fontWeight: "600", color: "#1a6b3c" },
  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 10,
  },
  loadingText: { fontSize: 13, color: "#888" },
  emptyWrap: { alignItems: "center", padding: 32, gap: 8 },
  emptyText: { fontSize: 13, color: "#aaa" },

  // Table ── ตรงกับ JournalForm
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#f8fafb",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecf0",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f7",
  },
  tableRowAlt: { backgroundColor: "#fafbfc" },
  th: { fontSize: 12, fontWeight: "700", color: "#1a6b3c" },
  td: { fontSize: 13, color: "#1a1a2e", lineHeight: 20 },
  col_no: { width: 32, textAlign: "center" },
  col_year: { width: 52, textAlign: "center" },
  col_ref: { width: 360, paddingHorizontal: 8 },
  col_act: { width: 72, alignItems: "center" },
  actionCell: { justifyContent: "center" },
  editBtn: {
    backgroundColor: "#f0a500",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 56,
    alignItems: "center",
  },
  deleteBtn: {
    backgroundColor: "#e53935",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 56,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  // Form ── ตรงกับ JournalForm
  divider: { height: 1, backgroundColor: "#f0f4f7" },
  formTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a2e",
    textAlign: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f7",
  },
  fieldWrap: { paddingHorizontal: 16, paddingVertical: 12 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a6b3c",
    marginBottom: 6,
  },
  required: { color: "#e74c3c" },
  input: {
    backgroundColor: "#f8fafb",
    borderColor: "#e8ecf0",
    borderRadius: 10,
    borderWidth: 1,
    color: "#1a1a2e",
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputMulti: { minHeight: 110, textAlignVertical: "top", paddingTop: 10 },
  inputUrl: { minHeight: 70, textAlignVertical: "top", paddingTop: 10 },

  // Buttons ── ตรงกับ JournalForm
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

export default ProceedingForm;
