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
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://localhost:8001/api";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState(null);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("กรุณากรอก email และรหัสผ่าน");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("รูปแบบ email ไม่ถูกต้อง");
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
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("token_type", data.token_type);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        navigation.navigate("MainTabs");
      } else {
        alert(data.message || "username หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            alert("Email หรือ Password ไม่ถูกต้อง");
            break;
          case 422:
            alert("กรุณากรอกข้อมูลให้ครบ");
            break;
          case 500:
            alert("Server error");
            break;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Decorative background blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
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

          {/* Title */}
          <Text style={styles.title}>Welcome to URUSmart</Text>
          <Text style={styles.subtitle}>Log in to your account</Text>

          {/* Card */}
          <View style={styles.card}>
            {/* Username */}
            <View
              style={[
                styles.inputBox,
                focusField === "email" && styles.inputBoxFocused,
              ]}
            >
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
                onFocus={() => setFocusField("email")}
                onBlur={() => setFocusField(null)}
              />
            </View>

            {/* Password */}
            <View
              style={[
                styles.inputBox,
                focusField === "password" && styles.inputBoxFocused,
              ]}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#0f7a55"
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setFocusField("password")}
                onBlur={() => setFocusField(null)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#6b7a82"
                />
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf5ef",
    overflow: "hidden",
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
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 18,
  },
  logoRing: {
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f7a55",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  logoInner: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 118,
    height: 118,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#064e35",
    textAlign: "center",
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#56706a",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 28,
    letterSpacing: 0.3,
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 22,
    shadowColor: "#0f7a55",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(15,122,85,0.06)",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5faf7",
    borderWidth: 1.5,
    borderColor: "#e3efe8",
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 14,
    height: 58,
  },
  inputBoxFocused: {
    borderColor: "#0f7a55",
    backgroundColor: "#ffffff",
    shadowColor: "#0f7a55",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
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
  },
  eyeBtn: {
    padding: 6,
  },
  button: {
    backgroundColor: "#0f7a55",
    borderRadius: 16,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#0f7a55",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
});

export default Login;
