import React from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AppHeader = ({ title, onBack, rightIcon, onRightPress }) => {
  const { top } = useSafeAreaInsets();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f7a55" />
      <View className="bg-brand flex-row items-center justify-between px-4 pb-4" style={{ paddingTop: top + 8 }}>
        <TouchableOpacity
          onPress={onBack}
          className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
          activeOpacity={0.75}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text className="text-white text-base font-semibold flex-1 text-center mx-2" numberOfLines={1}>
          {title}
        </Text>

        {rightIcon ? (
          <TouchableOpacity
            onPress={onRightPress}
            className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
            activeOpacity={0.75}
          >
            <Ionicons name={rightIcon} size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View className="w-9" />
        )}
      </View>
    </>
  );
};

export default AppHeader;
