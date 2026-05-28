import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const SERVICES = [
  // ── Page 1 ──────────────────────────────────────────
  {
    icon: "journal-outline",
    iconColor: "#0f7a55",
    label: "e-Research",
    bgColor: "#d6f0e3",
    url: null,
  },
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
    label: "Expert",
    bgColor: "#e8f5ee",
    url: null,
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
  // ── Page 2 ──────────────────────────────────────────
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
  {
    icon: "car-outline",
    iconColor: "#1565c0",
    label: "จองรถ",
    bgColor: "#e3f2fd",
    url: "http://202.29.52.231/reserve/public/login",
  },
];

const ITEMS_PER_PAGE = 8;

const TRANSLATED_LABELS = {
  จองรถ: "services.bookCar",
  ตารางสอน: "services.schedule",
  ห้องเรียน: "services.classroom",
};

const ServiceIconGrid = ({ navigation }) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const getLabel = (item) =>
    TRANSLATED_LABELS[item.label] ? t(TRANSLATED_LABELS[item.label]) : item.label;

  const handlePress = (item) => {
    if (item.label === "e-Research") {
      navigation?.navigate("EResearch");
    } else if (item.label === "Expert") {
      navigation?.navigate("Research");
    } else if (item.url) {
      navigation?.navigate("InAppBrowser", { url: item.url, title: getLabel(item) });
    }
  };

  // Split into pages of 8, pad last page to keep grid even
  const pages = [];
  for (let i = 0; i < SERVICES.length; i += ITEMS_PER_PAGE) {
    const chunk = [...SERVICES.slice(i, i + ITEMS_PER_PAGE)];
    while (chunk.length < ITEMS_PER_PAGE) chunk.push({ spacer: true });
    pages.push(chunk);
  }

  return (
    <View
      style={styles.container}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {containerWidth > 0 && (
        <>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const page = Math.round(
                e.nativeEvent.contentOffset.x / containerWidth
              );
              setCurrentPage(page);
            }}
          >
            {pages.map((page, pageIndex) => {
              const rows = [];
              for (let i = 0; i < page.length; i += 4) {
                rows.push(page.slice(i, i + 4));
              }
              return (
                <View key={pageIndex} style={{ width: containerWidth }}>
                  {rows.map((row, rowIndex) => (
                    <View
                      key={rowIndex}
                      style={[
                        styles.row,
                        rowIndex === rows.length - 1 && styles.rowLast,
                      ]}
                    >
                      {row.map((item, colIndex) =>
                        item.spacer ? (
                          <View key={colIndex} style={styles.item} />
                        ) : (
                          <TouchableOpacity
                            key={colIndex}
                            style={styles.item}
                            onPress={() => handlePress(item)}
                            activeOpacity={0.75}
                          >
                            <View
                              style={[
                                styles.iconBox,
                                { backgroundColor: item.bgColor },
                              ]}
                            >
                              <Ionicons
                                name={item.icon}
                                size={24}
                                color={item.iconColor}
                              />
                            </View>
                            <Text style={styles.label} numberOfLines={2}>
                              {getLabel(item)}
                            </Text>
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  ))}
                </View>
              );
            })}
          </ScrollView>

          {/* Page indicator dots */}
          {pages.length > 1 && (
            <View style={styles.dots}>
              {pages.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === currentPage && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 6,
    paddingHorizontal: 2,
  },
  row: {
    flexDirection: "row",
    marginBottom: 18,
  },
  rowLast: {
    marginBottom: 0,
  },
  item: {
    flex: 1,
    alignItems: "center",
    ...Platform.select({ web: { outlineStyle: "none" } }),
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    ...Platform.select({ web: { outlineStyle: "none" } }),
  },
  label: {
    fontSize: 11,
    color: "#444",
    textAlign: "center",
    lineHeight: 14,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#d1d5db",
  },
  dotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0f7a55",
  },
});

export default ServiceIconGrid;
