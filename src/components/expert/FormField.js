import React, { useState } from "react";
import { View, Text, TextInput, Platform } from "react-native";
import { colors, radius, spacing, typography } from "../../theme/tokens";

const FormField = React.forwardRef(
  (
    {
      label,
      value,
      onChangeText,
      required,
      multiline,
      keyboardType,
      placeholder,
      returnKeyType,
      onSubmitEditing,
      onLayout,
      onFocus,
      onBlur,
      editable = true,
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const inputStyle = [
      styles.input,
      focused && styles.inputFocused,
      multiline && styles.inputMultiline,
    ];

    return (
      <View style={styles.wrap} onLayout={onLayout}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        {editable ? (
          <TextInput
            ref={ref}
            style={inputStyle}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder || label}
            placeholderTextColor={colors.placeholder}
            keyboardType={multiline ? "default" : keyboardType || "default"}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            textAlignVertical={multiline ? "top" : "center"}
            autoCorrect={
              multiline ? false : Platform.OS === "ios" ? true : false
            }
            spellCheck={
              multiline ? false : Platform.OS === "ios" ? true : false
            }
            textContentType={
              multiline ? "none" : Platform.OS === "ios" ? undefined : "none"
            }
            autoComplete={
              multiline ? "off" : Platform.OS === "ios" ? undefined : "off"
            }
            autoCapitalize="none"
            returnKeyType={multiline ? "default" : (returnKeyType ?? "next")}
            onSubmitEditing={onSubmitEditing}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            blurOnSubmit={!onSubmitEditing}
          />
        ) : (
          <View style={styles.disabledBox}>
            <Text style={styles.disabledText}>{value || ""}</Text>
          </View>
        )}
      </View>
    );
  },
);

const styles = {
  wrap: {
    paddingHorizontal: spacing.card,
    paddingVertical: 10,
  },
  label: {
    ...typography.label,
    marginBottom: 7,
  },
  required: {
    color: colors.danger,
  },
  input: {
    ...typography.input,
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.fieldX,
    paddingVertical: spacing.fieldY,
    backgroundColor: colors.fieldBg,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  inputMultiline: {
    minHeight: 88,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  disabledBox: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.fieldX,
    paddingVertical: spacing.fieldY,
    backgroundColor: colors.fieldDisabled,
    justifyContent: "center",
  },
  disabledText: {
    ...typography.input,
    color: colors.textMuted,
  },
};

export default FormField;
