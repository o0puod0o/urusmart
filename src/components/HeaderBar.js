import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const logo = require("../assets/urusmartlogo.png");

const HeaderBar = ({ name, photoUrl, onNotification, onLogout }) => {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "อ.";

  return (
    <View style={styles.header}>
      <View style={styles.avatar}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{initials}</Text>
        )}
      </View>

      <View style={styles.logoWrap}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onLogout}
          activeOpacity={0.75}
        >
          <Ionicons name="log-out-outline" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onNotification}
          activeOpacity={0.75}
        >
          <Ionicons name="notifications-outline" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    minHeight: 132,
    backgroundColor: "#0f7a55",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: Platform.OS === "ios" ? 46 : 30,
    paddingBottom: 22,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ffffff24",
    borderWidth: 2,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    zIndex: 1,
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  logoWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 26,
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 70,
    tintColor: "#fff",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
    zIndex: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HeaderBar;
