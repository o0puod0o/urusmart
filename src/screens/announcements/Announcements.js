import React, { useState } from "react";
import { ActivityIndicator, FlatList, Modal, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ANNOUNCE_PALETTES } from "../../constants/announcePalettes";
import useFetch from "../../hook/useFetch";

const pt = Platform.OS === "ios" ? 52 : (StatusBar.currentHeight ?? 24) + 12;

const AnnouncementItem = ({ item, index, highlighted, defaultTag, defaultTitle, onPress }) => {
  const palette = ANNOUNCE_PALETTES[index % ANNOUNCE_PALETTES.length];
  const title = item.title || item.name || item.topic || item.message || defaultTitle;

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(14)}>
      <TouchableOpacity
        className="bg-white rounded-[18px] overflow-hidden border"
        activeOpacity={0.82}
        onPress={onPress}
        style={{
          borderColor: highlighted ? "#0f7a55" : "#dce8e2",
          elevation: highlighted ? 5 : 2,
          shadowColor: "#064e35",
          shadowOpacity: highlighted ? 0.18 : 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
        }}
      >
        <LinearGradient
          colors={item.colors ?? palette.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 4 }}
        />

        <View className="p-[14px] flex-row gap-3">
          <LinearGradient
            colors={item.colors ?? palette.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            <Ionicons name={item.icon ?? palette.icon} size={22} color="rgba(255,255,255,0.95)" />
          </LinearGradient>

          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-[6px]">
              <View className="bg-[#eef8f3] rounded-full px-2 py-[3px]">
                <Text className="text-primary text-[10px] font-extrabold tracking-[0.3px]">{item.tag ?? defaultTag}</Text>
              </View>
              {!!item.date && (
                <Text className="text-[#9aabaa] text-[10px] font-semibold">{item.date}</Text>
              )}
            </View>
            <Text className="text-[#0d1f18] text-[14px] font-extrabold leading-5" numberOfLines={2}>
              {title}
            </Text>
            {!!item.sub && (
              <Text className="text-[#5f746b] text-[12px] font-medium leading-[17px] mt-1" numberOfLines={2}>
                {item.sub}
              </Text>
            )}
          </View>

          <View className="justify-center">
            <Ionicons name="chevron-forward" size={16} color="#c4d4cc" />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const AnnouncementDetailModal = ({ item, defaultTag, defaultTitle, onClose }) => {
  if (!item) return null;
  const title   = item.title || item.name || item.topic || item.message || defaultTitle;
  const body    = item.body  || item.content || item.detail || item.description || item.sub || "";
  const tag     = item.tag   ?? defaultTag;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
        <View className="bg-white rounded-t-[28px] overflow-hidden" style={{ maxHeight: "85%" }}>
          {/* Handle bar */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-[#dce8e2]" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-3 border-b border-[#eef3f0]">
            <View className="bg-[#eef8f3] rounded-full px-3 py-[4px]">
              <Text className="text-primary text-[11px] font-extrabold">{tag}</Text>
            </View>
            <TouchableOpacity
              className="w-8 h-8 rounded-full bg-[#f0f4f2] items-center justify-center"
              onPress={onClose}
              activeOpacity={0.75}
            >
              <Ionicons name="close" size={18} color="#4a5568" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {!!item.date && (
              <Text className="text-[#9aabaa] text-[12px] font-semibold mb-3">{item.date}</Text>
            )}
            <Text className="text-[#0d1f18] text-[18px] font-extrabold leading-7 mb-4">{title}</Text>
            {!!body ? (
              <Text className="text-[#374151] text-[14px] leading-6">{body}</Text>
            ) : (
              <Text className="text-[#9aabaa] text-[13px] italic">ไม่มีรายละเอียดเพิ่มเติม</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function AnnouncementsScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { data: fetched, loading } = useFetch("/announcements", { initialData: [] });
  const seedItems    = route.params?.items ?? [];
  const items        = fetched?.length ? fetched : seedItems;
  const highlightId  = route.params?.highlightId ?? null;
  const [selected, setSelected] = useState(route.params?.selectedItem ?? null);

  return (
    <View className="flex-1 bg-[#f0f6f2]">
      <StatusBar barStyle="light-content" backgroundColor="#0a6644" />

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
            <Text className="text-white text-[20px] font-extrabold tracking-[-0.3px]">{t("announce.title")}</Text>
            <Text className="text-white/60 text-[12px] font-semibold mt-[2px]">
              {loading ? t("announce.loading") : t("announce.itemCount", { count: items.length })}
            </Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
          ) : (
            <View className="bg-white/15 rounded-full px-3 py-[5px]">
              <Text className="text-white text-[11px] font-bold">
                {t("announce.itemCount", { count: items.length })}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item.id ?? index}`}
        renderItem={({ item, index }) => (
          <AnnouncementItem
            item={item}
            index={index}
            highlighted={highlightId != null && item.id === highlightId}
            defaultTag={t("announce.defaultTag")}
            defaultTitle={t("announce.defaultTitle")}
            onPress={() => setSelected(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 36, gap: 10 }}
        ListEmptyComponent={
          <Animated.View entering={FadeInDown.springify()} className="items-center justify-center pt-20 gap-4">
            <View className="w-24 h-24 rounded-full bg-white border border-[#dce8e2] items-center justify-center" style={{ elevation: 2 }}>
              <Ionicons name="newspaper-outline" size={44} color="#c4d4cc" />
            </View>
            <Text className="text-[16px] font-bold text-[#94a3b8]">{t("announce.empty")}</Text>
            <Text className="text-[13px] text-[#bbc]">{t("announce.emptySub")}</Text>
          </Animated.View>
        }
      />

      <AnnouncementDetailModal
        item={selected}
        defaultTag={t("announce.defaultTag")}
        defaultTitle={t("announce.defaultTitle")}
        onClose={() => setSelected(null)}
      />
    </View>
  );
}
