/**
 * Settingpage.js — หน้าตั้งค่าสำหรับระบบอาจารย์และบุคลากรมหาวิทยาลัย
 *
 * sections:
 *  1. Mini Profile Banner  — avatar, ชื่อ, ตำแหน่ง (กดไปหน้า Staff Card)
 *  2. บัญชีและความปลอดภัย — เปลี่ยนรหัสผ่าน, PIN, Biometric
 *  3. การแจ้งเตือน        — push, ประเภทที่ต้องการ
 *  4. ออกจากระบบ
 */

import React, { useState } from "react";
import {
  Modal,
  SafeAreaView,
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
import { LinearGradient } from "expo-linear-gradient";

// ══════════════════════════════════════════════════════════════
// THEME
// ══════════════════════════════════════════════════════════════
const C = {
  g900: "#043d2a",
  g700: "#0a6644",
  g500: "#0f7a55",
  g400: "#1a9068",
  g300: "#5aab8a",
  g100: "#c8e8d8",
  g50: "#eef8f3",
  g20: "#f6fcf9",
  ink: "#111c18",
  sub: "#4a5e56",
  dim: "#8fa89f",
  line: "#dce8e2",
  card: "#ffffff",
  bg: "#f0f6f2",
  red: "#dc2626",
  redBg: "#fef2f2",
};

const HDR_GRADIENT = ["#064e35", "#0f7a55"];

// ── mock user ─────────────────────────────────────────────────
const MOCK_USER = {
  name: "ผศ.ดร. สมชาย มั่นคง",
  nameEn: "Asst.Prof.Dr. Somchai Munkong",
  role: "อาจารย์ประจำ",
  empId: "STF-2566-0042",
  email: "somchai.m@university.ac.th",
  avatar: null,
};

// ══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════

const SectionHeader = ({ icon, title, color = C.g700 }) => (
  <View style={SH.wrap}>
    <View style={[SH.iconBox, { backgroundColor: color + "18" }]}>
      <Ionicons name={icon} size={15} color={color} />
    </View>
    <Text style={SH.title}>{title}</Text>
  </View>
);
const SH = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 11,
    fontWeight: "800",
    color: C.sub,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});

const SettingRow = ({
  icon,
  iconColor = C.g500,
  label,
  value,
  onPress,
  danger = false,
  noBorder = false,
}) => (
  <TouchableOpacity
    style={[SR.row, noBorder && SR.noBorder]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View
      style={[
        SR.iconWrap,
        { backgroundColor: (danger ? C.red : iconColor) + "15" },
      ]}
    >
      <Ionicons name={icon} size={18} color={danger ? C.red : iconColor} />
    </View>
    <View style={SR.middle}>
      <Text style={[SR.label, danger && { color: C.red }]}>{label}</Text>
      {!!value && (
        <Text style={SR.value} numberOfLines={1}>
          {value}
        </Text>
      )}
    </View>
    <Ionicons name="chevron-forward" size={16} color={C.dim} />
  </TouchableOpacity>
);
const SR = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    gap: 13,
  },
  noBorder: { borderBottomWidth: 0 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  middle: { flex: 1 },
  label: { fontSize: 14, fontWeight: "700", color: C.ink },
  value: { fontSize: 12, color: C.dim, fontWeight: "600", marginTop: 1 },
});

const ToggleRow = ({
  icon,
  iconColor = C.g500,
  label,
  sub,
  value,
  onChange,
  noBorder = false,
}) => (
  <View style={[SR.row, noBorder && SR.noBorder]}>
    <View style={[SR.iconWrap, { backgroundColor: iconColor + "15" }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <View style={SR.middle}>
      <Text style={SR.label}>{label}</Text>
      {!!sub && <Text style={SR.value}>{sub}</Text>}
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: C.line, true: C.g300 }}
      thumbColor={value ? C.g500 : "#fff"}
      ios_backgroundColor={C.line}
    />
  </View>
);

