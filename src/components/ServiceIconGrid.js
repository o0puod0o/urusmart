import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SERVICES = [
  {
    icon: "book-outline",
    iconColor: "#1a6b3c",
    label: "LMS",
    bgColor: "#e8f5ee",
    url: "https://lms.uru.ac.th",
  },
  {
    icon: "videocam-outline",
    iconColor: "#185fa5",
    label: "E-Meeting",
    bgColor: "#e8f0fb",
    url: "https://meeting.uru.ac.th",
  },
  {
    icon: "people-outline",
    iconColor: "#e65100",
    label: "HRMS",
    bgColor: "#fff3e0",
    url: "https://hrms.uru.ac.th",
  },
  {
    icon: "document-outline",
    iconColor: "#c62828",
    label: "e-Doc",
    bgColor: "#fce4ec",
    url: "https://edoc.uru.ac.th",
  },
  {
    icon: "document-text-outline",
    iconColor: "#1a6b3c",
    label: "e-Research",
    bgColor: "#e8f5ee",
    url: null,
  },
  {
    icon: "car-outline",
    iconColor: "#1565c0",
    label: "จองรถ",
    bgColor: "#e3f2fd",
    url: "http://202.29.52.231/reserve/public/login",
  },
  {
    icon: "school-outline",
    iconColor: "#7b1fa2",
    label: "Advisor",
    bgColor: "#f3e5f5",
    url: "https://advisor.uru.ac.th",
  },
  {
    icon: "bar-chart-outline",
    iconColor: "#00838f",
    label: "Workload",
    bgColor: "#e0f7fa",
    url: "https://workload.uru.ac.th",
  },
  {
    icon: "calendar-number-outline",
    iconColor: "#f57f17",
    label: "ตารางสอน",
    bgColor: "#fff8e1",
    url: "https://academic.uru.ac.th/addteacherNew/show_timetable_teacher.php",
  },
  {
    icon: "map-outline",
    iconColor: "#2e7d32",
    label: "ห้องเรียน",
    bgColor: "#e8f5e9",
    url: "https://academic.uru.ac.th/appl/admin/check_room.asp",
  },
  {
    icon: "reader-outline",
    iconColor: "#bf360c",
    label: "ACD",
    bgColor: "#fbe9e7",
    url: "https://academic.uru.ac.th",
  },
  {
    icon: "star-outline",
    iconColor: "#4527a0",
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
                <Ionicons name={item.icon} size={24} color={item.iconColor} />
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
  label: {
    fontSize: 11,
    color: "#444",
    textAlign: "center",
    lineHeight: 14,
  },
});

export default ServiceIconGrid;
