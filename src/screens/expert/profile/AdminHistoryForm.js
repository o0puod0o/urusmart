//ประวัติการบริหาร
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import AppHeader from "../../../components/AppHeader";
import InlineDropdown from "../../../components/expert/InlineDropdown";
import FormField from "../../../components/expert/FormField";

const currentYear = new Date().getFullYear() + 543;
const BASE_YEAR_LIST = Array.from(
  { length: currentYear - 2529 },
  (_, index) => {
    const year = currentYear - index;
    return { id: String(year), label: String(year) };
  },
);

const INITIAL_ITEMS = [
  {
    id: "admin1",
    position: "ผู้ช่วยผู้อำนวยการสถาบันวิจัยและพัฒนา",
    organization: "สถาบันวิจัยและพัฒนา",
    start_year: "2566",
    end_year: "ปัจจุบัน",
    status: "เผยแพร่แล้ว",
  },
];

const AdminHistoryForm = ({ navigation, route }) => {
  const { t } = useTranslation();
  const YEAR_OPTIONS = useMemo(
    () => [
      { id: "", label: t("research.common.selectYear") },
      ...BASE_YEAR_LIST,
    ],
    [t],
  );
  const item = route?.params?.item || null;
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [editingItem, setEditingItem] = useState(item);
  const [form, setForm] = useState({
    position: item?.position || "",
    organization: item?.organization || "",
    start_year: item?.start_year || "",
    end_year: item?.end_year || "",
  });

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openNew = () => {
    setEditingItem(null);
    setForm({ position: "", organization: "", start_year: "", end_year: "" });
  };

  const openEdit = (itemToEdit) => {
    setEditingItem(itemToEdit);
    setForm({
      position: itemToEdit.position,
      organization: itemToEdit.organization,
      start_year: itemToEdit.start_year,
      end_year: itemToEdit.end_year,
    });
  };

  const handleSave = () => {
    if (
      !form.position ||
      !form.organization ||
      !form.start_year ||
      !form.end_year
    ) {
      Alert.alert(t("research.adminHistory.validation"));
      return;
    }

    const savedItem = {
      id: editingItem?.id || String(Date.now()),
      position: form.position,
      organization: form.organization,
      start_year: form.start_year,
      end_year: form.end_year,
      status: "เผยแพร่แล้ว",
    };

    if (editingItem) {
      setItems((prev) =>
        prev.map((entry) => (entry.id === editingItem.id ? savedItem : entry)),
      );
      Alert.alert(
        t("research.common.editSuccess"),
        t("research.common.savedMsg"),
      );
    } else {
      setItems((prev) => [savedItem, ...prev]);
      Alert.alert(
        t("research.common.addSuccess"),
        t("research.common.addSuccessMsg"),
      );
    }
    openNew();
  };

  const handleDelete = (itemToDelete) => {
    Alert.alert(
      t("research.common.deleteTitle"),
      t("research.common.deleteConfirm"),
      [
        { text: t("research.common.cancel"), style: "cancel" },
        {
          text: t("research.common.deleteBtn"),
          style: "destructive",
          onPress: () =>
            setItems((prev) =>
              prev.filter((entry) => entry.id !== itemToDelete.id),
            ),
        },
      ],
    );
  };

  const handleReset = () => {
    if (editingItem) {
      openEdit(editingItem);
    } else {
      openNew();
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={t("research.adminHistory.title")}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {items.map((entry) => (
            <View key={entry.id} style={styles.listItem}>
              <View style={styles.listText}>
                <Text style={styles.itemTitle}>{entry.position}</Text>
                <Text style={styles.itemDetail}>{entry.organization}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.itemYear}>
                    {t("research.common.year")} {entry.start_year}
                  </Text>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{entry.status}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.actionGroup}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEdit(entry)}
                >
                  <Text style={styles.editText}>
                    {t("research.common.editBtn")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(entry)}
                >
                  <Text style={styles.deleteText}>
                    {t("research.common.deleteBtn")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>
            {editingItem
              ? t("research.adminHistory.editForm")
              : t("research.adminHistory.addForm")}
          </Text>
          <FormField
            label={t("research.workHistory.colPosition")}
            value={form.position}
            onChangeText={(value) => setField("position", value)}
          />
          <View style={styles.divider} />
          <FormField
            label={t("research.workHistory.colPlace")}
            value={form.organization}
            onChangeText={(value) => setField("organization", value)}
          />
          <View style={styles.divider} />
          <InlineDropdown
            label={t("research.workHistory.colStart")}
            value={form.start_year}
            options={YEAR_OPTIONS}
            onSelect={(value) => setField("start_year", value)}
          />
          <View style={styles.divider} />
          <InlineDropdown
            label={t("research.workHistory.colEnd")}
            value={form.end_year}
            options={YEAR_OPTIONS}
            onSelect={(value) => setField("end_year", value)}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingItem
                  ? t("research.common.saveEdit")
                  : t("research.adminHistory.addForm")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>
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
  body: { padding: 14, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8ecf0",
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 12,
  },
  listItem: {
    backgroundColor: "#f8fafb",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listText: { flex: 1, paddingRight: 12 },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  itemDetail: { fontSize: 12, color: "#4b5563", marginBottom: 6 },
  itemSecondary: { fontSize: 11, color: "#6b7280" },
  actionGroup: { flexDirection: "row", gap: 8 },
  editButton: {
    backgroundColor: "#dbeafe",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  editText: { color: "#1e40af", fontSize: 12, fontWeight: "700" },
  deleteButton: {
    backgroundColor: "#fde2e6",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  deleteText: { color: "#c0392b", fontSize: 12, fontWeight: "700" },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  itemYear: { fontSize: 12, color: "#4b5563" },
  statusPill: {
    backgroundColor: "#d1fae5",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { color: "#065f46", fontSize: 11, fontWeight: "700" },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8ecf0",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 16,
  },
  divider: { height: 1, backgroundColor: "#f0f4f7", marginVertical: 10 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    minWidth: 160,
    backgroundColor: "#14532d",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  resetButton: {
    flex: 1,
    minWidth: 120,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  resetButtonText: { color: "#1f2937", fontSize: 14, fontWeight: "600" },
});

export default AdminHistoryForm;
