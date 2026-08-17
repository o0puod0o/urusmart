import React from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, hitSlop, radius } from "../theme/tokens";

const AppHeader = ({ title, onBack, rightIcon, onRightPress }) => {
  const { top } = useSafeAreaInsets();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f7a55" />
      <View
        className="flex-row items-center justify-between px-4 pb-4"
        style={{ paddingTop: top + 8, backgroundColor: colors.primary }}
      >
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 items-center justify-center"
          style={{ borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.14)" }}
          activeOpacity={0.75}
          hitSlop={hitSlop}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text className="text-white text-[17px] font-extrabold flex-1 text-center mx-2" numberOfLines={1}>
          {title}
        </Text>

        {rightIcon ? (
          <TouchableOpacity
            onPress={onRightPress}
            className="w-10 h-10 items-center justify-center"
            style={{ borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.14)" }}
            activeOpacity={0.75}
            hitSlop={hitSlop}
          >
            <Ionicons name={rightIcon} size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View className="w-10" />
        )}
      </View>
    </>
  );
};

export default AppHeader;
