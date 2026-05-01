import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import AppHeader from "../components/AppHeader";
import FormField from "../components/FormField";

// ==========================================
// TODO: ฟิลด์บางอัน เช่น faculty, department
// ควรดึงจาก API มาทำ Dropdown แทน TextInput
// GET /api/faculties, GET /api/departments
// ==========================================
const FIELDS = {
  research: [
    { key: "title", label: "ชื่อผลงานวิจัย", multiline: true, required: true },
    {
      key: "year",
      label: "ปีที่เผยแพร่ (พ.ศ.)",
      keyboardType: "numeric",
      required: true,
    },
    { key: "source", label: "แหล่งทุน/หน่วยงาน", required: false },
    {
      key: "status",
      label: "สถานะ (เช่น กำลังดำเนินการ / เผยแพร่แล้ว)",
      required: false,
    },
  ],
  journal: [
    { key: "title", label: "ชื่อบทความ", multiline: true, required: true },
    { key: "journal_name", label: "ชื่อวารสาร", required: true },
    {
      key: "year",
      label: "ปีที่เผยแพร่ (พ.ศ.)",
      keyboardType: "numeric",
      required: true,
    },
    { key: "volume", label: "ปีที่/เล่มที่/ฉบับที่", required: false },
    { key: "page", label: "หน้าที่", required: false },
    { key: "status", label: "สถานะ", required: false },
  ],
  proceeding: [
    { key: "title", label: "ชื่อบทความ", multiline: true, required: true },
    { key: "conference", label: "ชื่อการประชุม/สัมมนา", required: true },
    {
      key: "year",
      label: "ปีที่เผยแพร่ (พ.ศ.)",
      keyboardType: "numeric",
      required: true,
    },
    { key: "location", label: "สถานที่จัดงาน", required: false },
    { key: "page", label: "หน้าที่", required: false },
  ],
  book: [
    {
      key: "title",
      label: "ชื่อหนังสือ/ตำรา",
      multiline: true,
      required: true,
    },
    { key: "publisher", label: "สำนักพิมพ์/หน่วยงาน", required: false },
    {
      key: "year",
      label: "ปีที่พิมพ์ (พ.ศ.)",
      keyboardType: "numeric",
      required: true,
    },
    { key: "isbn", label: "ISBN", required: false },
  ],
  patent: [
    {
      key: "title",
      label: "ชื่อทรัพย์สินทางปัญญา",
      multiline: true,
      required: true,
    },
    {
      key: "type",
      label: "ประเภท (เช่น อนุสิทธิบัตร / สิทธิบัตร)",
      required: true,
    },
    { key: "number", label: "เลขที่คำขอ/เลขที่", required: false },
    {
      key: "year",
      label: "ปี (พ.ศ.)",
      keyboardType: "numeric",
      required: false,
    },
  ],
  award: [
    { key: "title", label: "ชื่อรางวัล", multiline: true, required: true },
    { key: "organization", label: "หน่วยงานที่มอบรางวัล", required: true },
    {
      key: "year",
      label: "ปีที่ได้รับ (พ.ศ.)",
      keyboardType: "numeric",
      required: true,
    },
  ],
  speaker: [
    {
      key: "title",
      label: "หัวข้อ/เรื่องที่บรรยาย",
      multiline: true,
      required: true,
    },
    { key: "organization", label: "หน่วยงานที่เชิญ", required: true },
    {
      key: "year",
      label: "ปี (พ.ศ.)",
      keyboardType: "numeric",
      required: true,
    },
    { key: "location", label: "สถานที่", required: false },
  ],
  training: [
    {
      key: "title",
      label: "ชื่อหลักสูตร/โครงการ",
      multiline: true,
      required: true,
    },
    { key: "organization", label: "หน่วยงานที่จัด", required: true },
    {
      key: "year",
      label: "ปี (พ.ศ.)",
      keyboardType: "numeric",
      required: true,
    },
    {
      key: "hours",
      label: "จำนวนชั่วโมง",
      keyboardType: "numeric",
      required: false,
    },
  ],
  service: [
    {
      key: "title",
      label: "ชื่อโครงการ/กิจกรรม",
      multiline: true,
      required: true,
    },
    { key: "organization", label: "หน่วยงาน/ชุมชน", required: true },
    {
      key: "year",
      label: "ปี (พ.ศ.)",
      keyboardType: "numeric",
      required: true,
    },
    { key: "role", label: "บทบาท/หน้าที่", required: false },
  ],
  human_subjects: [
    { key: "title", label: "ชื่อหลักสูตร", multiline: true, required: true },
    { key: "certificate_no", label: "เลขที่ใบรับรอง", required: false },
    {
      key: "year",
      label: "ปีที่ผ่าน (พ.ศ.)",
      keyboardType: "numeric",
      required: true,
    },
    {
      key: "expire_year",
      label: "ปีที่หมดอายุ (พ.ศ.)",
      keyboardType: "numeric",
      required: false,
    },
  ],
  expertise: [
    { key: "title", label: "ความเชี่ยวชาญ", multiline: true, required: true },
    {
      key: "detail",
      label: "รายละเอียดเพิ่มเติม",
      multiline: true,
      required: false,
    },
  ],
  interest: [
    { key: "title", label: "ความสนใจ", multiline: true, required: true },
  ],
  profile: [
    // TODO: ดึงข้อมูล user จาก API มาเติมค่าเริ่มต้น
    // GET /api/user/profile
    { key: "firstname_th", label: "ชื่อ (ภาษาไทย)", required: true },
    { key: "lastname_th", label: "นามสกุล (ภาษาไทย)", required: true },
    { key: "firstname_en", label: "ชื่อ (ภาษาอังกฤษ)", required: false },
    { key: "lastname_en", label: "นามสกุล (ภาษาอังกฤษ)", required: false },
    { key: "faculty", label: "คณะ", required: false },
    { key: "department", label: "สาขาวิชา", required: false },
    { key: "position", label: "ตำแหน่งทางวิชาการ", required: false },
    {
      key: "phone",
      label: "เบอร์โทรศัพท์",
      keyboardType: "phone-pad",
      required: false,
    },
    {
      key: "email",
      label: "อีเมล",
      keyboardType: "email-address",
      required: false,
    },
  ],
  education: [
    { key: "degree", label: "ระดับการศึกษา (เช่น ปริญญาเอก)", required: true },
    { key: "major", label: "สาขาวิชา", required: true },
    { key: "university", label: "สถาบัน", required: true },
    { key: "country", label: "ประเทศ", required: false },
    {
      key: "year",
      label: "ปีที่จบ (พ.ศ.)",
      keyboardType: "numeric",
      required: false,
    },
  ],
  work_history: [
    { key: "position", label: "ตำแหน่ง", required: true },
    { key: "organization", label: "หน่วยงาน/สถาบัน", required: true },
    {
      key: "start_year",
      label: "ปีที่เริ่ม (พ.ศ.)",
      keyboardType: "numeric",
      required: false,
    },
    {
      key: "end_year",
      label: "ปีที่สิ้นสุด (พ.ศ.)",
      keyboardType: "numeric",
      required: false,
    },
  ],
  admin_history: [
    { key: "position", label: "ตำแหน่งบริหาร", required: true },
    { key: "organization", label: "หน่วยงาน", required: true },
    {
      key: "start_year",
      label: "ปีที่เริ่ม (พ.ศ.)",
      keyboardType: "numeric",
      required: false,
    },
    {
      key: "end_year",
      label: "ปีที่สิ้นสุด (พ.ศ.)",
      keyboardType: "numeric",
      required: false,
    },
  ],
};

