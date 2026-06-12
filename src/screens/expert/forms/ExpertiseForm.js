import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../../components/AppHeader";
import InlineDropdown from "../../../components/expert/InlineDropdown";
import useResource from "../../../hook/useResource";
import api from "../../../services/api";

const EXPERT_GROUPS = [
  { id: "", label: "กรุณาเลือกกลุ่มความเชี่ยวชาญ" },
  { id: "1", label: "วิทยาศาสตร์และเทคโนโลยี" },
  { id: "2", label: "มนุษยศาสตร์และสังคมศาสตร์" },
  { id: "3", label: "บริหารธุรกิจและการจัดการ" },
  { id: "4", label: "ครุศาสตร์และศึกษาศาสตร์" },
  { id: "5", label: "เกษตรและสิ่งแวดล้อม" },
  { id: "6", label: "วิศวกรรมศาสตร์" },
  { id: "7", label: "นิติศาสตร์และรัฐศาสตร์" },
  { id: "8", label: "ศิลปะและการออกแบบ" },
];

const PLACEHOLDER_EXPERTISE = { id: "", label: "กรุณาเลือกความเชี่ยวชาญ" };
const OTHER_EXPERTISE = { id: "other", label: "อื่น ๆ (พิมพ์เอง)" };

const getGroupLabel = (groupId) =>
  EXPERT_GROUPS.find((g) => g.id === String(groupId))?.label ?? String(groupId);

