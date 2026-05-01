import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const STATUS_COLOR = {
  เผยแพร่แล้ว: { bg: "#e8f5ee", text: "#1a6b3c" },
  กำลังดำเนินการ: { bg: "#fff3e0", text: "#e67e22" },
  รอการตีพิมพ์: { bg: "#e8f0fb", text: "#185fa5" },
  "-": { bg: "#f0f4f8", text: "#888" },
};

const ListItem = ({ item, onEdit, onDelete }) => {
  const statusStyle = STATUS_COLOR[item.status] || STATUS_COLOR["-"];

  return (
    <View style={styles.row}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.meta}>
          {item.year && item.year !== "-" && (
            <Text style={styles.year}>ปี {item.year}</Text>
          )}
          {item.status && item.status !== "-" && (
            <View style={[styles.pill, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.pillText, { color: statusStyle.text }]}>
                {item.status}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => onEdit(item)}
          activeOpacity={0.75}
        >
          <Text style={styles.editText}>แก้ไข</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(item.id)}
          activeOpacity={0.75}
        >
          <Text style={styles.deleteText}>ลบ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1a1a2e",
    lineHeight: 18,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  year: {
    fontSize: 11,
    color: "#888",
  },
  pill: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pillText: {
    fontSize: 10,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "column",
    gap: 6,
  },
  editBtn: {
    backgroundColor: "#e8f5ee",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignItems: "center",
  },
  editText: {
    fontSize: 11,
    color: "#1a6b3c",
    fontWeight: "500",
  },
  deleteBtn: {
    backgroundColor: "#fce4ec",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignItems: "center",
  },
  deleteText: {
    fontSize: 11,
    color: "#c0392b",
    fontWeight: "500",
  },
});

export default ListItem;
