import React, { useRef, useState, useMemo } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AppHeader from "../../../components/AppHeader";
import InlineDropdown from "../../../components/expert/InlineDropdown";
import FormField from "../../../components/expert/FormField";
import useResource from "../../../hook/useResource";

const currentYear = new Date().getFullYear() + 543;
const BASE_YEAR_LIST = Array.from({ length: currentYear - 2529 }, (_, i) => ({ id: String(currentYear - i), label: String(currentYear - i) }));

const WorkHistoryForm = ({ navigation, route }) => {
  const { t } = useTranslation();
  const YEAR_OPTIONS = useMemo(() => [{ id: "", label: t("research.common.selectYear") }, ...BASE_YEAR_LIST], [t]);
  const { items, create, update, remove } = useResource("/workexes");
  const item = route?.params?.item || null;
  const workplaceRef = useRef(null);

  const [editingItem, setEditingItem] = useState(item);
  const [form, setForm] = useState({ position: item?.position || "", workplace: item?.workplace || "", year_start: item?.year_start || "", year_end: item?.year_end || "" });

  const setField = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const openNew = () => { setEditingItem(null); setForm({ position: "", workplace: "", year_start: "", year_end: "" }); };
  const openEdit = (e) => { setEditingItem(e); setForm({ position: e.position, workplace: e.workplace, year_start: e.year_start, year_end: e.year_end }); };

  const handleSave = async () => {
    if (!form.position || !form.workplace || !form.year_start || !form.year_end) {
      Alert.alert(t("research.workHistory.validation")); return;
    }
    try {
      const payload = { position: form.position, workplace: form.workplace, year_start: form.year_start, year_end: form.year_end };
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
    <KeyboardAvoidingView className="flex-1 bg-[#eef2f7]" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <AppHeader title={t("research.workHistory.title")} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* List */}
        <View className="bg-white rounded-2xl border border-[#e8ecf0] p-4 mb-[14px]">
          <Text className="text-[16px] font-bold text-[#1a1a2e] mb-3">{t("research.workHistory.title")}</Text>
          {items.map((entry) => (
            <View key={entry.id} className="bg-[#f8fafb] rounded-[14px] p-[14px] mb-3 flex-row justify-between items-center">
              <View className="flex-1 pr-3">
                <Text className="text-[14px] font-bold text-[#1a1a2e] mb-1">{entry.position}</Text>
                <Text className="text-[12px] text-[#4b5563] mb-[6px]">{entry.workplace}</Text>
                <Text className="text-[11px] text-[#6b7280]">{t("research.workHistory.startLabel")} {entry.year_start} - {t("research.workHistory.endLabel")} {entry.year_end}</Text>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity className="bg-[#f8f8f8] rounded-[10px] py-[9px] px-[14px]" onPress={() => openEdit(entry)}>
                  <Text className="text-brand text-[12px] font-bold">{t("research.common.editBtn")}</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-[#fde2e6] rounded-[10px] py-[9px] px-[14px]" onPress={() => handleDelete(entry)}>
                  <Text className="text-[#c0392b] text-[12px] font-bold">{t("research.common.deleteBtn")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Form */}
        <View className="bg-white rounded-2xl border border-[#e8ecf0] p-4">
          <Text className="text-[16px] font-bold text-[#1a1a2e] mb-4">{editingItem ? t("research.workHistory.editForm") : t("research.workHistory.addForm")}</Text>
          <FormField
            label={t("research.workHistory.colPosition")}
            value={form.position}
            onChangeText={(v) => setField("position", v)}
            onSubmitEditing={() => workplaceRef.current?.focus()}
          />
          <View className="h-px bg-[#f0f4f7] my-[10px]" />
          <FormField
            ref={workplaceRef}
            label={t("research.workHistory.colPlace")}
            value={form.workplace}
            onChangeText={(v) => setField("workplace", v)}
            returnKeyType="done"
          />
          <View className="h-px bg-[#f0f4f7] my-[10px]" />
          <InlineDropdown label={t("research.workHistory.colStart")} value={form.year_start} options={YEAR_OPTIONS} onSelect={(v) => setField("year_start", v)} searchable />
          <View className="h-px bg-[#f0f4f7] my-[10px]" />
          <InlineDropdown label={t("research.workHistory.colEnd")} value={form.year_end} options={YEAR_OPTIONS} onSelect={(v) => setField("year_end", v)} searchable />
          <View className="flex-row justify-between gap-3 mt-5">
            <TouchableOpacity className="flex-1 min-w-[160px] bg-[#14532d] rounded-xl py-[14px] items-center" onPress={handleSave}>
              <Text className="text-white text-[14px] font-semibold">{editingItem ? t("research.common.saveEdit") : t("research.workHistory.addForm")}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 min-w-[120px] bg-[#fef2f2] border border-[#dc2626] rounded-xl py-[14px] flex-row items-center gap-[6px] justify-center" onPress={() => editingItem ? openEdit(editingItem) : openNew()}>
              <Ionicons name="refresh" size={16} color="#dc2626" />
              <Text className="text-[#dc2626] text-[14px] font-semibold">{t("research.common.reset")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default WorkHistoryForm;
