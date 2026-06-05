import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Platform,
  ActivityIndicator, Image, StatusBar, KeyboardAvoidingView,
  ScrollView, Alert, Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onLoginSuccess } from "../services/notificationService";

const API_URL = "http://10.6.132.101:8001/api";

const PT = Platform.OS === "ios" ? 60 : (StatusBar.currentHeight ?? 24) + 20;
const PB = Platform.OS === "ios" ? 48 : 32;

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef(null);

  const handleLogin = async () => {
    Keyboard.dismiss();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert("แจ้งเตือน", "กรุณากรอก email และรหัสผ่าน");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("แจ้งเตือน", "รูปแบบ email ไม่ถูกต้อง");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.multiSet([
          ["token", String(data.token || "")],
          ["token_type", String(data.token_type || "")],
          ["user", JSON.stringify(data.user || {})],
        ]);
        onLoginSuccess().catch(() => {});
        navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
      } else {
        Alert.alert("เข้าสู่ระบบไม่สำเร็จ", data.message || "username หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบ API Server และเครือข่าย");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#eaf5ef]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : (StatusBar.currentHeight ?? 0)}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#eaf5ef" />

      {/* Blobs */}
      <View className="absolute w-[280px] h-[280px] rounded-[140px] bg-[#bfe3d0] opacity-55" style={{ top: -120, right: -80 }} />
      <View className="absolute w-[320px] h-[320px] rounded-[160px] bg-primary opacity-[0.12]" style={{ bottom: -140, left: -100 }} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingTop: PT, paddingBottom: PB }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Logo */}
        <View className="items-center mb-4">
          <View className="w-[140px] h-[140px] rounded-[70px] bg-white/60 items-center justify-center" style={{ elevation: 6 }}>
            <View className="w-[122px] h-[122px] rounded-[61px] overflow-hidden bg-white items-center justify-center">
              <Image source={require("../assets/urusmartlogo.png")} className="w-[100px] h-[100px]" resizeMode="contain" />
            </View>
          </View>
        </View>

        <Text className="text-[22px] font-black text-[#064e35] text-center tracking-[0.4px] mb-1">Welcome to URUSmart</Text>
        <Text className="text-[13px] text-[#56706a] text-center font-semibold mb-6">Log in to your account</Text>

        {/* Card */}
        <View className="w-full bg-white rounded-[24px] p-5 border border-[rgba(15,122,85,0.08)]" style={{ elevation: 6 }}>
          <Text className="text-[12px] font-bold text-[#374151] mb-[6px] ml-1">Username / Email</Text>
          <View className="flex-row items-center bg-[#f5faf7] border-[1.5px] border-[#e3efe8] rounded-[14px] px-3 mb-4 h-[54px]">
            <View className="w-[34px] h-[34px] rounded-[10px] bg-[#e6f2ec] items-center justify-center mr-[10px]">
              <Ionicons name="person-outline" size={18} color="#0f7a55" />
            </View>
            <TextInput
              className="flex-1 text-[15px] text-[#1f2937] font-medium"
              style={{ height: 54, paddingVertical: 0 }}
              placeholder="Enter your username"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
              underlineColorAndroid="transparent"
              autoComplete="off"
            />
          </View>

          <Text className="text-[12px] font-bold text-[#374151] mb-[6px] ml-1">Password</Text>
          <View className="flex-row items-center bg-[#f5faf7] border-[1.5px] border-[#e3efe8] rounded-[14px] px-3 mb-4 h-[54px]">
            <View className="w-[34px] h-[34px] rounded-[10px] bg-[#e6f2ec] items-center justify-center mr-[10px]">
              <Ionicons name="lock-closed-outline" size={18} color="#0f7a55" />
            </View>
            <TextInput
              ref={passwordRef}
              className="flex-1 text-[15px] text-[#1f2937] font-medium"
              style={{ height: 54, paddingVertical: 0 }}
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              underlineColorAndroid="transparent"
              autoComplete="off"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="p-[6px]"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#6b7a82" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-primary rounded-[14px] h-[54px] items-center justify-center mt-1"
            style={[{ elevation: 4 }, loading && { opacity: 0.75 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <Text className="text-white text-[16px] font-extrabold tracking-[0.8px]">Sign in</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
