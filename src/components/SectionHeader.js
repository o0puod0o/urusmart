import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const SectionHeader = ({ title, linkText, onPress }) => {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {linkText && (
        <TouchableOpacity onPress={onPress} style={styles.pill}>
          <Text style={styles.link}>{linkText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  pill: {
    backgroundColor: "#e8f5ee",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  link: {
    fontSize: 11,
    color: "#1a6b3c",
  },
});

export default SectionHeader;
