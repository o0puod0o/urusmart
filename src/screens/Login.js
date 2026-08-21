import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  Keyboard,
  Modal,
} from "react-native";
import { WebView } from "react-native-webview";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { onLoginSuccess } from "../services/notificationService";
import { API_BASE_URL, STORAGE_KEYS } from "../config";
import { clearAuthSession, saveAuthSession } from "../services/authStorage";
import {
  checkSupport,
  isBiometricEnabled,
  getBiometricToken,
  saveBiometricToken,
  setBiometricEnabled,
  clearBiometricToken,
} from "../services/biometricService";

const API_URL = API_BASE_URL;
const SSO_BASE_URL =
  API_URL?.replace(/\/api\/?$/, "") || "https://urusmart.uru.ac.th";
const SSO_REDIRECT_URL = `${SSO_BASE_URL}/auth/redirect`;
const ENABLE_PASSWORD_LOGIN =
  process.env.EXPO_PUBLIC_ENABLE_PASSWORD_LOGIN === "true";

// ถ้าเพิ่ม URL scheme ใน app.json ในอนาคต ต้อง validate origin ก่อนรับ token
const getSsoAccessTokenFromRoute = (route) =>
  route?.params?.access_token ??
  route?.params?.accessToken ??
  route?.params?.ssoToken ??
  route?.params?.passportToken ??
  "";

const getLoginErrorMessage = (message, t) => {
  const normalized = String(message || "")
    .trim()
    .toLowerCase();
  if (
    normalized.includes("invalid email or password") ||
    normalized.includes("invalid username or password") ||
    normalized.includes("invalid credentials")
  ) {
    return t("login.invalidCredentials");
  }

  return t("login.genericLoginError");
};

const parseSsoMessage = (message) => {
  try {
    const payload = JSON.parse(message);
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
};

const parseUrl = (url = "") => {
  try {
    return new URL(String(url));
  } catch {
    return null;
  }
};

const getSsoBackendHost = () =>
  parseUrl(SSO_BASE_URL)?.hostname ?? "urusmart.uru.ac.th";

const isUniversityHost = (hostname = "") =>
  hostname === "uru.ac.th" || hostname.endsWith(".uru.ac.th");

const TRUSTED_EXTERNAL_SSO_HOSTS = [
  "login.live.com",
  "login.microsoftonline.com",
  "login.microsoft.com",
  "account.live.com",
  "outlook.live.com",
  "office.com",
  "microsoft.com",
  "microsoftonline.com",
  "msauth.net",
  "windows.net",
];

const isTrustedExternalSsoHost = (hostname = "") =>
  TRUSTED_EXTERNAL_SSO_HOSTS.some(
    (host) => hostname === host || hostname.endsWith(`.${host}`),
  );

const sanitizeSsoUrlForLog = (url = "") => {
  const parsed = parseUrl(url);
  if (!parsed) return String(url || "");

  ["token", "access_token", "ssoToken", "passportToken", "code", "state"].forEach(
    (key) => {
      if (parsed.searchParams.has(key)) {
        parsed.searchParams.set(key, "[hidden]");
      }
    },
  );
  return parsed.toString();
};

const debugSso = (label, url) => {
  if (__DEV__) console.log(`[SSO] ${label}:`, sanitizeSsoUrlForLog(url));
};

const isTrustedSsoNavigationUrl = (url = "") => {
  const value = String(url);
  if (!value || value === "about:blank") return true;

  const parsed = parseUrl(value);
  if (!parsed) return false;
  if (!["http:", "https:"].includes(parsed.protocol)) return false;

  return (
    parsed.hostname === getSsoBackendHost() ||
    isUniversityHost(parsed.hostname) ||
    isTrustedExternalSsoHost(parsed.hostname)
  );
};

const isTrustedSsoMessageUrl = (url = "") => {
  const parsed = parseUrl(url);
  if (!parsed) return false;
  if (!["http:", "https:"].includes(parsed.protocol)) return false;
  return parsed.hostname === getSsoBackendHost();
};

const isSsoBackendUrl = (url = "") => {
  const parsed = parseUrl(url);
  if (!parsed) return false;
  if (!["http:", "https:"].includes(parsed.protocol)) return false;
  return parsed.hostname === getSsoBackendHost();
};

const isSsoResultUrl = (url = "") => {
  const parsed = parseUrl(url);
  if (!parsed) return false;
  return isSsoBackendUrl(url) && !parsed.pathname.includes("/auth/redirect");
};

const isSsoCallbackUrl = (url = "") =>
  String(url).includes("/auth/callback") ||
  String(url).includes("token=") ||
  String(url).includes("access_token=");

const getSsoPayloadFromUrl = (url = "") => {
  const parsed = parseUrl(url);
  if (!parsed) return null;

  const readToken = (params) =>
    params.get("token") ||
    params.get("access_token") ||
    params.get("ssoToken") ||
    params.get("passportToken");

  const searchToken = readToken(parsed.searchParams);
  const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ""));
  const hashToken = readToken(hashParams);
  const token = searchToken || hashToken;

  return token ? { token } : null;
};

