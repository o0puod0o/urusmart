//จัดการข้อมูลผลงานวิจัย
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import AppHeader from "../../../components/AppHeader";
import InlineDropdown from "../../../components/research/InlineDropdown";

const BASE_URL = "https://your-api.example.com"; // TODO: เปลี่ยนเป็น URL จริง

const YEAR_OPTIONS = [
  { id: "", label: "กรุณาเลือกปี" },
  ...Array.from({ length: 2569 - 2533 + 1 }, (_, i) => {
    const y = 2569 - i;
    return { id: String(y), label: String(y) };
  }),
];

// Mock data รายการ — ลบออกเมื่อมี API
const INITIAL_ITEMS = [
  {
    id: "1",
    year: "2562",
    title:
      "การจัดการศูนย์ข้อมูลเพื่อการพัฒนาเชิงพื้นที่สำหรับเครือข่ายมหาวิทยาลัยราชภัฏอุตรดิตถ์",
    type: "กองทุนวิจัยใน",
    pmu: "",
    level: "",
  },
  {
    id: "2",
    year: "2561",
    title: "การถ่ายทอดเทคโนโลยีระบบสารสนเทศทวนสอบคุณภาพสินค้าสับปะรด",
    type: "PMU",
    pmu: "",
    level: "",
  },
];

