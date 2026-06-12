import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AppHeader from "../../../components/AppHeader";
import InlineDropdown from "../../../components/expert/InlineDropdown";
import useResource from "../../../hook/useResource";

const currentThaiYear = new Date().getFullYear() + 543;
const BASE_YEAR_LIST = Array.from({ length: currentThaiYear - 2532 }, (_, i) => ({ id: String(currentThaiYear - i), label: String(currentThaiYear - i) }));
const INIT_FORM = { year: "", title: "" };

const TrainingForm = ({ navigation }) => {
  const { t } = useTranslation();
  const YEAR_OPTIONS = useMemo(() => [{ id: "", label: t("research.common.selectYear") }, ...BASE_YEAR_LIST], [t]);
  const { items, loading, saving, create, update, remove } = useResource("/trainings");
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(INIT_FORM);

  const tableItems = useMemo(() => [...items].sort((a, b) => Number(b.year) - Number(a.year)), [items]);
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const openEdit = (e) => { setEditingItem(e); setForm({ year: e.year, title: e.name ?? "" }); };
  const openNew = () => { setEditingItem(null); setForm(INIT_FORM); };

  const handleSave = async () => {
    if (!form.year || !form.title.trim()) { Alert.alert(t("research.common.warning"), t("research.training.validation")); return; }
    try {
      const payload = { year: form.year, name: form.title.trim() };
      editingItem ? await update(editingItem.id, payload) : await create(payload);
      Alert.alert(editingItem ? t("research.common.editSuccess") : t("research.common.addSuccess"), t("research.common.savedMsg"));
      openNew();
    } catch (err) { Alert.alert(t("research.common.saveFail"), err.message ?? t("research.common.apiError")); }
  };

  const handleDelete = (entry) => {
    const doDelete = async () => { try { await remove(entry.id); } catch (err) { Alert.alert(t("research.common.deleteFail"), err.message); } };
    if (Platform.OS === "web") {
      if (window.confirm(t("research.common.deleteConfirm"))) doDelete();
    } else {
      Alert.alert(t("research.common.deleteTitle"), t("research.common.deleteConfirm"), [
        { text: t("research.common.cancel"), style: "cancel" },
        { text: t("research.common.deleteBtn"), style: "destructive", onPress: doDelete },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#f5f7f8]" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <AppHeader title={t("research.training.heroTitle")} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 18, paddingBottom: 60 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View className="flex-row items-center bg-white border border-[#eef1f4] rounded-2xl px-[14px] py-[14px] mb-4" style={{ elevation: 1 }}>
          <View className="w-11 h-11 rounded-xl bg-[#e6f4ef] items-center justify-center mr-3">
            <Ionicons name="clipboard" size={22} color="#007a5a" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-[#6b7a82] uppercase tracking-[0.8px]">{t("research.award.heroEyebrow")}</Text>
            <Text className="text-[16px] font-black text-[#3f4d50] mt-[2px]">{t("research.training.heroTitle")}</Text>
          </View>
          <View className="bg-[#007a5a] rounded-full min-w-9 px-[10px] py-[5px] items-center">
            <Text className="text-white text-[13px] font-black">{items.length}</Text>
          </View>
        </View>

        {/* Table */}
        <View className="bg-white border border-[#eef1f4] rounded-2xl overflow-hidden mb-4" style={{ elevation: 1 }}>
          <View className="flex-row items-center bg-[#e6f4ef] border-b border-[#eef1f4] px-[14px] py-[11px]">
            <Ionicons name="list-outline" size={16} color="#00614a" />
            <Text className="text-[13px] font-extrabold text-[#00614a] ml-2">{t("research.training.listTitle")}</Text>
          </View>
          {loading ? (
            <View className="flex-row items-center justify-center py-9 gap-[10px]">
              <ActivityIndicator size="small" color="#007a5a" />
              <Text className="text-[13px] text-[#6b7a82]">{t("research.common.loading")}</Text>
            </View>
          ) : tableItems.length === 0 ? (
            <View className="items-center px-5 py-9">
              <Ionicons name="folder-open-outline" size={42} color="#9aa6b1" />
              <Text className="text-[14px] font-bold text-[#1f2a2e] mt-[10px]">{t("research.training.noData")}</Text>
              <Text className="text-[12px] text-[#6b7a82] mt-1">{t("research.common.addBelow")}</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ minWidth: 720 }}>
                <View className="flex-row items-center bg-white border-b border-[#e3e7eb] px-3 py-3">
                  {[{ w: 40, l: t("research.common.no") }, { w: 90, l: t("research.common.year") }, { w: 480, l: t("research.training.colTitle") }, { w: 90, l: t("research.common.manage") }].map((c, i) => (
                    <Text key={i} className="text-[11px] font-extrabold text-[#6b7a82] uppercase tracking-[0.5px] px-1" style={{ width: c.w }}>{c.l}</Text>
                  ))}
                </View>
                {tableItems.map((entry, index) => (
                  <View key={entry.id} className="flex-row items-center px-3 py-3 border-b border-[#eef1f4]" style={index % 2 === 1 ? { backgroundColor: "#fafbfc" } : {}}>
                    <Text className="text-[14px] font-bold text-[#1f2a2e] text-center px-1" style={{ width: 40 }}>{index + 1}</Text>
                    <View style={{ width: 90 }}>
                      <View className="self-start bg-[#e6f4ef] rounded-full px-[10px] py-1">
                        <Text className="text-[#00614a] text-[12px] font-extrabold">{entry.year}</Text>
                      </View>
                    </View>
                    <Text className="text-[14px] font-semibold text-[#1f2a2e] leading-5 px-1" style={{ width: 480 }} numberOfLines={3}>{entry.name}</Text>
                    <View className="flex-row gap-[6px] justify-center" style={{ width: 90 }}>
                      <TouchableOpacity className="w-[34px] h-[34px] rounded-lg bg-[#fff4e0] items-center justify-center" onPress={() => openEdit(entry)} activeOpacity={0.8}>
                        <Ionicons name="create-outline" size={17} color="#a8631a" />
                      </TouchableOpacity>
                      <TouchableOpacity className="w-[34px] h-[34px] rounded-lg bg-[#fde7e7] items-center justify-center" onPress={() => handleDelete(entry)} activeOpacity={0.8}>
                        <Ionicons name="trash-outline" size={17} color="#df4c4b" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Form */}
        <View className="bg-white border border-[#eef1f4] rounded-2xl pt-[14px] pb-[18px]" style={{ elevation: 1 }}>
          <View className="flex-row items-center justify-between border-b border-[#eef1f4] pb-3 px-4 mb-2">
            <View className="flex-row items-center">
              <Ionicons name={editingItem ? "create" : "add-circle"} size={18} color="#007a5a" />
              <Text className="text-[15px] font-black text-[#3f4d50] ml-2">{editingItem ? t("research.training.editForm") : t("research.training.addForm")}</Text>
            </View>
            {editingItem && (
              <View className="flex-row items-center bg-[#fff4e0] rounded-full px-[10px] py-1">
                <Ionicons name="create-outline" size={13} color="#a8631a" />
                <Text className="text-[#a8631a] text-[11px] font-extrabold ml-1">{t("research.common.editing")}</Text>
              </View>
            )}
          </View>
          <InlineDropdown label={`${t("research.common.year")}:`} value={form.year} options={YEAR_OPTIONS} onSelect={(v) => setField("year", v)} required searchable />
          <View className="px-4 py-2">
            <Text className="text-[13px] font-extrabold text-[#3f4d50] mb-[6px]">{t("research.training.fieldLabel")}:<Text className="text-[#d83a36]"> *</Text></Text>
            <TextInput className="bg-white border border-[#e3e7eb] rounded-[10px] px-[14px] py-[10px] text-[14px] text-[#1f2a2e]" style={{ minHeight: 46 }} value={form.title} onChangeText={(v) => setField("title", v)} placeholder={t("research.training.placeholder")} placeholderTextColor="#9aa6b1" returnKeyType="done" blurOnSubmit />
          </View>
          <View className="flex-row gap-[10px] px-4 pt-[14px]">
            <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 bg-[#007a5a] rounded-xl min-h-[50px]" style={{ elevation: 2, opacity: saving ? 0.6 : 1 }} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
              {saving ? <ActivityIndicator size="small" color="#fff" /> : (
                <>
                  <Ionicons name={editingItem ? "checkmark-circle" : "add-circle"} size={18} color="#fff" />
                  <Text className="text-white text-[14px] font-black">{editingItem ? t("research.common.saveEdit") : t("research.common.addData")}</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center gap-[6px] bg-[#fef2f2] border-[1.5px] border-[#dc2626] rounded-xl min-h-[50px] px-[18px]" onPress={openNew} activeOpacity={0.85}>
              <Ionicons name="refresh" size={17} color="#dc2626" />
              <Text className="text-[#dc2626] text-[14px] font-black">{t("research.common.reset")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default TrainingForm;
