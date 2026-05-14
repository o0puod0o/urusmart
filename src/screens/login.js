import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    setLoading(true);
    try {
      setTimeout(() => {
        setLoading(false);
        navigation.navigate("MainTabs");
      }, 1500);
    } catch (error) {
      setLoading(false);
      alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <KeyboardAvoidingView
      style={S.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Upper half: green ── */}
        <LinearGradient
          colors={["#043d2a", "#0f7a55"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={S.topHalf}
        >
          {/* decorative circles */}
          <View style={S.circle1} />
          <View style={S.circle2} />

          {/* Logo */}
          <View style={S.logoWrap}>
            <Image
              source={require("../assets/urusmartlogo.png")}
              style={S.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={S.appName}>URUSmart</Text>
        </LinearGradient>

        {/* ── Lower half: white form card ── */}
        <View style={S.bottomHalf}>
          {/* Card overlapping the two halves */}
          <View style={S.card}>
            <Text style={S.cardTitle}>เข้าสู่ระบบ</Text>
            <Text style={S.cardSub}>Sign in to your account</Text>

            {/* Email */}
            <View style={[S.inputBox, emailFocused && S.inputFocused]}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={emailFocused ? "#0f7a55" : "#8fa89f"}
                style={S.icon}
              />
              <TextInput
                style={S.input}
                placeholder="อีเมล"
                placeholderTextColor="#b0c4bc"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={[S.inputBox, passFocused && S.inputFocused]}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={passFocused ? "#0f7a55" : "#8fa89f"}
                style={S.icon}
              />
              <TextInput
                style={S.input}
                placeholder="รหัสผ่าน"
                placeholderTextColor="#b0c4bc"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color="#8fa89f"
                />
              </TouchableOpacity>
            </View>

            {/* Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={{ marginTop: 8 }}
            >
              <LinearGradient
                colors={
                  loading ? ["#5aab8a", "#5aab8a"] : ["#043d2a", "#0f7a55"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={S.button}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={S.btnRow}>
                    <Text style={S.btnTxt}>เข้าสู่ระบบ</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f6f2" },

  // ── Top green section ──
  topHalf: {
    height: 340,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  // decorative background circles
  circle1: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -60,
    right: -60,
  },
  circle2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: 20,
    left: -50,
  },
  logoWrap: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: { width: 72, height: 72 },
  appName: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  appSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },

  // ── Bottom white section ──
  bottomHalf: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    marginTop: -32,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#043d2a",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#eef8f3",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111c18",
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    color: "#8fa89f",
    fontWeight: "600",
    marginBottom: 24,
  },

  // ── Input ──
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6fcf9",
    borderWidth: 1.5,
    borderColor: "#dce8e2",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 14,
  },
  inputFocused: {
    borderColor: "#0f7a55",
    backgroundColor: "#eef8f3",
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#111c18",
    fontWeight: "600",
  },

  // ── Button ──
  button: {
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btnTxt: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});

export default Login;