const ResearchForm = ({ navigation, route }) => {
  const item = route.params?.item || null;

  const [items, setItems] = useState(INITIAL_ITEMS);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    year: "",
    title: "",
    type: "",
    pmu: "",
    level: "",
  });

  // ── Dropdown states ──
  const [typeOptions, setTypeOptions] = useState([
    { id: "", label: "กรุณาเลือกประเภทผลงานวิจัย" },
  ]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  // ดึงประเภทผลงานวิจัยจาก API
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingTypes(true);
        const res = await fetch(`${BASE_URL}/api/research-types`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setTypeOptions([
          { id: "", label: "กรุณาเลือกประเภทผลงานวิจัย" },
          ...data.map((d) => ({ id: String(d.id), label: d.name })),
        ]);
      } catch {
        // API ยังไม่พร้อม — dropdown ว่างไว้ก่อน
        console.log("API not ready, research types empty");
      } finally {
        setLoadingTypes(false);
      }
    };
    load();
  }, []);

  const setField = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const openEdit = (entry) => {
    setEditingItem(entry);
    setForm({
      year: entry.year,
      title: entry.title,
      type: entry.type,
      pmu: entry.pmu,
      level: entry.level,
    });
  };

  const openNew = () => {
    setEditingItem(null);
    setForm({ year: "", title: "", type: "", pmu: "", level: "" });
  };

  const handleSave = () => {
    if (!form.year || !form.title.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกปีและชื่องานวิจัย");
      return;
    }
    const saved = {
      id: editingItem?.id || String(Date.now()),
      year: form.year,
      title: form.title,
      type: form.type,
      pmu: form.pmu,
      level: form.level,
    };
    if (editingItem) {
      setItems((prev) =>
        prev.map((i) => (i.id === editingItem.id ? saved : i)),
      );
      Alert.alert("แก้ไขสำเร็จ", "ข้อมูลถูกบันทึกแล้ว");
    } else {
      setItems((prev) => [saved, ...prev]);
      Alert.alert("เพิ่มสำเร็จ", "เพิ่มข้อมูลเรียบร้อยแล้ว");
    }
    openNew();
    // TODO: POST/PUT /api/research
  };

  const handleDelete = (entry) => {
    Alert.alert("ลบข้อมูล", "ต้องการลบรายการนี้ใช่ไหม?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: () => {
          setItems((prev) => prev.filter((i) => i.id !== entry.id));
          // TODO: DELETE /api/research/:id
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="ผลงานวิจัย" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── ตารางรายการ ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>✎ แก้ไขข้อมูลผลงานวิจัย</Text>
          </View>

          <View style={styles.tableHead}>
            <Text style={[styles.thText, { width: 28 }]}>ที่</Text>
            <Text style={[styles.thText, { width: 44 }]}>ปี</Text>
            <Text style={[styles.thText, { flex: 1 }]}>ชื่องานวิจัย</Text>
            <Text style={[styles.thText, { width: 72 }]}>ประเภท</Text>
            <Text style={[styles.thText, { width: 44 }]}>PMU</Text>
            <Text style={[styles.thText, { width: 44 }]}>ระดับ</Text>
            <Text style={[styles.thText, { width: 44 }]}>แก้ไข</Text>
            <Text style={[styles.thText, { width: 36 }]}>ลบ</Text>
          </View>

          {items.length === 0 ? (
            <Text style={styles.emptyText}>ยังไม่มีข้อมูลผลงานวิจัย</Text>
          ) : (
            items.map((entry, index) => (
              <View
                key={entry.id}
                style={[
                  styles.tableRow,
                  index % 2 === 0 && { backgroundColor: "#f8fafb" },
                ]}
              >
                <Text style={[styles.tdText, { width: 28 }]}>{index + 1}</Text>
                <Text style={[styles.tdText, { width: 44 }]}>{entry.year}</Text>
                <Text style={[styles.tdText, { flex: 1 }]} numberOfLines={3}>
                  {entry.title}
                </Text>
                <Text style={[styles.tdText, { width: 72, color: "#1a6b3c" }]}>
                  {entry.type}
                </Text>
                <Text style={[styles.tdText, { width: 44 }]}>{entry.pmu}</Text>
                <Text style={[styles.tdText, { width: 44 }]}>
                  {entry.level}
                </Text>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.editBtn, { width: 44 }]}
                  onPress={() => openEdit(entry)}
                >
                  <Text style={styles.editBtnText}>แก้ไข</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.delBtn, { width: 36 }]}
                  onPress={() => handleDelete(entry)}
                >
                  <Text style={styles.delBtnText}>ลบ</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* ── ฟอร์มเพิ่ม/แก้ไข ── */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {editingItem ? "แก้ไขข้อมูลผลงานวิจัย" : "เพิ่มข้อมูลผลงานวิจัย"}
          </Text>

          <InlineDropdown
            label="ปี:"
            value={form.year}
            options={YEAR_OPTIONS}
            onSelect={(v) => setField("year", v)}
            required
          />
          <View style={styles.divider} />

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>
              ชื่องานวิจัย: <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textarea}
              placeholder="กรอกชื่องานวิจัย"
              placeholderTextColor="#bbb"
              value={form.title}
              onChangeText={(v) => setField("title", v)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          <View style={styles.divider} />

          {/* ประเภท — ดึงจาก API */}
          {loadingTypes ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color="#1a6b3c" />
              <Text style={styles.loadingText}>
                กำลังโหลดประเภทผลงานวิจัย...
              </Text>
            </View>
          ) : (
            <InlineDropdown
              label="ประเภทผลงานวิจัย:"
              value={form.type}
              options={typeOptions}
              onSelect={(v) => setField("type", v)}
            />
          )}

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>
                {editingItem ? "บันทึกการแก้ไข" : "เพิ่มข้อมูลผลงานวิจัย"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetBtn} onPress={openNew}>
              <Text style={styles.resetBtnText}>รีเซ็ก</Text>
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
    overflow: "hidden",
  },
  cardHeader: {
    backgroundColor: "#f8fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecf0",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardHeaderText: { fontSize: 14, fontWeight: "700", color: "#1a6b3c" },
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0faf4",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecf0",
    gap: 4,
  },
  thText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1a6b3c",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f7",
    gap: 4,
  },
  tdText: { fontSize: 11, color: "#1a1a2e" },
  emptyText: { textAlign: "center", color: "#aaa", fontSize: 13, padding: 24 },
  actionBtn: {
    borderRadius: 6,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  editBtn: { backgroundColor: "#fff3cd" },
  editBtnText: { fontSize: 10, fontWeight: "700", color: "#856404" },
  delBtn: { backgroundColor: "#fde2e6" },
  delBtnText: { fontSize: 10, fontWeight: "700", color: "#c0392b" },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8ecf0",
    overflow: "hidden",
    padding: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 16,
  },
  divider: { height: 1, backgroundColor: "#f0f4f7", marginVertical: 4 },
  fieldWrap: { paddingVertical: 10 },
  fieldLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
    marginBottom: 6,
  },
  required: { color: "#e74c3c" },
  textarea: {
    borderWidth: 1,
    borderColor: "#e8ecf0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1a1a2e",
    minHeight: 80,
    backgroundColor: "#f8fafb",
  },
  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
  },
  loadingText: { fontSize: 13, color: "#888" },
  btnRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  saveBtn: {
    flex: 1,
    backgroundColor: "#14532d",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  resetBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  resetBtnText: { color: "#1f2937", fontSize: 14, fontWeight: "600" },
});

export default ResearchForm;
