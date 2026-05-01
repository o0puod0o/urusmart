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
    url: "http://202.29.52.231/reserve/public/login",
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
    url: "https://academic.uru.ac.th/addteacherNew/show_timetable_teacher.php",
  },
  {
    icon: "🏫",
    label: "ห้องเรียน",
    bgColor: "#e8f5e9",
    url: "https://academic.uru.ac.th/appl/admin/check_room.asp",
  },
  {
    icon: "📰",
    label: "ACD",
    bgColor: "#fbe9e7",
    url: "https://academic.uru.ac.th",
  },
  {
    icon: "⭐",
    label: "AUN-QA",
    bgColor: "#ede7f6",
    url: "http://aunqa.uru.ac.th",
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
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 10,
    marginBottom: 20,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    marginBottom: 16,
  },

  item: {
    flex: 1,
    alignItems: "center",
  },

  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  icon: {
    fontSize: 22,
  },

  label: {
    fontSize: 11,
    color: "#444",
    textAlign: "center",
    lineHeight: 14,
  },
});

export default ServiceIconGrid;
