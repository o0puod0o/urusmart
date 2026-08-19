import React, { useEffect, useMemo, useState, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StatusBar, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAuthToken } from "../../services/authStorage";

// อนุญาตเฉพาะ http/https ป้องกัน javascript: file: data: URL injection
const isSafeUrl = (u) => {
  try {
    const { protocol } = new URL(u);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

const canPassTokenToUrl = (u) => {
  try {
    const parsed = new URL(u);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const appendTokenQuery = (u, token) => {
  try {
    const parsed = new URL(u);
    parsed.searchParams.set("token", token);
    return parsed.toString();
  } catch {
    return u;
  }
};

export default function InAppBrowser({ route, navigation }) {
  const {
    url,
    title,
    passAuthToken = true,
    authMode = "storage",
  } = route.params;
  const [loading, setLoading] = useState(isSafeUrl(url));
  const [authLoading, setAuthLoading] = useState(passAuthToken && canPassTokenToUrl(url));
  const [authToken, setAuthToken] = useState("");
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef(null);
  const insets = useSafeAreaInsets();

  const pt = insets.top || (Platform.OS === "ios" ? 50 : (StatusBar.currentHeight ?? 0) + 8);
  const shouldPassToken = passAuthToken && authToken && canPassTokenToUrl(url);

  useEffect(() => {
    let alive = true;

    const loadToken = async () => {
      if (!passAuthToken || !canPassTokenToUrl(url)) {
        setAuthLoading(false);
        return;
      }

      try {
        const token = await getAuthToken();
        if (alive) setAuthToken(token || "");
      } catch {
        if (alive) setAuthToken("");
      } finally {
        if (alive) setAuthLoading(false);
      }
    };

    loadToken();
    return () => {
      alive = false;
    };
  }, [passAuthToken, url]);

  const webUrl = useMemo(() => {
    if (!shouldPassToken || authMode !== "query") return url;
    return appendTokenQuery(url, authToken);
  }, [authMode, authToken, shouldPassToken, url]);

  const webHeaders = useMemo(() => {
    if (!shouldPassToken) return undefined;
    return {
      Accept: "application/json",
      Authorization: `Bearer ${authToken}`,
    };
  }, [authToken, shouldPassToken]);

  const injectedAuthScript = useMemo(() => {
    if (!shouldPassToken) return undefined;
    const tokenJson = JSON.stringify(authToken);
    return `
      (function () {
        try {
          var token = ${tokenJson};
          window.urusmartToken = token;
          localStorage.setItem("urusmart_token", token);
          localStorage.setItem("sanctum_token", token);
        } catch (error) {}
      })();
      true;
    `;
  }, [authToken, shouldPassToken]);

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

      {isSafeUrl(url) ? (
        <WebView
          ref={webViewRef}
          source={{ uri: webUrl, headers: webHeaders }}
          className="flex-1 bg-white"
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
          injectedJavaScriptBeforeContentLoaded={injectedAuthScript}
          injectedJavaScript={injectedAuthScript}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState={false}
          allowsBackForwardNavigationGestures
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="warning-outline" size={48} color="#ef4444" />
          <Text className="text-[16px] font-bold text-[#1f2937] mt-3">URL ไม่ปลอดภัย</Text>
          <Text className="text-[13px] text-[#6b7280] mt-1">รองรับเฉพาะ http และ https เท่านั้น</Text>
        </View>
      )}

      {(loading || authLoading) && (
        <View className="absolute items-center justify-center" style={{ top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.85)" }}>
          <ActivityIndicator size="large" color="#0f7a55" />
        </View>
      )}
    </View>
  );
}
