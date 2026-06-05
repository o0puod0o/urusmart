import React from "react";
import { View, ScrollView, StatusBar, Platform, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import HeaderBar from "../components/HeaderBar";
import SectionHeader from "../components/SectionHeader";
import ServiceIconGrid from "../components/ServiceIconGrid";
import AnnouncementCarousel from "../components/AnnouncementCarousel";
import useCurrentUser from "../hook/useCurrentUser";
import useFetch from "../hook/useFetch";
import useExpertStats from "../hook/useExpertStats";

const STAT_CONFIG = [
  { key: "researches", icon: "bar-chart-outline", label: "งานวิจัย",  color: "#0f7a55", bg: "#d6f0e3" },
  { key: "journals",   icon: "newspaper-outline", label: "บทความ",    color: "#185fa5", bg: "#e8f0fb" },
  { key: "patents",    icon: "ribbon-outline",    label: "สิทธิบัตร", color: "#7b1fa2", bg: "#f3e5f5" },
  { key: "awards",     icon: "trophy-outline",    label: "รางวัล",    color: "#e65100", bg: "#fff3e0" },
];

const cardShadow = Platform.select({
  ios: { shadowColor: "#064e35", shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  android: { elevation: 6 },
  web: { boxShadow: "0 10px 20px rgba(6,78,53,0.12)" },
});

const Homepage = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, logout } = useCurrentUser(navigation);
  const { stats, loading: statsLoading } = useExpertStats();

  const { data: announcements } = useFetch("/announcements", {
    initialData: [],
    params: { limit: 5 },
  });

  return (
    <View className="flex-1 bg-[#f0f6f2]">
      <StatusBar barStyle="light-content" backgroundColor="#064e35" />

      <HeaderBar
        name={user.name}
        photoUrl={user.photoUrl}
        onNotification={() => navigation.navigate("Notifications")}
        onLogout={logout}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 50, rowGap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Announcement Carousel */}
        <AnnouncementCarousel
          items={announcements?.length ? announcements : undefined}
          onViewAll={() => navigation.navigate("Announcements", {
            items: announcements?.length ? announcements : undefined,
          })}
          autoPlayMs={3500}
        />

        {/* Services Card */}
        <View
          className="bg-white rounded-[18px] py-4 px-4 mx-4 border border-[rgba(6,78,53,0.08)] overflow-hidden"
          style={cardShadow}
        >
          <View className="absolute left-0 top-4 bottom-4 w-1 rounded-tr rounded-br bg-primary" />
          <SectionHeader title={t("home.services")} />
          <View className="mt-3">
            <ServiceIconGrid navigation={navigation} />
          </View>
        </View>

        {/* ผลงานของฉัน Card */}
        <View
          className="bg-white rounded-[18px] py-4 px-4 mx-4 border border-[rgba(6,78,53,0.08)] overflow-hidden"
          style={cardShadow}
        >
          <View className="absolute left-0 top-4 bottom-4 w-1 rounded-tr rounded-br bg-[#7b1fa2]" />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-[14px]">
            <Text className="text-[15px] font-bold text-[#1a1a1a] pl-[10px]">ผลงานของฉัน</Text>
            <TouchableOpacity
              className="flex-row items-center gap-[2px]"
              onPress={() => navigation.navigate("Research")}
            >
              <Text className="text-[13px] text-[#7b1fa2] font-semibold">จัดการ</Text>
              <Ionicons name="chevron-forward" size={13} color="#7b1fa2" />
            </TouchableOpacity>
          </View>

          {/* Stats grid */}
          <View className="flex-row justify-between mb-4">
            {STAT_CONFIG.map((item) => (
              <View key={item.key} className="flex-1 items-center gap-[6px]">
                <View
                  className="w-12 h-12 rounded-[14px] items-center justify-center"
                  style={{ backgroundColor: item.bg }}
                >
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text className="text-[20px] font-extrabold" style={{ color: item.color }}>
                  {statsLoading ? "—" : stats[item.key]}
                </Text>
                <Text className="text-[11px] text-gray-500 text-center">{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Add button */}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-[6px] bg-[#7b1fa2] rounded-xl py-3"
            onPress={() => navigation.navigate("Research")}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={16} color="#fff" />
            <Text className="text-white text-[14px] font-bold">เพิ่มผลงานใหม่</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Homepage;
