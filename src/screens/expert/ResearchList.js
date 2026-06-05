import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function ResearchList({ navigation, route }) {
  const { t } = useTranslation();
  const { title, icon = "document-text-outline" } = route?.params || {};

  return (
    <SafeAreaView className="flex-1 bg-[#f0f6f2]">
      <View className="flex-row items-center justify-between px-4 py-[14px] bg-white border-b border-[#dce8e2]">
        <TouchableOpacity className="w-8 h-8 items-center justify-center" onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <Ionicons name="chevron-back" size={24} color="#0f7a55" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[17px] font-extrabold text-[#111c18]">{title ?? t("research.list.title")}</Text>
        <View className="w-8" />
      </View>

      <View className="flex-1 p-4">
        <View className="items-center justify-center bg-white rounded-2xl border border-[#dce8e2] p-6 min-h-[180px]">
          <Ionicons name={icon} size={34} color="#0f7a55" />
          <Text className="mt-3 text-[16px] font-extrabold text-[#111c18]">{t("research.list.noData")}</Text>
          <Text className="mt-[6px] text-center text-[13px] font-semibold text-[#4a5e56] leading-5">{t("research.list.desc")}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
