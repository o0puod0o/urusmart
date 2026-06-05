import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EResearch({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-[#f6faf8]">
      <View className="flex-row items-center justify-between px-4 py-[14px] bg-white border-b border-[#e8ecf0]">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-[#f0faf5] items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#0f7a55" />
        </TouchableOpacity>
        <Text className="text-[17px] font-bold text-[#1a1a1a]">e-Research</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <View className="w-[120px] h-[120px] rounded-[60px] bg-[#d6f0e3] items-center justify-center mb-6">
          <Ionicons name="construct-outline" size={64} color="#0f7a55" />
        </View>
        <Text className="text-[22px] font-extrabold text-primary mb-3">กำลังพัฒนา</Text>
        <Text className="text-[15px] text-gray-500 text-center leading-6 mb-9">
          ระบบ e-Research อยู่ในระหว่างการพัฒนา{"\n"}โปรดติดตามการอัปเดตในภายหลัง
        </Text>
        <TouchableOpacity
          className="flex-row items-center bg-primary px-6 py-3 rounded-xl"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text className="text-white text-[15px] font-bold">กลับหน้าหลัก</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
