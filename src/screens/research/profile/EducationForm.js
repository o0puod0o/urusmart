//ประวัติการศึกษา
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import AppHeader from "../../../components/AppHeader";
import FormField from "../../../components/research/FormField";
import InlineDropdown from "../../../components/research/InlineDropdown";

const DEGREE_OPTIONS = [
  { id: "", label: "กรุณาเลือกระดับการศึกษา" },
  { id: "phd", label: "ปริญญาเอก" },
  { id: "master", label: "ปริญญาโท" },
  { id: "bachelor", label: "ปริญญาตรี" },
  { id: "below_bachelor", label: "ต่ำกว่าปริญญาตรี" },
];

const currentYear = new Date().getFullYear() + 543;
const YEAR_OPTIONS = [
  { id: "", label: "กรุณาเลือกปี" },
  ...Array.from({ length: currentYear - 2499 }, (_, index) => {
    const year = currentYear - index;
    return { id: String(year), label: String(year) };
  }),
];

const INITIAL_EDUCATION_ITEMS = [
  {
    id: "edu1",
    degree: "bachelor",
    title: "ปริญญาตรี วิทยาการคอมพิวเตอร์",
    year: "2560",
    major: "วิทยาการคอมพิวเตอร์",
    institution: "มหาวิทยาลัยราชภัฏอุตรดิตถ์",
    status: "เผยแพร่แล้ว",
  },
  {
    id: "edu2",
    degree: "master",
    title: "ปริญญาโท การบริหารการศึกษา",
    year: "2563",
    major: "การบริหารการศึกษา",
    institution: "มหาวิทยาลัยราชภัฏอุตรดิตถ์",
    status: "เผยแพร่แล้ว",
  },
];

const EducationForm = ({ navigation }) => {
  const [items, setItems] = useState(INITIAL_EDUCATION_ITEMS);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    year: "",
    degree: "",
    major: "",
    institution: "",
  });

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openNewForm = () => {
    setEditingItem(null);
    setForm({ year: "", degree: "", major: "", institution: "" });
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setForm({
      year: item.year,
      degree: item.degree,
      major: item.major,
      institution: item.institution,
    });
  };

  const handleSave = () => {
    if (!form.year || !form.degree || !form.major || !form.institution) {
      Alert.alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    const savedItem = {
      id: editingItem?.id || String(Date.now()),
      degree: form.degree,
      title: `${DEGREE_OPTIONS.find((opt) => opt.id === form.degree)?.label || ""} ${form.major}`,
      year: form.year,
      major: form.major,
      institution: form.institution,
      status: "เผยแพร่แล้ว",
    };

    if (editingItem) {
      setItems((prev) =>
        prev.map((entry) => (entry.id === editingItem.id ? savedItem : entry)),
      );
      Alert.alert("แก้ไขสำเร็จ", "ข้อมูลประวัติการศึกษาถูกแก้ไขแล้ว");
    } else {
      setItems((prev) => [savedItem, ...prev]);
      Alert.alert("บันทึกสำเร็จ", "เพิ่มข้อมูลประวัติการศึกษาเรียบร้อยแล้ว");
    }

    openNewForm();
  };

  const handleDelete = (item) => {
    Alert.alert("ลบข้อมูล", "ต้องการลบรายการนี้ใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: () => {
          setItems((prev) => prev.filter((entry) => entry.id !== item.id));
          if (editingItem?.id === item.id) {
            openNewForm();
          }
        },
      },
    ]);
  };

  const handleReset = () => {
    if (editingItem) {
      openEditForm(editingItem);
    } else {
      openNewForm();
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="ประวัติการศึกษา" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ประวัติการศึกษา</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.listItem}>
              <View style={styles.listText}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMeta}>ปี {item.year}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.actionGroup}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditForm(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.editText}>แก้ไข</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deleteText}>ลบ</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>
            {editingItem
              ? "แก้ไขข้อมูลประวัติการศึกษา"
              : "เพิ่มข้อมูลประวัติการศึกษา"}
          </Text>

          <InlineDropdown
            label="ปีที่จบ (พ.ศ.)"
            value={form.year}
            options={YEAR_OPTIONS}
            onSelect={(value) => setField("year", value)}
            searchable
          />
          <View style={styles.divider} />

          <InlineDropdown
            label="ระดับการศึกษา"
            value={form.degree}
            options={DEGREE_OPTIONS}
            onSelect={(value) => setField("degree", value)}
          />
          <View style={styles.divider} />

          <FormField
            label="วุฒิการศึกษา (สาขาวิชา)"
            value={form.major}
            onChangeText={(value) => setField("major", value)}
          />
          <View style={styles.divider} />

          <FormField
            label="ชื่อสถานบัน"
            value={form.institution}
            onChangeText={(value) => setField("institution", value)}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingItem ? "บันทึกการแก้ไข" : "เพิ่มข้อมูลประวัติการศึกษา"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>รีเซ็ท</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
const COLORS = {
  primary: "#1f7a3a", // เขียวเข้มหลัก (header, ปุ่มหลัก)
  primaryDark: "#155f2c", // เขียวเข้มกว่า (hover/เงา/หัวข้อ)
  primarySoft: "#e6f4ea", // เขียวพาสเทลอ่อนมาก (badge)
  bg: "#f5faf6", // พื้นหลังหน้า ขาวอมเขียวบางๆ
  surface: "#ffffff",
  border: "#dcebe1",
  divider: "#eef4f0",
  text: "#1a2e22",
  textMuted: "#5b6f64",
  accent: "#2bb8c4", // ฟ้าเทอร์ควอยซ์ (ปุ่มรีเซ็ต)
  accentDark: "#1f97a1",
  danger: "#dc2626",
  dangerSoft: "#fde8e8",
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },

  body: { padding: 16, paddingBottom: 48, gap: 16 },

  // ===== Card รายการประวัติ =====
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    shadowColor: "#0b3b22",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 14,
  },

  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    gap: 12,
  },
  listText: { flex: 1, paddingRight: 8 },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  itemMeta: { fontSize: 13, color: COLORS.textMuted, marginBottom: 8 },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primaryDark,
  },

  actionGroup: { flexDirection: "row", gap: 8 },
  editButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  editText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  deleteButton: {
    backgroundColor: COLORS.dangerSoft,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  deleteText: { color: COLORS.danger, fontSize: 13, fontWeight: "600" },

  // ===== Card ฟอร์ม =====
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    shadowColor: "#0b3b22",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  divider: { height: 1, backgroundColor: COLORS.divider, marginVertical: 8 },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
    flexWrap: "wrap",
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    minWidth: 200,
    shadowColor: COLORS.primaryDark,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  saveButtonText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  resetButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: "center",
    minWidth: 90,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
export default EducationForm;