const Card = ({ children, style }) => (
  <View style={[CA.card, style]}>{children}</View>
);
const CA = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: C.line,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
});

// ══════════════════════════════════════════════════════════════
// AVATAR INITIALS
// ══════════════════════════════════════════════════════════════
const AvatarInitials = ({ name, size = 44 }) => {
  const skip = [
    "ผศ",
    "รศ",
    "ศ",
    "ดร",
    "อาจารย์",
    "Dr",
    "Prof",
    "Asst",
    "Assoc",
  ];
  const words = name
    .split(" ")
    .filter((w) => !skip.some((s) => w.startsWith(s)));
  const initials =
    words
      .slice(0, 2)
      .map((w) => w[0])
      .join("") || name[0];
  return (
    <LinearGradient
      colors={["#0f7a55", "#064e35"]}
      style={[AV.circle, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[AV.txt, { fontSize: size * 0.32 }]}>{initials}</Text>
    </LinearGradient>
  );
};
const AV = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center" },
  txt: { color: "#fff", fontWeight: "900" },
});

// ══════════════════════════════════════════════════════════════
// LOGOUT MODAL
// ══════════════════════════════════════════════════════════════
const LogoutModal = ({ visible, onCancel, onConfirm }) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={LM.overlay}>
      <View style={LM.box}>
        <View style={LM.iconWrap}>
          <Ionicons name="log-out-outline" size={28} color={C.red} />
        </View>
        <Text style={LM.title}>ออกจากระบบ</Text>
        <Text style={LM.body}>
          คุณต้องการออกจากระบบใช่หรือไม่?{"\n"}ข้อมูลที่ยังไม่บันทึกจะหายไป
        </Text>
        <View style={LM.btnRow}>
          <TouchableOpacity
            style={LM.cancel}
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <Text style={LM.cancelTxt}>ยกเลิก</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={LM.confirm}
            onPress={onConfirm}
            activeOpacity={0.8}
          >
            <Text style={LM.confirmTxt}>ออกจากระบบ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);
