import React, { useState, useMemo } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AppHeader from "../../../components/AppHeader";
import InlineDropdown from "../../../components/expert/InlineDropdown";
import useResource from "../../../hook/useResource";
import useRefs from "../../../hook/useRefs";

const BASE_YEAR_LIST = Array.from({ length: 2569 - 2533 + 1 }, (_, i) => {
  const y = 2569 - i;
  return { id: String(y), label: String(y) };
});

const COL = { no: 28, year: 40, type: 76, pmu: 36, level: 40, edit: 44, del: 32 };

const ResearchForm = ({ navigation }) => {
  const { t } = useTranslation();
  const YEAR_OPTIONS = useMemo(() => [{ id: "", label: t("research.common.selectYear") }, ...BASE_YEAR_LIST], [t]);
  const { items, saving, create, update, remove } = useResource("/researches");
  const { researchTypes, loading: loadingTypes } = useRefs();
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ year: "", title: "", type: "", pmu: "", level: "" });

  const typeOptions = [
    { id: "", label: t("research.researchForm.typePlaceholder") },
    ...researchTypes.map((d) => ({ id: String(d.id), label: d.name ?? d.label ?? "" })),
  ];

  const setField = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const openEdit = (entry) => { setEditingItem(entry); setForm({ year: entry.year, title: entry.title, type: entry.type, pmu: entry.pmu, level: entry.level }); };
  const openNew = () => { setEditingItem(null); setForm({ year: "", title: "", type: "", pmu: "", level: "" }); };

  const handleSave = async () => {
    if (!form.year || !form.title.trim()) { Alert.alert(t("research.common.warning"), t("research.researchForm.validation")); return; }
    try {
      editingItem ? await update(editingItem.id, form) : await create(form);
      Alert.alert(editingItem ? t("research.common.editSuccess") : t("research.common.addSuccess"), t("research.common.savedMsg"));
      openNew();
    } catch { Alert.alert(t("research.common.saveFail"), t("research.common.apiError")); }
  };

  const handleDelete = (entry) => {
    Alert.alert(t("research.common.deleteTitle"), t("research.common.deleteConfirm"), [
      { text: t("research.common.cancel"), style: "cancel" },
      { text: t("research.common.deleteBtn"), style: "destructive", onPress: async () => { try { await remove(entry.id); } catch { Alert.alert(t("research.common.deleteFail")); } } },
    ]);
  };

  return (
    <View className="flex-1 bg-[#eef2f7]">
      <AppHeader title={t("research.researchForm.title")} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40, gap: 14 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Table */}
        <View className="bg-white rounded-2xl border border-[#e8ecf0] overflow-hidden">
          <View className="bg-[#f8fafb] border-b border-[#e8ecf0] px-4 py-3">
            <Text className="text-[14px] font-bold text-primary">{t("research.researchForm.editForm")}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View className="flex-row items-center bg-[#f0faf4] px-[10px] py-[10px] border-b border-[#e8ecf0] gap-1">
                {[{ w: COL.no, label: t("research.common.no") }, { w: COL.year, label: t("research.common.year") }, { flex: 1, minW: 160, label: t("research.researchForm.colTitle") }, { w: COL.type, label: t("research.researchForm.colType") }, { w: COL.pmu, label: t("research.researchForm.colPmu") }, { w: COL.level, label: t("research.researchForm.colLevel") }, { w: COL.edit, label: t("research.common.editBtn") }, { w: COL.del, label: t("research.common.deleteBtn") }].map((col, i) => (
                  <Text key={i} className="text-[11px] font-bold text-primary text-center" style={col.flex ? { flex: 1, minWidth: col.minW } : { width: col.w }}>{col.label}</Text>
                ))}
              </View>
              {items.length === 0 ? (
                <Text className="text-center text-[#aaa] text-[13px] p-6">{t("research.researchForm.noData")}</Text>
              ) : items.map((entry, index) => (
                <View key={entry.id} className="flex-row items-center px-[10px] py-[10px] border-b border-[#f0f4f7] gap-1" style={index % 2 === 0 ? { backgroundColor: "#f8fafb" } : {}}>
                  <Text className="text-[11px] text-[#1a1a2e] text-center" style={{ width: COL.no }}>{index + 1}</Text>
                  <Text className="text-[11px] text-[#1a1a2e] text-center" style={{ width: COL.year }}>{entry.year}</Text>
                  <Text className="text-[11px] text-[#1a1a2e]" style={{ flex: 1, minWidth: 160 }} numberOfLines={3}>{entry.title}</Text>
                  <Text className="text-[11px] text-primary text-center" style={{ width: COL.type }}>{entry.type}</Text>
                  <Text className="text-[11px] text-[#1a1a2e] text-center" style={{ width: COL.pmu }}>{entry.pmu}</Text>
                  <Text className="text-[11px] text-[#1a1a2e] text-center" style={{ width: COL.level }}>{entry.level}</Text>
                  <TouchableOpacity className="rounded-[6px] py-[5px] items-center justify-center bg-[#fff3cd]" style={{ width: COL.edit }} onPress={() => openEdit(entry)}>
                    <Text className="text-[10px] font-bold text-[#856404]">{t("research.common.editBtn")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="rounded-[6px] py-[5px] items-center justify-center bg-[#fde2e6]" style={{ width: COL.del }} onPress={() => handleDelete(entry)}>
                    <Text className="text-[10px] font-bold text-[#c0392b]">{t("research.common.deleteBtn")}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Form */}
        <View className="bg-white rounded-2xl border border-[#e8ecf0] overflow-hidden">
          <Text className="text-[15px] font-bold text-[#1a1a2e] text-center p-4 border-b border-[#f0f4f7]">
            {editingItem ? t("research.researchForm.editForm") : t("research.researchForm.addForm")}
          </Text>
          <InlineDropdown label={`${t("research.common.year")}:`} value={form.year} options={YEAR_OPTIONS} onSelect={(v) => setField("year", v)} required />
          <View className="h-px bg-[#f0f4f7]" />
          <View className="px-4 py-3">
            <Text className="text-[13px] font-semibold text-brand mb-[6px]">{t("research.researchForm.fieldTitle")} <Text className="text-[#e74c3c]">*</Text></Text>
            <TextInput className="bg-[#f8fafb] border border-[#e8ecf0] rounded-[10px] px-3 py-[10px] text-[13px] text-[#1a1a2e]" style={{ minHeight: 110, textAlignVertical: "top", paddingTop: 10 }} placeholder={t("research.researchForm.placeholderTitle")} placeholderTextColor="#bbb" value={form.title} onChangeText={(v) => setField("title", v)} multiline numberOfLines={3} textAlignVertical="top" />
          </View>
          <View className="h-px bg-[#f0f4f7]" />
          {loadingTypes ? (
            <View className="flex-row items-center gap-[10px] px-4 py-[14px]">
              <ActivityIndicator size="small" color="#0f7a55" />
              <Text className="text-[13px] text-[#888]">{t("research.researchForm.loadingTypes")}</Text>
            </View>
          ) : (
            <InlineDropdown label={t("research.researchForm.fieldType")} value={form.type} options={typeOptions} onSelect={(v) => setField("type", v)} />
          )}
          <View className="flex-row gap-[10px] p-4">
            <TouchableOpacity className="flex-1 bg-brand rounded-[10px] py-[14px] items-center justify-center" style={{ elevation: 3 }} onPress={handleSave} activeOpacity={0.85}>
              <Text className="text-white text-[13px] font-bold">{editingItem ? t("research.common.saveEdit") : t("research.researchForm.addForm")}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#fef2f2] border border-[#dc2626] rounded-[10px] px-5 py-[14px] flex-row items-center gap-[6px]" onPress={openNew} activeOpacity={0.8}>
              <Ionicons name="refresh" size={16} color="#dc2626" />
              <Text className="text-[#dc2626] text-[13px] font-bold">{t("research.common.reset")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ResearchForm;
