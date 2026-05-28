/**
 * screens/Settings/Setting.js
 */

import React, { useRef } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

// ══════════════════════════════════════════════════════════════
// THEME
// ══════════════════════════════════════════════════════════════
const C = {
  g900: "#043d2a",
  g700: "#0a6644",
  g500: "#0f7a55",
  g400: "#1a9068",
  g300: "#5aab8a",
  g100: "#c8e8d8",
  g50: "#eef8f3",
  g20: "#f6fcf9",
  white: "#ffffff",
  ink: "#0d1f18",
  sub: "#4a5e56",
  dim: "#8fa89f",
  line: "#dce8e2",
  bg: "#f0f6f2",
};

// ══════════════════════════════════════════════════════════════
// MENU DATA — รวมเป็น flat list (ไม่มี section label)
// ══════════════════════════════════════════════════════════════
const getMenu = (t) => [
  {
    label: t("settings.notification"),
    sub: t("settings.notificationSub"),
    icon: "notifications-outline",
    route: "NotificationSetting",
    color: "#f59e0b",
    colorBg: "#fffbea",
  },
  {
    label: t("settings.language"),
    sub: t("settings.languageSub"),
    icon: "globe-outline",
    route: "Language",
    color: "#0891b2",
    colorBg: "#e0f7fa",
  },
  {
    label: t("settings.security"),
    sub: t("settings.securitySub"),
    icon: "shield-checkmark-outline",
    route: "Security",
    color: "#7c3aed",
    colorBg: "#f3e8ff",
  },
  {
    label: t("settings.contact"),
    sub: t("settings.contactSub"),
    icon: "call-outline",
    route: "ContactUs",
    color: C.g500,
    colorBg: C.g50,
  },
];

// ══════════════════════════════════════════════════════════════
// MENU ROW
// ══════════════════════════════════════════════════════════════
const MenuRow = ({ item, isLast, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.975,
        useNativeDriver: true,
        speed: 60,
      }),
      Animated.timing(bgAnim, {
        toValue: 1,
        useNativeDriver: false,
        duration: 80,
      }),
    ]).start();
  };
  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 25 }),
      Animated.timing(bgAnim, {
        toValue: 0,
        useNativeDriver: false,
        duration: 200,
      }),
    ]).start();
  };

  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.white, C.g20],
  });

  return (
    <Animated.View style={[{ transform: [{ scale }] }, !isLast && MR.border]}>
      <Animated.View style={{ backgroundColor: bgColor }}>
        <TouchableOpacity
          style={MR.row}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={1}
        >
          <View style={[MR.iconBox, { backgroundColor: item.colorBg }]}>
            <Ionicons name={item.icon} size={20} color={item.color} />
          </View>
          <View style={MR.textCol}>
            <Text style={MR.label}>{item.label}</Text>
            {!!item.sub && <Text style={MR.sub}>{item.sub}</Text>}
          </View>
          <Ionicons name="chevron-forward" size={15} color={C.dim} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const MR = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 14,
  },
  border: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.line,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: { flex: 1, gap: 2 },
  label: { fontSize: 15, fontWeight: "700", color: C.ink, letterSpacing: -0.1 },
  sub: { fontSize: 12, fontWeight: "500", color: C.dim },
});

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function SettingPage() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const MENU = getMenu(t);

  return (
    <View style={P.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0f7a55" />

      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <View style={P.header}>
        <View style={P.hdrInner}>
          <View style={P.badge}>
            <Ionicons
              name="settings-sharp"
              size={24}
              color="rgba(255,255,255,0.95)"
            />
          </View>
          <View>
            <Text style={P.hdrTitle}>{t("settings.title")}</Text>
            <Text style={P.hdrSub}>{t("settings.subtitle")}</Text>
          </View>
        </View>
      </View>

      {/* ══ CONTENT ═════════════════════════════════════════════ */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={P.scroll}
      >
        {/* ── Menu card ─────────────────────────────────────── */}
        <View style={P.card}>
          {MENU.map((item, i) => (
            <MenuRow
              key={item.route}
              item={item}
              isLast={i === MENU.length - 1}
              onPress={() => navigation.navigate(item.route)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════
const P = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    paddingHorizontal: 22,
    paddingTop: Platform.OS === "ios" ? 56 : (StatusBar.currentHeight ?? 24) + 16,
    paddingBottom: 26,
    overflow: "hidden",
    backgroundColor: C.g500,
  },
  hdrInner: { flexDirection: "row", alignItems: "center", gap: 14, zIndex: 1 },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  hdrTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  hdrSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginTop: 2,
  },

  // Scroll
  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40, gap: 12 },

  // Menu card
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.line,
    shadowColor: C.g900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },

});
