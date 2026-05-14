//จัดการข้อมูลความเชี่ยวชาญ
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AppHeader from "../../../components/AppHeader";
import InlineDropdown from "../../../components/research/InlineDropdown";

const EXPERTISE_GROUPS = [
  { id: "", label: "กรุณาเลือกกลุ่มความเชี่ยวชาญ" },
  { id: "1", label: "กลุ่มครุศาสตร์ ศึกษาศาสตร์พลศึกษา และพลศึกษา" },
  {
    id: "2",
    label:
      "กลุ่มบริหาร พาณิชย์ศาสตร์ การบัญชี การท่องเที่ยวและโรงแรม เศรษฐศาสตร์",
  },
  { id: "3", label: "กลุ่มมนุษยศาสตร์และสังคมศาสตร์" },
  { id: "4", label: "กลุ่มวิชาวิทยาศาสตร์กายภาพและชีวภาพ" },
  { id: "5", label: "กลุ่มวิทยาศาสตร์สุขภาพ" },
  { id: "6", label: "กลุ่มวิศวกรรมศาสตร์" },
  { id: "7", label: "กลุ่มศิลปกรรมศาสตร์" },
  { id: "8", label: "กลุ่มสถาปัตยกรรมศาสตร์" },
  { id: "9", label: "กลุ่มเกษตรศาสตร์" },
];

const INITIAL_ITEMS = [
  {
    id: "exp1",
    group_id: "6",
    group_label: "กลุ่มวิศวกรรมศาสตร์",
    status: "เผยแพร่แล้ว",
  },
];

const ExpertiseForm = ({ navigation, route }) => {
  const item = route?.params?.item || null;
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [editingItem, setEditingItem] = useState(item);
  const [form, setForm] = useState({
    group_id: item?.group_id || "",
  });

  const openNew = () => {
    setEditingItem(null);
    setForm({ group_id: "" });
  };

  const openEdit = (itemToEdit) => {
    setEditingItem(itemToEdit);
    setForm({ group_id: itemToEdit.group_id });
  };

  const handleSave = () => {
    if (!form.group_id) {
      Alert.alert("กรุณาเลือกกลุ่มความเชี่ยวชาญ");
      return;
    }

    const selectedGroup = EXPERTISE_GROUPS.find((g) => g.id === form.group_id);
    const savedItem = {
      id: editingItem?.id || String(Date.now()),
      group_id: form.group_id,
      group_label: selectedGroup?.label || "",
      status: "เผยแพร่แล้ว",
    };

    if (editingItem) {
      setItems((prev) =>
        prev.map((entry) => (entry.id === editingItem.id ? savedItem : entry)),
      );
      Alert.alert("แก้ไขสำเร็จ", "ข้อมูลความเชี่ยวชาญถูกบันทึกแล้ว");
    } else {
      setItems((prev) => [savedItem, ...prev]);
      Alert.alert("เพิ่มสำเร็จ", "เพิ่มข้อมูลความเชี่ยวชาญเรียบร้อยแล้ว");
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
      <AppHeader title="ความเชี่ยวชาญ" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* รายการที่มีอยู่ */}
        {items.length > 0 && (
          <View style={styles.card}>
            {items.map((entry) => (
              <View key={entry.id} style={styles.listItem}>
                <View style={styles.listText}>
                  <Text style={styles.itemTitle}>{entry.group_label}</Text>
                  <View style={styles.metaRow}>
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
        )}

        {/* ฟอร์ม */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>
            {editingItem
              ? "แก้ไขข้อมูลความเชี่ยวชาญ"
              : "เพิ่มข้อมูลความเชี่ยวชาญ"}
          </Text>

          <InlineDropdown
            label="กลุ่มความเชี่ยวชาญ"
            value={form.group_id}
            options={EXPERTISE_GROUPS}
            onSelect={(v) => setForm((p) => ({ ...p, group_id: v }))}
            required
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingItem ? "บันทึกการแก้ไข" : "แก้ไขข้อมูลความเชี่ยวชาญ"}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2f7" },
  body: { padding: 14, paddingBottom: 40, gap: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8ecf0",
    padding: 16,
  },
  listItem: {
    backgroundColor: "#f8fafb",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listText: { flex: 1, paddingRight: 12 },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 6,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  statusPill: {
    backgroundColor: "#d1fae5",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { color: "#065f46", fontSize: 11, fontWeight: "700" },
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
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
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

export default ExpertiseForm;