const HIDE_SSO_CALLBACK_SCRIPT = `
  (function () {
    if (
      window.location.href.indexOf('/auth/callback') !== -1 ||
      window.location.href.indexOf('token=') !== -1 ||
      window.location.href.indexOf('access_token=') !== -1
    ) {
      document.documentElement.style.opacity = '0';
      if (document.body) document.body.style.opacity = '0';
    }
  })();
  true;
`;

const SSO_CAPTURE_SCRIPT = `
  (function () {
    var sent = false;
    var attempts = 0;

    function sendPayload(value) {
      if (sent || !value || !window.ReactNativeWebView) return;
      sent = true;
      window.ReactNativeWebView.postMessage(
        typeof value === 'string' ? value : JSON.stringify(value)
      );
    }

    function readTokenFromParams(raw) {
      try {
        var params = new URLSearchParams(raw || '');
        return (
          params.get('token') ||
          params.get('access_token') ||
          params.get('ssoToken') ||
          params.get('passportToken')
        );
      } catch (error) {
        return null;
      }
    }

    function readTokenFromStorage(storage) {
      try {
        if (!storage) return null;
        var keys = [
          'token',
          'access_token',
          'ssoToken',
          'passportToken',
          'urusmart_token'
        ];
        for (var i = 0; i < keys.length; i += 1) {
          var value = storage.getItem(keys[i]);
          if (value) return value;
        }
      } catch (error) {}
      return null;
    }

    function capture() {
      if (sent) return true;
      attempts += 1;

      var href = String(window.location.href || '');
      var isCallback =
        href.indexOf('/auth/callback') !== -1 ||
        href.indexOf('token=') !== -1 ||
        href.indexOf('access_token=') !== -1;

      var token =
        readTokenFromParams(window.location.search) ||
        readTokenFromParams(String(window.location.hash || '').replace(/^#/, '')) ||
        readTokenFromStorage(window.localStorage) ||
        readTokenFromStorage(window.sessionStorage);

      if (token) {
        sendPayload({ token: token });
        return true;
      }

      try {
        var raw = (document.body && document.body.innerText || '').trim();
        if (raw && raw.charAt(0) === '{' && raw.indexOf('"token"') !== -1) {
          if (!isCallback) {
            document.documentElement.style.opacity = '0';
            if (document.body) document.body.style.opacity = '0';
          }
          sendPayload(raw);
          return true;
        }
      } catch (error) {}

      return false;
    }

    capture();
    var timer = setInterval(function () {
      if (capture() || attempts >= 120) {
        clearInterval(timer);
      }
    }, 250);

    return true;
  })();
  true;
`;

// ── Field ปกติ ไม่ใช้ Reanimated (ป้องกัน crash) ──────────────
const Field = ({ label, icon, children, focused }) => (
  <View className="mb-4">
    <Text className="text-[12px] font-bold text-[#374151] mb-[6px] ml-1">
      {label}
    </Text>
    <View
      className="flex-row items-center bg-[#f5faf7] rounded-[14px] px-3 h-[54px]"
      style={{
        borderWidth: focused ? 2 : 1.5,
        borderColor: focused ? "#0f7a55" : "#e3efe8",
      }}
    >
      <View className="w-[34px] h-[34px] rounded-[10px] bg-[#e6f2ec] items-center justify-center mr-[10px]">
        <Ionicons name={icon} size={18} color="#0f7a55" />
      </View>
      {children}
    </View>
  </View>
);

