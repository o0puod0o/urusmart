import React from "react";
import { TouchableOpacity, View, Text, Linking } from "react-native";

const ServiceIconItem = ({ icon, label, url, onPress, bgColor = "#e8f5ee" }) => {
  const handlePress = () => {
    if (onPress) onPress();
    else if (url) Linking.openURL(url);
  };

  return (
    <TouchableOpacity className="items-center gap-[5px]" onPress={handlePress} activeOpacity={0.75}>
      <View
        className="w-[52px] h-[52px] rounded-[14px] items-center justify-center border border-[#00000008]"
        style={{ backgroundColor: bgColor }}
      >
        <Text className="text-[22px]">{icon}</Text>
      </View>
      <Text className="text-[9px] text-[#555] text-center leading-[13px]" numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default ServiceIconItem;
