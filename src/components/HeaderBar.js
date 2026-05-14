import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HeaderBar = ({ name, faculty, date, onNotification, onLogout }) => {
  const today = date || new Date();
  const day = today.getDate();
  const monthNames = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  const month = monthNames[today.getMonth()];
  const year = (today.getFullYear() + 543).toString().slice(-2);
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "อ.";

  return (
    <View style={styles.header}>
      <View style={styles.top}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.logoWrap}>
          <Text style={styles.logoText}>URUSmart</Text>
          <Text style={styles.logoSub}>ระบบบุคลากร</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} onPress={onNotification}>
            <Ionicons name="notifications-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.greetCard}>
        <View>
          <Text style={styles.greetName}>{name || "บุคลากร URU"}</Text>
          <Text style={styles.greetFaculty}>
            {faculty || "มหาวิทยาลัยราชภัฏอุตรดิตถ์"}
          </Text>
        </View>
        <View style={styles.dateBox}>
          <Text style={styles.dateDay}>{day}</Text>
          <Text style={styles.dateMonth}>
            {month} {year}
          </Text>
        </View>
      </View>
    </View>
  );
};

// styles เหมือนเดิมทุกอย่าง ลบแค่ iconText ออกได้เลย
const styles = StyleSheet.create({
  header: {
    backgroundColor: "#1a6b3c",
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 20,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ffffff22",
    borderWidth: 1.5,
    borderColor: "#ffffff55",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  logoWrap: { alignItems: "center" },
  logoText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 1,
  },
  logoSub: { color: "#ffffffaa", fontSize: 10, marginTop: 2 },
  actions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ffffff22",
    alignItems: "center",
    justifyContent: "center",
  },
  greetCard: {
    backgroundColor: "#ffffff1f",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetName: { color: "#fff", fontSize: 15, fontWeight: "700" },
  greetFaculty: { color: "#ffffffcc", fontSize: 11, marginTop: 4 },
  dateBox: {
    backgroundColor: "#ffffff26",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
  },
  dateDay: { color: "#fff", fontSize: 22, fontWeight: "700", lineHeight: 24 },
  dateMonth: { color: "#ffffffaa", fontSize: 10, marginTop: 2 },
});

export default HeaderBar;
