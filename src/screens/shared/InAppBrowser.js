import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StatusBar, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function InAppBrowser({ route, navigation }) {
  const { url, title } = route.params;
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef(null);
  const insets = useSafeAreaInsets();

  const pt = insets.top || (Platform.OS === "ios" ? 50 : (StatusBar.currentHeight ?? 0) + 8);

  return (
    <View className="flex-1 bg-primary">
      <StatusBar barStyle="light-content" backgroundColor="#0f7a55" />

      <View
        className="flex-row items-center bg-primary px-2 pb-3"
        style={{ paddingTop: pt }}
      >
        <TouchableOpacity
          className="w-9 h-9 items-center justify-center"
          onPress={() => canGoBack ? webViewRef.current?.goBack() : navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text className="flex-1 text-white text-[16px] font-bold text-center mx-1" numberOfLines={1}>
          {title}
        </Text>

        <TouchableOpacity
          className="w-9 h-9 items-center justify-center"
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        className="flex-1 bg-white"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        allowsBackForwardNavigationGestures
      />

      {loading && (
        <View className="absolute inset-0 bg-white/85 items-center justify-center">
          <ActivityIndicator size="large" color="#0f7a55" />
        </View>
      )}
    </View>
  );
}
