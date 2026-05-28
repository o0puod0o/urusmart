/**
 * components/AnnouncementCarousel.js
 */

import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
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

export const MOCK_ANNOUNCEMENTS = [
  {
    id: "1",
    tag: "ประกาศ",
    title: "มรภ.อุตรดิตถ์ ได้รับการรับรองมาตรฐานคุณภาพ",
    sub: "ระดับอุดมศึกษา 5 ปี จาก สมศ.",
  },
  {
    id: "2",
    tag: "กำหนดการ",
    title: "ปฏิทินการส่งเกรดภาคเรียนที่ 1/2568",
    sub: "กำหนดส่ง 30 มิถุนายน 2568",
  },
  {
    id: "3",
    tag: "ทุนวิจัย",
    title: "เปิดรับสมัครทุนวิจัยภายใน ประจำปี 2568",
    sub: "ยื่นสมัครได้ถึง 15 มิถุนายน 2568",
  },
  {
    id: "4",
    tag: "กิจกรรม",
    title: "งานประชุมวิชาการระดับชาติ ครั้งที่ 12",
    sub: "วันที่ 20–21 กรกฎาคม 2568 ณ อาคาร SC",
  },
];

export default function AnnouncementCarousel({
  items = MOCK_ANNOUNCEMENTS,
  onViewAll,
  onPressItem,
}) {
  const { width } = useWindowDimensions();
  const announcements = items?.length ? items : MOCK_ANNOUNCEMENTS;

  const cardWidth = useMemo(() => {
    if (width >= 900) return Math.min(340, width * 0.34);
    if (width >= 600) return Math.min(300, width * 0.45);
    return Math.min(268, width * 0.68);
  }, [width]);

  const getTitle = (item) =>
    item.title || item.name || item.topic || item.message || "ข่าวสารใหม่";

  return (
    <LinearGradient
      colors={["#043d2a", "#065f46"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={S.root}
    >
      {/* Decorative background blob */}
      <View style={S.rootBlobTR} />
      <View style={S.rootBlobBL} />

      {/* Header row */}
      <View style={S.header}>
        <View style={S.headingWrap}>
          <View style={S.headingDot} />
          <Text style={S.heading}>ข่าวสารและประกาศ</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onViewAll}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          style={S.viewAllBtn}
        >
          <Text style={S.viewAllTxt}>ดูทั้งหมด</Text>
          <Ionicons name="chevron-forward" size={13} color="rgba(255,255,255,0.75)" />
        </TouchableOpacity>
      </View>

      {/* Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={S.list}
        decelerationRate="fast"
        snapToInterval={cardWidth + CARD_GAP}
        snapToAlignment="start"
      >
        {announcements.map((item, index) => {
          const palette = PALETTES[index % PALETTES.length];
          return (
            <TouchableOpacity
              key={`${item.id ?? index}`}
              activeOpacity={0.88}
              onPress={() => onPressItem?.(item)}
              style={{ width: cardWidth }}
            >
              <LinearGradient
                colors={item.colors ?? palette.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={S.card}
              >
                {/* Card blobs */}
                <View style={S.cardBlobTR} />
                <View style={S.cardBlobBL} />

                {/* Top row: tag + icon */}
                <View style={S.cardTop}>
                  <View style={S.tagPill}>
                    <Text style={S.tagTxt}>{item.tag ?? "ข่าวสาร"}</Text>
                  </View>
                  <View style={S.iconCircle}>
                    <Ionicons
                      name={item.icon ?? palette.icon}
                      size={18}
                      color="rgba(255,255,255,0.9)"
                    />
                  </View>
                </View>

                {/* Title */}
                <Text style={S.cardTitle} numberOfLines={3}>
                  {getTitle(item)}
                </Text>

                {/* Bottom: subtitle + arrow */}
                {!!item.sub && (
                  <View style={S.cardBottom}>
                    <Text style={S.cardSub} numberOfLines={1}>
                      {item.sub}
                    </Text>
                    <Ionicons
                      name="arrow-forward-circle-outline"
                      size={16}
                      color="rgba(255,255,255,0.65)"
                    />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}

        {/* "ดูทั้งหมด" end card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onViewAll}
          style={[S.seeAllCard, { width: cardWidth * 0.5 }]}
        >
          <View style={S.seeAllInner}>
            <View style={S.seeAllIcon}>
              <Ionicons name="grid-outline" size={22} color="#0f7a55" />
            </View>
            <Text style={S.seeAllTxt}>ดูทั้งหมด</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const S = StyleSheet.create({
  root: {
    width: "100%",
    paddingTop: 16,
    paddingBottom: 20,
    overflow: "hidden",
  },
  rootBlobTR: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.04)",
    top: -80,
    right: -60,
  },
  rootBlobBL: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.03)",
    bottom: -50,
    left: -40,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  headingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headingDot: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: "#4ade80",
  },
  heading: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  viewAllTxt: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "700",
  },

  // List
  list: {
    paddingHorizontal: 16,
    gap: CARD_GAP,
    alignItems: "flex-start",
  },

  // Card
  card: {
    height: 158,
    borderRadius: 18,
    padding: 16,
    overflow: "hidden",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardBlobTR: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -30,
    right: -20,
  },
  cardBlobBL: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -20,
    left: -10,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tagPill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  tagTxt: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 20,
    letterSpacing: -0.1,
    flex: 1,
    marginVertical: 8,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  cardSub: {
    flex: 1,
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontWeight: "600",
  },

  // See-all end card
  seeAllCard: {
    height: 158,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  seeAllInner: { alignItems: "center", gap: 8 },
  seeAllIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  seeAllTxt: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "700",
  },
});
