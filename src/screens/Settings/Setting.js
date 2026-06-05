import React, { useRef } from "react";
import { Animated, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

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
          className="flex-row items-center px-4 py-[13px] gap-[14px]"
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={1}
        >
          <View className="w-[42px] h-[42px] rounded-[13px] items-center justify-center" style={{ backgroundColor: item.colorBg }}>
            <Ionicons name={item.icon} size={20} color={item.color} />
          </View>
          <View className="flex-1 gap-[2px]">
            <Text className="text-[15px] font-bold text-[#0d1f18] tracking-[-0.1px]">{item.label}</Text>
            {!!item.sub && <Text className="text-[12px] font-medium text-[#8fa89f]">{item.sub}</Text>}
          </View>
          <Ionicons name="chevron-forward" size={15} color="#8fa89f" />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export default function SettingPage() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const MENU = getMenu(t);

  return (
    <View className="flex-1 bg-[#f0f6f2]">
      <StatusBar barStyle="light-content" backgroundColor="#0f7a55" />

      <View className="bg-primary px-[22px] pb-[26px] overflow-hidden" style={{ paddingTop: PT }}>
        <View className="flex-row items-center gap-[14px] z-10">
          <View className="w-[52px] h-[52px] rounded-[17px] bg-white/14 border-[1.5px] border-white/20 items-center justify-center">
            <Ionicons name="settings-sharp" size={24} color="rgba(255,255,255,0.95)" />
          </View>
          <View>
            <Text className="text-white text-[26px] font-black tracking-[-0.8px]">{t("settings.title")}</Text>
            <Text className="text-white/50 text-[12px] font-semibold tracking-[1px] mt-[2px]">{t("settings.subtitle")}</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40, gap: 12 }}>
        <View
          className="bg-white rounded-[20px] overflow-hidden border border-[#dce8e2]"
          style={{ elevation: 3, shadowColor: "#043d2a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 16 }}
        >
          {MENU.map((item, i) => (
            <MenuRow key={item.route} item={item} isLast={i === MENU.length - 1} onPress={() => navigation.navigate(item.route)} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
