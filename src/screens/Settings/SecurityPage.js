import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// TODO: ใส่ URL SSO จริง
const SSO_URL = "https://sso.youruniversity.ac.th/change-password";

const C = {
  primary: "#1a6b3c",
  primaryDark: "#14532d",
  primarySoft: "#e8f5ee",
  bg: "#f0f4f1",
  card: "#fff",
  ink: "#101b17",
  sub: "#5a6a60",
  dim: "#8a9a90",
  line: "#e0ebe4",
  purple: "#7c3aed",
  switchOff: "#dfe8e3",
  chevron: "#c9eadb",
};

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
    Alert.alert(
      "เปลี่ยนรหัสผ่าน",
      "การเปลี่ยนรหัสผ่านทำผ่านระบบ SSO ของมหาวิทยาลัย\nต้องการไปที่เว็บไซต์หรือไม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        { text: "เปิดเว็บ", onPress: () => Linking.openURL(SSO_URL) },
      ],
    );
  };

  const handlePIN = () => {
    Alert.alert("ตั้งค่า PIN", "ฟีเจอร์นี้จะเปิดใช้งานเร็วๆ นี้");
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>ความปลอดภัย</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.body}>
        <Text style={s.sectionLabel}>บัญชีและความปลอดภัย</Text>

        <View style={s.card}>
          {/* เปลี่ยนรหัสผ่าน */}
          <TouchableOpacity style={[s.row, s.rowBorder]} onPress={handleChangePassword} activeOpacity={0.7}>
            <View style={[s.iconWrap, { backgroundColor: C.primary }]}>
              <Ionicons name="lock-closed-outline" size={20} color="#fff" />
            </View>
            <View style={s.textWrap}>
              <Text style={s.rowTitle}>เปลี่ยนรหัสผ่าน</Text>
              <Text style={s.rowSub}>อัปเดตล่าสุด 3 เดือนที่แล้ว</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.dim} />
          </TouchableOpacity>

          {/* ตั้งค่า PIN */}
          <TouchableOpacity style={[s.row, s.rowBorder]} onPress={handlePIN} activeOpacity={0.7}>
            <View style={[s.iconWrap, { backgroundColor: C.purple }]}>
              <Ionicons name="keypad-outline" size={20} color="#fff" />
            </View>
            <View style={s.textWrap}>
              <Text style={s.rowTitle}>ตั้งค่า PIN</Text>
              <Text style={s.rowSub}>6 หลัก</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.dim} />
          </TouchableOpacity>

          {/* Biometric */}
          <View style={s.row}>
            <View style={[s.iconWrap, { backgroundColor: "#0891b2" }]}>
              <Ionicons name="finger-print-outline" size={20} color="#fff" />
            </View>
            <View style={s.textWrap}>
              <Text style={s.rowTitle}>เข้าสู่ระบบด้วย Biometric</Text>
              <Text style={s.rowSub}>Face ID / ลายนิ้วมือ</Text>
            </View>
            <Switch
              value={biometric}
              onValueChange={toggleBiometric}
              trackColor={{ false: C.switchOff, true: C.primary }}
              thumbColor="#fff"
              ios_backgroundColor={C.switchOff}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 54 : (StatusBar.currentHeight ?? 24) + 10,
    paddingBottom: 14,
    backgroundColor: C.primary,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#fff" },

  body: { paddingBottom: 40 },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.dim,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.line,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: "700", color: C.ink },
  rowSub: { fontSize: 12, fontWeight: "500", color: C.sub, marginTop: 2 },
});
