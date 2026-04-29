import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ResearchItem = ({ badge, badgeBg, badgeColor, title, subtitle }) => (
  <View style={styles.item}>
    <View style={[styles.badge, { backgroundColor: badgeBg }]}>
      <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
    </View>
    <View style={styles.textWrap}>
      <Text style={styles.itemTitle} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.itemSub}>{subtitle}</Text>
    </View>
  </View>
);

const ResearchCard = ({ items = [], onAdd }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ล่าสุด</Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>โมดูลในแอป</Text>
        </View>
      </View>

      {items.length === 0 ? (
        <Text style={styles.empty}>ยังไม่มีผลงานวิชาการ</Text>
      ) : (
        items.map((item, i) => (
          <ResearchItem
            key={i}
            badge={item.badge}
            badgeBg={item.badgeBg}
            badgeColor={item.badgeColor}
            title={item.title}
            subtitle={item.subtitle}
          />
        ))
      )}

      <TouchableOpacity
        style={styles.addBtn}
        onPress={onAdd}
        activeOpacity={0.8}
      >
        <Text style={styles.addText}>+ เพิ่มผลงานใหม่</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8ecf0",
    padding: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  pill: {
    backgroundColor: "#e8f5ee",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillText: {
    fontSize: 10,
    color: "#1a6b3c",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f7",
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  textWrap: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1a1a2e",
    lineHeight: 16,
  },
  itemSub: {
    fontSize: 10,
    color: "#888",
    marginTop: 2,
  },
  empty: {
    fontSize: 12,
    color: "#aaa",
    textAlign: "center",
    paddingVertical: 16,
  },
  addBtn: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#e8f5ee",
    alignItems: "center",
  },
  addText: {
    fontSize: 12,
    color: "#1a6b3c",
    fontWeight: "500",
  },
});

export default ResearchCard;
