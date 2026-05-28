import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onLoginSuccess } from "../services/notificationService";

const API_URL = "http://10.6.131.15:8001/api";

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
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
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
      console.error("Login error:", error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบ API Server และเครือข่าย");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ① KeyboardAvoidingView ครอบนอกสุด
    // behavior="padding" บน iOS ดีที่สุด
    // behavior="height"  บน Android
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#eaf5ef" />

      {/* Blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      {/* ② ScrollView ให้เลื่อนได้เมื่อแป้นพิมพ์ขึ้น */}
      <ScrollView
        contentContainerStyle={styles.inner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        automaticallyAdjustKeyboardInsets
      >
        {/* Logo */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoRing}>
            <View style={styles.logoInner}>
              <Image
                source={require("../assets/urusmartlogo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Welcome to URUSmart</Text>
        <Text style={styles.subtitle}>Log in to your account</Text>

        {/* Card */}
        <View style={styles.card}>
          {/* Email */}
          <Text style={styles.label}>Username / Email</Text>
          <View style={styles.inputBox}>
            <View style={styles.iconWrap}>
              <Ionicons name="person-outline" size={18} color="#0f7a55" />
            </View>
            <TextInput
              style={styles.input}
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

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputBox}>
            <View style={styles.iconWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#0f7a55" />
            </View>
            <TextInput
              ref={passwordRef}
              style={styles.input}
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
              style={styles.eyeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#6b7a82"
              />
            </TouchableOpacity>
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.75 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf5ef",
  },
  blobTop: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#bfe3d0",
    opacity: 0.55,
  },
  blobBottom: {
    position: "absolute",
    bottom: -140,
    left: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#0f7a55",
    opacity: 0.12,
  },

  // ③ inner เปลี่ยนจาก flex:1 / justifyContent:center
  //    เป็น paddingVertical เพื่อให้ ScrollView ทำงานถูกต้อง
  inner: {
    flexGrow: 1, // ← สำคัญ: ให้ ScrollView ขยายได้
    alignItems: "center",
    justifyContent: "center", // จัดกลางเมื่อ content ไม่เต็มหน้าจอ
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 60 : (StatusBar.currentHeight ?? 24) + 20,
    paddingBottom: Platform.OS === "ios" ? 48 : 32,
  },

  // Logo
  logoWrapper: { alignItems: "center", marginBottom: 16 },
  logoRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  logoInner: {
    width: 122,
    height: 122,
    borderRadius: 61,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 100, height: 100 },

  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#064e35",
    textAlign: "center",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#56706a",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 24,
  },

  // Card
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(15,122,85,0.08)",
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
    marginLeft: 4,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5faf7",
    borderWidth: 1.5,
    borderColor: "#e3efe8",
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 54,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#e6f2ec",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1f2937",
    fontWeight: "500",
    includeFontPadding: false,
    textAlignVertical: "center",
    height: 54,
    paddingVertical: 0,
  },
  eyeBtn: { padding: 6 },

  button: {
    backgroundColor: "#0f7a55",
    borderRadius: 14,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    elevation: 4,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
});

export default Login;
