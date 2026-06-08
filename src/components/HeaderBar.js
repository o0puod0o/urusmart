import React from "react";
import { Image, Platform, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const logo = require("../assets/urusmartlogo.png");

const pt = Platform.OS === "ios" ? 46 : (StatusBar.currentHeight ?? 24) + 8;

const HeaderBar = ({ name, photoUrl, onNotification, onLogout }) => {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "อ.";

  const greeting = name ? `สวัสดี, ${name}` : "สวัสดี";

  return (
    <View className="bg-primary px-5 pb-[18px]" style={{ paddingTop: pt }}>
      <View className="flex-row items-center justify-between">
        {/* Avatar + greeting */}
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-[48px] h-[48px] rounded-full bg-white/10 border-2 border-white items-center justify-center overflow-hidden">
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} className="w-full h-full" />
            ) : (
              <Text className="text-white text-base font-extrabold">{initials}</Text>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-white/60 text-[11px] font-semibold">ยินดีต้อนรับ</Text>
            <Text className="text-white text-[15px] font-bold" numberOfLines={1}>
              {greeting}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row items-center gap-2">
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

      {/* Logo */}
      <View className="items-center mt-2">
        <Image
          source={logo}
          style={{ width: 130, height: 50, tintColor: "#fff" }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

export default HeaderBar;