const ExpertiseForm = ({ navigation, route }) => {
  const item = route?.params?.item || null;
  const { items, loading: loadingItems, create, update, remove } = useResource("/expertises");

  const [editingItem, setEditingItem] = useState(item);
  const [form, setForm] = useState({
    group_id:  item?.group_id  ? String(item.group_id)  : "",
    expert_id: item?.expert_id ? String(item.expert_id) : (item?.name ? "other" : ""),
    name:      item?.name ?? "",
  });
  const [expertiseOptions, setExpertiseOptions] = useState([PLACEHOLDER_EXPERTISE]);
  const [loadingExpertises, setLoadingExpertises] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchExpertises = async (groupId) => {
    if (!groupId) { setExpertiseOptions([PLACEHOLDER_EXPERTISE]); return; }
    setLoadingExpertises(true);
    try {
      // endpoint: GET /api/expertise-options?group_id=X — ปรับตาม backend
      const r = await api.get("/expertise-options", { params: { group_id: groupId } });
      const body = r.data?.data ?? r.data ?? [];
      const rows = Array.isArray(body) ? body : [];
      setExpertiseOptions([
        PLACEHOLDER_EXPERTISE,
        ...rows.map((e) => ({ id: String(e.id), label: e.name ?? e.label ?? String(e.id) })),
        OTHER_EXPERTISE,
      ]);
    } catch {
      // ถ้า endpoint ไม่มีหรือ error → แสดงแค่ "อื่น ๆ"
      setExpertiseOptions([PLACEHOLDER_EXPERTISE, OTHER_EXPERTISE]);
    } finally {
      setLoadingExpertises(false);
    }
  };

  // โหลด expertise options เมื่อ editingItem เปลี่ยน (pre-fill)
  useEffect(() => {
    if (editingItem?.group_id) fetchExpertises(String(editingItem.group_id));
  }, [editingItem?.id]);

  const openNew = () => {
    setEditingItem(null);
    setForm({ group_id: "", expert_id: "", name: "" });
    setExpertiseOptions([PLACEHOLDER_EXPERTISE]);
  };

  const openEdit = (e) => {
    setEditingItem(e);
    setForm({
      group_id:  String(e.group_id ?? ""),
      expert_id: e.expert_id ? String(e.expert_id) : (e.name ? "other" : ""),
      name:      e.name ?? "",
    });
  };

  const handleGroupSelect = (v) => {
    setForm((p) => ({ ...p, group_id: v, expert_id: "", name: "" }));
    fetchExpertises(v);
  };

  const handleExpertiseSelect = (v) => {
    setForm((p) => ({ ...p, expert_id: v, name: v === "other" ? p.name : "" }));
  };

  // มี options จริงเมื่อ > placeholder + "อื่น ๆ"
  const hasRealOptions = expertiseOptions.length > 2;

  const handleSave = async () => {
    if (!form.group_id) { Alert.alert("กรุณาเลือกกลุ่มความเชี่ยวชาญ"); return; }
    if (hasRealOptions && !form.expert_id) { Alert.alert("กรุณาเลือกความเชี่ยวชาญ"); return; }
    const needsName = form.expert_id === "other" || !hasRealOptions;
    if (needsName && !form.name.trim()) { Alert.alert("กรุณาระบุชื่อความเชี่ยวชาญ"); return; }
    const payload = needsName
      ? { group_id: parseInt(form.group_id, 10), name: form.name.trim() }
      : { group_id: parseInt(form.group_id, 10), expert_id: parseInt(form.expert_id, 10) };
    if (__DEV__) console.log("[ExpertiseForm] payload:", JSON.stringify(payload));
    setSaving(true);
    try {
      editingItem ? await update(editingItem.id, payload) : await create(payload);
      Alert.alert(editingItem ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ");
      openNew();
    } catch (err) {
      Alert.alert("เกิดข้อผิดพลาด", err.response?.data?.message ?? err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (entry) => {
    const doDelete = async () => {
      try { await remove(entry.id); }
      catch (err) { Alert.alert("เกิดข้อผิดพลาด", err.message); }
    };
    if (Platform.OS === "web") {
      if (window.confirm("ต้องการลบรายการนี้ใช่ไหม?")) doDelete();
    } else {
      Alert.alert("ลบข้อมูล", "ต้องการลบรายการนี้ใช่ไหม?", [
        { text: "ยกเลิก", style: "cancel" },
        { text: "ลบ", style: "destructive", onPress: doDelete },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#eef2f7]" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <AppHeader title="ความเชี่ยวชาญ" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{ padding: 14, paddingBottom: 40, gap: 14 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* รายการที่มีอยู่ */}
        {loadingItems ? (
          <View className="items-center py-5">
            <ActivityIndicator size="small" color="#14532d" />
          </View>
        ) : items.length > 0 ? (
          <View className="bg-white rounded-2xl border border-[#e8ecf0] overflow-hidden">
            <View className="flex-row items-center px-4 py-3 bg-[#f8fafb] border-b border-[#e8ecf0]">
              <Ionicons name="ribbon-outline" size={16} color="#1a6b3c" />
              <Text className="text-[13px] font-semibold text-brand ml-1">รายการความเชี่ยวชาญ</Text>
            </View>
            {items.map((entry, index) => (
              <View key={entry.id ?? index} className="px-4 py-3 border-b border-[#f0f4f7] flex-row justify-between items-start">
                <View className="flex-1 pr-3">
                  <Text className="text-[13px] font-semibold text-[#1a1a2e]">
                    {entry.group_label ?? getGroupLabel(entry.group_id)}
                  </Text>
                  {!!(entry.expert_name ?? entry.name) && (
                    <Text className="text-[12px] text-[#6b7280] mt-[3px]">
                      {entry.expert_name ?? entry.name}
                    </Text>
                  )}
                  {!!entry.status && (
                    <View className="self-start bg-[#d1fae5] rounded-full px-[10px] py-[2px] mt-[6px]">
                      <Text className="text-[#065f46] text-[11px] font-bold">{entry.status}</Text>
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
        <View className="bg-white rounded-2xl border border-[#e8ecf0] overflow-hidden">
          <View className="flex-row items-center px-4 py-3 bg-[#f8fafb] border-b border-[#e8ecf0]">
            <Ionicons name={editingItem ? "create-outline" : "add-circle-outline"} size={16} color="#1a6b3c" />
            <Text className="text-[13px] font-semibold text-brand ml-1">
              {editingItem ? "แก้ไขข้อมูลความเชี่ยวชาญ" : "เพิ่มข้อมูลความเชี่ยวชาญ"}
            </Text>
          </View>

          {/* 1. กลุ่มความเชี่ยวชาญ */}
          <InlineDropdown
            label="กลุ่มความเชี่ยวชาญ"
            value={form.group_id}
            options={EXPERT_GROUPS}
            onSelect={handleGroupSelect}
            required
            searchable
          />
          <View className="h-px bg-[#f0f4f7]" />

          {/* 2. ความเชี่ยวชาญ (cascade) — แสดงเฉพาะเมื่อมี options จริง */}
          {hasRealOptions && (
            <>
              <InlineDropdown
                label="ความเชี่ยวชาญ"
                value={form.expert_id}
                options={expertiseOptions}
                onSelect={handleExpertiseSelect}
                loading={loadingExpertises}
                required
                searchable
              />
              <View className="h-px bg-[#f0f4f7]" />
            </>
          )}

          {/* 3. TextInput — แสดงเมื่อเลือก "อื่น ๆ" หรือไม่มี options */}
          {(form.expert_id === "other" || !hasRealOptions) && (
            <View className="px-4 py-3">
              <Text className="text-[12px] text-[#888] font-medium mb-[6px]">
                ชื่อความเชี่ยวชาญ <Text className="text-[#e74c3c]">*</Text>
              </Text>
              <TextInput
                className="text-[14px] text-[#1a1a2e] border border-[#e8ecf0] rounded-[10px] px-[12px] py-[10px] bg-[#f8fafb]"
                value={form.name}
                onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
                placeholder="พิมพ์ชื่อความเชี่ยวชาญ"
                placeholderTextColor="#bbb"
                autoCapitalize="none"
                returnKeyType="done"
              />
            </View>
          )}

          <View className="flex-row gap-3 p-4">
            <TouchableOpacity
              className="flex-1 bg-[#14532d] rounded-xl py-[14px] items-center justify-center flex-row gap-2"
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text className="text-white text-[14px] font-semibold">{editingItem ? "บันทึกการแก้ไข" : "เพิ่มข้อมูล"}</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-[#fef2f2] border border-[#dc2626] rounded-xl py-[14px] px-5 flex-row items-center gap-[6px] justify-center"
              onPress={openNew}
              activeOpacity={0.85}
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

export default ExpertiseForm;
