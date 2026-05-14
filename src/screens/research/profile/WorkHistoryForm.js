//ประวัติการทำงาน
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../../components/AppHeader";
import InlineDropdown from "../../../components/research/InlineDropdown";
import FormField from "../../../components/research/FormField";

const currentYear = new Date().getFullYear() + 543;
const YEAR_OPTIONS = [
  { id: "", label: "กรุณาเลือกปี" },
  ...Array.from({ length: currentYear - 2529 }, (_, index) => {
    const year = currentYear - index;
    return { id: String(year), label: String(year) };
  }),
];

const INITIAL_ITEMS = [
  {
    id: "work1",
    position: "โปรแกรมเมอร์",
    organization: "ไทยมาร์กอุตรดิตถ์",
    start_year: "2546",
    end_year: "2547",
    status: "เผยแพร่แล้ว",
  },
  {
    id: "work2",
    position: "เจ้าหน้าที่คอมพิวเตอร์",
    organization: "คณะวิทยาการจัดการ มหาวิทยาลัยราชภัฏอุตรดิตถ์",
    start_year: "2547",
    end_year: "2548",
    status: "เผยแพร่แล้ว",
  },
  {
    id: "work3",
    position: "อาจารย์",
    organization: "คณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยราชภัฏอุตรดิตถ์",
    start_year: "2548",
    end_year: "ปัจจุบัน",
    status: "เผยแพร่แล้ว",
  },
];

const WorkHistoryForm = ({ navigation, route }) => {
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
      Alert.alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
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
      Alert.alert("แก้ไขสำเร็จ", "ข้อมูลประวัติการทำงานถูกบันทึกแล้ว");
    } else {
      setItems((prev) => [savedItem, ...prev]);
      Alert.alert("เพิ่มสำเร็จ", "เพิ่มข้อมูลประวัติการทำงานเรียบร้อยแล้ว");
    }
    openNew();
  };

  const handleDelete = (itemToDelete) => {
    Alert.alert("ลบข้อมูล", "ต้องการลบรายการนี้ใช่ไหม?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: () =>
          setItems((prev) =>
            prev.filter((entry) => entry.id !== itemToDelete.id),
          ),
      },
    ]);
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
      <AppHeader title="ประวัติการทำงาน" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>ประวัติการทำงาน</Text>
          </View>
          {items.map((entry) => (
            <View key={entry.id} style={styles.listItem}>
              <View style={styles.listText}>
                <Text style={styles.itemTitle}>{entry.position}</Text>
                <Text style={styles.itemDetail}>{entry.organization}</Text>
                <Text style={styles.itemSecondary}>
                  ปีที่เริ่ม {entry.start_year} - ปีที่ออก {entry.end_year}
                </Text>
              </View>
              <View style={styles.actionGroup}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEdit(entry)}
                >
                  <Text style={styles.editText}>แก้ไข</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(entry)}
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
              ? "แก้ไขข้อมูลประวัติการทำงาน"
              : "เพิ่มข้อมูลประวัติการทำงาน"}
          </Text>
          <FormField
            label="ทำงานในตำแหน่ง"
            value={form.position}
            onChangeText={(value) => setField("position", value)}
          />
          <View style={styles.divider} />
          <FormField
            label="สถานที่ทำงาน"
            value={form.organization}
            onChangeText={(value) => setField("organization", value)}
          />
          <View style={styles.divider} />
          <InlineDropdown
            label="ปีที่เริ่มทำงาน (พ.ศ.)"
            value={form.start_year}
            options={YEAR_OPTIONS}
            onSelect={(value) => setField("start_year", value)}
            searchable
          />
          <View style={styles.divider} />
          <InlineDropdown
            label="ปีที่ออกจากงาน (พ.ศ.)"
            value={form.end_year}
            options={YEAR_OPTIONS}
            onSelect={(value) => setField("end_year", value)}
            searchable
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingItem ? "บันทึกการแก้ไข" : "เพิ่มข้อมูลประวัติการทำงาน"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>รีเซ็ต</Text>
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#1a1a2e" },
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
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  editText: { color: "#1a6b3c", fontSize: 12, fontWeight: "700" },
  deleteButton: {
    backgroundColor: "#fde2e6",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  deleteText: { color: "#c0392b", fontSize: 12, fontWeight: "700" },
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

export default WorkHistoryForm;
