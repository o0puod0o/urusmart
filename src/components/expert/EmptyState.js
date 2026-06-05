import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

const EmptyState = ({ icon, message, onAdd }) => {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center pt-20 gap-[10px]">
      <Text className="text-[48px]">{icon}</Text>
      <Text className="text-[14px] text-[#aaa]">{message ?? t("research.empty.message")}</Text>
      {onAdd && (
        <TouchableOpacity
          className="mt-2 bg-brand rounded-[10px] px-5 py-[10px]"
          onPress={onAdd}
          activeOpacity={0.85}
        >
          <Text className="text-white text-[13px] font-medium">{t("research.empty.addNew")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default EmptyState;