const Login = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { top } = useSafeAreaInsets();
  const PT = top + 16;
  const PB = Platform.OS === "ios" ? 48 : 32;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [ssoPageLoading, setSsoPageLoading] = useState(false);
  const [hideSsoContent, setHideSsoContent] = useState(false);
  const [showSsoWebView, setShowSsoWebView] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("Biometric");
  const [biometricIcon, setBiometricIcon] = useState("finger-print-outline");
  const [biometricReady, setBiometricReady] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollRef = useRef(null);
  const focusedFieldRef = useRef(null);
  const passwordRef = useRef(null);
  const ssoWebViewRef = useRef(null);
  const ssoTimeoutRef = useRef(null);
  const ssoHandledRef = useRef(false);
  const ssoCurrentUrlRef = useRef(SSO_REDIRECT_URL);
  const ssoAccessToken = getSsoAccessTokenFromRoute(route);

  // ── Entrance animations ──
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const textY = useSharedValue(30);
  const textOpacity = useSharedValue(0);
  const cardY = useSharedValue(50);
  const cardOpacity = useSharedValue(0);
  const btnScale = useSharedValue(1);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 120 });
    logoOpacity.value = withTiming(1, { duration: 400 });
    textY.value = withDelay(250, withSpring(0, { damping: 14 }));
    textOpacity.value = withDelay(250, withTiming(1, { duration: 400 }));
    cardY.value = withDelay(
      400,
      withSpring(0, { damping: 16, stiffness: 100 }),
    );
    cardOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
  }, []);

  // ── ตรวจ Biometric ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [enabled, support] = await Promise.all([
        isBiometricEnabled(),
        checkSupport(),
      ]);
      if (enabled && support.supported) {
        setBiometricAvailable(true);
        setBiometricLabel(getBiometricLabel(support));
        setBiometricIcon(
          support.hasFaceId ? "scan-outline" : "finger-print-outline",
        );
        setBiometricReady(true);
      }
    })();
  }, [t]);

  // ── Auto-trigger biometric ───────────────────────────────────
  useEffect(() => {
    if (!biometricReady) return;
    const timer = setTimeout(() => triggerBiometric(), 700);
    return () => clearTimeout(timer);
  }, [biometricReady]);

  useEffect(
    () => () => {
      if (ssoTimeoutRef.current) clearTimeout(ssoTimeoutRef.current);
    },
    [],
  );

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates?.height ?? 0);

      if (Platform.OS === "android") {
        const targetY = focusedFieldRef.current === "password" ? 230 : 150;
        setTimeout(() => {
          scrollRef.current?.scrollTo({ y: targetY, animated: true });
        }, 50);
      }
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
      focusedFieldRef.current = null;
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollFocusedInputIntoView = (field, y = 0) => {
    if (Platform.OS !== "android") return;
    focusedFieldRef.current = field;
    requestAnimationFrame(() => {
      setTimeout(
        () => {
          scrollRef.current?.scrollTo({ y, animated: true });
        },
        keyboardVisible ? 80 : 260,
      );
    });
  };

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));
  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textY.value }],
    opacity: textOpacity.value,
  }));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardY.value }],
    opacity: cardOpacity.value,
  }));
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const getBiometricLabel = (support) =>
    support?.hasFaceId ? t("login.faceId") : t("login.fingerprint");

  const navigateToMain = () => {
    navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
  };

  const disableBiometricLogin = async () => {
    setBiometricAvailable(false);
    setBiometricReady(false);
    await setBiometricEnabled(false);
    await clearBiometricToken();
  };

  const runPostLoginNotifications = () => {
    onLoginSuccess().catch((error) => {
      console.error("POST-LOGIN NOTIFICATION ERROR:", error);
    });
  };

  const promptEnableBiometric = async (token) => {
    const support = await checkSupport();
    if (!support.supported) return;
    const biometricLabelText = getBiometricLabel(support);

    Alert.alert(
      t("login.enableBiometricTitle", { label: biometricLabelText }),
      t("login.enableBiometricMsg", { label: biometricLabelText }),
      [
        {
          text: t("login.notNow"),
          style: "cancel",
          onPress: async () => {
            await setBiometricEnabled(false);
            await clearBiometricToken();
          },
        },
        {
          text: t("login.enable"),
          onPress: async () => {
            try {
              await saveBiometricToken(
                String(token),
                t("login.enableBiometricPrompt", {
                  label: biometricLabelText,
                }),
              );
              await setBiometricEnabled(true);
            } catch (_) {
              Alert.alert(
                t("login.enableFailedTitle"),
                t("login.enableFailedMsg"),
              );
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  const promptEnableBiometricAfterNavigation = (token) => {
    setTimeout(() => {
      promptEnableBiometric(token).catch((error) => {
        console.error("BIOMETRIC PROMPT ERROR:", error);
      });
    }, 600);
  };

  const completeBackendLogin = async (data) => {
    if (!data?.token) {
      Alert.alert(t("login.signInFailedTitle"), t("login.missingToken"));
      return;
    }

    await saveAuthSession(data.token);
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify(data.user || {}),
    );
    runPostLoginNotifications();
    navigateToMain();
    promptEnableBiometricAfterNavigation(data.token);
  };

  const loginWithSsoToken = async (accessToken) => {
    const token = String(accessToken || "").trim();
    if (!token || loading) return;

    Keyboard.dismiss();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/sso-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ access_token: token }),
      });
      const data = await response.json();
      if (response.ok) {
        await completeBackendLogin(data);
      } else {
        Alert.alert(t("login.signInFailedTitle"), t("login.ssoFailed"));
      }
    } catch (_) {
      Alert.alert(t("login.errorTitle"), t("login.ssoNetworkError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ssoAccessToken) loginWithSsoToken(ssoAccessToken);
  }, [ssoAccessToken]);

  const openSsoLogin = () => {
    Keyboard.dismiss();
    ssoHandledRef.current = false;
    ssoCurrentUrlRef.current = SSO_REDIRECT_URL;
    setHideSsoContent(false);
    setSsoPageLoading(true);
    setShowSsoWebView(true);
  };

  const startSsoCallbackTimeout = (delay = 45000) => {
    if (ssoHandledRef.current || ssoTimeoutRef.current) return;
    ssoTimeoutRef.current = setTimeout(() => {
      if (ssoHandledRef.current) return;
      setSsoPageLoading(false);
      setHideSsoContent(false);
      Alert.alert(
        "เข้าสู่ระบบใช้เวลานาน",
        "ยังไม่ได้รับข้อมูลยืนยันตัวตนจาก SSO กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง",
      );
    }, delay);
  };

  const closeSsoLogin = () => {
    if (ssoTimeoutRef.current) {
      clearTimeout(ssoTimeoutRef.current);
      ssoTimeoutRef.current = null;
    }
    setShowSsoWebView(false);
    setHideSsoContent(false);
    setSsoPageLoading(false);
  };

  const handleSsoMessage = async (event) => {
    if (ssoHandledRef.current) return;

    const sourceUrl = event.nativeEvent?.url || ssoCurrentUrlRef.current || "";
    const payload = parseSsoMessage(event.nativeEvent?.data);
    if (__DEV__) {
      console.log("[SSO] message payload keys:", Object.keys(payload || {}));
    }
    if (!payload?.token) return;

    const sourceTrusted = isTrustedSsoMessageUrl(sourceUrl);
    const fallbackTrusted =
      (!sourceUrl || sourceUrl === "about:blank") &&
      isTrustedSsoMessageUrl(ssoCurrentUrlRef.current);
    if (!sourceTrusted && !fallbackTrusted) {
      if (__DEV__) {
        console.warn(
          "[SSO] rejected WebView message from:",
          sanitizeSsoUrlForLog(sourceUrl),
        );
      }
      return;
    }

    await completeSsoLogin(payload);
  };

  const completeSsoLogin = async (payload) => {
    if (ssoHandledRef.current || !payload?.token) return;

    ssoHandledRef.current = true;
    if (ssoTimeoutRef.current) {
      clearTimeout(ssoTimeoutRef.current);
      ssoTimeoutRef.current = null;
    }
    setSsoLoading(true);
    setHideSsoContent(true);
    try {
      closeSsoLogin();
      await completeBackendLogin(payload);
    } catch (error) {
      Alert.alert(t("login.signInFailedTitle"), t("login.ssoFailed"));
    } finally {
      setSsoLoading(false);
    }
  };

  const handleSsoNavigationUrl = (url = "") => {
    if (!isSsoBackendUrl(url)) return false;

    const payload = getSsoPayloadFromUrl(url);
    if (!payload?.token) return false;

    completeSsoLogin(payload).catch((error) => {
      if (__DEV__) console.warn("[SSO] complete from URL failed:", error);
      Alert.alert(t("login.signInFailedTitle"), t("login.ssoFailed"));
    });
    return true;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      cardY.value = withSequence(
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(-4, { duration: 60 }),
        withTiming(4, { duration: 60 }),
        withSpring(0),
      );
      Alert.alert(t("login.alertTitle"), t("login.missingFields"));
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        await completeBackendLogin(data);
      } else {
        Alert.alert(
          t("login.signInFailedTitle"),
          getLoginErrorMessage(data.message, t),
        );
      }
    } catch (_) {
      Alert.alert(t("login.errorTitle"), t("login.networkError"));
    } finally {
      setLoading(false);
    }
  };

  const triggerBiometric = async () => {
    let token;
    try {
      token = await getBiometricToken(t("login.biometricPrompt"));
    } catch (_) {
      // ผู้ใช้ยกเลิกหรือระบบยืนยันตัวตนไม่สำเร็จ ยังให้ลองใหม่ได้
      return;
    }
    if (!token) {
      await disableBiometricLogin();
      Alert.alert(
        t("login.noBiometricTokenTitle"),
        t("login.noBiometricTokenMsg"),
      );
      return;
    }
    let response;
    try {
      response = await fetch(`${API_URL}/me`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (_) {
      Alert.alert(t("login.errorTitle"), t("login.networkError"));
      return;
    }
    if (!response.ok) {
      await clearAuthSession();
      await disableBiometricLogin();
      Alert.alert(t("login.sessionExpiredTitle"), t("login.sessionExpiredMsg"));
      return;
    }
    await saveAuthSession(token);
    runPostLoginNotifications();
    navigateToMain();
  };

  const onPressIn = () => {
    btnScale.value = withSpring(0.96, { damping: 12 });
  };
  const onPressOut = () => {
    btnScale.value = withSpring(1, { damping: 12 });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={
        Platform.OS === "ios" ? 0 : (StatusBar.currentHeight ?? 0)
      }
    >
      <StatusBar barStyle="dark-content" backgroundColor="#eaf5ef" />

      {/* Background */}
      <LinearGradient
        colors={["#eaf5ef", "#d6eee3", "#eaf5ef"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{
          top: -130,
          right: -90,
          backgroundColor: "rgba(191,227,208,0.6)",
        }}
      />
      <View
        className="absolute w-[260px] h-[260px] rounded-full"
        style={{
          bottom: -100,
          left: -80,
          backgroundColor: "rgba(15,122,85,0.08)",
        }}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: keyboardVisible ? "flex-start" : "center",
          paddingHorizontal: 24,
          paddingTop: keyboardVisible ? 8 : PT,
          paddingBottom: keyboardVisible
            ? Math.max(keyboardHeight + 20, PB)
            : PB,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        bounces={false}
      >
        {/* Logo */}
        <Animated.View className="items-center mb-5" style={logoStyle}>
          <View
            className="w-[148px] h-[148px] rounded-full items-center justify-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.7)",
              elevation: 8,
              shadowColor: "#0f7a55",
              shadowOpacity: 0.15,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
            }}
          >
            <LinearGradient
              colors={["#ffffff", "#f0faf5"]}
              style={{
                width: 128,
                height: 128,
                borderRadius: 64,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Image
                source={require("../assets/urusmartlogo.png")}
                style={{ width: 104, height: 104 }}
                resizeMode="contain"
              />
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View className="items-center mb-7" style={textStyle}>
          <Text className="text-[24px] font-black text-[#064e35] text-center tracking-[-0.3px]">
            {t("login.title")}
          </Text>
          <Text className="text-[13px] text-[#56706a] text-center font-medium mt-[6px]">
            {t("login.subtitle")}
          </Text>
        </Animated.View>

        {/* Card */}
        <Animated.View className="w-full" style={cardStyle}>
          <View
            className="bg-white rounded-[26px] p-6 border border-[rgba(15,122,85,0.08)]"
            style={{
              elevation: 10,
              shadowColor: "#0f7a55",
              shadowOpacity: 0.12,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 10 },
            }}
          >
            <TouchableOpacity
              onPress={openSsoLogin}
              disabled={loading || ssoLoading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={
                  ssoLoading
                    ? ["#7bb8a4", "#7bb8a4"]
                    : ["#0a6644", "#0f7a55", "#1a9068"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 58,
                  borderRadius: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  elevation: 4,
                }}
              >
                {ssoLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="school-outline" size={21} color="#fff" />
                    <Text className="text-white text-[16px] font-extrabold">
                      {t("login.ssoSignIn")}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {ENABLE_PASSWORD_LOGIN && (
              <>
                <View className="flex-row items-center my-4">
                  <View className="flex-1 h-[1px] bg-[#e5eee9]" />
                  <Text className="mx-3 text-[12px] font-bold text-[#8a9a94]">
                    {t("login.or")}
                  </Text>
                  <View className="flex-1 h-[1px] bg-[#e5eee9]" />
                </View>

                {/* Email */}
                <Field
                  label={t("login.usernameLabel")}
                  icon="person-outline"
                  focused={emailFocused}
                >
                  <TextInput
                    className="flex-1 text-[15px] text-[#1f2937] font-medium"
                    style={{ height: 54, paddingVertical: 0 }}
                    placeholder={t("login.usernamePlaceholder")}
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => {
                      setEmailFocused(true);
                      scrollFocusedInputIntoView("email", 150);
                    }}
                    onBlur={() => setEmailFocused(false)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    keyboardType="default"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    blurOnSubmit={false}
                    underlineColorAndroid="transparent"
                    textContentType="username"
                  />
                </Field>

                {/* Password */}
                <Field
                  label={t("login.passwordLabel")}
                  icon="lock-closed-outline"
                  focused={passFocused}
                >
                  <TextInput
                    ref={passwordRef}
                    className="flex-1 text-[15px] text-[#1f2937] font-medium"
                    style={{ height: 54, paddingVertical: 0 }}
                    placeholder={t("login.passwordPlaceholder")}
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => {
                      setPassFocused(true);
                      scrollFocusedInputIntoView("password", 230);
                    }}
                    onBlur={() => setPassFocused(false)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    keyboardType="default"
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    underlineColorAndroid="transparent"
                    textContentType="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#6b7a82"
                    />
                  </TouchableOpacity>
                </Field>

                {/* Sign in button */}
                <Animated.View style={btnStyle}>
                  <TouchableOpacity
                    onPress={handleLogin}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    disabled={loading}
                    activeOpacity={1}
                  >
                    <LinearGradient
                      colors={
                        loading
                          ? ["#7bb8a4", "#7bb8a4"]
                          : ["#0a6644", "#0f7a55", "#1a9068"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        height: 56,
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 4,
                        elevation: 4,
                      }}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <View className="flex-row items-center gap-2">
                          <Text className="text-white text-[16px] font-extrabold tracking-[0.8px]">
                            {t("login.signIn")}
                          </Text>
                          <Ionicons
                            name="arrow-forward"
                            size={18}
                            color="rgba(255,255,255,0.85)"
                          />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}

            {/* Biometric button */}
            {biometricAvailable && (
              <TouchableOpacity
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                className="flex-row items-center justify-center gap-2 mt-3 py-[14px] rounded-2xl border border-[#d4ece2]"
                style={{ backgroundColor: "rgba(14,122,85,0.06)" }}
                onPress={triggerBiometric}
                activeOpacity={0.8}
              >
                <Ionicons name={biometricIcon} size={22} color="#0f7a55" />
                <Text className="text-primary text-[14px] font-bold">
                  {t("login.biometricSignIn", { label: biometricLabel })}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      <Modal
        visible={showSsoWebView}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeSsoLogin}
      >
        <View className="flex-1 bg-primary">
          <View
            className="flex-row items-center bg-primary px-3 pb-3"
            style={{ paddingTop: PT }}
          >
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center"
              onPress={closeSsoLogin}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text
              className="flex-1 text-white text-[16px] font-bold text-center"
              numberOfLines={1}
            >
              {t("login.ssoTitle")}
            </Text>
            <View className="w-10 h-10" />
          </View>

          <WebView
            ref={ssoWebViewRef}
            source={{ uri: SSO_REDIRECT_URL }}
            className="flex-1 bg-white"
            style={{ opacity: hideSsoContent ? 0 : 1 }}
            onMessage={handleSsoMessage}
            injectedJavaScriptBeforeContentLoaded={HIDE_SSO_CALLBACK_SCRIPT}
            injectedJavaScript={SSO_CAPTURE_SCRIPT}
            originWhitelist={["*"]}
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            startInLoadingState
            onShouldStartLoadWithRequest={(request) => {
              debugSso("request", request.url);
              if (!isTrustedSsoNavigationUrl(request.url)) {
                if (__DEV__) {
                  console.warn(
                    "[SSO] blocked untrusted navigation:",
                    sanitizeSsoUrlForLog(request.url),
                  );
                }
                return false;
              }
              ssoCurrentUrlRef.current = request.url;
              if (handleSsoNavigationUrl(request.url)) return false;
              if (
                isSsoCallbackUrl(request.url) ||
                isSsoResultUrl(request.url)
              ) {
                setHideSsoContent(isSsoCallbackUrl(request.url));
                setSsoPageLoading(true);
                startSsoCallbackTimeout();
              }
              return true;
            }}
            onNavigationStateChange={(navState) => {
              const url = navState?.url;
              debugSso("state", url);
              ssoCurrentUrlRef.current = url || ssoCurrentUrlRef.current;
              if (handleSsoNavigationUrl(url)) return;
              if (isSsoCallbackUrl(url) || isSsoResultUrl(url)) {
                startSsoCallbackTimeout();
                ssoWebViewRef.current?.injectJavaScript(SSO_CAPTURE_SCRIPT);
              }
            }}
            onLoadStart={(event) => {
              const url = event.nativeEvent?.url;
              debugSso("load start", url);
              ssoCurrentUrlRef.current = url || ssoCurrentUrlRef.current;
              handleSsoNavigationUrl(url);
              setSsoPageLoading(true);
              setHideSsoContent(isSsoCallbackUrl(url));
              if (isSsoCallbackUrl(url) || isSsoResultUrl(url)) {
                startSsoCallbackTimeout();
              }
            }}
            onLoadEnd={(event) => {
              const url = event.nativeEvent?.url;
              debugSso("load end", url);
              ssoCurrentUrlRef.current = url || ssoCurrentUrlRef.current;
              handleSsoNavigationUrl(url);
              setSsoPageLoading(false);
              setHideSsoContent(isSsoCallbackUrl(url));
              if (isSsoCallbackUrl(url) || isSsoResultUrl(url)) {
                startSsoCallbackTimeout();
                ssoWebViewRef.current?.injectJavaScript(SSO_CAPTURE_SCRIPT);
              }
            }}
            renderLoading={() => (
              <View className="absolute inset-0 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#0f7a55" />
              </View>
            )}
            onHttpError={(event) => {
              if (__DEV__) {
                console.warn(
                  "[SSO] http error:",
                  event.nativeEvent?.statusCode,
                  sanitizeSsoUrlForLog(event.nativeEvent?.url),
                );
              }
            }}
            onError={(event) => {
              if (__DEV__) {
                console.warn(
                  "[SSO] webview error:",
                  event.nativeEvent?.description,
                  sanitizeSsoUrlForLog(event.nativeEvent?.url),
                );
              }
              setSsoPageLoading(false);
              Alert.alert(t("login.errorTitle"), t("login.ssoNetworkError"));
            }}
          />
          {(ssoPageLoading || hideSsoContent || ssoLoading) && (
            <View
              className="absolute left-0 right-0 bottom-0 items-center justify-center bg-white"
              style={{ top: PT + 52 }}
            >
              <ActivityIndicator size="large" color="#0f7a55" />
            </View>
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default Login;
