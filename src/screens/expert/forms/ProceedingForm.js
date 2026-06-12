import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AppHeader from "../../../components/AppHeader";
import InlineDropdown from "../../../components/expert/InlineDropdown";
import useResource from "../../../hook/useResource";

const BASE_YEAR_LIST = Array.from({ length: 2569 - 2533 + 1 }, (_, i) => ({ id: String(2569 - i), label: String(2569 - i) }));

const ProceedingForm = ({ navigation }) => {
  const { t } = useTranslation();
  const yearOptions = useMemo(() => [{ id: "", label: t("research.common.selectYear") }, ...BASE_YEAR_LIST], [t]);
  const { items, loading, saving, create, update, remove } = useResource("/proceedings");
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ year: "", reference: "", url: "" });

  const tableItems = useMemo(() => [...items].sort((a, b) => Number(b.year) - Number(a.year)), [items]);
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const openEdit = (e) => { setEditingItem(e); setForm({ year: e.year, reference: e.name ?? "", url: e.url ?? "" }); };
  const openNew = () => { setEditingItem(null); setForm({ year: "", reference: "", url: "" }); };

  const handleSave = async () => {
    if (!form.year || !form.reference.trim()) { Alert.alert(t("research.common.warning"), t("research.proceeding.validation")); return; }
    const payload = { year: form.year, name: form.reference.trim(), url: form.url.trim() };
    try {
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
      <AppHeader title="Proceeding" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40, gap: 14 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Table */}
        <View className="bg-white rounded-2xl border border-[#e8ecf0] overflow-hidden">
          <View className="flex-row items-center px-4 py-3 bg-[#f8fafb] border-b border-[#e8ecf0]">
            <Ionicons name="document-text-outline" size={16} color="#1a6b3c" />
            <Text className="text-[13px] font-semibold text-brand ml-1">{t("research.proceeding.listTitle")}</Text>
          </View>
          {loading ? (
            <View className="flex-row items-center justify-center p-7 gap-[10px]">
              <ActivityIndicator size="small" color="#1a6b3c" />
              <Text className="text-[13px] text-[#888]">{t("research.common.loading")}</Text>
            </View>
          ) : tableItems.length === 0 ? (
            <View className="items-center p-8 gap-2">
              <Ionicons name="documents-outline" size={36} color="#ccc" />
              <Text className="text-[13px] text-[#aaa]">{t("research.proceeding.noData")}</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View className="flex-row bg-[#f8fafb] py-[10px] px-[10px] border-b border-[#e8ecf0]">
                  {[{ w: 32, l: t("research.common.no") }, { w: 52, l: t("research.common.year") }, { w: 360, l: t("research.journal.colRef") }, { w: 72, l: t("research.common.editBtn") }, { w: 72, l: t("research.common.deleteBtn") }].map((c, i) => (
                    <Text key={i} className="text-[12px] font-bold text-brand" style={{ width: c.w, textAlign: "center" }}>{c.l}</Text>
                  ))}
                </View>
                {tableItems.map((entry, index) => (
                  <View key={entry.id} className="flex-row py-3 px-[10px] items-start border-b border-[#f0f4f7]" style={index % 2 === 1 ? { backgroundColor: "#fafbfc" } : {}}>
                    <Text className="text-[13px] text-[#1a1a2e] text-center leading-5" style={{ width: 32 }}>{index + 1}</Text>
                    <Text className="text-[13px] text-[#1a1a2e] text-center leading-5" style={{ width: 52 }}>{entry.year}</Text>
                    <Text className="text-[13px] text-[#1a1a2e] leading-5 px-2" style={{ width: 360 }} numberOfLines={4}>{entry.name}</Text>
                    <View className="items-center justify-center" style={{ width: 72 }}>
                      <TouchableOpacity className="bg-[#f0a500] rounded-lg px-[10px] py-[6px] min-w-[56px] items-center" onPress={() => openEdit(entry)} activeOpacity={0.8}>
                        <Text className="text-white text-[12px] font-bold">{t("research.common.editBtn")}</Text>
                      </TouchableOpacity>
                    </View>
                    <View className="items-center justify-center" style={{ width: 72 }}>
                      <TouchableOpacity className="bg-[#e53935] rounded-lg px-[10px] py-[6px] min-w-[56px] items-center" onPress={() => handleDelete(entry)} activeOpacity={0.8}>
                        <Text className="text-white text-[12px] font-bold">{t("research.common.deleteBtn")}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Form */}
        <View className="bg-white rounded-2xl border border-[#e8ecf0] overflow-hidden">
          <Text className="text-[15px] font-bold text-[#1a1a2e] text-center p-4 border-b border-[#f0f4f7]">
            {editingItem ? t("research.proceeding.editForm") : t("research.proceeding.addForm")}
          </Text>
          <InlineDropdown label="ปี:" value={form.year} options={yearOptions} onSelect={(v) => setField("year", v)} required searchable />
          <View className="h-px bg-[#f0f4f7]" />
          <View className="px-4 py-3">
            <Text className="text-[13px] font-semibold text-brand mb-[6px]">{t("research.journal.fieldRef")}<Text className="text-[#e74c3c]"> *</Text></Text>
            <TextInput className="bg-[#f8fafb] border border-[#e8ecf0] rounded-[10px] px-3 text-[13px] text-[#1a1a2e]" style={{ minHeight: 110, textAlignVertical: "top", paddingTop: 10, paddingVertical: 10 }} value={form.reference} onChangeText={(v) => setField("reference", v)} placeholder={t("research.journal.placeholderRef")} placeholderTextColor="#bbb" multiline numberOfLines={5} textAlignVertical="top" />
          </View>
          <View className="h-px bg-[#f0f4f7]" />
          <View className="px-4 py-3">
            <Text className="text-[13px] font-semibold text-brand mb-[6px]">URL:</Text>
            <TextInput className="bg-[#f8fafb] border border-[#e8ecf0] rounded-[10px] px-3 text-[13px] text-[#1a1a2e]" style={{ minHeight: 70, textAlignVertical: "top", paddingTop: 10, paddingVertical: 10 }} value={form.url} onChangeText={(v) => setField("url", v)} placeholder="https://..." placeholderTextColor="#bbb" multiline numberOfLines={2} textAlignVertical="top" autoCapitalize="none" keyboardType="url" />
          </View>
          <View className="flex-row gap-[10px] p-4">
            <TouchableOpacity className="flex-1 bg-brand rounded-[10px] py-[14px] items-center justify-center" style={{ elevation: 3, opacity: saving ? 0.65 : 1 }} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
              {saving ? <ActivityIndicator size="small" color="#fff" /> : (
                <Text className="text-white text-[13px] font-bold">{editingItem ? t("research.proceeding.saveEdit") : t("research.proceeding.saveAdd")}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#fef2f2] border border-[#dc2626] rounded-[10px] px-5 py-[14px] flex-row items-center gap-[6px]" onPress={openNew} activeOpacity={0.85}>
              <Ionicons name="refresh" size={16} color="#dc2626" />
              <Text className="text-[#dc2626] text-[13px] font-bold">{t("research.common.reset")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProceedingForm;
