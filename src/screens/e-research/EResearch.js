import React from "react";
import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";

export default function EResearch({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#eaf5ef]">
      <StatusBar barStyle="light-content" backgroundColor="#064e35" />
      <AppHeader title="e-Research" onBack={() => navigation.goBack()} />

      <View className="flex-1 items-center justify-center px-8" style={{ paddingBottom: insets.bottom + 24 }}>

        {/* Icon circle */}
        <View
          className="w-[140px] h-[140px] rounded-full items-center justify-center mb-8"
          style={{
            backgroundColor: "rgba(15,122,85,0.08)",
            borderWidth: 2,
            borderColor: "rgba(15,122,85,0.15)",
          }}
        >
          <LinearGradient
            colors={["#0a6644", "#0f7a55", "#1a9068"]}
            style={{ width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="flask-outline" size={44} color="rgba(255,255,255,0.95)" />
          </LinearGradient>
        </View>

        {/* Title */}
        <Text className="text-[24px] font-black text-[#064e35] text-center mb-2">
          e-Research
        </Text>
        <Text className="text-[14px] text-[#0f7a55] font-semibold text-center mb-4">
          ระบบจัดการงานวิจัยออนไลน์
        </Text>

        {/* Divider */}
        <View className="w-16 h-[2px] bg-[#0f7a55] rounded-full opacity-30 mb-6" />

        {/* Status card */}
        <View
          className="w-full bg-white rounded-2xl p-5 border border-[#d4ece2] mb-8"
          style={{ elevation: 3, shadowColor: "#064e35", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}
        >
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-[12px] bg-[#fff8e1] items-center justify-center">
              <Ionicons name="time-outline" size={22} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-[#1a1a1a]">อยู่ระหว่างการพัฒนา</Text>
              <Text className="text-[12px] text-gray-400 mt-[2px]">กำลังรวมระบบกับทีม</Text>
            </View>
            <View className="bg-[#fff8e1] rounded-full px-3 py-1">
              <Text className="text-[11px] font-bold text-[#f59e0b]">เร็วๆ นี้</Text>
            </View>
          </View>

          <View className="gap-[10px]">
            {[
              { icon: "document-text-outline", label: "จัดการโครงการวิจัย" },
              { icon: "people-outline",        label: "ทีมนักวิจัย" },
              { icon: "bar-chart-outline",     label: "รายงานและสถิติ" },
              { icon: "cloud-upload-outline",  label: "ส่งรายงานออนไลน์" },
            ].map((f, i) => (
              <View key={i} className="flex-row items-center gap-3">
                <View className="w-7 h-7 rounded-[8px] bg-[#eaf5ef] items-center justify-center">
                  <Ionicons name={f.icon} size={15} color="#0f7a55" />
                </View>
                <Text className="text-[13px] text-gray-500 flex-1">{f.label}</Text>
                <Ionicons name="checkmark-circle-outline" size={16} color="#d1d5db" />
              </View>
            ))}
          </View>
        </View>

        {/* Back button */}
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 w-full py-[14px] rounded-[16px]"
          style={{ backgroundColor: "#0f7a55" }}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back-outline" size={18} color="#fff" />
          <Text className="text-white text-[15px] font-bold">กลับหน้าหลัก</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
