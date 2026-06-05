import React from "react";
import { FlatList, Platform, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const PT = Platform.OS === "ios" ? "pt-[52px]" : `pt-[${(StatusBar.currentHeight ?? 24) + 12}px]`;

const PALETTES = [
  { colors: ["#043d2a", "#0f7a55"], icon: "megaphone-outline" },
  { colors: ["#065f46", "#10b981"], icon: "calendar-outline" },
  { colors: ["#0a6644", "#22c55e"], icon: "flask-outline" },
  { colors: ["#064e35", "#16a34a"], icon: "people-outline" },
  { colors: ["#073b30", "#0d9488"], icon: "star-outline" },
];

const getTitle = (item) => item.title || item.name || item.topic || item.message || "ข่าวสารใหม่";

const AnnouncementItem = ({ item, index }) => {
  const palette = PALETTES[index % PALETTES.length];
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-[14px] flex-row gap-3 border border-[#dce8e2]"
      activeOpacity={0.82}
    >
      <LinearGradient
        colors={item.colors ?? palette.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" }}
      >
        <Ionicons name={item.icon ?? palette.icon} size={22} color="rgba(255,255,255,0.95)" />
      </LinearGradient>

      <View className="flex-1">
        <View className="self-start bg-[#eef8f3] rounded-full px-2 py-[3px] mb-[6px]">
          <Text className="text-primary text-[10px] font-extrabold tracking-[0.3px]">{item.tag ?? "ข่าวสาร"}</Text>
        </View>
        <Text className="text-[#0d1f18] text-[14px] font-extrabold leading-5" numberOfLines={2}>{getTitle(item)}</Text>
        {!!item.sub && <Text className="text-[#5f746b] text-[12px] font-semibold leading-[17px] mt-1" numberOfLines={2}>{item.sub}</Text>}
      </View>
    </TouchableOpacity>
  );
};

export default function AnnouncementsScreen({ navigation, route }) {
  const items = route.params?.items ?? [];

  return (
    <View className="flex-1 bg-[#f0f6f2]">
      <StatusBar barStyle="light-content" backgroundColor="#0a6644" />

      <View className={`bg-[#0a6644] flex-row items-center px-4 pb-4 gap-3 ${PT}`}>
        <TouchableOpacity
          className="w-[38px] h-[38px] rounded-xl bg-white/15 items-center justify-center"
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white text-[20px] font-extrabold tracking-[-0.3px]">ข่าวสารและประกาศ</Text>
          <Text className="text-white/72 text-[12px] font-semibold mt-[2px]">{items.length} รายการ</Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item.id ?? index}`}
        renderItem={({ item, index }) => <AnnouncementItem item={item} index={index} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 36, gap: 10 }}
        ListEmptyComponent={
          <View className="items-center justify-center pt-20 gap-3">
            <Ionicons name="newspaper-outline" size={48} color="#c4d4cc" />
            <Text className="text-[14px] text-[#94a3b8]">ยังไม่มีข่าวสาร</Text>
          </View>
        }
      />
    </View>
  );
}
