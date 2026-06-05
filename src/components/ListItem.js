import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const STATUS_COLOR = {
  เผยแพร่แล้ว: { bg: "#e8f5ee", text: "#1a6b3c" },
  กำลังดำเนินการ: { bg: "#fff3e0", text: "#e67e22" },
  รอการตีพิมพ์: { bg: "#e8f0fb", text: "#185fa5" },
  "-": { bg: "#f0f4f8", text: "#888" },
};

const ListItem = ({ item, onEdit, onDelete }) => {
  const statusStyle = STATUS_COLOR[item.status] || STATUS_COLOR["-"];

  return (
    <View className="flex-row items-center p-[14px] gap-[10px]">
      <View className="flex-1 gap-[6px]">
        <Text className="text-[13px] font-medium text-[#1a1a2e] leading-[18px]" numberOfLines={2}>
          {item.title}
        </Text>
        <View className="flex-row items-center gap-[8px]">
          {item.year && item.year !== "-" && (
            <Text className="text-[11px] text-[#888]">ปี {item.year}</Text>
          )}
          {item.status && item.status !== "-" && (
            <View className="rounded-[20px] px-[8px] py-[2px]" style={{ backgroundColor: statusStyle.bg }}>
              <Text className="text-[10px] font-medium" style={{ color: statusStyle.text }}>
                {item.status}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="flex-col gap-[6px]">
        <TouchableOpacity
          className="bg-[#e8f5ee] rounded-lg px-[12px] py-[5px] items-center"
          onPress={() => onEdit(item)}
          activeOpacity={0.75}
        >
          <Text className="text-[11px] text-brand font-medium">แก้ไข</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-[#fce4ec] rounded-lg px-[12px] py-[5px] items-center"
          onPress={() => onDelete(item.id)}
          activeOpacity={0.75}
        >
          <Text className="text-[11px] text-[#c0392b] font-medium">ลบ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ListItem;
