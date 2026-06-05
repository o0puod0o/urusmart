import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../../components/AppHeader";
import FormField from "../../../components/expert/FormField";
import InlineDropdown from "../../../components/expert/InlineDropdown";
import useResource from "../../../hook/useResource";
import useRefs from "../../../hook/useRefs";

const currentYear = new Date().getFullYear() + 543;
const YEAR_OPTIONS = [
  { id: "", label: "กรุณาเลือกปี" },
  ...Array.from({ length: currentYear - 2499 }, (_, i) => {
    const y = currentYear - i;
    return { id: String(y), label: String(y) };
  }),
];

const EducationForm = ({ navigation }) => {
  const { items, create, update, remove } = useResource("/educations");
  const { degrees } = useRefs();

  const DEGREE_OPTIONS = useMemo(() => [
    { id: "", label: "กรุณาเลือกระดับการศึกษา" },
    ...degrees.map((d) => ({ id: String(d.id), label: d.name ?? d.label ?? "" })),
  ], [degrees]);

  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ year: "", degree: "", major: "", institution: "" });

  const setField = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const openNewForm = () => { setEditingItem(null); setForm({ year: "", degree: "", major: "", institution: "" }); };
  const openEditForm = (item) => { setEditingItem(item); setForm({ year: item.year, degree: item.degree, major: item.major, institution: item.institution }); };

  const handleSave = async () => {
    if (!form.year || !form.degree || !form.major || !form.institution) {
      Alert.alert("กรุณากรอกข้อมูลให้ครบทุกช่อง"); return;
    }
    try {
      editingItem
        ? await update(editingItem.id, { degree: form.degree, year: form.year, major: form.major, institution: form.institution })
        : await create({ degree: form.degree, year: form.year, major: form.major, institution: form.institution });
      Alert.alert(editingItem ? "แก้ไขสำเร็จ" : "บันทึกสำเร็จ");
      openNewForm();
    } catch { Alert.alert("บันทึกไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง"); }
  };

  const handleDelete = (item) => {
    Alert.alert("ลบข้อมูล", "ต้องการลบรายการนี้ใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ลบ", style: "destructive", onPress: async () => {
        try { await remove(item.id); if (editingItem?.id === item.id) openNewForm(); }
        catch { Alert.alert("ลบไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง"); }
      }},
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="ประวัติการศึกษา" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 16 }} showsVerticalScrollIndicator={false}>

        {/* List */}
        <View className="bg-white rounded-[20px] border border-[#dcebe1] p-[18px]" style={{ elevation: 2, shadowColor: "#0b3b22", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }}>
          <Text className="text-[18px] font-bold text-[#155f2c] mb-[14px]">ประวัติการศึกษา</Text>
          {items.map((item) => (
            <View key={item.id} className="flex-row justify-between items-start py-[14px] border-t border-[#eef4f0] gap-3">
              <View className="flex-1 pr-2">
                <Text className="text-[15px] font-bold text-[#1a2e22] mb-1">{item.title}</Text>
                <Text className="text-[13px] text-[#5b6f64] mb-2">ปี {item.year}</Text>
                <View className="self-start bg-[#e6f4ea] rounded-full px-[10px] py-1">
                  <Text className="text-[12px] font-semibold text-[#155f2c]">{item.status}</Text>
                </View>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity className="bg-[#1f7a3a] rounded-[10px] py-2 px-[14px]" onPress={() => openEditForm(item)} activeOpacity={0.8}>
                  <Text className="text-white text-[13px] font-semibold">แก้ไข</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-[#fde8e8] rounded-[10px] py-2 px-[14px]" onPress={() => handleDelete(item)} activeOpacity={0.8}>
                  <Text className="text-[#dc2626] text-[13px] font-semibold">ลบ</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Form */}
        <View className="bg-white rounded-[20px] border border-[#dcebe1] p-[18px]" style={{ elevation: 2, shadowColor: "#0b3b22", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }}>
          <Text className="text-[16px] font-bold text-[#155f2c] mb-3">{editingItem ? "แก้ไขข้อมูลประวัติการศึกษา" : "เพิ่มข้อมูลประวัติการศึกษา"}</Text>
          <InlineDropdown label="ปีที่จบ (พ.ศ.)" value={form.year} options={YEAR_OPTIONS} onSelect={(v) => setField("year", v)} searchable />
          <View className="h-px bg-[#eef4f0] my-2" />
          <InlineDropdown label="ระดับการศึกษา" value={form.degree} options={DEGREE_OPTIONS} onSelect={(v) => setField("degree", v)} />
          <View className="h-px bg-[#eef4f0] my-2" />
          <FormField label="วุฒิการศึกษา (สาขาวิชา)" value={form.major} onChangeText={(v) => setField("major", v)} />
          <View className="h-px bg-[#eef4f0] my-2" />
          <FormField label="ชื่อสถาบัน" value={form.institution} onChangeText={(v) => setField("institution", v)} />

          <View className="flex-row gap-3 mt-[22px] flex-wrap">
            <TouchableOpacity className="flex-1 bg-[#1f7a3a] rounded-xl py-4 items-center min-w-[200px]" style={{ elevation: 2 }} onPress={handleSave}>
              <Text className="text-white text-[14px] font-bold">{editingItem ? "บันทึกการแก้ไข" : "เพิ่มข้อมูลประวัติการศึกษา"}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#fef2f2] border border-[#dc2626] rounded-xl py-[14px] px-[22px] flex-row items-center gap-[6px] justify-center min-w-[90px]" onPress={() => editingItem ? openEditForm(editingItem) : openNewForm()}>
              <Ionicons name="refresh" size={16} color="#dc2626" />
              <Text className="text-[#dc2626] text-[14px] font-bold">รีเซ็ท</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EducationForm;
