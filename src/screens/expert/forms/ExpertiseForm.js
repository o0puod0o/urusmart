import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../../components/AppHeader";
import InlineDropdown from "../../../components/expert/InlineDropdown";
import useResource from "../../../hook/useResource";
import api from "../../../services/api";

const ExpertiseForm = ({ navigation, route }) => {
  const item = route?.params?.item || null;
  const { items, loading: loadingItems, create, update, remove } = useResource("/expertises");
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [editingItem, setEditingItem] = useState(item);
  const [form, setForm] = useState({ group_id: item?.group_id || "" });

  useEffect(() => {
    api.get("/ref/expertise-groups")
      .then((r) => {
        const rows = r.data?.data ?? r.data ?? [];
        setGroups([{ id: "", label: "กรุณาเลือกกลุ่มความเชี่ยวชาญ" }, ...rows.map((g) => ({ id: String(g.id), label: g.name ?? g.label ?? "" }))]);
      })
      .catch(() => setGroups([{ id: "", label: "กรุณาเลือกกลุ่มความเชี่ยวชาญ" }]))
      .finally(() => setLoadingGroups(false));
  }, []);

  const openNew = () => { setEditingItem(null); setForm({ group_id: "" }); };
  const openEdit = (e) => { setEditingItem(e); setForm({ group_id: String(e.group_id) }); };

  const handleSave = async () => {
    if (!form.group_id) { Alert.alert("กรุณาเลือกกลุ่มความเชี่ยวชาญ"); return; }
    try {
      editingItem ? await update(editingItem.id, form) : await create(form);
      Alert.alert(editingItem ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ");
      openNew();
    } catch (err) { Alert.alert("เกิดข้อผิดพลาด", err.message); }
  };

  const handleDelete = (entry) => {
    Alert.alert("ลบข้อมูล", "ต้องการลบรายการนี้ใช่ไหม?", [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ลบ", style: "destructive", onPress: async () => { try { await remove(entry.id); } catch (err) { Alert.alert("เกิดข้อผิดพลาด", err.message); } } },
    ]);
  };

  const getGroupLabel = (groupId) => groups.find((g) => g.id === String(groupId))?.label ?? groupId;

  return (
    <View className="flex-1 bg-[#eef2f7]">
      <AppHeader title="ความเชี่ยวชาญ" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40, gap: 14 }} showsVerticalScrollIndicator={false}>

        {/* รายการที่มีอยู่ */}
        {loadingItems ? (
          <View className="items-center py-5">
            <ActivityIndicator size="small" color="#14532d" />
          </View>
        ) : items.length > 0 ? (
          <View className="bg-white rounded-2xl border border-[#e8ecf0] p-4">
            {items.map((entry) => (
              <View key={entry.id} className="bg-[#f8fafb] rounded-[14px] p-[14px] mb-[10px] flex-row justify-between items-center">
                <View className="flex-1 pr-3">
                  <Text className="text-[14px] font-semibold text-[#1a1a2e] mb-[6px]">
                    {entry.group_label ?? getGroupLabel(entry.group_id)}
                  </Text>
                  {!!entry.status && (
                    <View className="flex-row items-center gap-[10px]">
                      <View className="bg-[#d1fae5] rounded-full px-[10px] py-1">
                        <Text className="text-[#065f46] text-[11px] font-bold">{entry.status}</Text>
                      </View>
                    </View>
                  )}
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity className="bg-[#dbeafe] rounded-[10px] py-[9px] px-[14px]" onPress={() => openEdit(entry)}>
                    <Text className="text-[#1e40af] text-[12px] font-bold">แก้ไข</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="bg-[#fde2e6] rounded-[10px] py-[9px] px-[14px]" onPress={() => handleDelete(entry)}>
                    <Text className="text-[#c0392b] text-[12px] font-bold">ลบ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* ฟอร์ม */}
        <View className="bg-white rounded-2xl border border-[#e8ecf0] p-4">
          <Text className="text-[16px] font-bold text-[#1a1a2e] mb-4">
            {editingItem ? "แก้ไขข้อมูลความเชี่ยวชาญ" : "เพิ่มข้อมูลความเชี่ยวชาญ"}
          </Text>
          <InlineDropdown
            label="กลุ่มความเชี่ยวชาญ"
            value={form.group_id}
            options={loadingGroups ? [{ id: "", label: "กำลังโหลด..." }] : groups}
            onSelect={(v) => setForm((p) => ({ ...p, group_id: v }))}
            required
          />
          <View className="flex-row gap-3 mt-5">
            <TouchableOpacity className="flex-1 bg-[#14532d] rounded-xl py-[14px] items-center" onPress={handleSave}>
              <Text className="text-white text-[14px] font-semibold">{editingItem ? "บันทึกการแก้ไข" : "เพิ่มข้อมูล"}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#fef2f2] border border-[#dc2626] rounded-xl py-[14px] px-5 flex-row items-center gap-[6px] justify-center" onPress={() => editingItem ? openEdit(editingItem) : openNew()}>
              <Ionicons name="refresh" size={16} color="#dc2626" />
              <Text className="text-[#dc2626] text-[14px] font-semibold">รีเซ็ท</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ExpertiseForm;
