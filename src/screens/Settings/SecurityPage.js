import React, { useEffect, useState } from "react";
import { Alert, Linking, Platform, ScrollView, StatusBar, Switch, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SSO_URL = "https://sso.youruniversity.ac.th/change-password";
const PT = Platform.OS === "ios" ? "pt-[54px]" : `pt-[${(StatusBar.currentHeight ?? 24) + 10}px]`;

export default function SecurityPage() {
  const navigation = useNavigation();
  const [biometric, setBiometric] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("@biometric").then((val) => {
      if (val !== null) setBiometric(JSON.parse(val));
    });
  }, []);

  const toggleBiometric = async (val) => {
    setBiometric(val);
    await AsyncStorage.setItem("@biometric", JSON.stringify(val));
  };

  const handleChangePassword = () => {
    Alert.alert("เปลี่ยนรหัสผ่าน", "การเปลี่ยนรหัสผ่านทำผ่านระบบ SSO ของมหาวิทยาลัย\nต้องการไปที่เว็บไซต์หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      { text: "เปิดเว็บ", onPress: () => Linking.openURL(SSO_URL) },
    ]);
  };

  const handlePIN = () => Alert.alert("ตั้งค่า PIN", "ฟีเจอร์นี้จะเปิดใช้งานเร็วๆ นี้");

  return (
    <View className="flex-1 bg-[#f0f4f1]">
      <StatusBar barStyle="light-content" backgroundColor="#14532d" />

      <View className={`bg-brand flex-row items-center justify-between px-4 pb-[14px] ${PT}`}>
        <TouchableOpacity className="w-9 h-9 rounded-full bg-white/20 items-center justify-center" onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text className="text-[17px] font-extrabold text-white">ความปลอดภัย</Text>
        <View className="w-9" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-[12px] font-bold text-[#8a9a90] px-5 pt-5 pb-2 uppercase tracking-[0.8px]">บัญชีและความปลอดภัย</Text>

        <View className="bg-white rounded-2xl mx-4 overflow-hidden border border-[#e0ebe4]">
          <TouchableOpacity className="flex-row items-center gap-[14px] px-4 py-[14px] border-b border-[#e0ebe4]" onPress={handleChangePassword} activeOpacity={0.7}>
            <View className="w-10 h-10 rounded-xl bg-brand items-center justify-center">
              <Ionicons name="lock-closed-outline" size={20} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-[#101b17]">เปลี่ยนรหัสผ่าน</Text>
              <Text className="text-[12px] font-medium text-[#5a6a60] mt-[2px]">อัปเดตล่าสุด 3 เดือนที่แล้ว</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#8a9a90" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center gap-[14px] px-4 py-[14px] border-b border-[#e0ebe4]" onPress={handlePIN} activeOpacity={0.7}>
            <View className="w-10 h-10 rounded-xl bg-[#7c3aed] items-center justify-center">
              <Ionicons name="keypad-outline" size={20} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-[#101b17]">ตั้งค่า PIN</Text>
              <Text className="text-[12px] font-medium text-[#5a6a60] mt-[2px]">6 หลัก</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#8a9a90" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-[14px] px-4 py-[14px]">
            <View className="w-10 h-10 rounded-xl bg-[#0891b2] items-center justify-center">
              <Ionicons name="finger-print-outline" size={20} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-[#101b17]">เข้าสู่ระบบด้วย Biometric</Text>
              <Text className="text-[12px] font-medium text-[#5a6a60] mt-[2px]">Face ID / ลายนิ้วมือ</Text>
            </View>
            <Switch value={biometric} onValueChange={toggleBiometric} trackColor={{ false: "#dfe8e3", true: "#1a6b3c" }} thumbColor="#fff" ios_backgroundColor="#dfe8e3" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
