/**
 * screens/Homepage.js
 */

import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import HeaderBar from "../components/HeaderBar";
import SectionHeader from "../components/SectionHeader";
import ServiceIconGrid from "../components/ServiceIconGrid";
import AnnouncementCarousel from "../components/AnnouncementCarousel";
import useCurrentUser from "../hook/useCurrentUser";
import useFetch from "../hook/useFetch";

const softShadow = Platform.select({
  ios: {
    shadowColor: "#064e35",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  android: { elevation: 6 },
  web: { boxShadow: "0 10px 20px rgba(6,78,53,0.12)" },
});

const Homepage = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, logout } = useCurrentUser(navigation);

  // TODO: เปลี่ยน endpoint เป็น API จริง
  // GET /api/announcements?limit=5  → ส่งให้ AnnouncementCarousel
  const { data: announcements, loading: annLoading } = useFetch(
    "/announcements",
    {
      initialData: [],
      params: { limit: 5 },
    },
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#064e35" />

      {/* ── Header ──────────────────────────────────────────── */}
      <View style={styles.headerWrapper}>
        <HeaderBar
          name={user.name}
          photoUrl={user.photoUrl}
          onNotification={() => navigation.navigate("Notifications")}
          onLogout={logout}
        />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Announcement Carousel ───────────────────────── */}
        {/*
          ถ้า API พร้อม ส่ง items={announcements} แทน
          ตอนนี้ใช้ MOCK_ANNOUNCEMENTS จาก component โดยอัตโนมัติ
          รูปแบบข้อมูล: { id, tag, title, sub, colors: [from, to] }
        */}
        <View style={styles.carouselWrapper}>
          <AnnouncementCarousel
            items={announcements?.length ? announcements : undefined}
            onViewAll={() =>
              navigation.navigate("Announcements", {
                items: announcements?.length ? announcements : undefined,
              })
            }
            autoPlayMs={3500}
          />
        </View>

        {/* ── Services Card ───────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardAccent} />
          <SectionHeader title={t("home.services")} />
          <View style={styles.sectionBody}>
            <ServiceIconGrid navigation={navigation} />
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f6f2" },

  headerWrapper: {},
  body: { flex: 1 },
  bodyContent: {
    paddingTop: 0,
    paddingHorizontal: 0,
    paddingBottom: 50,
    rowGap: 16,
  },

  // Carousel อยู่ชิดขอบ ไม่มี padding ข้าง
  carouselWrapper: {
    backgroundColor: "#55c8e8",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(6,78,53,0.08)",
    overflow: "hidden",
    ...softShadow,
  },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 16,
    bottom: 16,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: "#0f7a55",
  },
  sectionBody: { marginTop: 12 },

});

export default Homepage;
