import React, { useState } from "react";
import { FlatList, Platform, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const PT = Platform.OS === "ios" ? "pt-[52px]" : `pt-[${(StatusBar.currentHeight ?? 24) + 12}px]`;

const NotifItem = ({ item, onPress }) => (
  <TouchableOpacity
    className={`rounded-2xl p-[14px] flex-row gap-3 mb-2 border ${item.read ? "bg-white border-[#dce8e2]" : "bg-[#f0faf5] border-[#b2deca]"}`}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <View className="w-[46px] h-[46px] rounded-[14px] items-center justify-center shrink-0" style={{ backgroundColor: item.iconBg }}>
      <Ionicons name={item.icon} size={22} color={item.iconColor} />
    </View>
    <View className="flex-1 gap-[3px]">
      <View className="flex-row items-center gap-[6px]">
        <Text className={`flex-1 text-[14px] text-[#0d1f18] ${item.read ? "font-semibold" : "font-extrabold"}`} numberOfLines={1}>
          {item.title}
        </Text>
        {!item.read && <View className="w-2 h-2 rounded-full bg-primary shrink-0" />}
      </View>
      <Text className="text-[12px] text-[#4a5e56] leading-[18px]" numberOfLines={2}>{item.body}</Text>
      <Text className="text-[11px] text-[#8fa89f] font-semibold mt-[2px]">{item.time}</Text>
    </View>
  </TouchableOpacity>
);

export default function NotificationsScreen({ navigation }) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const todayItems = notifications.filter((n) => n.group === "today");
  const earlierItems = notifications.filter((n) => n.group === "earlier");
  const sections = [
    ...(todayItems.length > 0 ? [{ type: "label", id: "l-today", text: t("notifications.today") }, ...todayItems] : []),
    ...(earlierItems.length > 0 ? [{ type: "label", id: "l-earlier", text: t("notifications.earlier") }, ...earlierItems] : []),
  ];

  return (
    <View className="flex-1 bg-[#f0f6f2]">
      <StatusBar barStyle="light-content" backgroundColor="#0a6644" />

      {/* Header */}
      <View className={`bg-[#0a6644] flex-row items-center px-4 pb-4 gap-[10px] ${PT}`}>
        <TouchableOpacity
          className="w-9 h-9 rounded-xl bg-white/15 items-center justify-center"
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
          <TouchableOpacity className="w-20 items-end" onPress={markAllRead}>
            <Text className="text-white/85 text-[12px] font-bold">{t("notifications.markAllRead")}</Text>
          </TouchableOpacity>
        ) : (
          <View className="w-20" />
        )}
      </View>

      {notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3">
          <View className="w-[90px] h-[90px] rounded-full bg-white border border-[#dce8e2] items-center justify-center mb-1">
            <Ionicons name="notifications-off-outline" size={44} color="#8fa89f" />
          </View>
          <Text className="text-[17px] font-extrabold text-[#0d1f18]">{t("notifications.empty")}</Text>
          <Text className="text-[13px] text-[#8fa89f] font-medium">{t("notifications.emptySub")}</Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
          renderItem={({ item }) => {
            if (item.type === "label") {
              return (
                <Text className="text-[12px] font-extrabold text-[#8fa89f] tracking-[0.8px] uppercase mt-4 mb-2 ml-[2px]">
                  {item.text}
                </Text>
              );
            }
            return <NotifItem item={item} onPress={() => markRead(item.id)} />;
          }}
        />
      )}
    </View>
  );
}
