import React, { useState } from "react";
import { FlatList, StatusBar, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInRight, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NotifItem = ({ item, onPress, index }) => (
  <Animated.View entering={FadeInRight.delay(index * 50).springify().damping(16)}>
    <TouchableOpacity
      className={`rounded-[18px] p-[14px] flex-row gap-3 mb-2 overflow-hidden ${item.read ? "bg-white border border-[#dce8e2]" : "border border-[#b2deca]"}`}
      style={!item.read
        ? { backgroundColor: "#f0faf5", elevation: 2, shadowColor: "#0f7a55", shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }
        : { elevation: 1 }
      }
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Unread accent bar */}
      {!item.read && (
        <View className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[18px] bg-primary" />
      )}

      {/* Icon */}
      {!item.read ? (
        <LinearGradient
          colors={[item.iconBg ?? "#e8f5ee", "#d4efe5"]}
          style={{ width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          <Ionicons name={item.icon} size={22} color={item.iconColor} />
        </LinearGradient>
      ) : (
        <View className="w-12 h-12 rounded-[14px] items-center justify-center shrink-0" style={{ backgroundColor: item.iconBg }}>
          <Ionicons name={item.icon} size={22} color={item.iconColor} />
        </View>
      )}

      {/* Text */}
      <View className="flex-1 gap-[3px] pl-1">
        <View className="flex-row items-center gap-[6px]">
          <Text
            className={`flex-1 text-[14px] text-[#0d1f18] ${item.read ? "font-semibold" : "font-extrabold"}`}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {!item.read && <View className="w-2 h-2 rounded-full bg-primary shrink-0" />}
        </View>
        <Text className="text-[12px] text-[#4a5e56] leading-[18px]" numberOfLines={2}>{item.body}</Text>
        <Text className="text-[11px] text-[#8fa89f] font-semibold mt-[2px]">{item.time}</Text>
      </View>
    </TouchableOpacity>
  </Animated.View>
);

export default function NotificationsScreen({ navigation }) {
  const { t } = useTranslation();
  const { top } = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead    = (id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const todayItems   = notifications.filter((n) => n.group === "today");
  const earlierItems = notifications.filter((n) => n.group === "earlier");
  const sections = [
    ...(todayItems.length   > 0 ? [{ type: "label", id: "l-today",   text: t("notifications.today")   }, ...todayItems]   : []),
    ...(earlierItems.length > 0 ? [{ type: "label", id: "l-earlier", text: t("notifications.earlier") }, ...earlierItems] : []),
  ];

  return (
    <View className="flex-1 bg-[#f0f6f2]">
      <StatusBar barStyle="light-content" backgroundColor="#064e35" />

      {/* Header */}
      <LinearGradient colors={["#064e35", "#0a6644"]} style={{ paddingTop: top + 10, paddingBottom: 18, paddingHorizontal: 16 }}>
        <View className="flex-row items-center gap-[10px]">
          <TouchableOpacity
            className="w-9 h-9 rounded-xl items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View className="flex-1 flex-row items-center gap-2">
            <Text className="text-white text-[20px] font-extrabold tracking-[-0.3px]">{t("notifications.title")}</Text>
            {unreadCount > 0 && (
              <View className="bg-red-500 rounded-full min-w-[22px] h-[22px] items-center justify-center px-[6px]">
                <Text className="text-white text-[11px] font-extrabold">{unreadCount}</Text>
              </View>
            )}
          </View>
          {unreadCount > 0 ? (
            <TouchableOpacity
              className="rounded-full px-3 py-[5px]"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              onPress={markAllRead}
            >
              <Text className="text-white text-[12px] font-bold">{t("notifications.markAllRead")}</Text>
            </TouchableOpacity>
          ) : (
            <View className="w-20" />
          )}
        </View>
      </LinearGradient>

      {/* Body */}
      {notifications.length === 0 ? (
        <Animated.View entering={FadeInDown.springify()} className="flex-1 items-center justify-center gap-3">
          <View className="w-[90px] h-[90px] rounded-full bg-white border border-[#dce8e2] items-center justify-center mb-1"
            style={{ elevation: 2 }}
          >
            <Ionicons name="notifications-off-outline" size={44} color="#8fa89f" />
          </View>
          <Text className="text-[17px] font-extrabold text-[#0d1f18]">{t("notifications.empty")}</Text>
          <Text className="text-[13px] text-[#8fa89f] font-medium">{t("notifications.emptySub")}</Text>
        </Animated.View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
          renderItem={({ item, index }) => {
            if (item.type === "label") {
              return (
                <Text className="text-[11px] font-extrabold text-[#8fa89f] tracking-[0.8px] uppercase mt-4 mb-2 ml-[2px]">
                  {item.text}
                </Text>
              );
            }
            return <NotifItem item={item} onPress={() => markRead(item.id)} index={index} />;
          }}
        />
      )}
    </View>
  );
}
