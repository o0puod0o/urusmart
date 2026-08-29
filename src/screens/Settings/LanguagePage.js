import React, { useState } from "react";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { changeLanguage } from "../../i18n/i18n";
const LANGUAGES = [
  { code: "th", label: "ภาษาไทย",  nativeLabel: "Thai",    flag: "🇹🇭" },
  { code: "en", label: "English",   nativeLabel: "อังกฤษ", flag: "🇬🇧" },
];

export default function LanguagePage() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { top } = useSafeAreaInsets();
  const [selected, setSelected] = useState(i18n.language);

  const handleSelect = async (code) => {
    setSelected(code);
    await changeLanguage(code);
  };

  return (
    <View className="flex-1 bg-[#eaf5ef]">
      <StatusBar barStyle="light-content" backgroundColor="#0f7a55" />

      <View className="bg-primary flex-row items-center justify-between px-4 pb-[14px]" style={{ paddingTop: top + 10 }}>
        <TouchableOpacity className="w-9 h-9 rounded-full bg-white/20 items-center justify-center" onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text className="text-[17px] font-extrabold text-white">{t("language.title")}</Text>
        <View className="w-9" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-[12px] font-bold text-[#4a5c54] px-5 pt-5 pb-2 uppercase tracking-[0.8px]">{t("language.select")}</Text>

        <View className="bg-white rounded-2xl mx-4 overflow-hidden border border-[#e0ebe4]">
          {LANGUAGES.map((lang, i) => {
            const active = selected === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                className={`flex-row items-center gap-[14px] px-4 py-4 ${i < LANGUAGES.length - 1 ? "border-b border-[#e0ebe4]" : ""} ${active ? "bg-[#e8f5ee]" : ""}`}
                onPress={() => handleSelect(lang.code)}
                activeOpacity={0.7}
              >
                <Text className="text-[32px]">{lang.flag}</Text>
                <View className="flex-1">
                  <Text className={`text-[16px] font-bold ${active ? "text-brand" : "text-[#1a1a2e]"}`}>{lang.label}</Text>
                  <Text className="text-[12px] text-[#4a5c54] mt-[2px]">{lang.nativeLabel}</Text>
                </View>
                {active
                  ? <Ionicons name="checkmark-circle" size={24} color="#1a6b3c" />
                  : <View className="w-6" />
                }
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="flex-row items-start gap-2 bg-[#e8f5ee] rounded-[14px] mx-4 mt-4 p-[14px] border border-[#e0ebe4]">
          <Ionicons name="information-circle-outline" size={16} color="#1a6b3c" />
          <Text className="flex-1 text-[12px] text-[#4a5c54] leading-[18px]">{t("language.note")}</Text>
        </View>
      </ScrollView>
    </View>
  );
}
