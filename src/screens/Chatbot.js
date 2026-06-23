import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated, FlatList, KeyboardAvoidingView,
  Platform, StatusBar, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import HeaderBar from "../components/HeaderBar";
import useCurrentUser from "../hook/useCurrentUser";
import { sendChatMessage } from "../services/chatbot";

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// ── Typing indicator (3 dots) ──────────────────────────────
const TypingDot = ({ delay }) => {
  const anim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 350, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);
  return (
    <Animated.View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#0f7a55", opacity: anim, marginHorizontal: 2 }} />
  );
};

const TypingBubble = () => (
  <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
    <LinearGradient colors={["#0a6644", "#0f7a55"]} style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" }}>
      <Ionicons name="sparkles" size={15} color="rgba(255,255,255,0.95)" />
    </LinearGradient>
    <View style={{ backgroundColor: "#fff", borderRadius: 18, borderBottomLeftRadius: 6, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1, borderColor: "#e8ede9", flexDirection: "row", alignItems: "center" }}>
      <TypingDot delay={0} />
      <TypingDot delay={200} />
      <TypingDot delay={400} />
    </View>
  </View>
);

// ── Chat bubble ────────────────────────────────────────────
const ChatBubble = ({ item, onRetry }) => {
  const { t } = useTranslation();
  const isUser = item.role === "user";

  if (item.error) {
    return (
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#fef2f2", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="alert-circle" size={18} color="#dc2626" />
        </View>
        <View style={{ maxWidth: "78%", backgroundColor: "#fff5f5", borderRadius: 18, borderBottomLeftRadius: 6, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: "#fecaca" }}>
          <Text style={{ color: "#dc2626", fontSize: 13, fontWeight: "600", lineHeight: 20 }}>{t("chatbot.connectError")}</Text>
          <TouchableOpacity onPress={() => onRetry(item.retryText)} activeOpacity={0.75} style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="refresh" size={13} color="#0f7a55" />
            <Text style={{ color: "#0f7a55", fontSize: 12, fontWeight: "700" }}>{t("chatbot.retry")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, justifyContent: isUser ? "flex-end" : "flex-start" }}>
      {!isUser && (
        <LinearGradient colors={["#0a6644", "#0f7a55"]} style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="sparkles" size={15} color="rgba(255,255,255,0.95)" />
        </LinearGradient>
      )}
      {isUser ? (
        <LinearGradient
          colors={["#0f7a55", "#1a9068"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ maxWidth: "78%", borderRadius: 18, borderBottomRightRadius: 6, paddingHorizontal: 14, paddingVertical: 11 }}
        >
          <Text style={{ color: "#fff", fontSize: 14, lineHeight: 21, fontWeight: "500" }}>{item.text}</Text>
        </LinearGradient>
      ) : (
        <View style={{ maxWidth: "78%", backgroundColor: "#fff", borderRadius: 18, borderBottomLeftRadius: 6, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: "#e8ede9", elevation: 1, shadowColor: "#064e35", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }}>
          <Text style={{ color: "#102019", fontSize: 14, lineHeight: 21, fontWeight: "500" }}>{item.text}</Text>
        </View>
      )}
    </View>
  );
};

// ── Main ───────────────────────────────────────────────────
export default function ChatbotPage({ navigation }) {
  const { t } = useTranslation();
  const { user, logout } = useCurrentUser(navigation);
  const listRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // scroll to bottom on new message
  useEffect(() => {
    const timer = setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 80);
    return () => clearTimeout(timer);
  }, [messages, sending]);

  const sendMessage = useCallback(async (preset) => {
    const text = (preset ?? input).trim();
    if (!text || sending) return;
    const userMsg = { id: makeId(), role: "user", text };
    setMessages((cur) => [...cur, userMsg]);
    setInput("");
    setSending(true);
    try {
      // แปลง messages → history format ที่ backend ต้องการ (สูงสุด 10 คู่ล่าสุด)
      const history = messages
        .filter((m) => !m.error)
        .slice(-20)
        .map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text }));

      const res = await sendChatMessage(text, history);
      const reply = res.data?.data?.reply ?? res.data?.reply ?? "—";
      setMessages((cur) => [...cur, { id: makeId(), role: "bot", text: reply }]);
    } catch (e) {
      const serverReply = e?.response?.data?.data?.reply ?? e?.response?.data?.reply;
      if (serverReply) {
        // backend ส่ง reply message กลับมาแม้ status 5xx → แสดงเป็น bot bubble ปกติ
        setMessages((cur) => [...cur, { id: makeId(), role: "bot", text: serverReply }]);
      } else {
        setMessages((cur) => [...cur, { id: makeId(), role: "bot", error: true, retryText: text, text: "" }]);
      }
    } finally {
      setSending(false);
    }
  }, [input, sending, messages]);

  const retryMessage = useCallback((text) => {
    setMessages((cur) => cur.filter((m) => !m.error));
    sendMessage(text);
  }, [sendMessage]);


  return (
    <View style={{ flex: 1, backgroundColor: "#f0f6f2" }}>
      <StatusBar barStyle="light-content" backgroundColor="#064e35" />
      <HeaderBar name={user.name} photoUrl={user.photoUrl} onNotification={() => navigation.navigate("Notifications")} onLogout={logout} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={
          Platform.OS === "ios" ? 8 : (StatusBar.currentHeight ?? 0)
        }
      >
        {/* Title bar */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#dce8e2", paddingHorizontal: 16, paddingVertical: 14 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "#e6f5ef", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="chatbubble-ellipses" size={22} color="#0f7a55" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#102019", fontSize: 17, fontWeight: "800" }}>{t("chatbot.title")}</Text>
            <Text style={{ color: "#587066", fontSize: 12, fontWeight: "600", marginTop: 2 }}>{t("chatbot.subtitle")}</Text>
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble item={item} onRetry={retryMessage} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, gap: 12 }}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#e6f5ef", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="chatbubbles-outline" size={34} color="#0f7a55" />
              </View>
              <Text style={{ color: "#587066", fontSize: 14, fontWeight: "600", textAlign: "center" }}>{t("chatbot.emptyHint")}</Text>
            </View>
          }
          ListFooterComponent={sending ? <TypingBubble /> : null}
        />

        {/* Composer */}
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, backgroundColor: "#fff", paddingHorizontal: 16, paddingTop: 10, paddingBottom: Platform.OS === "ios" ? 18 : 14 }}>
          <TextInput
            style={{ flex: 1, minHeight: 44, maxHeight: 110, borderRadius: 16, borderWidth: 1, borderColor: "#dce8e2", backgroundColor: "#f8fbf9", color: "#102019", paddingHorizontal: 14, paddingTop: 11, paddingBottom: 10, fontSize: 14, fontWeight: "500" }}
            value={input}
            onChangeText={setInput}
            placeholder={t("chatbot.placeholder")}
            placeholderTextColor="#8fa89f"
            multiline
            maxLength={2000}
            editable={!sending}
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            style={{ width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: !input.trim() || sending ? "#8fa89f" : "#0f7a55" }}
            onPress={() => sendMessage()}
            activeOpacity={0.85}
            disabled={!input.trim() || sending}
          >
            <Ionicons name="send" size={19} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
