import React, { useEffect, useState } from "react";
import {
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

const STORAGE_KEY = "@notif_settings";

const COLORS = {
  primary: "#1a6b3c",
  primaryDark: "#14532d",
  primarySoft: "#e8f5ee",
  bg: "#f0f4f1",
  card: "#ffffff",
  ink: "#101b17",
  sub: "#5a6a60",
  dim: "#8a9a90",
  line: "#e0ebe4",
  switchOff: "#dfe8e3",
};

const DEFAULT = {
  beforeClass: true,
  holiday: true,
  gradeDeadline: true,
  announcement: false,
};

const ITEMS = [
  {
    key: "beforeClass",
    icon: "alarm-outline",
    iconBg: "#2167b2",
    title: "แจ้งเตือนก่อนสอน",
    sub: "ล่วงหน้า 15 นาที",
  },
  {
    key: "holiday",
    icon: "calendar-clear-outline",
    iconBg: "#c95b05",
    title: "วันหยุดราชการ",
    sub: "แจ้งเตือนวันก่อน",
  },
  {
    key: "gradeDeadline",
    icon: "document-text-outline",
    iconBg: "#7c3aed",
    title: "ส่งเกรด",
    sub: "ก่อนครบกำหนด 3 วัน",
  },
  {
    key: "announcement",
    icon: "megaphone-outline",
    iconBg: COLORS.primary,
    title: "ประกาศจากมหาวิทยาลัย",
    sub: "",
  },
];

export default function NotificationSettingPage() {
  const navigation = useNavigation();
  const [settings, setSettings] = useState(DEFAULT);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setSettings({ ...DEFAULT, ...JSON.parse(raw) });
    });
  }, []);

  const toggle = async (key) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>การแจ้งเตือน</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.body}>
        <Text style={s.sectionLabel}>การแจ้งเตือน</Text>

        <View style={s.card}>
          {ITEMS.map((item, i) => (
            <View key={item.key} style={[s.row, i < ITEMS.length - 1 && s.rowBorder]}>
              <View style={[s.iconWrap, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={20} color="#fff" />
              </View>
              <View style={s.textWrap}>
                <Text style={s.rowTitle}>{item.title}</Text>
                {!!item.sub && <Text style={s.rowSub}>{item.sub}</Text>}
              </View>
              <Switch
                value={settings[item.key]}
                onValueChange={() => toggle(item.key)}
                trackColor={{ false: COLORS.switchOff, true: COLORS.primary }}
                thumbColor="#fff"
                ios_backgroundColor={COLORS.switchOff}
              />
            </View>
          ))}
        </View>

        <View style={s.noteCard}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
          <Text style={s.noteText}>กรุณาเปิดการแจ้งเตือนในการตั้งค่าของอุปกรณ์ด้วย</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 54 : (StatusBar.currentHeight ?? 24) + 10,
    paddingBottom: 14,
    backgroundColor: COLORS.primary,
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
    color: COLORS.dim,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.line },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: "700", color: COLORS.ink },
  rowSub: { fontSize: 12, fontWeight: "500", color: COLORS.sub, marginTop: 2 },

  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  noteText: { flex: 1, fontSize: 12, color: COLORS.sub, lineHeight: 18 },
});
