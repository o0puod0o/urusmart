// จัดการข้อมูล Human Subjects Protection Standard Course
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
  border: "#e3e7eb",
  borderSoft: "#eef1f4",
  text: "#1f2a2e",
  textMuted: "#6b7a82",
  label: "#3f4d50",
  danger: "#df4c4b",
  warning: "#f7a23b",
  warningSoft: "#fff4e0",
  required: "#d83a36",
  rowAlt: "#fafbfc",
  placeholder: "#9aa6b1",
};

const BASE_YEAR_LIST = Array.from({ length: 2569 - 2533 + 1 }, (_, index) => {
  const year = String(2569 - index);
  return { id: year, label: year };
});

const COURSE_TITLE = "HUMAN SUBJECTS PROTECTION STANDARD COURSE";

const normalizeCourse = (item) => ({
  id: String(item.id ?? item.human_subject_id ?? Date.now()),
  year: String(item.year ?? item.course_year ?? ""),
  title: item.title ?? item.topic ?? item.course_title ?? item.name ?? "",
  evidenceUrl:
    item.evidenceUrl ?? item.evidence_url ?? item.url ?? item.link ?? "",
});

const EditingPill = ({ label }) => (
  <View style={styles.editingPill}>
    <Ionicons name="create-outline" size={12} color="#a16207" />
    <Text style={styles.editingPillText}>{label}</Text>
  </View>
);

