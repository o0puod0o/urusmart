import React, { useEffect, useState } from "react";
import { Alert, Linking, Platform, ScrollView, StatusBar, Switch, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../../config";
import {
  checkSupport,
  authenticate,
  setBiometricEnabled,
  isBiometricEnabled,
  saveBiometricToken,
  clearBiometricToken,
} from "../../services/biometricService";

const SSO_URL = "https://sso.youruniversity.ac.th/change-password";
const pt = Platform.OS === "ios" ? 54 : (StatusBar.currentHeight ?? 24) + 10;

export default function SecurityPage() {
  const navigation = useNavigation();

  const [biometric, setBiometric]       = useState(false);
  const [biometricInfo, setBiometricInfo] = useState(null); // { supported, label, hasFaceId }
  const [checking, setChecking]         = useState(true);

  // ── โหลด preference + ตรวจ hardware เมื่อเปิดหน้า ──────────
  useEffect(() => {
    (async () => {
      const [enabled, support] = await Promise.all([
        isBiometricEnabled(),
        checkSupport(),
      ]);
      setBiometric(enabled);
      setBiometricInfo(support);
      setChecking(false);
    })();
  }, []);

  // ── Toggle biometric ─────────────────────────────────────────
  const toggleBiometric = async (val) => {
    if (!biometricInfo?.supported) {
      Alert.alert(
        "ไม่รองรับ",
        biometricInfo?.reason ?? "อุปกรณ์นี้ไม่รองรับ Biometric",
      );
      return;
    }

    if (val) {
      // เปิด → ต้องยืนยัน biometric ก่อน
      const result = await authenticate(
        `ยืนยันเพื่อเปิดใช้ ${biometricInfo.label ?? "Biometric"}`
      );

      if (!result.success) {
        Alert.alert(
          "ยืนยันไม่สำเร็จ",
          result.error === "user_cancel"
            ? "คุณยกเลิกการยืนยัน"
            : "ไม่สามารถยืนยันตัวตนได้ กรุณาลองใหม่",
        );
        return; // ไม่เปลี่ยน switch
      }

      // บันทึก token ปัจจุบันเพื่อใช้กับ biometric login
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) await saveBiometricToken(token);

      setBiometric(true);
      await setBiometricEnabled(true);
      Alert.alert(
        "เปิดใช้งานแล้ว",
        `${biometricInfo.label ?? "Biometric"} เปิดใช้งานสำเร็จ\nครั้งถัดไปสามารถล็อคอินด้วย ${biometricInfo.label ?? "Biometric"} ได้เลย`,
      );
    } else {
      // ปิด → ถามยืนยันก่อน
      Alert.alert(
        "ปิด Biometric",
        "ต้องการปิดการเข้าสู่ระบบด้วย Biometric ใช่ไหม?",
        [
          { text: "ยกเลิก", style: "cancel" },
          {
            text: "ปิด",
            style: "destructive",
            onPress: async () => {
              setBiometric(false);
              await setBiometricEnabled(false);
              await clearBiometricToken();
            },
          },
        ],
      );
    }
  };

  const handleChangePassword = () => {
    Alert.alert(
      "เปลี่ยนรหัสผ่าน",
      "การเปลี่ยนรหัสผ่านทำผ่านระบบ SSO ของมหาวิทยาลัย\nต้องการไปที่เว็บไซต์หรือไม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        { text: "เปิดเว็บ", onPress: () => Linking.openURL(SSO_URL) },
      ],
    );
  };

  const handlePIN = () =>
    Alert.alert("ตั้งค่า PIN", "ฟีเจอร์นี้จะเปิดใช้งานเร็วๆ นี้");

  // ── label ไอคอน biometric ────────────────────────────────────
  const biometricLabel = biometricInfo?.hasFaceId ? "Face ID" : "ลายนิ้วมือ";
  const biometricIcon  = biometricInfo?.hasFaceId ? "scan-outline" : "finger-print-outline";

  return (
    <View className="flex-1 bg-[#f0f4f1]">
      <StatusBar barStyle="light-content" backgroundColor="#14532d" />

      <View
        className="bg-brand flex-row items-center justify-between px-4 pb-[14px]"
        style={{ paddingTop: pt }}
      >
        <TouchableOpacity
          className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text className="text-[17px] font-extrabold text-white">ความปลอดภัย</Text>
        <View className="w-9" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ── บัญชีและความปลอดภัย ── */}
        <Text className="text-[12px] font-bold text-[#8a9a90] px-5 pt-5 pb-2 uppercase tracking-[0.8px]">
          บัญชีและความปลอดภัย
        </Text>

        <View className="bg-white rounded-2xl mx-4 overflow-hidden border border-[#e0ebe4]">
          {/* เปลี่ยนรหัสผ่าน */}
          <TouchableOpacity
            className="flex-row items-center gap-[14px] px-4 py-[14px] border-b border-[#e0ebe4]"
            onPress={handleChangePassword}
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 rounded-xl bg-brand items-center justify-center">
              <Ionicons name="lock-closed-outline" size={20} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-[#101b17]">เปลี่ยนรหัสผ่าน</Text>
              <Text className="text-[12px] font-medium text-[#5a6a60] mt-[2px]">อัปเดตล่าสุด 3 เดือนที่แล้ว</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#8a9a90" />
          </TouchableOpacity>

          {/* ตั้งค่า PIN */}
          <TouchableOpacity
            className="flex-row items-center gap-[14px] px-4 py-[14px] border-b border-[#e0ebe4]"
            onPress={handlePIN}
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 rounded-xl bg-[#7c3aed] items-center justify-center">
              <Ionicons name="keypad-outline" size={20} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-[#101b17]">ตั้งค่า PIN</Text>
              <Text className="text-[12px] font-medium text-[#5a6a60] mt-[2px]">6 หลัก</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#8a9a90" />
          </TouchableOpacity>

          {/* Biometric */}
          <View className="flex-row items-center gap-[14px] px-4 py-[14px]">
            <View className="w-10 h-10 rounded-xl bg-[#0891b2] items-center justify-center">
              <Ionicons name={biometricIcon} size={20} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-[#101b17]">
                เข้าสู่ระบบด้วย {biometricLabel}
              </Text>
              {checking ? (
                <Text className="text-[12px] text-[#aaa] mt-[2px]">กำลังตรวจสอบ...</Text>
              ) : !biometricInfo?.supported ? (
                <Text className="text-[12px] text-[#e65100] mt-[2px]">
                  {biometricInfo?.reason ?? "ไม่รองรับในอุปกรณ์นี้"}
                </Text>
              ) : biometric ? (
                <Text className="text-[12px] text-[#0f7a55] font-semibold mt-[2px]">
                  ✓ เปิดใช้งานอยู่
                </Text>
              ) : (
                <Text className="text-[12px] font-medium text-[#5a6a60] mt-[2px]">
                  {biometricLabel} / ลายนิ้วมือ
                </Text>
              )}
            </View>
            <Switch
              value={biometric}
              onValueChange={toggleBiometric}
              disabled={checking || !biometricInfo?.supported}
              trackColor={{ false: "#dfe8e3", true: "#1a6b3c" }}
              thumbColor="#fff"
              ios_backgroundColor="#dfe8e3"
            />
          </View>
        </View>

        {/* ── คำอธิบาย ── */}
        {biometricInfo?.supported && (
          <View className="flex-row items-start gap-2 bg-[#e8f5ee] rounded-[14px] mx-4 mt-4 p-[14px] border border-[#e0ebe4]">
            <Ionicons name="information-circle-outline" size={16} color="#1a6b3c" />
            <Text className="flex-1 text-[12px] text-[#5a6a60] leading-[18px]">
              เมื่อเปิดใช้งาน{biometricLabel} ครั้งถัดไปที่เปิดแอปจะสามารถล็อคอินได้ทันทีโดยไม่ต้องพิมพ์รหัสผ่าน
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
