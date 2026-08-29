import React from "react";
import { Linking, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ContactUsPage() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { top } = useSafeAreaInsets();

  const SECTIONS = [
    {
      title: t("contact.support"),
      items: [
        { icon: "call-outline",  iconBg: "#2167b2", label: t("contact.phone"), value: "090-323-4567",      onPress: () => Linking.openURL("tel:090-323-4567") },
        { icon: "mail-outline",  iconBg: "#7c3aed", label: t("contact.email"), value: "support@uru.ac.th", onPress: () => Linking.openURL("mailto:support@uru.ac.th") },
      ],
    },
    {
      title: t("contact.workHours"),
      items: [
        { icon: "time-outline",           iconBg: "#c95b05", label: t("contact.weekdays"), value: t("contact.weekdaysHours"), onPress: null },
        { icon: "calendar-clear-outline", iconBg: "#c81e1e", label: t("contact.holiday"),  value: t("contact.holidayValue"), onPress: null },
      ],
    },
    {
      title: t("contact.other"),
      items: [
        { icon: "globe-outline",    iconBg: "#1a6b3c", label: t("contact.website"),  value: "www.uru.ac.th",          onPress: () => Linking.openURL("https://www.uru.ac.th") },
        { icon: "location-outline", iconBg: "#1a6b3c", label: t("contact.location"), value: t("contact.locationValue"), onPress: () => Linking.openURL("https://maps.app.goo.gl/vCDDKADLTq1mhVm19") },
      ],
    },
  ];

  return (
    <View className="flex-1 bg-[#eaf5ef]">
      <StatusBar barStyle="light-content" backgroundColor="#0f7a55" />

      <View className="bg-primary flex-row items-center justify-between px-4 pb-[14px]" style={{ paddingTop: top + 10 }}>
        <TouchableOpacity className="w-9 h-9 rounded-full bg-white/20 items-center justify-center" onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text className="text-[17px] font-extrabold text-white">{t("contact.title")}</Text>
        <View className="w-9" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {SECTIONS.map((section) => (
          <View key={section.title}>
            <Text className="text-[12px] font-bold text-[#4a5c54] px-5 pt-5 pb-2 uppercase tracking-[0.8px]">{section.title}</Text>
            <View className="bg-white rounded-2xl mx-4 overflow-hidden border border-[#e0ebe4]">
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  className={`flex-row items-center gap-[14px] px-4 py-[14px] ${i < section.items.length - 1 ? "border-b border-[#e0ebe4]" : ""}`}
                  onPress={item.onPress ?? undefined}
                  activeOpacity={item.onPress ? 0.7 : 1}
                  disabled={!item.onPress}
                >
                  <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: item.iconBg }}>
                    <Ionicons name={item.icon} size={20} color="#fff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[12px] font-semibold text-[#4a5c54]">{item.label}</Text>
                    <Text className={`text-[15px] font-bold mt-[2px] ${item.onPress ? "text-brand" : "text-[#101b17]"}`}>{item.value}</Text>
                  </View>
                  {item.onPress && <Ionicons name="chevron-forward" size={16} color="#8a9a90" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View className="flex-row items-start gap-2 bg-[#e8f5ee] rounded-[14px] mx-4 mt-4 p-[14px] border border-[#e0ebe4]">
          <Ionicons name="information-circle-outline" size={16} color="#1a6b3c" />
          <Text className="flex-1 text-[12px] text-[#4a5c54] leading-[18px]">{t("contact.helpNote")}</Text>
        </View>
      </ScrollView>
    </View>
  );
}
