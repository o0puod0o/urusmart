import React from "react";
import {
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MOCK_ANNOUNCEMENTS } from "../../components/AnnouncementCarousel";

const C = {
  g900: "#064e35",
  g700: "#0a6644",
  g500: "#0f7a55",
  bg: "#f0f6f2",
  white: "#ffffff",
  ink: "#0d1f18",
  sub: "#5f746b",
  line: "#dce8e2",
};

const PALETTES = [
  { colors: ["#043d2a", "#0f7a55"], icon: "megaphone-outline" },
  { colors: ["#065f46", "#10b981"], icon: "calendar-outline" },
  { colors: ["#0a6644", "#22c55e"], icon: "flask-outline" },
  { colors: ["#064e35", "#16a34a"], icon: "people-outline" },
  { colors: ["#073b30", "#0d9488"], icon: "star-outline" },
];

const getTitle = (item) =>
  item.title || item.name || item.topic || item.message || "ข่าวสารใหม่";

const AnnouncementItem = ({ item, index }) => {
  const palette = PALETTES[index % PALETTES.length];

  return (
    <TouchableOpacity activeOpacity={0.82} style={styles.item}>
      <LinearGradient
        colors={item.colors ?? palette.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconBox}
      >
        <Ionicons
          name={item.icon ?? palette.icon}
          size={22}
          color="rgba(255,255,255,0.95)"
        />
      </LinearGradient>

      <View style={styles.textCol}>
        <View style={styles.tagPill}>
          <Text style={styles.tagTxt}>{item.tag ?? "ข่าวสาร"}</Text>
        </View>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {getTitle(item)}
        </Text>
        {!!item.sub && (
          <Text style={styles.itemSub} numberOfLines={2}>
            {item.sub}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function AnnouncementsScreen({ navigation, route }) {
  const items = route.params?.items?.length
    ? route.params.items
    : MOCK_ANNOUNCEMENTS;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.g700} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>ข่าวสารและประกาศ</Text>
          <Text style={styles.headerSub}>{items.length} รายการ</Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item.id ?? index}`}
        renderItem={({ item, index }) => (
          <AnnouncementItem item={item} index={index} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    backgroundColor: C.g700,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 52 : (StatusBar.currentHeight ?? 24) + 12,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1 },
  headerTitle: {
    color: C.white,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSub: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 10,
  },
  item: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: { flex: 1 },
  tagPill: {
    alignSelf: "flex-start",
    backgroundColor: "#eef8f3",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  tagTxt: {
    color: C.g500,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  itemTitle: {
    color: C.ink,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  itemSub: {
    color: C.sub,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
    marginTop: 4,
  },
});
