import React, { useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../../components/AppHeader";
import FormField from "../../../components/expert/FormField";
import InlineDropdown from "../../../components/expert/InlineDropdown";
import useResource from "../../../hook/useResource";

const currentYear = new Date().getFullYear() + 543;
const YEAR_OPTIONS = [
  { id: "", label: "กรุณาเลือกปี" },
  ...Array.from({ length: currentYear - 2499 }, (_, i) => {
    const y = currentYear - i;
    return { id: String(y), label: String(y) };
  }),
];

const DEGREE_OPTIONS = [
  { id: "", label: "กรุณาเลือกระดับการศึกษา" },
  { id: "1", label: "ต่ำกว่าปริญญาตรี" },
  { id: "2", label: "ปริญญาตรี" },
  { id: "3", label: "ปริญญาโท" },
  { id: "4", label: "ปริญญาเอก" },
];

const EducationForm = ({ navigation }) => {
  const { items, create, update, remove } = useResource("/educations");
  const universityRef = useRef(null);

  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ year: "", degree: "", course: "", university: "" });

  const setField = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const openNewForm = () => { setEditingItem(null); setForm({ year: "", degree: "", course: "", university: "" }); };
  const openEditForm = (item) => {
    setEditingItem(item);
    const degId = item.degree_id ?? (typeof item.degree === "object" ? item.degree?.id : item.degree);
    setForm({ year: String(item.year ?? ""), degree: String(degId ?? ""), course: item.course ?? "", university: item.university ?? "" });
  };

  const getDegreeLabel = (item) => {
    const degId = String(item.degree_id ?? (typeof item.degree === "object" ? item.degree?.id : item.degree) ?? "");
    return DEGREE_OPTIONS.find((d) => d.id === degId)?.label ?? degId;
  };

  const handleSave = async () => {
    if (!form.year || !form.degree || !form.course || !form.university) {
      Alert.alert("กรุณากรอกข้อมูลให้ครบ", "กรุณากรอก ปี ระดับการศึกษา สาขา และสถาบัน"); return;
    }
    try {
      const payload = { degree: parseInt(form.degree, 10), year: form.year, course: form.course.trim(), university: form.university.trim() };
      if (__DEV__) console.log("[EducationForm] payload:", JSON.stringify(payload));
      editingItem ? await update(editingItem.id, payload) : await create(payload);
      Alert.alert(editingItem ? "แก้ไขสำเร็จ" : "บันทึกสำเร็จ");
      openNewForm();
    } catch (err) { Alert.alert("บันทึกไม่สำเร็จ", err.message ?? "กรุณาลองใหม่อีกครั้ง"); }
  };

  const handleDelete = (item) => {
    const doDelete = async () => {
      try { await remove(item.id); if (editingItem?.id === item.id) openNewForm(); }
      catch (err) { Alert.alert("ลบไม่สำเร็จ", err.message ?? "กรุณาลองใหม่อีกครั้ง"); }
    };
    if (Platform.OS === "web") {
      if (window.confirm("ต้องการลบรายการนี้ใช่หรือไม่?")) doDelete();
    } else {
      Alert.alert("ลบข้อมูล", "ต้องการลบรายการนี้ใช่หรือไม่?", [
        { text: "ยกเลิก", style: "cancel" },
        { text: "ลบ", style: "destructive", onPress: doDelete },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#eef2f7]" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <AppHeader title="ประวัติการศึกษา" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* List */}
        <View className="bg-white rounded-2xl border border-[#e8ecf0] p-4 mb-[14px]">
          <Text className="text-[16px] font-bold text-[#1a1a2e] mb-3">ประวัติการศึกษา</Text>
          {items.map((item) => (
            <View key={item.id} className="bg-[#f8fafb] rounded-[14px] p-[14px] mb-3 flex-row justify-between items-center">
              <View className="flex-1 pr-3">
                <Text className="text-[14px] font-bold text-[#1a1a2e] mb-1">{item.course}</Text>
                <Text className="text-[12px] text-[#4b5563] mb-[6px]">{item.university}</Text>
                <Text className="text-[11px] text-[#6b7280]">
                  {"ปี "}{item.year}{getDegreeLabel(item) ? ` · ${getDegreeLabel(item)}` : ""}
                </Text>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity className="bg-[#f8f8f8] rounded-[10px] py-[9px] px-[14px]" onPress={() => openEditForm(item)}>
                  <Text className="text-brand text-[12px] font-bold">แก้ไข</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-[#fde2e6] rounded-[10px] py-[9px] px-[14px]" onPress={() => handleDelete(item)}>
                  <Text className="text-[#c0392b] text-[12px] font-bold">ลบ</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Form */}
        <View className="bg-white rounded-2xl border border-[#e8ecf0] p-4">
          <Text className="text-[16px] font-bold text-[#1a1a2e] mb-4">
            {editingItem ? "แก้ไขข้อมูลประวัติการศึกษา" : "เพิ่มข้อมูลประวัติการศึกษา"}
          </Text>
          <InlineDropdown label="ปีที่จบ (พ.ศ.)" value={form.year} options={YEAR_OPTIONS} onSelect={(v) => setField("year", v)} searchable />
          <View className="h-px bg-[#f0f4f7] my-[10px]" />
          <InlineDropdown label="ระดับการศึกษา" value={form.degree} options={DEGREE_OPTIONS} onSelect={(v) => setField("degree", v)} />
          <View className="h-px bg-[#f0f4f7] my-[10px]" />
          <FormField
            label="วุฒิการศึกษา (สาขาวิชา)"
            value={form.course}
            onChangeText={(v) => setField("course", v)}
            onSubmitEditing={() => universityRef.current?.focus()}
          />
          <View className="h-px bg-[#f0f4f7] my-[10px]" />
          <FormField
            ref={universityRef}
            label="ชื่อสถาบัน"
            value={form.university}
            onChangeText={(v) => setField("university", v)}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          <View className="flex-row justify-between gap-3 mt-5">
            <TouchableOpacity className="flex-1 min-w-[160px] bg-[#14532d] rounded-xl py-[14px] items-center" onPress={handleSave}>
              <Text className="text-white text-[14px] font-semibold">
                {editingItem ? "บันทึกการแก้ไข" : "เพิ่มข้อมูลประวัติการศึกษา"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 min-w-[120px] bg-[#fef2f2] border border-[#dc2626] rounded-xl py-[14px] flex-row items-center gap-[6px] justify-center"
              onPress={() => editingItem ? openEditForm(editingItem) : openNewForm()}
            >
              <Ionicons name="refresh" size={16} color="#dc2626" />
              <Text className="text-[#dc2626] text-[14px] font-semibold">รีเซ็ท</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EducationForm;
