import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const InlineDropdown = ({ label, value, options, onSelect, required, searchable = false }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = options.find((o) => o.id === value);

  const filteredOptions = useMemo(() => {
    if (!search?.trim() || !searchable) return options;
    const lower = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(lower) ||
        String(opt.id).toLowerCase().includes(lower),
    );
  }, [options, search, searchable]);

  return (
    <View className="px-4 py-3">
      <Text className="text-[12px] text-[#888] font-medium mb-[6px]">
        {label}
        {required && <Text className="text-[#e74c3c]"> *</Text>}
      </Text>

      <TouchableOpacity
        className={`flex-row items-center px-3 py-[11px] border rounded-[10px] ${
          open
            ? "bg-[#f0faf4] border-brand rounded-bl-none rounded-br-none"
            : "bg-[#f8fafb] border-[#e8ecf0]"
        }`}
        onPress={() => { setOpen(!open); setSearch(""); }}
        activeOpacity={0.8}
      >
        <Text
          className="flex-1 text-[14px] text-[#1a1a2e]"
          style={!selected?.id ? { color: "#bbb" } : {}}
          numberOfLines={1}
        >
          {selected?.id ? selected.label : options[0]?.label}
        </Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color="#888" />
      </TouchableOpacity>

      {open && (
        <View className="border border-t-0 border-brand rounded-bl-[10px] rounded-br-[10px] overflow-hidden bg-white">
          {searchable && (
            <View className="flex-row items-center px-3 py-[10px] border-b border-[#f0f4f7] bg-[#fafafa]">
              <Ionicons name="search" size={16} color="#888" />
              <TextInput
                className="flex-1 ml-2 text-[14px] text-[#1a1a2e] py-0"
                placeholder={t("research.common.search")}
                placeholderTextColor="#999"
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
            </View>
          )}
          <ScrollView nestedScrollEnabled bounces={false} style={{ maxHeight: 260 }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  className={`px-3 py-3 border-b border-[#f0f4f7] ${opt.id === value ? "bg-[#f0faf4]" : ""}`}
                  onPress={() => { onSelect(opt.id); setOpen(false); setSearch(""); }}
                >
                  <View className="flex-row items-center">
                    <View className="w-5 items-center mr-[6px]">
                      {opt.id === value && <Ionicons name="checkmark" size={13} color="#1a6b3c" />}
                    </View>
                    <Text className={`text-[13px] flex-1 ${opt.id === value ? "text-brand font-semibold" : "text-[#444]"}`}>
                      {opt.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="py-4 items-center">
                <Text className="text-[13px] text-[#aaa]">{t("research.common.notFound")}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default InlineDropdown;
