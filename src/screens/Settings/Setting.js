import React, { useRef } from "react";
import { Animated, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import useCurrentUser from "../../hook/useCurrentUser";

const PT = Platform.OS === "ios" ? 56 : (StatusBar.currentHeight ?? 24) + 16;

const getMenu = (t) => [
  { label: t("settings.notification"), sub: t("settings.notificationSub"), icon: "notifications-outline", route: "NotificationSetting", color: "#f59e0b", colorBg: "#fffbea" },
  { label: t("settings.language"),     sub: t("settings.languageSub"),     icon: "globe-outline",            route: "Language",            color: "#0891b2", colorBg: "#e0f7fa" },
  { label: t("settings.security"),     sub: t("settings.securitySub"),     icon: "shield-checkmark-outline", route: "Security",            color: "#7c3aed", colorBg: "#f3e8ff" },
  { label: t("settings.contact"),      sub: t("settings.contactSub"),      icon: "call-outline",             route: "ContactUs",           color: "#0f7a55", colorBg: "#eef8f3" },
];

const MenuRow = ({ item, isLast, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  const onPressIn = () => Animated.parallel([
    Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, speed: 60 }),
    Animated.timing(bgAnim, { toValue: 1, useNativeDriver: false, duration: 80 }),
  ]).start();

  const onPressOut = () => Animated.parallel([
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 25 }),
    Animated.timing(bgAnim, { toValue: 0, useNativeDriver: false, duration: 200 }),
  ]).start();

  const bgColor = bgAnim.interpolate({ inputRange: [0, 1], outputRange: ["#ffffff", "#f6fcf9"] });

  return (
    <Animated.View style={[{ transform: [{ scale }] }, !isLast && { borderBottomWidth: 0.5, borderBottomColor: "#dce8e2" }]}>
      <Animated.View style={{ backgroundColor: bgColor }}>
        <TouchableOpacity
          className="flex-row items-center px-4 py-[14px] gap-[14px]"
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={1}
        >
          <View className="w-[44px] h-[44px] rounded-[14px] items-center justify-center" style={{ backgroundColor: item.colorBg }}>
            <Ionicons name={item.icon} size={22} color={item.color} />
          </View>
          <View className="flex-1 gap-[3px]">
            <Text className="text-[15px] font-bold text-[#0d1f18]">{item.label}</Text>
            {!!item.sub && <Text className="text-[12px] text-[#8fa89f]">{item.sub}</Text>}
          </View>
          <View className="w-8 h-8 rounded-full bg-[#f4f6f8] items-center justify-center">
            <Ionicons name="chevron-forward" size={14} color="#bbb" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export default function SettingPage() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user, logout } = useCurrentUser(navigation);
  const MENU = getMenu(t);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "อ.";

  return (
    <View className="flex-1 bg-[#eaf5ef]">
      <StatusBar barStyle="light-content" backgroundColor="#0f7a55" />

      <LinearGradient
        colors={["#064e35", "#0a6644", "#0f7a55"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 22, paddingBottom: 28, paddingTop: PT, overflow: "hidden" }}
      >
        {/* blobs */}
        <View className="absolute w-[200px] h-[200px] rounded-full" style={{ right: -60, top: -60, backgroundColor: "rgba(255,255,255,0.05)" }} />
        <View className="absolute w-[120px] h-[120px] rounded-full" style={{ left: -30, bottom: -40, backgroundColor: "rgba(255,255,255,0.04)" }} />

        {/* Profile row */}
        <View className="flex-row items-center gap-4">
          <View className="w-[60px] h-[60px] rounded-[18px] bg-white/20 items-center justify-center border border-white/30">
            <Text className="text-white text-[22px] font-black">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white text-[20px] font-black tracking-[-0.3px]">
              {user?.name || t("settings.title")}
            </Text>
            <View className="flex-row items-center gap-[6px] mt-1">
              <View className="w-2 h-2 rounded-full bg-[#4ade80]" />
              <Text className="text-white/60 text-[12px] font-semibold">{t("settings.subtitle")}</Text>
            </View>
          </View>
          <View className="w-10 h-10 rounded-full bg-white/15 border border-white/25 items-center justify-center">
            <Ionicons name="settings-sharp" size={18} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40, gap: 12 }}>
        {/* Menu card */}
        <View
          className="bg-white rounded-[20px] overflow-hidden border border-[#dce8e2]"
          style={{ elevation: 3, shadowColor: "#043d2a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 16 }}
        >
          {MENU.map((item, i) => (
            <MenuRow
              key={item.route}
              item={item}
              isLast={i === MENU.length - 1}
              onPress={() => navigation.navigate(item.route)}
            />
          ))}
        </View>

        {/* Logout button */}
        <TouchableOpacity
          onPress={logout}
          activeOpacity={0.8}
          className="flex-row items-center justify-center gap-3 bg-white rounded-[20px] py-[16px] border border-[#fecaca]"
          style={{ elevation: 2, shadowColor: "#dc2626", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 }}
        >
          <View className="w-9 h-9 rounded-full bg-[#fef2f2] items-center justify-center">
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          </View>
          <Text className="text-[15px] font-bold text-[#dc2626]">ออกจากระบบ</Text>
        </TouchableOpacity>

        {/* App version */}
        <View className="items-center py-2">
          <Text className="text-[11px] text-[#bbb] font-semibold">URUSmart v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
