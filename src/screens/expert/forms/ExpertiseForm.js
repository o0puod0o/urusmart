import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../../components/AppHeader";
import FormContainer from "../../../components/expert/FormContainer";
import KeyboardAwareScrollView from "../../../components/expert/KeyboardAwareScrollView";
import InlineDropdown from "../../../components/expert/InlineDropdown";
import useResource from "../../../hook/useResource";
import useConfirm from "../../../hook/useConfirm";
import {
  getExpertGroupLabel,
  getExpertGroupSelectOptions,
} from "../../../constants/expertGroups";

const EXPERT_GROUPS = getExpertGroupSelectOptions(
  "กรุณาเลือกกลุ่มความเชี่ยวชาญ",
);

const getGroupLabel = getExpertGroupLabel;

const ExpertiseForm = ({ navigation, route }) => {
  const item = route?.params?.item || null;
  const {
    items,
    loading: loadingItems,
    create,
    update,
    remove,
  } = useResource("/expertises");

  const [editingItem, setEditingItem] = useState(item);
  const [form, setForm] = useState({
    group_id: item?.group_id ? String(item.group_id) : "",
  });
  const [saving, setSaving] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  const openNew = () => {
    setEditingItem(null);
    setForm({ group_id: "" });
  };

  const openEdit = (e) => {
    setEditingItem(e);
    setForm({ group_id: e.group_id ? String(e.group_id) : "" });
  };

  const handleSave = async () => {
    if (!form.group_id) {
      Alert.alert("กรุณาเลือกกลุ่มความเชี่ยวชาญ");
      return;
    }
    const groupLabel =
      EXPERT_GROUPS.find((g) => g.id === form.group_id)?.label ?? "";
    const payload = { group_id: parseInt(form.group_id, 10), name: groupLabel };
    if (__DEV__)
      console.log("[ExpertiseForm] payload:", JSON.stringify(payload));
    setSaving(true);
    try {
      editingItem
        ? await update(editingItem.id, payload)
        : await create(payload);
      Alert.alert(editingItem ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ");
      openNew();
    } catch (err) {
      if (__DEV__) console.warn("[ExpertiseForm] save error:", err.message);
      Alert.alert(
        "บันทึกไม่สำเร็จ",
        err.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (entry) => {
    const doDelete = async () => {
      try {
        await remove(entry.id);
      } catch (err) {
        Alert.alert("เกิดข้อผิดพลาด", err.message);
      }
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
    <FormContainer className="flex-1 bg-[#f5f7f8]">
      <AppHeader title="ความเชี่ยวชาญ" onBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingHorizontal: 14,
          paddingTop: 18,
          paddingBottom: 60,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View
          className="flex-row items-center bg-white border border-[#eef1f4] rounded-2xl px-[14px] py-[14px] mb-4"
          style={{ elevation: 1 }}
        >
          <View className="w-11 h-11 rounded-xl bg-[#e6f4ef] items-center justify-center mr-3">
            <Ionicons name="ribbon" size={22} color="#007a5a" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-[#6b7a82] uppercase tracking-[0.8px]">
              ข้อมูลผู้เชี่ยวชาญ
            </Text>
            <Text className="text-[19px] font-black text-[#3f4d50] mt-[2px]">
              ความเชี่ยวชาญ
            </Text>
          </View>
          <View className="bg-[#007a5a] rounded-full min-w-9 px-[10px] py-[5px] items-center">
            <Text className="text-white text-[13px] font-black">
              {items.length}
            </Text>
          </View>
        </View>

        {/* รายการ */}
        <View
          className="bg-white border border-[#eef1f4] rounded-2xl overflow-hidden mb-4"
          style={{ elevation: 1 }}
        >
          <View className="flex-row items-center gap-2 bg-[#e6f4ef] border-b border-[#eef1f4] px-[14px] py-[11px]">
            <Ionicons name="list-outline" size={16} color="#00614a" />
            <Text className="text-[13px] font-extrabold text-[#00614a]">
              รายการความเชี่ยวชาญ
            </Text>
          </View>
          {loadingItems ? (
            <View className="flex-row items-center justify-center py-9 gap-[10px]">
              <ActivityIndicator size="small" color="#007a5a" />
              <Text className="text-[13px] text-[#6b7a82]">กำลังโหลด...</Text>
            </View>
          ) : items.length === 0 ? (
            <View className="items-center py-9">
              <Ionicons name="folder-open-outline" size={42} color="#9aa6b1" />
              <Text className="text-[14px] font-bold text-[#1f2a2e] mt-[10px]">
                ยังไม่มีข้อมูลความเชี่ยวชาญ
              </Text>
              <Text className="text-[12px] text-[#6b7a82] mt-1">
                เพิ่มข้อมูลด้านล่าง
              </Text>
            </View>
          ) : (
            items.map((entry, index) => (
              <View
                key={entry.id ?? index}
                className="flex-row items-center px-[14px] py-3 border-b border-[#eef1f4]"
                style={[
                  editingItem?.id === entry.id
                    ? { backgroundColor: "#ccf0e2" }
                    : {},
                ]}
              >
                <View className="flex-1 pr-2">
                  <Text className="text-[14px] font-semibold text-[#1f2a2e]">
                    {entry.name ||
                      entry.expert_name ||
                      entry.expertise_name ||
                      entry.group_label ||
                      entry.group_name ||
                      ""}
                  </Text>
                </View>
                <View className="flex-row gap-[6px]">
                  <TouchableOpacity
                    className="w-[34px] h-[34px] rounded-lg bg-[#fff0d6] items-center justify-center"
                    onPress={() => openEdit(entry)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="create-outline" size={17} color="#a8631a" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-[34px] h-[34px] rounded-lg bg-[#fde7e7] items-center justify-center"
                    onPress={() => handleDelete(entry)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={17} color="#df4c4b" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* ฟอร์ม */}
        <View
          className="bg-white border border-[#eef1f4] rounded-2xl pb-[18px]"
          style={{ elevation: 1 }}
        >
          <View className="flex-row items-center justify-between border-b border-[#eef1f4] px-4 py-3 mb-2">
            <View className="flex-row items-center">
              <Ionicons
                name={editingItem ? "create" : "add-circle"}
                size={18}
                color="#007a5a"
              />
              <Text className="text-[16px] font-black text-[#3f4d50] ml-2">
                {editingItem ? "แก้ไขความเชี่ยวชาญ" : "เพิ่มความเชี่ยวชาญ"}
              </Text>
            </View>
            {editingItem && (
              <View className="flex-row items-center bg-[#fff0d6] rounded-full px-[10px] py-1">
                <Ionicons name="create-outline" size={13} color="#a8631a" />
                <Text className="text-[#a8631a] text-[11px] font-extrabold ml-1">
                  กำลังแก้ไข
                </Text>
              </View>
            )}
          </View>

          <InlineDropdown
            label="กลุ่มความเชี่ยวชาญ"
            value={form.group_id}
            options={EXPERT_GROUPS}
            onSelect={(v) => setForm((p) => ({ ...p, group_id: v }))}
            required
            searchable
          />

          <View className="flex-row gap-[10px] px-4 pt-[14px]">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-2 bg-[#007a5a] rounded-xl py-[13px]"
              style={{ elevation: 2, opacity: saving ? 0.6 : 1 }}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name={editingItem ? "checkmark-circle" : "add-circle"}
                    size={18}
                    color="#fff"
                  />
                  <Text className="text-white text-[14px] font-black">
                    {editingItem ? "บันทึก" : "เพิ่มข้อมูล"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center gap-[6px] bg-[#fef2f2] border-[1.5px] border-[#dc2626] rounded-xl px-[18px]"
              onPress={() =>
                confirm({
                  title: "รีเซ็ตฟอร์ม",
                  message: "ต้องการเคลียร์ข้อมูลในฟอร์มหรือไม่?",
                  icon: "refresh",
                  onConfirm: openNew,
                })
              }
              activeOpacity={0.85}
            >
              <Ionicons name="refresh" size={17} color="#dc2626" />
              <Text className="text-[#dc2626] text-[14px] font-black">
                รีเซ็ท
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
      <ConfirmDialog />
    </FormContainer>
  );
};

export default ExpertiseForm;
