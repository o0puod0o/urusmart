import React from "react";
import { FlatList, Platform, StatusBar, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const pt = Platform.OS === "ios" ? 52 : (StatusBar.currentHeight ?? 24) + 12;

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
    <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(14)}>
      <TouchableOpacity
        className="bg-white rounded-[18px] overflow-hidden border border-[#dce8e2]"
        activeOpacity={0.82}
        style={{ elevation: 2, shadowColor: "#064e35", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }}
      >
        {/* Colored top strip */}
        <LinearGradient
          colors={item.colors ?? palette.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 4 }}
        />

        <View className="p-[14px] flex-row gap-3">
          {/* Icon */}
          <LinearGradient
            colors={item.colors ?? palette.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            <Ionicons name={item.icon ?? palette.icon} size={22} color="rgba(255,255,255,0.95)" />
          </LinearGradient>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-[6px]">
              <View className="bg-[#eef8f3] rounded-full px-2 py-[3px]">
                <Text className="text-primary text-[10px] font-extrabold tracking-[0.3px]">{item.tag ?? "ข่าวสาร"}</Text>
              </View>
              {!!item.date && (
                <Text className="text-[#9aabaa] text-[10px] font-semibold">{item.date}</Text>
              )}
            </View>
            <Text className="text-[#0d1f18] text-[14px] font-extrabold leading-5" numberOfLines={2}>
              {getTitle(item)}
            </Text>
            {!!item.sub && (
              <Text className="text-[#5f746b] text-[12px] font-medium leading-[17px] mt-1" numberOfLines={2}>
                {item.sub}
              </Text>
            )}
          </View>

          {/* Arrow */}
          <View className="justify-center">
            <Ionicons name="chevron-forward" size={16} color="#c4d4cc" />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function AnnouncementsScreen({ navigation, route }) {
  const items = route.params?.items ?? [];

  return (
    <View className="flex-1 bg-[#f0f6f2]">
      <StatusBar barStyle="light-content" backgroundColor="#0a6644" />

      {/* Header */}
      <LinearGradient
        colors={["#064e35", "#0a6644"]}
        style={{ paddingTop: pt, paddingBottom: 18, paddingHorizontal: 16 }}
      >
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            className="w-[38px] h-[38px] rounded-xl items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-[20px] font-extrabold tracking-[-0.3px]">ข่าวสารและประกาศ</Text>
            <Text className="text-white/60 text-[12px] font-semibold mt-[2px]">{items.length} รายการ</Text>
          </View>
          <View className="bg-white/15 rounded-full px-3 py-[5px]">
            <Text className="text-white text-[11px] font-bold">{items.length} รายการ</Text>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item.id ?? index}`}
        renderItem={({ item, index }) => <AnnouncementItem item={item} index={index} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 36, gap: 10 }}
        ListEmptyComponent={
          <Animated.View entering={FadeInDown.springify()} className="items-center justify-center pt-20 gap-4">
            <View className="w-24 h-24 rounded-full bg-white border border-[#dce8e2] items-center justify-center" style={{ elevation: 2 }}>
              <Ionicons name="newspaper-outline" size={44} color="#c4d4cc" />
            </View>
            <Text className="text-[16px] font-bold text-[#94a3b8]">ยังไม่มีข่าวสาร</Text>
            <Text className="text-[13px] text-[#bbc]">ยังไม่มีประกาศในขณะนี้</Text>
          </Animated.View>
        }
      />
    </View>
  );
}
