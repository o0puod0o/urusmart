import React, { useEffect, useState } from "react";
import { Platform, ScrollView, StatusBar, Switch, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@notif_settings";
const pt = Platform.OS === "ios" ? 54 : (StatusBar.currentHeight ?? 24) + 10;

const DEFAULT = { beforeClass: true, holiday: true, gradeDeadline: true, announcement: false };
const ITEMS = [
  { key: "beforeClass", icon: "alarm-outline",          iconBg: "#2167b2", title: "แจ้งเตือนก่อนสอน",            sub: "ล่วงหน้า 15 นาที" },
  { key: "holiday",     icon: "calendar-clear-outline",  iconBg: "#c95b05", title: "วันหยุดราชการ",               sub: "แจ้งเตือนวันก่อน" },
  { key: "gradeDeadline",icon: "document-text-outline",  iconBg: "#7c3aed", title: "ส่งเกรด",                     sub: "ก่อนครบกำหนด 3 วัน" },
  { key: "announcement",icon: "megaphone-outline",       iconBg: "#1a6b3c", title: "ประกาศจากมหาวิทยาลัย",       sub: "" },
];

export default function NotificationSettingPage() {
  const navigation = useNavigation();
  const [settings, setSettings] = useState(DEFAULT);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setSettings({ ...DEFAULT, ...JSON.parse(raw) });
    });
  }, []);

  const toggle = async (key) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <View className="flex-1 bg-[#f0f4f1]">
      <StatusBar barStyle="light-content" backgroundColor="#14532d" />

      <View className="bg-brand flex-row items-center justify-between px-4 pb-[14px]" style={{ paddingTop: pt }}>
        <TouchableOpacity className="w-9 h-9 rounded-full bg-white/20 items-center justify-center" onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text className="text-[17px] font-extrabold text-white">การแจ้งเตือน</Text>
        <View className="w-9" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-[12px] font-bold text-[#8a9a90] px-5 pt-5 pb-2 uppercase tracking-[0.8px]">การแจ้งเตือน</Text>

        <View className="bg-white rounded-2xl mx-4 overflow-hidden border border-[#e0ebe4]">
          {ITEMS.map((item, i) => (
            <View key={item.key} className={`flex-row items-center gap-[14px] px-4 py-[14px] ${i < ITEMS.length - 1 ? "border-b border-[#e0ebe4]" : ""}`}>
              <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: item.iconBg }}>
                <Ionicons name={item.icon} size={20} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-[#101b17]">{item.title}</Text>
                {!!item.sub && <Text className="text-[12px] font-medium text-[#5a6a60] mt-[2px]">{item.sub}</Text>}
              </View>
              <Switch value={settings[item.key]} onValueChange={() => toggle(item.key)} trackColor={{ false: "#dfe8e3", true: "#1a6b3c" }} thumbColor="#fff" ios_backgroundColor="#dfe8e3" />
            </View>
          ))}
        </View>

        <View className="flex-row items-start gap-2 bg-[#e8f5ee] rounded-[14px] mx-4 mt-4 p-[14px] border border-[#e0ebe4]">
          <Ionicons name="information-circle-outline" size={16} color="#1a6b3c" />
          <Text className="flex-1 text-[12px] text-[#5a6a60] leading-[18px]">กรุณาเปิดการแจ้งเตือนในการตั้งค่าของอุปกรณ์ด้วย</Text>
        </View>
      </ScrollView>
    </View>
  );
}
