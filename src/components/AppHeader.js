import React from "react";
import { View, Text, TouchableOpacity, Platform, StatusBar } from "react-native";

const PT = Platform.OS === "ios" ? "pt-[52px]" : `pt-[${(StatusBar.currentHeight ?? 24) + 8}px]`;

const AppHeader = ({ title, onBack, rightIcon, onRightPress }) => {
  return (
    <View className={`bg-brand flex-row items-center justify-between px-4 pb-4 ${PT}`}>
      <TouchableOpacity
        onPress={onBack}
        className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
      >
        <Text className="text-white text-2xl font-light" style={{ marginTop: -2 }}>
          ‹
        </Text>
      </TouchableOpacity>

      <Text className="text-white text-base font-semibold flex-1 text-center mx-2" numberOfLines={1}>
        {title}
      </Text>

      {rightIcon ? (
        <TouchableOpacity
          onPress={onRightPress}
          className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
        >
          <Text className="text-white text-[22px]">{rightIcon}</Text>
        </TouchableOpacity>
      ) : (
        <View className="w-9" />
      )}
    </View>
  );
};

export default AppHeader;
