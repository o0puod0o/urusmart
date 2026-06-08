import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  Keyboard,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onLoginSuccess } from "../services/notificationService";
import { API_BASE_URL, STORAGE_KEYS } from "../config";
import {
  checkSupport,
  authenticate,
  isBiometricEnabled,
  getBiometricToken,
  saveBiometricToken,
} from "../services/biometricService";

const API_URL = API_BASE_URL;
const PT = Platform.OS === "ios" ? 60 : (StatusBar.currentHeight ?? 24) + 20;
const PB = Platform.OS === "ios" ? 48 : 32;

// ── Field ปกติ ไม่ใช้ Reanimated (ป้องกัน crash) ──────────────
const Field = ({ label, icon, children, focused }) => (
  <View className="mb-4">
    <Text className="text-[12px] font-bold text-[#374151] mb-[6px] ml-1">
      {label}
    </Text>
    <View
      className="flex-row items-center bg-[#f5faf7] rounded-[14px] px-3 h-[54px]"
      style={{
        borderWidth: focused ? 2 : 1.5,
        borderColor: focused ? "#0f7a55" : "#e3efe8",
      }}
    >
      <View className="w-[34px] h-[34px] rounded-[10px] bg-[#e6f2ec] items-center justify-center mr-[10px]">
        <Ionicons name={icon} size={18} color="#0f7a55" />
      </View>
      {children}
    </View>
  </View>
);

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("Biometric");
  const [biometricIcon, setBiometricIcon] = useState("finger-print-outline");
  const [biometricReady, setBiometricReady] = useState(false);
  const passwordRef = useRef(null);

  // ── Entrance animations ──
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const textY = useSharedValue(30);
  const textOpacity = useSharedValue(0);
  const cardY = useSharedValue(50);
  const cardOpacity = useSharedValue(0);
  const btnScale = useSharedValue(1);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 120 });
    logoOpacity.value = withTiming(1, { duration: 400 });
    textY.value = withDelay(250, withSpring(0, { damping: 14 }));
    textOpacity.value = withDelay(250, withTiming(1, { duration: 400 }));
    cardY.value = withDelay(
      400,
      withSpring(0, { damping: 16, stiffness: 100 }),
    );
    cardOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
  }, []);

  // ── ตรวจ Biometric ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [enabled, support] = await Promise.all([
        isBiometricEnabled(),
        checkSupport(),
      ]);
      if (enabled && support.supported) {
        setBiometricAvailable(true);
        setBiometricLabel(support.hasFaceId ? "Face ID" : "ลายนิ้วมือ");
        setBiometricIcon(
          support.hasFaceId ? "scan-outline" : "finger-print-outline",
        );
        setBiometricReady(true);
      }
    })();
  }, []);

  // ── Auto-trigger biometric ───────────────────────────────────
  useEffect(() => {
    if (!biometricReady) return;
    const timer = setTimeout(() => triggerBiometric(), 700);
    return () => clearTimeout(timer);
  }, [biometricReady]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));
  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textY.value }],
    opacity: textOpacity.value,
  }));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardY.value }],
    opacity: cardOpacity.value,
  }));
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const handleLogin = async () => {
    Keyboard.dismiss();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      cardY.value = withSequence(
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(-4, { duration: 60 }),
        withTiming(4, { duration: 60 }),
        withSpring(0),
      );
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
      console.log("[Login] กำลังเข้าสู่ระบบด้วย email:", trimmedEmail);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      });
      const data = await response.json();
      console.log("[Login] ตอบสนองจาก API:", response.ok ? "สำเร็จ" : "ล้มเหลว", data);
      
      if (response.ok) {
        console.log("[Login] บันทึก token และ user ลง AsyncStorage...");
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.TOKEN, String(data.token || "")],
          [STORAGE_KEYS.TOKEN_TYPE, String(data.token_type || "")],
          [STORAGE_KEYS.USER, JSON.stringify(data.user || {})],
        ]);
        console.log("[Login] AsyncStorage บันทึกเสร็จ");
        
        if (data.token) {
          console.log("[Login] บันทึก Biometric token...");
          await saveBiometricToken(String(data.token));
          console.log("[Login] Biometric token บันทึกเสร็จ");
        }
        
        console.log("[Login] เรียก onLoginSuccess()...");
        try {
          await onLoginSuccess();
          console.log("[Login] onLoginSuccess() เสร็จ");
        } catch (notificationError) {
          console.warn("[Login] onLoginSuccess() เกิด error (แต่จะวนต่อ):", notificationError);
        }
        
        console.log("[Login] ทำการ navigate ไป MainTabs...");
        setLoading(false);
        navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
        console.log("[Login] Navigate ส่งคำสั่งเสร็จ");
      } else {
        console.log("[Login] เข้าสู่ระบบไม่สำเร็จ:", data.message);
        Alert.alert(
          "เข้าสู่ระบบไม่สำเร็จ",
          data.message || "username หรือรหัสผ่านไม่ถูกต้อง",
        );
      }
    } catch (error) {
      console.error("[Login] Catch error:", error);
      Alert.alert(
        "เกิดข้อผิดพลาด",
        "ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบ API Server และเครือข่าย",
      );
    } finally {
      setLoading(false);
    }
  };

  const triggerBiometric = async () => {
    console.log("[Biometric] ทำการยืนยันตัวตน...");
    const result = await authenticate("ยืนยันตัวตนเพื่อเข้าสู่ระบบ URUSmart");
    console.log("[Biometric] ผลการยืนยัน:", result.success ? "สำเร็จ" : "ล้มเหลว");
    
    if (!result.success) {
      console.log("[Biometric] ผู้ใช้ยกเลิก");
      return;
    }
    
    const token = await getBiometricToken();
    if (!token) {
      console.log("[Biometric] ไม่พบ biometric token");
      Alert.alert(
        "ไม่พบข้อมูล",
        "กรุณาเข้าสู่ระบบด้วย email และรหัสผ่านก่อน 1 ครั้ง",
      );
      return;
    }
    
    console.log("[Biometric] Navigate ไป MainTabs...");
    navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
  };

  const onPressIn = () => {
    btnScale.value = withSpring(0.96, { damping: 12 });
  };
  const onPressOut = () => {
    btnScale.value = withSpring(1, { damping: 12 });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={
        Platform.OS === "ios" ? 0 : (StatusBar.currentHeight ?? 0)
      }
    >
      <StatusBar barStyle="dark-content" backgroundColor="#eaf5ef" />

      {/* Background */}
      <LinearGradient
        colors={["#eaf5ef", "#d6eee3", "#eaf5ef"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{
          top: -130,
          right: -90,
          backgroundColor: "rgba(191,227,208,0.6)",
        }}
      />
      <View
        className="absolute w-[260px] h-[260px] rounded-full"
        style={{
          bottom: -100,
          left: -80,
          backgroundColor: "rgba(15,122,85,0.08)",
        }}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingTop: PT,
          paddingBottom: PB,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Logo */}
        <Animated.View className="items-center mb-5" style={logoStyle}>
          <View
            className="w-[148px] h-[148px] rounded-full items-center justify-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.7)",
              elevation: 8,
              shadowColor: "#0f7a55",
              shadowOpacity: 0.15,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
            }}
          >
            <LinearGradient
              colors={["#ffffff", "#f0faf5"]}
              style={{
                width: 128,
                height: 128,
                borderRadius: 64,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Image
                source={require("../assets/urusmartlogo.png")}
                style={{ width: 104, height: 104 }}
                resizeMode="contain"
              />
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View className="items-center mb-7" style={textStyle}>
          <Text className="text-[24px] font-black text-[#064e35] text-center tracking-[-0.3px]">
            Welcome to URUSmart
          </Text>
          <Text className="text-[13px] text-[#56706a] text-center font-medium mt-[6px]">
            ลงชื่อเข้าใช้บัญชีของคุณ
          </Text>
        </Animated.View>

        {/* Card */}
        <Animated.View className="w-full" style={cardStyle}>
          <View
            className="bg-white rounded-[26px] p-6 border border-[rgba(15,122,85,0.08)]"
            style={{
              elevation: 10,
              shadowColor: "#0f7a55",
              shadowOpacity: 0.12,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 10 },
            }}
          >
            {/* Email */}
            <Field
              label="Username / Email"
              icon="person-outline"
              focused={emailFocused}
            >
              <TextInput
                className="flex-1 text-[15px] text-[#1f2937] font-medium"
                style={{ height: 54, paddingVertical: 0 }}
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
                underlineColorAndroid="transparent"
                autoComplete="off"
              />
            </Field>

            {/* Password */}
            <Field
              label="Password"
              icon="lock-closed-outline"
              focused={passFocused}
            >
              <TextInput
                ref={passwordRef}
                className="flex-1 text-[15px] text-[#1f2937] font-medium"
                style={{ height: 54, paddingVertical: 0 }}
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                underlineColorAndroid="transparent"
                autoComplete="off"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#6b7a82"
                />
              </TouchableOpacity>
            </Field>

            {/* Sign in button */}
            <Animated.View style={btnStyle}>
              <TouchableOpacity
                onPress={handleLogin}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                disabled={loading}
                activeOpacity={1}
              >
                <LinearGradient
                  colors={
                    loading
                      ? ["#7bb8a4", "#7bb8a4"]
                      : ["#0a6644", "#0f7a55", "#1a9068"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: 56,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 4,
                    elevation: 4,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View className="flex-row items-center gap-2">
                      <Text className="text-white text-[16px] font-extrabold tracking-[0.8px]">
                        Sign in
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color="rgba(255,255,255,0.85)"
                      />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Biometric button */}
            {biometricAvailable && (
              <TouchableOpacity
                className="flex-row items-center justify-center gap-2 mt-3 py-[14px] rounded-2xl border border-[#d4ece2]"
                style={{ backgroundColor: "rgba(14,122,85,0.06)" }}
                onPress={triggerBiometric}
                activeOpacity={0.8}
              >
                <Ionicons name={biometricIcon} size={22} color="#0f7a55" />
                <Text className="text-primary text-[14px] font-bold">
                  เข้าสู่ระบบด้วย {biometricLabel}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Footer */}
        <Animated.View
          className="flex-row items-center gap-[5px] mt-6"
          style={[textStyle, { opacity: 0.4 }]}
        >
          <Ionicons name="shield-checkmark-outline" size={12} color="#0a6644" />
          <Text className="text-[10px] text-[#0a6644] font-semibold">
            Secured by URUSmart · Uttaradit Rajabhat University
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
