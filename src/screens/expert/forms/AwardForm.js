//จัดการข้อมูลรางวัล
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

const BASE_YEAR_LIST = Array.from({ length: 2569 - 2533 + 1 }, (_, index) => {
  const year = String(2569 - index);
  return { id: year, label: year };
});

const normalizeAward = (item) => ({
  id: String(item.id ?? item.award_id ?? Date.now()),
  year: String(item.year ?? item.award_year ?? item.received_year ?? ""),
  title: item.title ?? item.award_title ?? item.award_name ?? item.name ?? "",
});

const EditingPill = ({ label }) => (
  <View style={styles.editingPill}>
    <Ionicons name="create-outline" size={13} color="#a8631a" />
    <Text style={styles.editingPillText}>{label}</Text>
  </View>
);

const AwardForm = ({ navigation }) => {
  const { t } = useTranslation();
  const GENERATED_YEAR_OPTIONS = useMemo(
    () => [
      { id: "", label: t("research.common.selectYear") },
      ...BASE_YEAR_LIST,
    ],
    [t],
  );
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ year: "", title: "" });
  const [yearOptions, setYearOptions] = useState(GENERATED_YEAR_OPTIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [awardRes] = await Promise.allSettled([
          fetch(`${BASE_URL}/api/awards`),
        ]);

        if (awardRes.status === "fulfilled" && awardRes.value.ok) {
          const data = await awardRes.value.json();
          const rows = Array.isArray(data) ? data : (data.data ?? []);
          setItems(rows.map(normalizeAward));
        }
        setYearOptions([
          { id: "", label: t("research.common.selectYear") },
          ...BASE_YEAR_LIST,
        ]);
      } catch {
        console.log("Award API not ready");
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
    setForm({ year: entry.year, title: entry.title });
  };

  const openNew = () => {
    setEditingItem(null);
    setForm({ year: "", title: "" });
  };

  const persistAward = async (payload) => {
    const isEditing = Boolean(editingItem);
    const endpoint = isEditing
      ? `${BASE_URL}/api/awards/${editingItem.id}`
      : `${BASE_URL}/api/awards`;
    const res = await fetch(endpoint, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("save award failed");
    return res.json();
  };

  const handleSave = async () => {
    if (!form.year || !form.title.trim()) {
      Alert.alert(t("research.common.warning"), t("research.award.validation"));
      return;
    }
    const payload = { year: form.year, title: form.title.trim() };
    try {
      setSaving(true);
      const savedData = await persistAward(payload);
      const saved = normalizeAward(savedData.data ?? savedData ?? payload);
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
      Alert.alert(t("research.common.saveFail"), t("research.award.apiError"));
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
              const res = await fetch(`${BASE_URL}/api/awards/${entry.id}`, {
                method: "DELETE",
              });
              if (!res.ok) throw new Error("delete award failed");
              setItems((prev) => prev.filter((item) => item.id !== entry.id));
            } catch {
              Alert.alert(
                t("research.common.deleteFail"),
                t("research.award.apiError"),
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
        title={t("research.award.title")}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="trophy" size={22} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroEyebrow}>
              {t("research.award.heroEyebrow")}
            </Text>
            <Text style={styles.heroTitle}>
              {t("research.award.heroTitle")}
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{items.length}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.tableCard}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="list-outline"
              size={16}
              color={COLORS.primaryDark}
            />
            <Text style={styles.cardHeaderText}>
              {t("research.award.listTitle")}
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
              <Text style={styles.emptyText}>{t("research.award.noData")}</Text>
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
                    {t("research.award.colTitle")}
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
                          size={17}
                          color="#a8631a"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: "#fde7e7" }]}
                        onPress={() => handleDelete(entry)}
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

        {/* Form */}
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
                  ? t("research.award.editForm")
                  : t("research.award.addForm")}
              </Text>
            </View>
            {editingItem && (
              <EditingPill label={t("research.common.editing")} />
            )}
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
              {t("research.award.fieldLabel")}
              <Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(value) => setField("title", value)}
              placeholder={t("research.award.placeholder")}
              placeholderTextColor={COLORS.placeholder}
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
                    {editingItem
                      ? t("research.common.save")
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
    fontSize: 19,
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

  table: { minWidth: 720 },
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
  colNo: { textAlign: "center", width: 40 },
  colYear: { width: 90 },
  colTitle: { width: 460 },
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
    fontSize: 16,
    fontWeight: "900",
    marginLeft: 8,
  },
  editingPill: {
    alignItems: "center",
    backgroundColor: COLORS.warningSoft,
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

export default AwardForm;
