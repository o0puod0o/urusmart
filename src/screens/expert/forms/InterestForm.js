// จัดการข้อมูลความสนใจ
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AppHeader from "../../../components/AppHeader";
import InlineDropdown from "../../../components/expert/InlineDropdown";

const BASE_URL = "https://your-api.example.com";

const InterestForm = ({ navigation }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState([
    { id: "1", title: "Big Data" },
    {
      id: "2",
      title: "การพัฒนาระบบสารสนเทศ MIS และ Android Mobile Application",
    },
    { id: "3", title: "โปรแกรมเมอร์/วิทยาศาสตร์คอมพิวเตอร์/เทคโนโลยีสารสนเทศ" },
  ]);

  const [interestOptions, setInterestOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState("");
  const [customInterest, setCustomInterest] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingOptions(true);
        const res = await fetch(`${BASE_URL}/api/interests`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setInterestOptions([
          { id: "", label: t("research.interest.selectPlaceholder") },
          ...data.map((d) => ({ id: d.id, label: d.title })),
        ]);
      } catch {
        console.log("API not ready, interests dropdown empty");
      } finally {
        setLoadingOptions(false);
      }
    };
    load();
  }, []);

  const handleAdd = () => {
    const title = selectedInterest
      ? interestOptions.find((o) => o.id === selectedInterest)?.label
      : customInterest.trim();

    if (!title) {
      Alert.alert(t("research.interest.validation"));
      return;
    }
    const alreadyExists = items.some(
      (item) => item.title.toLowerCase() === title.toLowerCase(),
    );
    if (alreadyExists) {
      Alert.alert(t("research.interest.duplicate"));
      return;
    }
    setItems((prev) => [...prev, { id: String(Date.now()), title }]);
    setSelectedInterest("");
    setCustomInterest("");
    // TODO: POST /api/interests { title }
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
          onPress: () => {
            setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
            // TODO: DELETE /api/interests/:id
          },
        },
      ],
    );
  };

  const handleReset = () => {
    setSelectedInterest("");
    setCustomInterest("");
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={t("research.interest.title")}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── ตารางรายการ ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="star-outline" size={16} color="#1a6b3c" />
            <Text style={styles.cardHeaderText}>
              {" "}
              {t("research.interest.listHeader")}
            </Text>
          </View>

          <View style={styles.tableHead}>
            <Text style={[styles.th, { width: 50 }]}>
              {t("research.interest.colNo")}
            </Text>
            <Text style={[styles.th, { flex: 1 }]}>
              {t("research.interest.colTitle")}
            </Text>
            <Text style={[styles.th, { width: 60, textAlign: "center" }]}>
              {t("research.common.deleteBtn")}
            </Text>
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="star-outline" size={36} color="#ccc" />
              <Text style={styles.emptyText}>
                {t("research.interest.noData")}
              </Text>
            </View>
          ) : (
            items.map((entry, index) => (
              <View
                key={entry.id}
                style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
              >
                <Text
                  style={[
                    styles.td,
                    { width: 50, textAlign: "center", color: "#888" },
                  ]}
                >
                  {index + 1}
                </Text>
                <Text style={[styles.td, { flex: 1 }]}>{entry.title}</Text>
                <View style={[{ width: 60, alignItems: "center" }]}>
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
            ))
          )}
        </View>

        {/* ── ฟอร์มเพิ่ม ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="add-circle-outline" size={16} color="#1a6b3c" />
            <Text style={styles.cardHeaderText}>
              {" "}
              {t("research.interest.addHeader")}
            </Text>
          </View>

          <View style={styles.formBody}>
            {/* Dropdown */}
            <InlineDropdown
              label={t("research.interest.selectExisting")}
              value={selectedInterest}
              options={[
                { id: "", label: t("research.interest.selectPlaceholder") },
                ...interestOptions.filter((o) => o.id !== ""),
              ]}
              onSelect={(v) => {
                setSelectedInterest(v);
                setCustomInterest("");
              }}
              loading={loadingOptions}
            />

            {/* Divider */}
            <View style={styles.divider} />

            {/* หรือ */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>
                {t("research.interest.orManual")}
              </Text>
              <View style={styles.orLine} />
            </View>

            <View style={styles.divider} />

            {/* TextInput ── ใช้ style เดียวกับต้นแบบ JournalForm */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>
                {t("research.interest.fieldLabel")}
              </Text>
              <TextInput
                style={[styles.input, styles.inputMulti]}
                value={customInterest}
                onChangeText={(v) => {
                  setCustomInterest(v);
                  setSelectedInterest("");
                }}
                placeholder={t("research.interest.placeholder")}
                placeholderTextColor="#bbb"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleAdd}
                activeOpacity={0.85}
              >
                <Text style={styles.saveBtnText}>
                  {t("research.interest.addForm")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={handleReset}
                activeOpacity={0.85}
              >
                <Text style={styles.resetBtnText}>
                  {t("research.common.reset")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2f7" },
  body: { padding: 14, paddingBottom: 40, gap: 14 },

  // Card
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

  // Table
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecf0",
    backgroundColor: "#f0faf4",
  },
  th: { fontSize: 12, fontWeight: "700", color: "#1a6b3c" },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f7",
  },
  tableRowAlt: { backgroundColor: "#fafbfc" },
  td: { fontSize: 13, color: "#1a1a2e", lineHeight: 20 },
  emptyWrap: { alignItems: "center", padding: 32, gap: 8 },
  emptyText: { fontSize: 13, color: "#aaa" },
  deleteBtn: {
    backgroundColor: "#e53935",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 48,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  // Form ── ตรงกับต้นแบบ JournalForm
  formBody: { paddingBottom: 4 },
  divider: { height: 1, backgroundColor: "#f0f4f7" },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  orLine: { flex: 1, height: 1, backgroundColor: "#e8ecf0" },
  orText: { fontSize: 12, color: "#666", fontWeight: "600" },

  // ── ตรงกับต้นแบบ JournalForm ──
  fieldWrap: { paddingHorizontal: 16, paddingVertical: 12 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a6b3c",
    marginBottom: 6,
  },
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

  // Buttons ── ตรงกับต้นแบบ JournalForm
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

export default InterestForm;