const LM = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 28,
    width: "82%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: C.redBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: { fontSize: 18, fontWeight: "900", color: C.ink, marginBottom: 8 },
  body: {
    fontSize: 13,
    color: C.sub,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 22,
  },
  btnRow: { flexDirection: "row", gap: 10, width: "100%" },
  cancel: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: C.g50,
    borderWidth: 1,
    borderColor: C.g100,
    alignItems: "center",
  },
  cancelTxt: { color: C.g700, fontWeight: "800", fontSize: 14 },
  confirm: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: C.red,
    alignItems: "center",
  },
  confirmTxt: { color: "#fff", fontWeight: "800", fontSize: 14 },
});

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function Settingpage() {
  const navigation = useNavigation();

  const [notifPush, setNotifPush] = useState(true);
  const [notifNews, setNotifNews] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const user = MOCK_USER;

  const handleLogout = () => {
    setShowLogout(false);
    // navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <SafeAreaView style={P.screen}>
      <StatusBar barStyle="light-content" />

      {/* ── HEADER ─────────────────────────────────────────── */}
      <LinearGradient
        colors={HDR_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={P.header}
      >
        <View style={P.hdrRow}>
          <TouchableOpacity
            style={P.circleBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={P.hdrTitle}>ตั้งค่า</Text>
            <Text style={P.hdrSub}>Settings</Text>
          </View>
          <View style={P.circleBtn} />
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* ════════════════════════════════════════════════════ */}
        {/* 1. MINI PROFILE BANNER                              */}
        {/* ════════════════════════════════════════════════════ */}
        <TouchableOpacity
          style={MB.card}
          onPress={() => navigation.navigate("StaffCard")}
          activeOpacity={0.75}
        >
          <AvatarInitials name={user.name} size={48} />
          <View style={MB.info}>
            <Text style={MB.name} numberOfLines={1}>
              {user.name}
            </Text>
            <Text style={MB.sub} numberOfLines={1}>
              {user.role} • {user.empId}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.dim} />
        </TouchableOpacity>

        {/* ════════════════════════════════════════════════════ */}
        {/* 2. บัญชีและความปลอดภัย                             */}
        {/* ════════════════════════════════════════════════════ */}
        <SectionHeader
          icon="shield-checkmark-outline"
          title="บัญชีและความปลอดภัย"
          color="#1a5fa8"
        />
        <Card>
          <SettingRow
            icon="lock-closed-outline"
            iconColor="#1a5fa8"
            label="เปลี่ยนรหัสผ่าน"
            value="อัปเดตล่าสุด 3 เดือนที่แล้ว"
            onPress={() => {}}
          />
          <SettingRow
            icon="keypad-outline"
            iconColor="#7c3aed"
            label="ตั้งค่า PIN"
            value="6 หลัก"
            onPress={() => {}}
          />
          <ToggleRow
            icon="finger-print-outline"
            iconColor="#0891b2"
            label="เข้าสู่ระบบด้วย Biometric"
            sub="Face ID / ลายนิ้วมือ"
            value={biometric}
            onChange={setBiometric}
            noBorder
          />
        </Card>

        {/* ════════════════════════════════════════════════════ */}
        {/* 3. การแจ้งเตือน                                     */}
        {/* ════════════════════════════════════════════════════ */}
        <SectionHeader
          icon="notifications-outline"
          title="การแจ้งเตือน"
          color="#f59e0b"
        />
        <Card>
          <ToggleRow
            icon="phone-portrait-outline"
            iconColor="#f59e0b"
            label="การแจ้งเตือน Push"
            sub="รับการแจ้งเตือนบนอุปกรณ์"
            value={notifPush}
            onChange={setNotifPush}
          />
          <View style={SEC.subHead}>
            <Text style={SEC.subHeadTxt}>ประเภทการแจ้งเตือน</Text>
          </View>
          <ToggleRow
            icon="calendar-outline"
            iconColor={C.g500}
            label="ตารางสอน / นัดหมาย"
            sub="แจ้งก่อนเวลา 15 นาที"
            value={notifPush}
            onChange={setNotifPush}
          />
          <ToggleRow
            icon="newspaper-outline"
            iconColor={C.dim}
            label="ข่าวสารและประกาศ"
            sub="ข่าวสารทั่วไปของมหาวิทยาลัย"
            value={notifNews}
            onChange={setNotifNews}
            noBorder
          />
        </Card>

        {/* ════════════════════════════════════════════════════ */}
        {/* 4. ออกจากระบบ                                       */}
        {/* ════════════════════════════════════════════════════ */}
        <View style={{ marginTop: 8, marginBottom: 4 }}>
          <Card>
            <SettingRow
              icon="log-out-outline"
              label="ออกจากระบบ"
              onPress={() => setShowLogout(true)}
              danger
              noBorder
            />
          </Card>
        </View>

        <Text style={P.footer}>
          ระบบสารสนเทศบุคลากร • มหาวิทยาลัย{"\n"}© 2568 สงวนลิขสิทธิ์
        </Text>
      </ScrollView>

      <LogoutModal
        visible={showLogout}
        onCancel={() => setShowLogout(false)}
        onConfirm={handleLogout}
      />
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════
const P = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  hdrRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  hdrTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  hdrSub: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  footer: {
    textAlign: "center",
    fontSize: 11,
    color: C.dim,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 16,
    marginBottom: 8,
  },
});

/** Mini Profile Banner */
const MB = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.card,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "800", color: C.ink },
  sub: { fontSize: 12, color: C.dim, fontWeight: "600", marginTop: 2 },
});

const SEC = StyleSheet.create({
  subHead: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  subHeadTxt: {
    fontSize: 10,
    fontWeight: "800",
    color: C.dim,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});