const ResearchForm = ({ navigation, route }) => {
  const { type, title, icon, item } = route.params;
  const isEdit = item !== null;
  const fields = FIELDS[type] || [];

  const [form, setForm] = useState(() => {
    const init = {};
    fields.forEach((f) => {
      init[f.key] = item ? item[f.key] || "" : "";
    });
    return init;
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const missing = fields.filter((f) => f.required && !form[f.key]?.trim());
    if (missing.length > 0) {
      Alert.alert("กรุณากรอกข้อมูล", `กรอก "${missing[0].label}" ก่อนครับ`);
      return;
    }

    // TODO: เชื่อม API บันทึกข้อมูล
    // if (isEdit) {
    //   await api.put(`/research/${item.id}`, { type, ...form });
    // } else {
    //   await api.post("/research", { type, ...form });
    // }

    Alert.alert("บันทึกสำเร็จ", "ข้อมูลถูกบันทึกแล้ว", [
      { text: "ตกลง", onPress: () => navigation.goBack() },
    ]);
  };

  const shortTitle = title
    .replace("จัดการข้อมูล", "")
    .replace("จัดการ", "")
    .trim();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <AppHeader
        title={`${isEdit ? "แก้ไข" : "เพิ่ม"}${shortTitle}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {fields.map((field, index) => (
            <View key={field.key}>
              <FormField
                label={field.label}
                value={form[field.key]}
                onChangeText={(v) => handleChange(field.key, v)}
                required={field.required}
                multiline={field.multiline}
                keyboardType={field.keyboardType}
              />
              {index < fields.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveText}>💾 บันทึกข้อมูล</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text style={styles.cancelText}>ยกเลิก</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2f7" },
  body: { padding: 14, paddingBottom: 40, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8ecf0",
    overflow: "hidden",
  },
  divider: { height: 1, backgroundColor: "#f0f4f7" },
  saveBtn: {
    backgroundColor: "#1a6b3c",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1a6b3c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  cancelBtn: {
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e8ecf0",
    backgroundColor: "#fff",
  },
  cancelText: { color: "#888", fontSize: 14 },
});

export default ResearchForm;
