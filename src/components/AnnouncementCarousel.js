import React, { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const CARD_GAP = 12;
const PALETTES = [
  { colors: ["#043d2a", "#0f7a55"], icon: "megaphone-outline" },
  { colors: ["#065f46", "#10b981"], icon: "calendar-outline" },
  { colors: ["#0a6644", "#22c55e"], icon: "flask-outline" },
  { colors: ["#064e35", "#16a34a"], icon: "people-outline" },
  { colors: ["#073b30", "#0d9488"], icon: "star-outline" },
];

export default function AnnouncementCarousel({ items = [], onViewAll, onPressItem }) {
  const { width } = useWindowDimensions();
  const announcements = Array.isArray(items) ? items : [];

  const cardWidth = useMemo(() => {
    if (width >= 900) return Math.min(340, width * 0.34);
    if (width >= 600) return Math.min(300, width * 0.45);
    return Math.min(268, width * 0.68);
  }, [width]);

  const getTitle = (item) => item.title || item.name || item.topic || item.message || "ข่าวสารใหม่";

  return (
    <LinearGradient colors={["#043d2a", "#065f46"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: "100%", paddingTop: 16, paddingBottom: 20, overflow: "hidden" }}>
      <View className="absolute w-[220px] h-[220px] rounded-full bg-white/[0.04]" style={{ top: -80, right: -60 }} />
      <View className="absolute w-[150px] h-[150px] rounded-full bg-white/[0.03]" style={{ bottom: -50, left: -40 }} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-[18px] mb-[14px]">
        <View className="flex-row items-center gap-2">
          <View className="w-1 h-5 rounded-[2px] bg-[#4ade80]" />
          <Text className="text-white text-[16px] font-extrabold tracking-[-0.3px]">ข่าวสารและประกาศ</Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center gap-[3px] bg-white/[0.12] rounded-full px-3 py-[5px] border border-white/[0.18]"
          activeOpacity={0.75}
          onPress={onViewAll}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Text className="text-white/85 text-[12px] font-bold">ดูทั้งหมด</Text>
          <Ionicons name="chevron-forward" size={13} color="rgba(255,255,255,0.75)" />
        </TouchableOpacity>
      </View>

      {/* Cards */}
      {announcements.length === 0 ? (
        <View className="items-center justify-center py-7 gap-2">
          <Ionicons name="newspaper-outline" size={32} color="rgba(255,255,255,0.4)" />
          <Text className="text-white/50 text-[13px]">ยังไม่มีข่าวสาร</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: CARD_GAP, alignItems: "flex-start" }}
          decelerationRate="fast"
          snapToInterval={cardWidth + CARD_GAP}
          snapToAlignment="start"
        >
          {announcements.map((item, index) => {
            const palette = PALETTES[index % PALETTES.length];
            return (
              <TouchableOpacity key={`${item.id ?? index}`} activeOpacity={0.88} onPress={() => onPressItem?.(item)} style={{ width: cardWidth }}>
                <LinearGradient
                  colors={item.colors ?? palette.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ height: 158, borderRadius: 18, padding: 16, overflow: "hidden", justifyContent: "space-between", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}
                >
                  <View className="absolute w-[110px] h-[110px] rounded-full bg-white/[0.08]" style={{ top: -30, right: -20 }} />
                  <View className="absolute w-[70px] h-[70px] rounded-full bg-white/[0.05]" style={{ bottom: -20, left: -10 }} />

                  <View className="flex-row items-center justify-between">
                    <View className="bg-white/20 rounded-full px-[10px] py-1 border border-white/[0.28]">
                      <Text className="text-white text-[10px] font-extrabold tracking-[0.4px]">{item.tag ?? "ข่าวสาร"}</Text>
                    </View>
                    <View className="w-[34px] h-[34px] rounded-[17px] bg-white/15 border border-white/[0.22] items-center justify-center">
                      <Ionicons name={item.icon ?? palette.icon} size={18} color="rgba(255,255,255,0.9)" />
                    </View>
                  </View>

                  <Text className="text-white text-[13px] font-extrabold leading-5 tracking-[-0.1px] flex-1 my-2" numberOfLines={3}>
                    {getTitle(item)}
                  </Text>

                  {!!item.sub && (
                    <View className="flex-row items-center justify-between gap-[6px]">
                      <Text className="flex-1 text-white/70 text-[10px] font-semibold" numberOfLines={1}>{item.sub}</Text>
                      <Ionicons name="arrow-forward-circle-outline" size={16} color="rgba(255,255,255,0.65)" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}

          {/* ดูทั้งหมด end card */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onViewAll}
            style={{ width: cardWidth * 0.5, height: 158, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" }}
          >
            <View className="items-center gap-2">
              <View className="w-11 h-11 rounded-full bg-white items-center justify-center">
                <Ionicons name="grid-outline" size={22} color="#0f7a55" />
              </View>
              <Text className="text-white/80 text-[12px] font-bold">ดูทั้งหมด</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      )}
    </LinearGradient>
  );
}