const HumanSubjectsForm = ({ navigation }) => {
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
  const [form, setForm] = useState({ year: "", title: "", evidenceUrl: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/human-subjects`);
        if (!res.ok) throw new Error("fetch human subjects failed");
        const data = await res.json();
        const rows = Array.isArray(data) ? data : (data.data ?? []);
        setItems(rows.map(normalizeCourse));
      } catch {
        console.log("Human subjects API not ready");
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
      evidenceUrl: entry.evidenceUrl,
    });
  };

  const openNew = () => {
    setEditingItem(null);
    setForm({ year: "", title: "", evidenceUrl: "" });
  };

  const persistCourse = async (payload) => {
    const isEditing = Boolean(editingItem);
    const endpoint = isEditing
      ? `${BASE_URL}/api/human-subjects/${editingItem.id}`
      : `${BASE_URL}/api/human-subjects`;
    const res = await fetch(endpoint, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("save human subjects failed");
    return res.json();
  };

  const handleSave = async () => {
    if (!form.year || !form.title.trim() || !form.evidenceUrl.trim()) {
      Alert.alert(t("research.common.warning"), t("research.human.validation"));
      return;
    }
    const payload = {
      year: form.year,
      title: form.title.trim(),
      evidenceUrl: form.evidenceUrl.trim(),
    };
    try {
      setSaving(true);
      const savedData = await persistCourse(payload);
      const saved = normalizeCourse(savedData.data ?? savedData ?? payload);
      const safeSaved = { ...saved, id: editingItem?.id ?? saved.id };

      if (editingItem) {
        setItems((prev) =>
          prev.map((entry) =>
            entry.id === editingItem.id ? safeSaved : entry,
          ),
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
                `${BASE_URL}/api/human-subjects/${entry.id}`,
                { method: "DELETE" },
              );
              if (!res.ok) throw new Error("delete human subjects failed");
              setItems((prev) => prev.filter((item) => item.id !== entry.id));
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
      <AppHeader title={COURSE_TITLE} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Ionicons
              name="shield-checkmark"
              size={22}
              color={COLORS.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>{t("research.human.eyebrow")}</Text>
            <Text style={styles.pageTitle}>{COURSE_TITLE}</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{tableItems.length}</Text>
          </View>
        </View>

        <View style={styles.tableCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="list-outline" size={16} color={COLORS.primary} />
            <Text style={styles.cardHeaderText}>
              {t("research.human.listTitle")}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>
                {t("research.human.loading")}
              </Text>
            </View>
          ) : tableItems.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons
                name="folder-open-outline"
                size={42}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyTitle}>
                {t("research.common.noData")}
              </Text>
              <Text style={styles.emptyHint}>
                {t("research.common.addBelow")}
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.table}>
                <View style={styles.tableHead}>
                  <Text style={[styles.thText, styles.colNo]}>
                    {t("research.common.no")}
                  </Text>
                  <Text style={[styles.thText, styles.colYear]}>
                    {t("research.common.year")}
                  </Text>
                  <Text style={[styles.thText, styles.colTitle]}>
                    {t("research.human.colTitle")}
                  </Text>
                  <Text style={[styles.thText, styles.colEvidence]}>
                    {t("research.human.colLink")}
                  </Text>
                  <Text style={[styles.thText, styles.colAction]}>
                    {t("research.common.manage")}
                  </Text>
                </View>

                {tableItems.map((entry, index) => (
                  <View
                    key={entry.id}
                    style={[
                      styles.tableRow,
                      index % 2 === 1 && { backgroundColor: COLORS.rowAlt },
                      editingItem?.id === entry.id && styles.tableRowEditing,
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
                      style={[styles.linkText, styles.colEvidence]}
                      numberOfLines={2}
                    >
                      {entry.evidenceUrl}
                    </Text>
                    <View style={[styles.actionCell, styles.colAction]}>
                      <TouchableOpacity
                        style={[styles.iconBtn, styles.editBtn]}
                        onPress={() => openEdit(entry)}
                        activeOpacity={0.85}
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
                        activeOpacity={0.85}
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

        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Ionicons
              name={editingItem ? "create" : "add-circle"}
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.formTitle}>
              {editingItem
                ? t("research.human.editForm")
                : t("research.human.addForm")}
            </Text>
            {editingItem && (
              <EditingPill label={t("research.common.editing")} />
            )}
          </View>
          <Text style={styles.formSubtitle}>
            {t("research.human.formSubtitle")} {COURSE_TITLE}
          </Text>

          <View style={styles.divider} />

          <InlineDropdown
            label={t("research.common.year") + ":"}
            value={form.year}
            options={YEAR_OPTIONS}
            onSelect={(value) => setField("year", value)}
            required
            searchable
          />

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>
              {t("research.human.fieldLabel")}
              <Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(value) => setField("title", value)}
              placeholder={t("research.human.placeholder")}
              placeholderTextColor={COLORS.placeholder}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>
              {t("research.human.fieldLink")}
              <Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={form.evidenceUrl}
              onChangeText={(value) => setField("evidenceUrl", value)}
              placeholder={t("research.human.placeholderLink")}
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
              activeOpacity={0.9}
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
              <Ionicons name="refresh" size={16} color={COLORS.primary} />
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
  body: { paddingHorizontal: 14, paddingTop: 20, paddingBottom: 60 },
  hero: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  heroIconWrap: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  pageTitle: {
    color: COLORS.label,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 26,
  },
  countBadge: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    minWidth: 32,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countBadgeText: { color: "#fff", fontSize: 13, fontWeight: "900" },
  tableCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.borderSoft,
    borderRadius: 14,
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
  tableRowEditing: { backgroundColor: COLORS.warningSoft },
  thText: {
    color: COLORS.textMuted,
    fontSize: 12,
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
  linkText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  colNo: { textAlign: "center", width: 40 },
  colYear: { width: 80 },
  colTitle: { width: 460 },
  colEvidence: { width: 130 },
  colAction: { textAlign: "center", width: 110 },
  yearChip: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  yearChipText: { color: COLORS.primaryDark, fontSize: 12, fontWeight: "800" },
  actionCell: { flexDirection: "row", gap: 6, justifyContent: "center" },
  iconBtn: {
    alignItems: "center",
    borderRadius: 8,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  editBtn: { backgroundColor: COLORS.warning },
  deleteBtn: { backgroundColor: COLORS.danger },
  loadingWrap: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: { color: COLORS.textMuted, fontSize: 13, marginLeft: 10 },
  emptyWrap: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyTitle: {
    color: COLORS.label,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 10,
  },
  emptyHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.borderSoft,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 1,
    paddingBottom: 18,
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  formHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
  },
  formTitle: { color: COLORS.label, fontSize: 17, fontWeight: "900" },
  formSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
    paddingHorizontal: 16,
  },
  divider: {
    backgroundColor: COLORS.borderSoft,
    height: 1,
    marginHorizontal: 16,
    marginVertical: 14,
  },
  editingPill: {
    alignItems: "center",
    backgroundColor: COLORS.warningSoft,
    borderRadius: 999,
    flexDirection: "row",
    gap: 4,
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  editingPillText: { color: "#a16207", fontSize: 11, fontWeight: "800" },
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
    paddingTop: 18,
  },
  saveBtn: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 10,
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
    borderRadius: 10,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 20,
  },
  resetBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: "900" },
});

export default HumanSubjectsForm;
