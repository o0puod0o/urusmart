import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AppHeader from "../../../components/AppHeader";
import InlineDropdown from "../../../components/expert/InlineDropdown";
import useResource from "../../../hook/useResource";

const InterestForm = ({ navigation }) => {
  const { t } = useTranslation();
  const { items, loading: loadingOptions, create, remove } = useResource("/interests");
  const [selectedInterest, setSelectedInterest] = useState("");
  const [customInterest, setCustomInterest] = useState("");

  const interestOptions = items.map((d) => ({ id: String(d.id), label: d.title ?? d.name ?? "" }));

  const handleAdd = async () => {
    const title = selectedInterest
      ? interestOptions.find((o) => o.id === selectedInterest)?.label
      : customInterest.trim();
    if (!title) { Alert.alert(t("research.interest.validation")); return; }
    if (items.some((item) => (item.title ?? item.name ?? "").toLowerCase() === title.toLowerCase())) {
      Alert.alert(t("research.interest.duplicate")); return;
    }
    try { await create({ title }); } catch { Alert.alert(t("research.common.saveFail"), t("research.common.apiError")); }
    setSelectedInterest(""); setCustomInterest("");
  };

  const handleDelete = (entry) => {
    Alert.alert(t("research.common.deleteTitle"), t("research.common.deleteConfirm"), [
      { text: t("research.common.cancel"), style: "cancel" },
      { text: t("research.common.deleteBtn"), style: "destructive", onPress: async () => { try { await remove(entry.id); } catch { Alert.alert(t("research.common.deleteFail")); } } },
    ]);
  };

  return (
    <View className="flex-1 bg-[#eef2f7]">
      <AppHeader title={t("research.interest.title")} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40, gap: 14 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* List */}
        <View className="bg-white rounded-2xl border border-[#e8ecf0] overflow-hidden">
          <View className="flex-row items-center px-4 py-3 bg-[#f8fafb] border-b border-[#e8ecf0]">
            <Ionicons name="star-outline" size={16} color="#1a6b3c" />
            <Text className="text-[13px] font-semibold text-brand ml-1">{t("research.interest.listHeader")}</Text>
          </View>
          <View className="flex-row items-center px-4 py-[10px] bg-[#f0faf4] border-b border-[#e8ecf0]">
            <Text className="text-[12px] font-bold text-brand" style={{ width: 50 }}>{t("research.interest.colNo")}</Text>
            <Text className="text-[12px] font-bold text-brand flex-1">{t("research.interest.colTitle")}</Text>
            <Text className="text-[12px] font-bold text-brand text-center" style={{ width: 60 }}>{t("research.common.deleteBtn")}</Text>
          </View>
          {items.length === 0 ? (
            <View className="items-center p-8 gap-2">
              <Ionicons name="star-outline" size={36} color="#ccc" />
              <Text className="text-[13px] text-[#aaa]">{t("research.interest.noData")}</Text>
            </View>
          ) : items.map((entry, index) => (
            <View key={entry.id} className="flex-row items-center px-4 py-3 border-b border-[#f0f4f7]" style={index % 2 === 1 ? { backgroundColor: "#fafbfc" } : {}}>
              <Text className="text-[13px] text-[#888] text-center leading-5" style={{ width: 50 }}>{index + 1}</Text>
              <Text className="text-[13px] text-[#1a1a2e] leading-5 flex-1">{entry.title}</Text>
              <View className="items-center" style={{ width: 60 }}>
                <TouchableOpacity className="bg-[#e53935] rounded-lg px-[10px] py-[6px] min-w-12 items-center" onPress={() => handleDelete(entry)} activeOpacity={0.8}>
                  <Text className="text-white text-[12px] font-bold">{t("research.common.deleteBtn")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Form */}
        <View className="bg-white rounded-2xl border border-[#e8ecf0] overflow-hidden">
          <View className="flex-row items-center px-4 py-3 bg-[#f8fafb] border-b border-[#e8ecf0]">
            <Ionicons name="add-circle-outline" size={16} color="#1a6b3c" />
            <Text className="text-[13px] font-semibold text-brand ml-1">{t("research.interest.addHeader")}</Text>
          </View>
          <InlineDropdown
            label={t("research.interest.selectExisting")}
            value={selectedInterest}
            options={[{ id: "", label: t("research.interest.selectPlaceholder") }, ...interestOptions.filter((o) => o.id !== "")]}
            onSelect={(v) => { setSelectedInterest(v); setCustomInterest(""); }}
            loading={loadingOptions}
          />
          <View className="h-px bg-[#f0f4f7]" />
          <View className="flex-row items-center gap-2 px-4 py-3">
            <View className="flex-1 h-px bg-[#e8ecf0]" />
            <Text className="text-[12px] text-[#666] font-semibold">{t("research.interest.orManual")}</Text>
            <View className="flex-1 h-px bg-[#e8ecf0]" />
          </View>
          <View className="h-px bg-[#f0f4f7]" />
          <View className="px-4 py-3">
            <Text className="text-[13px] font-semibold text-brand mb-[6px]">{t("research.interest.fieldLabel")}</Text>
            <TextInput
              className="bg-[#f8fafb] border border-[#e8ecf0] rounded-[10px] px-3 text-[13px] text-[#1a1a2e]"
              style={{ minHeight: 110, textAlignVertical: "top", paddingTop: 10, paddingVertical: 10 }}
              value={customInterest}
              onChangeText={(v) => { setCustomInterest(v); setSelectedInterest(""); }}
              placeholder={t("research.interest.placeholder")}
              placeholderTextColor="#bbb"
              multiline numberOfLines={5} textAlignVertical="top"
            />
          </View>
          <View className="flex-row gap-[10px] p-4">
            <TouchableOpacity className="flex-1 bg-brand rounded-[10px] py-[14px] items-center justify-center" style={{ elevation: 3 }} onPress={handleAdd} activeOpacity={0.85}>
              <Text className="text-white text-[13px] font-bold">{t("research.interest.addForm")}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#fef2f2] border border-[#dc2626] rounded-[10px] px-5 py-[14px] flex-row items-center gap-[6px]" onPress={() => { setSelectedInterest(""); setCustomInterest(""); }} activeOpacity={0.85}>
              <Ionicons name="refresh" size={16} color="#dc2626" />
              <Text className="text-[#dc2626] text-[13px] font-bold">{t("research.common.reset")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default InterestForm;
