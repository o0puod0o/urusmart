import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "../../theme/tokens";
import { sanitizeAcademicText } from "../../utils/inputSanitize";

// Dropdown แบบ dialog กลางจอ — เปิดทันทีไม่ต้องรอ measure() ตำแหน่ง trigger
// เหมาะกับกรณีที่ต้องการเปิด-ปิดถี่ๆ โดยไม่มี native bridge latency ของ InlineDropdown
const SheetDropdown = ({
  label,
  value,
  options,
  placeholder,
  onSelect,
  loading = false,
  searchable = false,
  required = false,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = useMemo(
    () => options.find((o) => String(o.id) === String(value) && o.id !== ""),
    [options, value],
  );

  const handleSelect = useCallback((id) => {
    onSelect(id);
    setSearch("");
    setOpen(false);
  }, [onSelect]);

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter(
      (option) =>
        String(option.label ?? "").toLowerCase().includes(q) ||
        String(option.id ?? "").toLowerCase().includes(q),
    );
  }, [options, search, searchable]);

  const renderOption = useCallback(
    (opt, index) => {
      const isSelected = String(opt.id) === String(value);
      const isPlaceholder = opt.id === "";

      return (
        <TouchableOpacity
          key={`${opt.id}-${index}`}
          className={`px-[14px] py-3 border-b border-[#f0f4f7] ${
            isSelected ? "bg-[#f0faf4]" : ""
          }`}
          onPress={() => handleSelect(opt.id)}
          activeOpacity={0.75}
        >
          <View className="flex-row items-center">
            <View className="w-5 items-center mr-[6px]">
              {isSelected && (
                <Ionicons name="checkmark" size={14} color={colors.primary} />
              )}
            </View>
            <Text
              className={`flex-1 text-[13px] ${
                isSelected
                  ? "text-brand font-semibold"
                  : isPlaceholder
                    ? "text-[#9aa6b1]"
                    : "text-[#444]"
              }`}
              numberOfLines={2}
            >
              {opt.label}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [handleSelect, value],
  );

  const displayPlaceholder = placeholder ?? options[0]?.label ?? "เลือก...";

  return (
    <View className="px-4 py-2">
      {!!label && (
        <Text className="text-[13px] font-semibold text-brand mb-[6px]">
          {label}
          {required && <Text className="text-[#d83a36]"> *</Text>}
        </Text>
      )}
      <TouchableOpacity
        className={`flex-row items-center rounded-xl px-[14px] gap-1 ${
          open
            ? "bg-[#e8f5ee] border-[1.5px] border-brand"
            : "bg-[#f4f6f8] border border-[#e8ecf0]"
        }`}
        style={{ minHeight: 48 }}
        onPress={() => {
          setSearch("");
          setOpen((prev) => !prev);
        }}
        activeOpacity={0.8}
      >
        <Text
          className="flex-1 text-[13px] text-[#1a1a2e]"
          style={!selected ? { color: "#aaa" } : {}}
          numberOfLines={1}
        >
          {selected ? selected.label : displayPlaceholder}
        </Text>
        {loading && (
          <ActivityIndicator size="small" color="#888" style={{ marginRight: 4 }} />
        )}
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={open || selected ? colors.primary : "#888"}
        />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <KeyboardAvoidingView
          className="flex-1 justify-center px-5"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ backgroundColor: "rgba(10, 20, 16, 0.28)" }}
        >
          <TouchableOpacity
            className="absolute inset-0"
            activeOpacity={1}
            onPress={() => setOpen(false)}
          />
          <View className="bg-white rounded-2xl overflow-hidden border border-[#d4ece2]">
            <View className="flex-row items-center px-4 py-3 bg-[#f0faf5] border-b border-[#d4ece2]">
              <Text
                className="flex-1 text-[14px] font-bold text-[#0a3d2a]"
                numberOfLines={1}
              >
                {selected ? selected.label : displayPlaceholder}
              </Text>
              <TouchableOpacity
                className="w-8 h-8 rounded-full items-center justify-center bg-white"
                onPress={() => setOpen(false)}
              >
                <Ionicons name="close" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {searchable && (
              <View className="flex-row items-center gap-2 px-3 py-3 bg-[#f8fafb] border-b border-[#edf3f0]">
                <View className="w-8 h-8 rounded-[10px] bg-[#e8f5ee] items-center justify-center">
                  <Ionicons name="search-outline" size={15} color={colors.primary} />
                </View>
                <TextInput
                  className="flex-1 text-[14px] text-[#1a1a2e] font-medium"
                  style={{ paddingVertical: 0 }}
                  placeholder={t("research.common.search")}
                  placeholderTextColor="#aab8b2"
                  value={search}
                  onChangeText={(text) => setSearch(sanitizeAcademicText(text))}
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                />
                {search.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearch("")}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={18} color="#9aa6b1" />
                  </TouchableOpacity>
                )}
              </View>
            )}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item, index }) => renderOption(item, index)}
              ListEmptyComponent={
                loading ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text className="text-[13px] text-[#9aa6b1] font-semibold mt-2">
                      {t("research.common.loading")}
                    </Text>
                  </View>
                ) : (
                  <View className="items-center py-8">
                    <Ionicons name="search-outline" size={28} color="#c4d4cc" />
                    <Text className="text-[13px] text-[#9aa6b1] font-semibold mt-2">
                      {t("research.common.notFound")}
                    </Text>
                  </View>
                )
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              bounces={false}
              initialNumToRender={16}
              maxToRenderPerBatch={16}
              updateCellsBatchingPeriod={16}
              windowSize={7}
              style={{ maxHeight: 360 }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default SheetDropdown;
