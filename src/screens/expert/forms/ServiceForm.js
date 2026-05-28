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
import { useTranslation } from "react-i18next";
import AppHeader from "../../../components/AppHeader";
import InlineDropdown from "../../../components/expert/InlineDropdown";

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
const BASE_YEAR_LIST = Array.from(
  { length: currentThaiYear - 2532 },
  (_, i) => {
    const year = String(currentThaiYear - i);
    return { id: year, label: year };
  },
);

const normalizeService = (item) => ({
  id: String(item.id ?? item.service_id ?? Date.now()),
  year: String(item.year ?? item.service_year ?? ""),
  title: item.title ?? item.topic ?? item.service_title ?? item.name ?? "",
  url: item.url ?? item.link ?? item.more_info_url ?? "",
  fileName: item.fileName ?? item.file_name ?? item.attachment_name ?? "",
});

const EditingPill = ({ label }) => (
  <View style={styles.editingPill}>
    <Ionicons name="create-outline" size={13} color="#a8631a" />
    <Text style={styles.editingPillText}>{label}</Text>
  </View>
);

const INIT_FORM = { year: "", title: "", url: "", fileName: "" };

const ServiceForm = ({ navigation }) => {
  const { t } = useTranslation();
  const YEAR_OPTIONS = useMemo(
    () => [
      { id: "", label: t("research.common.selectYear") },
      ...BASE_YEAR_LIST,
    ],
    [t],
  );
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
      Alert.alert(
        t("research.common.warning"),
        t("research.service.validation"),
      );
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
              const res = await fetch(`${BASE_URL}/api/services/${entry.id}`, {
                method: "DELETE",
              });
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
      <AppHeader
        title={t("research.service.heroTitle")}
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
            <Text style={styles.heroEyebrow}>
              {t("research.award.heroEyebrow")}
            </Text>
            <Text style={styles.heroTitle}>
              {t("research.service.heroTitle")}
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
              {t("research.service.listTitle")}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>
                {t("research.common.loading")}
              </Text>
            </View>
          ) : tableItems.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons
                name="folder-open-outline"
                size={42}
                color={COLORS.placeholder}
              />
              <Text style={styles.emptyText}>
                {t("research.service.noData")}
              </Text>
              <Text style={styles.emptyHint}>
                {t("research.common.addBelow")}
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.table}>
                <View style={styles.tableHead}>
                  <Text style={[styles.th, styles.col_no]}>
                    {t("research.common.no")}
                  </Text>
                  <Text style={[styles.th, styles.col_year]}>
                    {t("research.common.year")}
                  </Text>
                  <Text style={[styles.th, styles.col_title]}>
                    {t("research.service.colTitle")}
                  </Text>
                  <Text style={[styles.th, styles.col_link]}>
                    {t("research.service.colLink")}
                  </Text>
                  <Text style={[styles.th, styles.col_file]}>
                    {t("research.service.colFile")}
                  </Text>
                  <Text style={[styles.th, styles.col_act]}>
                    {t("research.common.manage")}
                  </Text>
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
                  ? t("research.service.editForm")
                  : t("research.service.addForm")}
              </Text>
            </View>
            {editingItem && (
              <EditingPill label={t("research.common.editing")} />
            )}
          </View>

          <InlineDropdown
            label={t("research.common.year") + ":"}
            value={form.year}
            options={YEAR_OPTIONS}
            onSelect={(v) => setField("year", v)}
            required
          />

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>
              {t("research.service.fieldLabel")}
              <Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(v) => setField("title", v)}
              placeholder={t("research.service.placeholder")}
              placeholderTextColor={COLORS.placeholder}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>
              {t("research.service.fieldLink")}
            </Text>
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
            <Text style={styles.fieldLabel}>
              {t("research.service.fieldAttach")}
            </Text>
            <TouchableOpacity
              style={styles.fileInput}
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert(
                  t("research.service.fieldAttach"),
                  "Connect file picker in next step",
                )
              }
            >
              <View style={styles.fileButton}>
                <Text style={styles.fileButtonText}>
                  {t("research.service.chooseFile")}
                </Text>
              </View>
              <Text style={styles.fileNameText}>
                {form.fileName || t("research.service.noFile")}
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
                    {editingItem
                      ? t("research.common.saveEdit")
                      : t("research.common.addData")}
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
  yearChipText: { color: COLORS.primaryDark, fontSize: 12, fontWeight: "800" },
  actionRow: { flexDirection: "row", gap: 6, justifyContent: "center" },
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
  formHeaderLeft: { alignItems: "center", flexDirection: "row", flex: 1 },
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
