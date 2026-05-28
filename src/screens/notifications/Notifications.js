import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const C = {
  g900: "#064e35",
  g700: "#0a6644",
  g500: "#0f7a55",
  g50: "#eef8f3",
  white: "#ffffff",
  ink: "#0d1f18",
  sub: "#4a5e56",
  dim: "#8fa89f",
  line: "#dce8e2",
  bg: "#f0f6f2",
  unreadBg: "#f0faf5",
  unreadDot: "#0f7a55",
};

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    icon: "document-text-outline",
    iconColor: "#0891b2",
    iconBg: "#e0f7fa",
    title: "ผลงานวิจัยได้รับการอนุมัติ",
    body: 'ผลงานวิจัย "การจัดการศูนย์ข้อมูลเพื่อการพัฒนา" ได้รับการอนุมัติแล้ว',
    time: "10 นาทีที่แล้ว",
    read: false,
    group: "today",
  },
  {
    id: "2",
    icon: "calendar-outline",
    iconColor: "#f59e0b",
    iconBg: "#fffbea",
    title: "แจ้งเตือนการประชุม",
    body: "มีการประชุมคณะกรรมการวิจัยในวันพรุ่งนี้ เวลา 09:00 น.",
    time: "1 ชั่วโมงที่แล้ว",
    read: false,
    group: "today",
  },
  {
    id: "3",
    icon: "checkmark-circle-outline",
    iconColor: "#0f7a55",
    iconBg: "#eef8f3",
    title: "อัปเดตโปรไฟล์สำเร็จ",
    body: "ข้อมูลโปรไฟล์ของคุณได้รับการอัปเดตเรียบร้อยแล้ว",
    time: "3 ชั่วโมงที่แล้ว",
    read: true,
    group: "today",
  },
  {
    id: "4",
    icon: "alert-circle-outline",
    iconColor: "#7c3aed",
    iconBg: "#f3e8ff",
    title: "แบบฟอร์มรอการตรวจสอบ",
    body: 'แบบฟอร์มบทความวารสาร "..." กำลังรอการตรวจสอบจากผู้ดูแล',
    time: "เมื่อวาน",
    read: true,
    group: "earlier",
  },
  {
    id: "5",
    icon: "notifications-outline",
    iconColor: C.g500,
    iconBg: C.g50,
    title: "ยินดีต้อนรับสู่ URUSmart",
    body: "ขอบคุณที่ใช้งานระบบ URUSmart ค้นพบฟีเจอร์ทั้งหมดได้ที่หน้าหลัก",
    time: "3 วันที่แล้ว",
    read: true,
    group: "earlier",
  },
];

const NotifItem = ({ item, onPress }) => (
  <TouchableOpacity
    style={[styles.item, !item.read && styles.itemUnread]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
      <Ionicons name={item.icon} size={22} color={item.iconColor} />
    </View>
    <View style={styles.textCol}>
      <View style={styles.titleRow}>
        <Text style={[styles.itemTitle, !item.read && styles.itemTitleUnread]} numberOfLines={1}>
          {item.title}
        </Text>
        {!item.read && <View style={styles.dot} />}
      </View>
      <Text style={styles.itemBody} numberOfLines={2}>{item.body}</Text>
      <Text style={styles.itemTime}>{item.time}</Text>
    </View>
  </TouchableOpacity>
);

export default function NotificationsScreen({ navigation }) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const todayItems = notifications.filter((n) => n.group === "today");
  const earlierItems = notifications.filter((n) => n.group === "earlier");

  const sections = [
    ...(todayItems.length > 0
      ? [{ type: "label", id: "l-today", text: t("notifications.today") }, ...todayItems]
      : []),
    ...(earlierItems.length > 0
      ? [{ type: "label", id: "l-earlier", text: t("notifications.earlier") }, ...earlierItems]
      : []),
  ];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.g700} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t("notifications.title")}</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity style={styles.markBtn} onPress={markAllRead}>
            <Text style={styles.markBtnText}>{t("notifications.markAllRead")}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.markBtn} />
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Ionicons name="notifications-off-outline" size={44} color={C.dim} />
          </View>
          <Text style={styles.emptyTitle}>{t("notifications.empty")}</Text>
          <Text style={styles.emptySub}>{t("notifications.emptySub")}</Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            if (item.type === "label") {
              return <Text style={styles.sectionLabel}>{item.text}</Text>;
            }
            return <NotifItem item={item} onPress={() => markRead(item.id)} />;
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header: {
    backgroundColor: C.g700,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 52 : (StatusBar.currentHeight ?? 24) + 12,
    paddingBottom: 16,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  badge: {
    backgroundColor: "#ef4444",
    borderRadius: 999,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  markBtn: { width: 80, alignItems: "flex-end" },
  markBtnText: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "700" },

  list: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 0 },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: C.dim,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 2,
  },

  item: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.line,
  },
  itemUnread: {
    backgroundColor: C.unreadBg,
    borderColor: "#b2deca",
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textCol: { flex: 1, gap: 3 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  itemTitle: { flex: 1, fontSize: 14, fontWeight: "600", color: C.ink },
  itemTitleUnread: { fontWeight: "800" },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.unreadDot,
    flexShrink: 0,
  },
  itemBody: { fontSize: 12, color: C.sub, lineHeight: 18 },
  itemTime: { fontSize: 11, color: C.dim, fontWeight: "600", marginTop: 2 },

  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 999,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: C.ink },
  emptySub: { fontSize: 13, color: C.dim, fontWeight: "500" },
});
