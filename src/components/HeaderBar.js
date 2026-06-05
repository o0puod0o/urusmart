import React from "react";
import { Image, Platform, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const logo = require("../assets/urusmartlogo.png");

const PT = Platform.OS === "ios" ? "pt-[46px]" : `pt-[${(StatusBar.currentHeight ?? 24) + 8}px]`;

const HeaderBar = ({ name, photoUrl, onNotification, onLogout }) => {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "อ.";

  return (
    <View className={`bg-primary min-h-[132px] flex-row items-center justify-between px-7 pb-[22px] ${PT}`}>
      {/* Avatar */}
      <View className="w-16 h-16 rounded-full bg-white/10 border-2 border-white items-center justify-center overflow-hidden z-10">
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} className="w-full h-full" />
        ) : (
          <Text className="text-white text-lg font-extrabold">{initials}</Text>
        )}
      </View>

      {/* Logo center */}
      <View className="absolute left-0 right-0 bottom-[26px] items-center">
        <Image
          source={logo}
          style={{ width: 150, height: 70, tintColor: "#fff" }}
          resizeMode="contain"
        />
      </View>

      {/* Actions */}
      <View className="flex-row items-center gap-[22px] z-10">
        <TouchableOpacity
          className="w-[38px] h-[38px] items-center justify-center"
          onPress={onLogout}
          activeOpacity={0.75}
        >
          <Ionicons name="log-out-outline" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-[38px] h-[38px] items-center justify-center"
          onPress={onNotification}
          activeOpacity={0.75}
        >
          <Ionicons name="notifications-outline" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HeaderBar;
