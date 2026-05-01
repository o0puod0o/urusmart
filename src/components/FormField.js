import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

const FormField = ({
  label,
  value,
  onChangeText,
  required,
  multiline,
  keyboardType,
  placeholder,
}) => {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || `กรอก${label}`}
        placeholderTextColor="#bbb"
        keyboardType={keyboardType || "default"}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? "top" : "center"}
        autoCapitalize="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    padding: 14,
  },
  label: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
    marginBottom: 6,
  },
  required: {
    color: "#e74c3c",
  },
  input: {
    fontSize: 14,
    color: "#1a1a2e",
    borderWidth: 1,
    borderColor: "#e8ecf0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f8fafb",
  },
  inputMulti: {
    minHeight: 80,
    paddingTop: 10,
  },
});

export default FormField;
