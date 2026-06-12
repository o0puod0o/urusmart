import React from "react";
import { Image, Platform, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const logo = require("../assets/urusmartlogo.png");

const pt = Platform.OS === "ios" ? 46 : (StatusBar.currentHeight ?? 24) + 8;

const HeaderBar = ({ name, photoUrl, onNotification, onLogout }) => {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "อ.";

  return (
    <View className="bg-primary px-4 pb-3" style={{ paddingTop: pt }}>
      <View className="flex-row items-center">
        {/* Avatar — fixed width */}
        <View className="w-[40px] h-[40px] rounded-full bg-white/10 border-2 border-white items-center justify-center overflow-hidden">
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} className="w-full h-full" />
          ) : (
            <Text className="text-white text-[14px] font-extrabold">{initials}</Text>
          )}
        </View>

        {/* Logo — absolute center ทำให้อยู่กลางจริงๆ ไม่ขึ้นกับความกว้างซ้าย-ขวา */}
        <View
          style={{ position: "absolute", left: 0, right: 0, alignItems: "center" }}
          pointerEvents="none"
        >
          <Image
            source={logo}
            style={{ width: 120, height: 40, tintColor: "#fff" }}
            resizeMode="contain"
          />
        </View>

        {/* Actions — push to right */}
        <View className="flex-row items-center gap-2 ml-auto">
          <TouchableOpacity
            className="w-[36px] h-[36px] items-center justify-center rounded-full bg-white/10"
            onPress={onNotification}
            activeOpacity={0.75}
          >
            <Ionicons name="notifications-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-[32px] h-[32px] items-center justify-center rounded-full bg-white/10"
            onPress={onLogout}
            activeOpacity={0.75}
          >
            <Ionicons name="log-out-outline" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HeaderBar;
