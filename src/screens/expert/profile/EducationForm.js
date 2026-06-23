import React, { useRef, useState, useMemo } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../../components/AppHeader";
import FormContainer from "../../../components/expert/FormContainer";
import FormField from "../../../components/expert/FormField";
import InlineDropdown from "../../../components/expert/InlineDropdown";
import useResource from "../../../hook/useResource";
import useConfirm from "../../../hook/useConfirm";

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
  const { items, loading, saving, create, update, remove } = useResource("/educations");
  const sortedItems = useMemo(() => [...items].sort((a, b) => Number(a.id) - Number(b.id)), [items]);
  const { confirm, ConfirmDialog } = useConfirm();
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
    <FormContainer className="flex-1 bg-[#f5f7f8]">
      <AppHeader title="ประวัติการศึกษา" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 18, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >

        <View className="flex-row items-center bg-white border border-[#eef1f4] rounded-2xl px-[14px] py-[14px] mb-4" style={{ elevation: 1 }}>
          <View className="w-11 h-11 rounded-xl bg-[#e6f4ef] items-center justify-center mr-3">
            <Ionicons name="school" size={22} color="#007a5a" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-[#6b7a82] uppercase tracking-[0.8px]">จัดการข้อมูล</Text>
            <Text className="text-[19px] font-black text-[#3f4d50] mt-[2px]">ประวัติการศึกษา</Text>
          </View>
          <View className="bg-[#007a5a] rounded-full min-w-9 px-[10px] py-[5px] items-center">
            <Text className="text-white text-[13px] font-black">{items.length}</Text>
          </View>
        </View>

        {/* List */}
        <View className="bg-white rounded-2xl border border-[#eef1f4] overflow-hidden mb-4" style={{ elevation: 1 }}>
          <View className="flex-row items-center gap-2 bg-[#e6f4ef] border-b border-[#eef1f4] px-[14px] py-[11px]">
            <Ionicons name="list-outline" size={16} color="#00614a" />
            <Text className="text-[13px] font-extrabold text-[#00614a]">รายการประวัติการศึกษา</Text>
          </View>
          {loading ? (
            <View className="flex-row items-center justify-center py-9 gap-[10px]">
              <ActivityIndicator size="small" color="#007a5a" />
              <Text className="text-[13px] text-[#6b7a82]">กำลังโหลด...</Text>
            </View>
          ) : sortedItems.length === 0 ? (
            <View className="items-center py-9">
              <Ionicons name="folder-open-outline" size={42} color="#9aa6b1" />
              <Text className="text-[14px] font-bold text-[#1f2a2e] mt-[10px]">ยังไม่มีข้อมูลประวัติการศึกษา</Text>
              <Text className="text-[12px] text-[#6b7a82] mt-1">เพิ่มข้อมูลใหม่ในแบบฟอร์มด้านล่าง</Text>
            </View>
          ) : sortedItems.map((item, index) => (
            <View key={item.id} className="p-[14px] flex-row justify-between items-center border-b border-[#eef1f4]" style={index % 2 === 1 ? { backgroundColor: "#fafbfc" } : {}}>
              <View className="flex-1 pr-3">
                <Text className="text-[14px] font-bold text-[#1a1a2e] mb-1">{item.course}</Text>
                <Text className="text-[12px] text-[#4b5563] mb-[6px]">{item.university}</Text>
                <View className="flex-row items-center gap-2 flex-wrap">
                  <View className="bg-[#e6f4ef] rounded-full px-[10px] py-1">
                    <Text className="text-[#00614a] text-[12px] font-extrabold">{item.year || "-"}</Text>
                  </View>
                  {!!getDegreeLabel(item) && <Text className="text-[12px] text-[#6b7280]">{getDegreeLabel(item)}</Text>}
                </View>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity className="w-[34px] h-[34px] rounded-lg bg-[#fff4e0] items-center justify-center" onPress={() => openEditForm(item)}>
                  <Ionicons name="create-outline" size={17} color="#a8631a" />
                </TouchableOpacity>
                <TouchableOpacity className="w-[34px] h-[34px] rounded-lg bg-[#fde7e7] items-center justify-center" onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={17} color="#df4c4b" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Form */}
        <View className="bg-white border border-[#eef1f4] rounded-2xl pb-[18px]" style={{ elevation: 1 }}>
          <View className="flex-row items-center justify-between border-b border-[#eef1f4] px-4 py-3 mb-2">
            <View className="flex-row items-center">
              <Ionicons name={editingItem ? "create" : "add-circle"} size={18} color="#007a5a" />
              <Text className="text-[16px] font-black text-[#3f4d50] ml-2">{editingItem ? "แก้ไขข้อมูลประวัติการศึกษา" : "เพิ่มข้อมูลประวัติการศึกษา"}</Text>
            </View>
          </View>
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

          <View className="flex-row gap-[10px] px-4 pt-[14px]">
            <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 bg-[#007a5a] rounded-xl py-[13px]" style={{ elevation: 2, opacity: saving ? 0.6 : 1 }} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#fff" /> : <>
                <Ionicons name={editingItem ? "checkmark-circle" : "add-circle"} size={18} color="#fff" />
                <Text className="text-white text-[14px] font-black">{editingItem ? "บันทึกการแก้ไข" : "เพิ่มข้อมูลประวัติการศึกษา"}</Text>
              </>}
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center gap-[6px] bg-[#fef2f2] border-[1.5px] border-[#dc2626] rounded-xl px-[18px]"
              onPress={() => confirm({ title: "รีเซ็ตฟอร์ม", message: "ต้องการเคลียร์ข้อมูลในฟอร์มหรือไม่?", icon: "refresh", onConfirm: openNewForm })}
            >
              <Ionicons name="refresh" size={16} color="#dc2626" />
              <Text className="text-[#dc2626] text-[14px] font-black">รีเซ็ท</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <ConfirmDialog />
    </FormContainer>
  );
};

export default EducationForm;
