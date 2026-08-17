import React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { colors } from "../../theme/tokens";

const FormContainer = ({ children, style, className }) => (
  <KeyboardAvoidingView
    style={[{ flex: 1, backgroundColor: colors.appBg }, style]}
    className={className}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
  >
    {children}
  </KeyboardAvoidingView>
);

export default FormContainer;
