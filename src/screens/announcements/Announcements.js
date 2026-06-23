import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Linking,
  Modal,
  PanResponder,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import ReAnimated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ANNOUNCE_PALETTES } from "../../constants/announcePalettes";
import useFetch from "../../hook/useFetch";

const SHEET_H = Dimensions.get("window").height * 0.72;

// ── List card ─────────────────────────────────────────────
const AnnouncementItem = ({ item, index, highlighted, defaultTag, defaultTitle, onPress }) => {
  const palette = ANNOUNCE_PALETTES[index % ANNOUNCE_PALETTES.length];
  const title = item.title || item.name || item.topic || item.message || defaultTitle;

  return (
    <ReAnimated.View entering={FadeInDown.delay(index * 60).springify().damping(14)}>
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
    </ReAnimated.View>
  );
};

// ── Bottom Sheet Detail ────────────────────────────────────
const AnnouncementDetailModal = ({ item, defaultTag, defaultTitle, onClose }) => {
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(SHEET_H)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // Open animation each time a new item is selected
  useEffect(() => {
    if (!item) return;
    translateY.setValue(SHEET_H);
    backdrop.setValue(0);
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 58, friction: 11 }),
      Animated.timing(backdrop, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [item]);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SHEET_H, duration: 260, useNativeDriver: true }),
      Animated.timing(backdrop, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onCloseRef.current());
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80 || g.vy > 0.8) {
          Animated.parallel([
            Animated.timing(translateY, { toValue: SHEET_H, duration: 260, useNativeDriver: true }),
            Animated.timing(backdrop, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]).start(() => onCloseRef.current());
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start();
        }
      },
    })
  ).current;

  if (!item) return null;

  const title = item.title || item.name || item.topic || defaultTitle;
  const body = item.message || item.body || item.content || item.detail || item.description || item.sub || "";
  const tag = item.tag ?? defaultTag;
  const icon = item.icon ?? ANNOUNCE_PALETTES[0].icon;
  const colors = item.colors ?? ANNOUNCE_PALETTES[0].colors;
  const hasUrl = !!item.url;

  const formatDate = (ds) => {
    if (!ds) return null;
    try {
      const d = new Date(ds);
      if (isNaN(d.getTime())) return ds;
      const day = d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
      const time = d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
      return `${day} • ${time} น.`;
    } catch { return ds; }
  };
  const dateStr = item.published_at ? formatDate(item.published_at) : (item.date ?? null);

  const handleShare = async () => {
    try {
      const msg = [title, body, item.url].filter(Boolean).join("\n\n");
      await Share.share({ message: msg, title });
    } catch (_) {}
  };

  return (
    <Modal visible transparent statusBarTranslucent animationType="none" onRequestClose={dismiss}>
      {/* Dimmed backdrop — tap to close */}
      <TouchableWithoutFeedback onPress={dismiss}>
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.52)", opacity: backdrop }]}
        />
      </TouchableWithoutFeedback>

      {/* Sheet positioned at bottom */}
      <View style={{ flex: 1, justifyContent: "flex-end" }} pointerEvents="box-none">
        <Animated.View
          style={{
            height: SHEET_H,
            backgroundColor: "#fff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            elevation: 24,
            shadowColor: "#000",
            shadowOpacity: 0.22,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: -6 },
            transform: [{ translateY }],
            overflow: "hidden",
          }}
        >
          {/* Drag handle */}
          <View
            {...panResponder.panHandlers}
            style={{ alignItems: "center", paddingTop: 12, paddingBottom: 10 }}
          >
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#dde7e3" }} />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            bounces
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {/* ── Hero ── */}
            <View style={{ alignItems: "center", paddingHorizontal: 24, paddingTop: 4, paddingBottom: 22, gap: 14 }}>
              <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 26,
                  alignItems: "center",
                  justifyContent: "center",
                  elevation: 4,
                  shadowColor: colors[1],
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                }}
              >
                <Ionicons name={icon} size={38} color="rgba(255,255,255,0.97)" />
              </LinearGradient>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                <View style={{ backgroundColor: "#eef8f3", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
                  <Text style={{ color: "#0f7a55", fontSize: 11, fontWeight: "800", letterSpacing: 0.3 }}>{tag}</Text>
                </View>
                {!!dateStr && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="time-outline" size={12} color="#9aabaa" />
                    <Text style={{ color: "#9aabaa", fontSize: 11, fontWeight: "600" }}>{dateStr}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* ── Title ── */}
            <View style={{ paddingHorizontal: 24, paddingBottom: 18 }}>
              <Text style={{ color: "#0d1f18", fontSize: 20, fontWeight: "800", lineHeight: 29, letterSpacing: -0.4 }}>
                {title}
              </Text>
            </View>

            {/* ── Divider ── */}
            <View style={{ height: 1, backgroundColor: "#f0f4f2", marginHorizontal: 24, marginBottom: 20 }} />

            {/* ── Body ── */}
            <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
              {body ? (
                <Text style={{ color: "#374151", fontSize: 14.5, lineHeight: 25, fontWeight: "500" }}>
                  {body}
                </Text>
              ) : (
                <View style={{ alignItems: "center", paddingTop: 16, paddingBottom: 8, gap: 12 }}>
                  <View style={{
                    width: 84,
                    height: 84,
                    borderRadius: 42,
                    backgroundColor: "#f0f6f2",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 2,
                    borderColor: "#dce8e2",
                  }}>
                    <Ionicons name="mail-open-outline" size={38} color="#b2cfc6" />
                  </View>
                  <Text style={{ color: "#4a5568", fontSize: 15, fontWeight: "700", textAlign: "center" }}>
                    {t("announce.detailEmpty")}
                  </Text>
                  <Text style={{ color: "#9aabaa", fontSize: 13, fontWeight: "500", textAlign: "center", lineHeight: 20, maxWidth: 250 }}>
                    {t("announce.detailEmptySub")}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* ── Footer actions ── */}
          <View style={{
            flexDirection: "row",
            gap: 10,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Math.max(bottom, 16),
            borderTopWidth: 1,
            borderTopColor: "#f0f4f2",
          }}>
            {hasUrl && (
              <TouchableOpacity
                onPress={() => Linking.openURL(item.url).catch(() => {})}
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 15,
                  backgroundColor: "#0f7a55",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Ionicons name="open-outline" size={17} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>{t("announce.readMore")}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleShare}
              activeOpacity={0.85}
              style={{
                flex: hasUrl ? 0 : 1,
                width: hasUrl ? 48 : undefined,
                height: 48,
                borderRadius: 15,
                backgroundColor: "#f0f6f2",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: hasUrl ? 0 : 6,
              }}
            >
              <Ionicons name="share-social-outline" size={19} color="#0f7a55" />
              {!hasUrl && (
                <Text style={{ color: "#0f7a55", fontSize: 14, fontWeight: "700" }}>{t("announce.share")}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={dismiss}
              activeOpacity={0.85}
              style={{
                width: 48,
                height: 48,
                borderRadius: 15,
                backgroundColor: "#f0f6f2",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ── Screen ─────────────────────────────────────────────────
export default function AnnouncementsScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { top } = useSafeAreaInsets();
  const { data: fetched, loading } = useFetch("/announcements", { initialData: [] });
  const seedItems   = route.params?.items ?? [];
  const items       = fetched?.length ? fetched : seedItems;
  const highlightId = route.params?.highlightId ?? null;
  const [selected, setSelected] = useState(route.params?.selectedItem ?? null);

  const selectItem = useCallback((item, index) => {
    const palette = ANNOUNCE_PALETTES[index % ANNOUNCE_PALETTES.length];
    setSelected({
      ...item,
      colors: item.colors ?? palette.colors,
      icon:   item.icon   ?? palette.icon,
    });
  }, []);

  return (
    <View className="flex-1 bg-[#f0f6f2]">
      <StatusBar barStyle="light-content" backgroundColor="#0a6644" />

      <LinearGradient
        colors={["#064e35", "#0a6644"]}
        style={{ paddingTop: top + 10, paddingBottom: 18, paddingHorizontal: 16 }}
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
            onPress={() => selectItem(item, index)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 36, gap: 10 }}
        ListEmptyComponent={
          <ReAnimated.View entering={FadeInDown.springify()} className="items-center justify-center pt-20 gap-4">
            <View className="w-24 h-24 rounded-full bg-white border border-[#dce8e2] items-center justify-center" style={{ elevation: 2 }}>
              <Ionicons name="newspaper-outline" size={44} color="#c4d4cc" />
            </View>
            <Text className="text-[16px] font-bold text-[#94a3b8]">{t("announce.empty")}</Text>
            <Text className="text-[13px] text-[#bbc]">{t("announce.emptySub")}</Text>
          </ReAnimated.View>
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
