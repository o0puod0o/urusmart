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
  // ⛔ ถ้าไม่มีข้อมูล ไม่ต้อง render อะไรเลย
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ล่าสุด</Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>โมดูลในแอป</Text>
        </View>
      </View>

      {items.map((item, i) => (
        <ResearchItem
          key={i}
          badge={item.badge}
          badgeBg={item.badgeBg}
          badgeColor={item.badgeColor}
          title={item.title}
          subtitle={item.subtitle}
        />
      ))}

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
    borderRadius: 20,
    padding: 14,
    marginBottom: 20,
    marginTop: 6,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a2e",
  },

  pill: {
    backgroundColor: "#e8f5ee",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  pillText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1a6b3c",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eef2f5",
  },

  badge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  itemTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a2e",
    lineHeight: 17,
  },

  itemSub: {
    fontSize: 11,
    color: "#777",
    marginTop: 3,
  },

  addBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#e8f5ee",
    alignItems: "center",
  },

  addText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a6b3c",
  },
});

export default ResearchCard;
