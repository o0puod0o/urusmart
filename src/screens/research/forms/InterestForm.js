//จัดการข้อมูลความสนใจ
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AppHeader from "../../../components/AppHeader";
import InlineDropdown from "../../../components/research/InlineDropdown";
import FormField from "../../../components/research/FormField";

const BASE_URL = "https://your-api.example.com";

const InterestForm = ({ navigation, route }) => {
  const [items, setItems] = useState([
    { id: "1", title: "Big Data" },
    {
      id: "2",
      title: "การพัฒนาระบบสารสนเทศ MIS และ Android Mobile Application",
    },
    { id: "3", title: "โปรแกรมเมอร์/วิทยาศาสตร์คอมพิวเตอร์/เทคโนโลยีสารสนเทศ" },
  ]);

  const [interestOptions, setInterestOptions] = useState([
    { id: "", label: "กรุณาเลือกความสนใจที่มีในระบบ" },
  ]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState("");
  const [customInterest, setCustomInterest] = useState("");

  // ดึง dropdown จาก API
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingOptions(true);
        const res = await fetch(`${BASE_URL}/api/interests`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setInterestOptions([
          { id: "", label: "กรุณาเลือกความสนใจที่มีในระบบ" },
          ...data.map((d) => ({ id: d.id, label: d.title })),
        ]);
      } catch {
        // API ยังไม่พร้อม — ใช้ค่าว่างไว้ก่อน
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
      Alert.alert("กรุณาเลือกหรือกรอกความสนใจ");
      return;
    }

    const alreadyExists = items.some(
      (item) => item.title.toLowerCase() === title.toLowerCase(),
    );
    if (alreadyExists) {
      Alert.alert("มีความสนใจนี้อยู่แล้ว");
      return;
    }

    setItems((prev) => [...prev, { id: String(Date.now()), title }]);
    setSelectedInterest("");
    setCustomInterest("");
    // TODO: POST /api/interests { title }
  };

  const handleDelete = (itemToDelete) => {
    Alert.alert("ลบข้อมูล", "ต้องการลบรายการนี้ใช่ไหม?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: () => {
          setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
          // TODO: DELETE /api/interests/:id
        },
      },
    ]);
  };

  const handleReset = () => {
    setSelectedInterest("");
    setCustomInterest("");
  };

  return (
    <View style={styles.container}>
      <AppHeader title="ความสนใจ" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ตารางรายการ */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>★ แก้ไขข้อมูลความสนใจ</Text>
          </View>

          {/* หัวตาราง */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { width: 50 }]}>
              ลำดับที่
            </Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>ความสนใจ</Text>
            <Text
              style={[
                styles.tableHeaderText,
                { width: 50, textAlign: "right" },
              ]}
            ></Text>
          </View>

          {items.length === 0 ? (
            <Text style={styles.emptyText}>ยังไม่มีข้อมูลความสนใจ</Text>
          ) : (
            items.map((entry, index) => (
              <View key={entry.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: 50, color: "#888" }]}>
                  {index + 1}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {entry.title}
                </Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(entry)}
                >
                  <Text style={styles.deleteText}>ลบ</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* ฟอร์มเพิ่ม */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>★ เพิ่มข้อมูลความสนใจ</Text>
          </View>

          <View style={styles.formBody}>
            {/* Dropdown */}
            <InlineDropdown
              label="เลือกความสนใจที่มีอยู่ในระบบ"
              value={selectedInterest}
              options={interestOptions}
              onSelect={(v) => {
                setSelectedInterest(v);
                setCustomInterest(""); // clear text ถ้าเลือก dropdown
              }}
              loading={loadingOptions}
            />

            {/* หรือ */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>หรือ กรอกความสนใจด้วยตนเอง</Text>
              <View style={styles.orLine} />
            </View>

            {/* TextInput */}
            <FormField
              label=""
              value={customInterest}
              onChangeText={(v) => {
                setCustomInterest(v);
                setSelectedInterest(""); // clear dropdown ถ้าพิมพ์เอง
              }}
              placeholder="เพิ่มข้อมูลความสนใจใหม่"
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
                <Text style={styles.saveButtonText}>เพิ่มข้อมูลความสนใจ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
              >
                <Text style={styles.resetButtonText}>รีเซ็ก</Text>
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
  cardHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a6b3c",
  },

  // ตาราง
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecf0",
    backgroundColor: "#f0faf4",
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a6b3c",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f7",
  },
  tableCell: {
    fontSize: 13,
    color: "#1a1a2e",
  },
  emptyText: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 13,
    padding: 24,
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    width: 50,
    alignItems: "center",
  },
  deleteText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  // ฟอร์ม
  formBody: { padding: 16, gap: 4 },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 8,
  },
  orLine: { flex: 1, height: 1, backgroundColor: "#e8ecf0" },
  orText: { fontSize: 12, color: "#666", fontWeight: "600" },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#14532d",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  resetButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  resetButtonText: { color: "#1f2937", fontSize: 14, fontWeight: "600" },
});

export default InterestForm;
``;
