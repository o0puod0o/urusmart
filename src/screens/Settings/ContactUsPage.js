import React from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

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
};

// TODO: แก้ข้อมูลให้ตรงกับหน่วยงานจริง
const SECTIONS = [
  {
    title: "ฝ่ายสนับสนุนระบบ",
    items: [
      {
        icon: "call-outline",
        iconBg: "#2167b2",
        label: "โทรศัพท์",
        value: "090-323-4567",
        onPress: () => Linking.openURL("tel:090-323-4567"),
      },
      {
        icon: "mail-outline",
        iconBg: "#7c3aed",
        label: "อีเมล",
        value: "support@uru.ac.th",
        onPress: () => Linking.openURL("mailto:support@uru.ac.th"),
      },
    ],
  },
  {
    title: "เวลาทำการ",
    items: [
      {
        icon: "time-outline",
        iconBg: "#c95b05",
        label: "จันทร์ – ศุกร์",
        value: "08:30 – 16:30 น.",
        onPress: null,
      },
      {
        icon: "calendar-clear-outline",
        iconBg: "#c81e1e",
        label: "วันหยุด",
        value: "ปิดทำการ",
        onPress: null,
      },
    ],
  },
  {
    title: "ช่องทางอื่น",
    items: [
      {
        icon: "globe-outline",
        iconBg: C.primary,
        label: "เว็บไซต์",
        value: "www.uru.ac.th",
        onPress: () => Linking.openURL("https://www.uru.ac.th"),
      },
      {
        icon: "location-outline",
        iconBg: C.primary,
        label: "ที่ตั้ง",
        value: "อาคาร ICIT ชั้น 1",
        onPress: () => Linking.openURL("https://maps.app.goo.gl/vCDDKADLTq1mhVm19"),
      },
    ],
  },
];

export default function ContactUsPage() {
  const navigation = useNavigation();

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>ติดต่อเรา</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.body}>
        {SECTIONS.map((section) => (
          <View key={section.title}>
            <Text style={s.sectionLabel}>{section.title}</Text>
            <View style={s.card}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[s.row, i < section.items.length - 1 && s.rowBorder]}
                  onPress={item.onPress ?? undefined}
                  activeOpacity={item.onPress ? 0.7 : 1}
                  disabled={!item.onPress}
                >
                  <View style={[s.iconWrap, { backgroundColor: item.iconBg }]}>
                    <Ionicons name={item.icon} size={20} color="#fff" />
                  </View>
                  <View style={s.textWrap}>
                    <Text style={s.rowLabel}>{item.label}</Text>
                    <Text style={[s.rowValue, item.onPress && { color: C.primary }]}>
                      {item.value}
                    </Text>
                  </View>
                  {item.onPress && (
                    <Ionicons name="chevron-forward" size={16} color={C.dim} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={s.noteCard}>
          <Ionicons name="information-circle-outline" size={16} color={C.primary} />
          <Text style={s.noteText}>
            หากพบปัญหาการใช้งานระบบ กรุณาแจ้งพนักงานและรายละเอียดปัญหา
          </Text>
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
  rowLabel: { fontSize: 12, fontWeight: "600", color: C.sub },
  rowValue: { fontSize: 15, fontWeight: "700", color: C.ink, marginTop: 2 },

  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: C.primarySoft,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.line,
  },
  noteText: { flex: 1, fontSize: 12, color: C.sub, lineHeight: 18 },
});
