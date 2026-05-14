//แก้ไขประวัติส่วนตัว
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../../components/AppHeader";
import FormField from "../../../components/research/FormField";
import InlineDropdown from "../../../components/research/InlineDropdown";

// 🔧 ตั้ง base URL ของ API ตรงนี้
const API_BASE = "https://your-api.example.com/api";

// placeholder สำหรับแต่ละ dropdown
const PLACEHOLDERS = {
  prefixes: "กรุณาเลือกคำนำหน้าชื่อ",
  positions: "กรุณาเลือกตำแหน่ง",
  lines: "กรุณาเลือกสาย",
  mainUnits: "กรุณาเลือกหน่วยงานหลัก",
  subUnits: "กรุณาเลือกหน่วยงานรอง",
};

const ProfileForm = ({ navigation, route }) => {
  const item = route.params?.item;

  const [form, setForm] = useState({
    id_card: item?.id_card || "",
    firstname_th: item?.firstname_th || "",
    lastname_th: item?.lastname_th || "",
    firstname_en: item?.firstname_en || "",
    lastname_en: item?.lastname_en || "",
    prefix: item?.prefix || "",
    position: item?.position || "",
    branch: item?.branch || "",
    line: item?.line || "",
    address: item?.address || "",
    moo: item?.moo || "",
    road: item?.road || "",
    tambon: item?.tambon || "",
    amphoe: item?.amphoe || "",
    province: item?.province || "",
    zipcode: item?.zipcode || "",
    phone_work: item?.phone_work || "",
    phone_mobile: item?.phone_mobile || "",
    email: item?.email || "",
    birthdate: item?.birthdate || "",
    main_unit: item?.main_unit || "",
    sub_unit: item?.sub_unit || "",
  });

  // ─── Dropdown options จาก DB ────────────
  const [options, setOptions] = useState({
    prefixes: [],
    positions: [],
    lines: [],
    mainUnits: [],
    subUnits: [],
  });
  const [loadingOptions, setLoadingOptions] = useState(true);

  // helper: แปลง response → [{id, label}] พร้อมใส่ placeholder ตัวแรก
  const toOptions = (rows, key, idField = "id", labelField = "name") => [
    { id: "", label: PLACEHOLDERS[key] },
    ...rows.map((r) => ({ id: String(r[idField]), label: r[labelField] })),
  ];

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [pref, pos, ln, mu, su] = await Promise.all([
          fetch(`${API_BASE}/prefixes`).then((r) => r.json()),
          fetch(`${API_BASE}/positions`).then((r) => r.json()),
          fetch(`${API_BASE}/lines`).then((r) => r.json()),
          fetch(`${API_BASE}/main-units`).then((r) => r.json()),
          fetch(`${API_BASE}/sub-units`).then((r) => r.json()),
        ]);

        setOptions({
          // ปรับ idField/labelField ให้ตรงกับ schema ของคุณ
          prefixes: toOptions(pref, "prefixes", "id", "name"),
          positions: toOptions(pos, "positions", "id", "name"),
          lines: toOptions(ln, "lines", "id", "name"),
          mainUnits: toOptions(mu, "mainUnits", "id", "name"),
          subUnits: toOptions(su, "subUnits", "id", "name"),
        });
      } catch (err) {
        console.error(err);
        Alert.alert("โหลดข้อมูลไม่สำเร็จ", "ไม่สามารถดึงข้อมูล dropdown ได้");
      } finally {
        setLoadingOptions(false);
      }
    };
    loadAll();
  }, []);

  // ถ้าต้องการให้ sub_unit ขึ้นกับ main_unit ให้โหลดใหม่ตอน main_unit เปลี่ยน
  useEffect(() => {
    if (!form.main_unit) return;
    fetch(`${API_BASE}/sub-units?main_unit_id=${form.main_unit}`)
      .then((r) => r.json())
      .then((rows) =>
        setOptions((p) => ({
          ...p,
          subUnits: toOptions(rows, "subUnits", "id", "name"),
        })),
      )
      .catch((err) => console.error(err));
  }, [form.main_unit]);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSave = () => {
    if (!form.firstname_th.trim() || !form.lastname_th.trim()) {
      Alert.alert("กรุณากรอกข้อมูล", "กรอกชื่อ-นามสกุลภาษาไทยก่อนครับ");
      return;
    }
    Alert.alert("บันทึกสำเร็จ", "ข้อมูลถูกบันทึกแล้ว", [
      { text: "ตกลง", onPress: () => navigation.goBack() },
    ]);
  };

  const handleReset = () => {
    Alert.alert("รีเซ็ต", "ต้องการล้างข้อมูลทั้งหมดใช่ไหม?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "รีเซ็ต",
        style: "destructive",
        onPress: () =>
          setForm((p) =>
            Object.keys(p).reduce((acc, k) => ({ ...acc, [k]: "" }), {}),
          ),
      },
    ]);
  };

  if (loadingOptions) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1a6b3c" />
        <Text style={{ marginTop: 12, color: "#1a6b3c" }}>
          กำลังโหลดข้อมูล...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <AppHeader
        title="แก้ไขประวัติส่วนตัว"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>
              รูปโปรไฟล์ (อัปโหลดรูปภาพใหม่)
            </Text>
            <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={18} color="#1a6b3c" />
              <Text style={styles.uploadText}>เลือกไฟล์</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />

          <FormField
            label="รหัสบัตรประจำตัวประชาชน"
            value={form.id_card}
            onChangeText={(v) => set("id_card", v)}
            keyboardType="numeric"
          />
          <View style={styles.divider} />

          <FormField
            label="ชื่อภาษาไทย"
            value={form.firstname_th}
            onChangeText={(v) => set("firstname_th", v)}
            required
          />
          <View style={styles.divider} />
          <FormField
            label="นามสกุลภาษาไทย"
            value={form.lastname_th}
            onChangeText={(v) => set("lastname_th", v)}
            required
          />
          <View style={styles.divider} />

          <FormField
            label="ชื่อภาษาอังกฤษ"
            value={form.firstname_en}
            onChangeText={(v) => set("firstname_en", v)}
          />
          <View style={styles.divider} />
          <FormField
            label="นามสกุลภาษาอังกฤษ"
            value={form.lastname_en}
            onChangeText={(v) => set("lastname_en", v)}
          />
          <View style={styles.divider} />

          <InlineDropdown
            label="คำนำหน้าชื่อ"
            value={form.prefix}
            options={options.prefixes}
            onSelect={(v) => set("prefix", v)}
          />
          <View style={styles.divider} />

          <InlineDropdown
            label="ตำแหน่ง"
            value={form.position}
            options={options.positions}
            onSelect={(v) => set("position", v)}
          />
          <View style={styles.divider} />

          <FormField
            label="สาขา (สำหรับผู้ช่วยศาสตราจารย์ รองศาสตราจารย์ ศาสตราจารย์)"
            value={form.branch}
            onChangeText={(v) => set("branch", v)}
          />
          <View style={styles.divider} />

          <InlineDropdown
            label="สาย"
            value={form.line}
            options={options.lines}
            onSelect={(v) => set("line", v)}
          />
          <View style={styles.divider} />

          <FormField
            label="ที่อยู่"
            value={form.address}
            onChangeText={(v) => set("address", v)}
          />
          <View style={styles.divider} />
          <FormField
            label="หมู่"
            value={form.moo}
            onChangeText={(v) => set("moo", v)}
            keyboardType="numeric"
          />
          <View style={styles.divider} />
          <FormField
            label="ถนน"
            value={form.road}
            onChangeText={(v) => set("road", v)}
          />
          <View style={styles.divider} />
          <FormField
            label="ตำบล"
            value={form.tambon}
            onChangeText={(v) => set("tambon", v)}
          />
          <View style={styles.divider} />
          <FormField
            label="อำเภอ"
            value={form.amphoe}
            onChangeText={(v) => set("amphoe", v)}
          />
          <View style={styles.divider} />
          <FormField
            label="จังหวัด"
            value={form.province}
            onChangeText={(v) => set("province", v)}
          />
          <View style={styles.divider} />
          <FormField
            label="รหัสไปรษณีย์"
            value={form.zipcode}
            onChangeText={(v) => set("zipcode", v)}
            keyboardType="numeric"
          />
          <View style={styles.divider} />

          <FormField
            label="เบอร์โทรศัพท์ที่ทำงาน"
            value={form.phone_work}
            onChangeText={(v) => set("phone_work", v)}
            keyboardType="phone-pad"
          />
          <View style={styles.divider} />
          <FormField
            label="เบอร์โทรศัพท์มือถือ"
            value={form.phone_mobile}
            onChangeText={(v) => set("phone_mobile", v)}
            keyboardType="phone-pad"
          />
          <View style={styles.divider} />
          <FormField
            label="อีเมล"
            value={form.email}
            onChangeText={(v) => set("email", v)}
            keyboardType="email-address"
          />
          <View style={styles.divider} />
          <FormField
            label="วัน เดือน ปีเกิด (เช่น 04/10/2523)"
            value={form.birthdate}
            onChangeText={(v) => set("birthdate", v)}
          />
          <View style={styles.divider} />

          <InlineDropdown
            label="หน่วยงานหลัก"
            value={form.main_unit}
            options={options.mainUnits}
            onSelect={(v) => {
              set("main_unit", v);
              set("sub_unit", "");
            }}
            searchable
          />
          <View style={styles.divider} />

          <InlineDropdown
            label="หน่วยงานรอง"
            value={form.sub_unit}
            options={options.subUnits}
            onSelect={(v) => set("sub_unit", v)}
            searchable
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>แก้ไขประวัติส่วนตัว</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>รีเซ็ต</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2f7" },
  center: { justifyContent: "center", alignItems: "center" },
  body: { padding: 14, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8ecf0",
    overflow: "hidden",
  },
  divider: { height: 1, backgroundColor: "#f0f4f7" },
  fieldWrap: { paddingHorizontal: 16, paddingVertical: 12 },
  fieldLabel: {
    fontSize: 12,
    color: "#1a6b3c",
    fontWeight: "600",
    marginBottom: 8,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f0f4f8",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  uploadText: { fontSize: 13, color: "#1a6b3c", fontWeight: "600" },
  btnRow: { flexDirection: "row", gap: 10, padding: 16 },
  saveBtn: {
    flex: 1,
    backgroundColor: "#1a6b3c",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  resetBtn: {
    backgroundColor: "#17a2b8",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 13,
    alignItems: "center",
  },
  resetBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});

export default ProfileForm;
