import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const SectionHeader = ({ title, linkText, onPress }) => {
  return (
    <View className="flex-row justify-between items-center mb-[10px]">
      <Text className="text-[13px] font-semibold text-[#1a1a2e]">{title}</Text>
      {linkText && (
        <TouchableOpacity
          onPress={onPress}
          className="bg-[#e8f5ee] rounded-[20px] px-[10px] py-[3px]"
        >
          <Text className="text-[11px] text-brand">{linkText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SectionHeader;
