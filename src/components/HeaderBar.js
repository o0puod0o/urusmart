import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

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
            <Text style={styles.iconText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onLogout}>
            <Text style={styles.iconText}>↗</Text>
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

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#1a6b3c",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff22",
    borderWidth: 2,
    borderColor: "#ffffff44",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  logoWrap: {
    alignItems: "center",
  },
  logoText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  logoSub: {
    color: "#ffffff88",
    fontSize: 9,
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ffffff1a",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 15,
    color: "#fff",
  },
  greetCard: {
    backgroundColor: "#ffffff18",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  greetFaculty: {
    color: "#ffffff99",
    fontSize: 10,
    marginTop: 3,
  },
  dateBox: {
    backgroundColor: "#ffffff22",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  dateDay: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 22,
  },
  dateMonth: {
    color: "#ffffff88",
    fontSize: 9,
  },
});

export default HeaderBar;
