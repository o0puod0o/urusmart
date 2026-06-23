import React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";

const FormContainer = ({ children, style, className }) => (
  <KeyboardAvoidingView
    style={[{ flex: 1 }, style]}
    className={className}
    behavior="height"
    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
  >
    {children}
  </KeyboardAvoidingView>
);

export default FormContainer;
