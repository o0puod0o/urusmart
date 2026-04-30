import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const AppHeader = ({ title, onBack, rightIcon, onRightPress }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.btn}>
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress} style={styles.btn}>
          <Text style={styles.rightIcon}>{rightIcon}</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 36 }} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#1a6b3c",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff22",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "300",
    marginTop: -2,
  },
  rightIcon: {
    color: "#fff",
    fontSize: 22,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
});

export default AppHeader;
