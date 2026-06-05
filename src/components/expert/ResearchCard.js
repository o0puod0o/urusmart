import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

const ResearchItem = ({ badge, badgeBg, badgeColor, title, subtitle }) => (
  <View className="flex-row items-center gap-3 py-3 border-b border-[#eef2f5]">
    <View
      className="w-[42px] h-[42px] rounded-[14px] items-center justify-center"
      style={{ backgroundColor: badgeBg }}
    >
      <Text className="text-[11px] font-bold" style={{ color: badgeColor }}>{badge}</Text>
    </View>
    <View className="flex-1">
      <Text className="text-[13px] font-semibold text-[#1a1a2e] leading-[17px]" numberOfLines={2}>{title}</Text>
      <Text className="text-[11px] text-[#777] mt-[3px]">{subtitle}</Text>
    </View>
  </View>
);

const ResearchCard = ({ items = [], onAdd }) => {
  const { t } = useTranslation();
  if (!items || items.length === 0) return null;

  return (
    <View className="bg-white rounded-[20px] p-[14px] mb-5 mt-[6px]" style={{ elevation: 2, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8 }}>
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-[14px] font-bold text-[#1a1a2e]">{t("research.card.latest")}</Text>
        <View className="bg-[#e8f5ee] rounded-[20px] px-[10px] py-1">
          <Text className="text-[10px] font-semibold text-brand">{t("research.card.inApp")}</Text>
        </View>
      </View>

      {items.map((item, i) => (
        <ResearchItem key={i} badge={item.badge} badgeBg={item.badgeBg} badgeColor={item.badgeColor} title={item.title} subtitle={item.subtitle} />
      ))}

      <TouchableOpacity
        className="mt-3 py-3 rounded-xl bg-[#e8f5ee] items-center"
        onPress={onAdd}
        activeOpacity={0.8}
      >
        <Text className="text-[13px] font-semibold text-brand">{t("research.card.addNew")}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResearchCard;
