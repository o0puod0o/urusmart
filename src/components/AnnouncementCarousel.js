import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ANNOUNCE_PALETTES } from "../constants/announcePalettes";

const CARD_GAP = 12;
const SCROLL_ANIM_MS = 380; // ระยะเวลา animation scroll (ms)

export default function AnnouncementCarousel({ items = [], onViewAll, onPressItem, autoPlayMs = 0 }) {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const announcements = Array.isArray(items) ? items : [];
  const count = announcements.length;

  const scrollRef = useRef(null);
  const scrollXRef = useRef(0);
  const isUserScrolling = useRef(false);
  const [dotIndex, setDotIndex] = useState(0);

  const cardWidth = useMemo(() => {
    if (width >= 900) return Math.min(340, width * 0.34);
    if (width >= 600) return Math.min(300, width * 0.45);
    return Math.min(268, width * 0.68);
  }, [width]);

  // triple array เพื่อ infinite loop ในทั้ง 2 ทิศทาง
  const loopedItems = useMemo(() => {
    if (count <= 1) return announcements;
    return [...announcements, ...announcements, ...announcements];
  }, [announcements, count]);

  const snapUnit = cardWidth + CARD_GAP;

  const scrollToX = (x, animated = true) => {
    scrollRef.current?.scrollTo({ x, animated });
  };

  // เริ่มต้นที่ชุดกลาง (index = count)
  useEffect(() => {
    if (count <= 1 || cardWidth === 0) return;
    const initialX = count * snapUnit;
    const t = setTimeout(() => {
      scrollToX(initialX, false);
      scrollXRef.current = initialX;
    }, 80);
    return () => clearTimeout(t);
  }, [count, cardWidth]);

  // Auto-scroll — อ่านตำแหน่งจริงจาก scrollXRef ทุกครั้ง ไม่ใช้ index ที่แคชไว้
  useEffect(() => {
    if (!autoPlayMs || count <= 1) return;
    const interval = setInterval(() => {
      if (isUserScrolling.current) return;
      const currentIndex = Math.round(scrollXRef.current / snapUnit);
      const next = currentIndex + 1;
      const nextX = next * snapUnit;
      scrollToX(nextX, true);
      setDotIndex(next % count);

      if (next >= count * 2) {
        setTimeout(() => {
          const resetX = (next - count) * snapUnit;
          scrollToX(resetX, false);
          scrollXRef.current = resetX;
        }, SCROLL_ANIM_MS);
      }
    }, autoPlayMs);
    return () => clearInterval(interval);
  }, [autoPlayMs, count, cardWidth]);

  const handleScrollEnd = (e) => {
    if (count <= 1) return;
    isUserScrolling.current = false;
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / snapUnit);
    setDotIndex(index % count);

    if (index < count) {
      setTimeout(() => {
        const resetX = (index + count) * snapUnit;
        scrollToX(resetX, false);
        scrollXRef.current = resetX;
      }, 50);
    } else if (index >= count * 2) {
      setTimeout(() => {
        const resetX = (index - count) * snapUnit;
        scrollToX(resetX, false);
        scrollXRef.current = resetX;
      }, 50);
    }
  };

  const getTitle = (item) => item.title || item.name || item.topic || item.message || t("announce.defaultTitle");

  return (
    <LinearGradient colors={["#043d2a", "#065f46"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: "100%", paddingTop: 16, paddingBottom: 20, overflow: "hidden" }}>
      <View className="absolute w-[220px] h-[220px] rounded-full" style={{ top: -80, right: -60, backgroundColor: "rgba(255,255,255,0.04)" }} />
      <View className="absolute w-[150px] h-[150px] rounded-full" style={{ bottom: -50, left: -40, backgroundColor: "rgba(255,255,255,0.03)" }} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-[18px] mb-[14px]">
        <View className="flex-row items-center gap-2">
          <View className="w-1 h-5 rounded-[2px] bg-[#4ade80]" />
          <Text className="text-white text-[16px] font-extrabold tracking-[-0.3px]">{t("announce.title")}</Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center gap-[3px] rounded-full px-3 py-[5px]"
          style={{ backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" }}
          activeOpacity={0.75}
          onPress={onViewAll}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Text className="text-white/85 text-[12px] font-bold">{t("announce.viewAll")}</Text>
          <Ionicons name="chevron-forward" size={13} color="rgba(255,255,255,0.75)" />
        </TouchableOpacity>
      </View>

      {/* Cards */}
      {count === 0 ? (
        <View className="items-center justify-center py-7 gap-2">
          <Ionicons name="newspaper-outline" size={32} color="rgba(255,255,255,0.4)" />
          <Text className="text-white/50 text-[13px]">{t("announce.empty")}</Text>
        </View>
      ) : (
        <>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: CARD_GAP, alignItems: "flex-start" }}
            decelerationRate="fast"
            snapToInterval={cardWidth + CARD_GAP}
            snapToAlignment="start"
            onScroll={(e) => { scrollXRef.current = e.nativeEvent.contentOffset.x; }}
            onScrollBeginDrag={() => { isUserScrolling.current = true; }}
            onMomentumScrollEnd={handleScrollEnd}
            scrollEventThrottle={16}
          >
            {loopedItems.map((item, index) => {
              const realIndex = index % count;
              const palette = ANNOUNCE_PALETTES[realIndex % ANNOUNCE_PALETTES.length];
              return (
                <TouchableOpacity
                  key={`${index}`}
                  activeOpacity={0.88}
                  onPress={() => onPressItem?.(item)}
                  style={{ width: cardWidth }}
                >
                  <LinearGradient
                    colors={item.colors ?? palette.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ height: 158, borderRadius: 18, padding: 16, overflow: "hidden", justifyContent: "space-between", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}
                  >
                    <View className="absolute w-[110px] h-[110px] rounded-full" style={{ top: -30, right: -20, backgroundColor: "rgba(255,255,255,0.08)" }} />
                    <View className="absolute w-[70px] h-[70px] rounded-full" style={{ bottom: -20, left: -10, backgroundColor: "rgba(255,255,255,0.05)" }} />

                    <View className="flex-row items-center justify-between">
                      <View className="bg-white/20 rounded-full px-[10px] py-1 border border-white/[0.28]">
                        <Text className="text-white text-[10px] font-extrabold tracking-[0.4px]">{item.tag ?? t("announce.defaultTag")}</Text>
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

            {/* View all card — แสดงท้ายชุดสุดท้ายเท่านั้น */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onViewAll}
              style={{ width: cardWidth * 0.5, height: 158, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" }}
            >
              <View className="items-center gap-2">
                <View className="w-11 h-11 rounded-full bg-white items-center justify-center">
                  <Ionicons name="grid-outline" size={22} color="#0f7a55" />
                </View>
                <Text className="text-white/80 text-[12px] font-bold">{t("announce.viewAll")}</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Dot indicators */}
          {count > 1 && (
            <View className="flex-row justify-center items-center gap-[5px] mt-[12px]">
              {announcements.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === dotIndex ? 16 : 5,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: i === dotIndex ? "#4ade80" : "rgba(255,255,255,0.3)",
                  }}
                />
              ))}
            </View>
          )}
        </>
      )}
    </LinearGradient>
  );
}
