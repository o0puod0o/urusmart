import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

const EmptyState = ({ icon, message, onAdd }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message ?? t("research.empty.message")}</Text>
      {onAdd && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={onAdd}
          activeOpacity={0.85}
        >
          <Text style={styles.addText}>{t("research.empty.addNew")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 10,
  },
  icon: {
    fontSize: 48,
  },
  message: {
    fontSize: 14,
    color: "#aaa",
  },
  addBtn: {
    marginTop: 8,
    backgroundColor: "#1a6b3c",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  addText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
});

export default EmptyState;
