import React from "react";
import { View, Text, TextInput } from "react-native";

const FormField = React.forwardRef(
  ({ label, value, onChangeText, required, multiline, keyboardType, placeholder, returnKeyType, onSubmitEditing, editable = true }, ref) => {
    return (
      <View className="p-[14px]">
        <Text className="text-[12px] text-[#888] font-medium mb-[6px]">
          {label}
          {required && <Text className="text-[#e74c3c]"> *</Text>}
        </Text>
        {editable ? (
          <TextInput
            ref={ref}
            className="text-[14px] text-[#1a1a2e] border border-[#e8ecf0] rounded-[10px] px-[12px] py-[10px] bg-[#f8fafb]"
            style={multiline ? { minHeight: 80, paddingTop: 10 } : {}}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder || `กรอก${label}`}
            placeholderTextColor="#bbb"
            keyboardType={keyboardType || "default"}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            textAlignVertical={multiline ? "top" : "center"}
            autoCapitalize="none"
            returnKeyType={multiline ? "default" : (returnKeyType ?? "next")}
            onSubmitEditing={onSubmitEditing}
            blurOnSubmit={!onSubmitEditing}
          />
        ) : (
          <View className="border border-[#e8ecf0] rounded-[10px] px-[12px] py-[10px] bg-[#f3f4f6]">
            <Text className="text-[14px] text-[#6b7280]">{value || ""}</Text>
          </View>
        )}
      </View>
    );
  }
);

export default FormField;
