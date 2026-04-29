import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import HeaderBar from "../components/HeaderBar";
import StatCard from "../components/StatCard";
import SectionHeader from "../components/SectionHeader";
import ServiceIconGrid from "../components/ServiceIconGrid";
import ResearchCard from "../components/ResearchCard";

const RESEARCH_ITEMS = [
  {
    badge: "RES",
    badgeBg: "#e8f5ee",
    badgeColor: "#1a6b3c",
    title: "งานวิจัยด้านการศึกษาออนไลน์",
    subtitle: "อัปเดต 2 วันที่แล้ว · กำลังดำเนินการ",
  },
  {
    badge: "PUB",
    badgeBg: "#e8f0fb",
    badgeColor: "#185fa5",
    title: "บทความวิชาการ TCI กลุ่ม 1",
    subtitle: "อัปเดต 5 วันที่แล้ว · เผยแพร่แล้ว",
  },
];

const Homepage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <HeaderBar
        name="อ.ธรณ์ ชัยโสภา"
        faculty="อาจารย์ประจำ · คณะวิทยาการจัดการ"
        onNotification={() => console.log("notification")}
        onLogout={() => navigation.replace("Login")}
      />

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard value="3" label="วิชาที่สอนวันนี้" dotColor="#1a6b3c" />
          <StatCard value="2" label="งานวิจัยค้างส่ง" dotColor="#e67e22" />
        </View>

        {/* Services */}
        <SectionHeader
          title="ระบบที่ใช้งาน"
          linkText="ดูทั้งหมด"
          onPress={() => console.log("see all")}
        />
        <ServiceIconGrid navigation={navigation} />

        {/* e-Research */}
        <SectionHeader
          title="ผลงานวิชาการ (e-Research)"
          linkText="+ เพิ่มใหม่"
          onPress={() => navigation.navigate("Research")}
        />
        <ResearchCard
          items={RESEARCH_ITEMS}
          onAdd={() => navigation.navigate("Research")}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2f7",
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 14,
    paddingBottom: 30,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
});

export default Homepage;
