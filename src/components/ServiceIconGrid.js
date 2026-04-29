import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";

const SERVICES = [
  {
    icon: "📚",
    label: "LMS",
    bgColor: "#e8f5ee",
    url: "https://lms.uru.ac.th",
  },
  {
    icon: "📋",
    label: "E-Meeting",
    bgColor: "#e8f0fb",
    url: "https://meeting.uru.ac.th",
  },
  {
    icon: "👤",
    label: "HRMS",
    bgColor: "#fff3e0",
    url: "https://hrms.uru.ac.th",
  },
  {
    icon: "📄",
    label: "e-Doc",
    bgColor: "#fce4ec",
    url: "https://edoc.uru.ac.th",
  },
  { icon: "🔬", label: "e-Research", bgColor: "#e8f5ee", url: null },
  {
    icon: "🚗",
    label: "จองรถ",
    bgColor: "#e3f2fd",
    url: "https://car.uru.ac.th",
  },
  {
    icon: "🎓",
    label: "Advisor",
    bgColor: "#f3e5f5",
    url: "https://advisor.uru.ac.th",
  },
  {
    icon: "📊",
    label: "Workload",
    bgColor: "#e0f7fa",
    url: "https://workload.uru.ac.th",
  },
  {
    icon: "📅",
    label: "ตารางสอน",
    bgColor: "#fff8e1",
    url: "https://time.uru.ac.th",
  },
  {
    icon: "🏫",
    label: "ห้องเรียน",
    bgColor: "#e8f5e9",
    url: "https://room.uru.ac.th",
  },
  {
    icon: "📰",
    label: "ACD",
    bgColor: "#fbe9e7",
    url: "https://acd.uru.ac.th",
  },
  {
    icon: "⭐",
    label: "AUN-QA",
    bgColor: "#ede7f6",
    url: "https://aunqa.uru.ac.th",
  },
];

const ServiceIconGrid = ({ navigation }) => {
  const handlePress = (item) => {
    if (item.label === "e-Research") {
      navigation?.navigate("Research");
    } else if (item.url) {
      Linking.openURL(item.url);
    }
  };

  // แบ่งเป็นแถวละ 4
  const rows = [];
  for (let i = 0; i < SERVICES.length; i += 4) {
    rows.push(SERVICES.slice(i, i + 4));
  }

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item, colIndex) => (
            <TouchableOpacity
              key={colIndex}
              style={styles.item}
              onPress={() => handlePress(item)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconBox, { backgroundColor: item.bgColor }]}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <Text style={styles.label} numberOfLines={2}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
          {/* เติม placeholder ถ้าแถวสุดท้ายไม่ครบ 4 */}
          {row.length < 4 &&
            Array(4 - row.length)
              .fill(null)
              .map((_, i) => <View key={`empty-${i}`} style={styles.item} />)}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8ecf0",
    padding: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#00000008",
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontSize: 10,
    color: "#555",
    textAlign: "center",
    lineHeight: 13,
  },
});

export default ServiceIconGrid;
