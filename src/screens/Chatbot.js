/**
 * Chatbot.js - URU Smart Assistant
 *
 * ใส่ CHAT_API_URL ถ้าต้องการต่อ backend/AI API จริง
 * รูปแบบที่หน้านี้คาดหวัง: POST { message, history } แล้วตอบ { reply }
 */

import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import HeaderBar from "../components/HeaderBar";
import useCurrentUser from "../hook/useCurrentUser";

const CHAT_API_URL = "";

const C = {
  primary: "#0f7a55",
  primaryDark: "#064e35",
  primarySoft: "#e6f5ef",
  sky: "#27b8e3",
  bg: "#f0f6f2",
  card: "#ffffff",
  ink: "#102019",
  sub: "#587066",
  dim: "#8fa89f",
  line: "#dce8e2",
  botBubble: "#ffffff",
  userBubble: "#0f7a55",
  warning: "#f59e0b",
};


const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const buildLocalReply = (message) => {
  const text = message.trim().toLowerCase();

  if (!text) return "พิมพ์คำถามมาได้เลยครับ";

  if (text.includes("วิจัย") || text.includes("research")) {
    return "ถ้าต้องการจัดการผลงานวิจัย ให้ไปที่หน้าหลักแล้วเลือกเมนู e-Research จากนั้นเลือกเพิ่มหรือแก้ไขรายการที่ต้องการครับ";
  }

  if (text.includes("ตาราง") || text.includes("สอน") || text.includes("งาน")) {
    return "ตอนนี้หน้านี้ถูกเปลี่ยนเป็นแชทบอทแล้วครับ ถ้าต้องการให้บอทอ่านตารางจริง ให้ต่อ API ที่ส่งข้อมูลตารางของอาจารย์มาให้บอทสรุปได้";
  }

  if (text.includes("ออกจากระบบ") || text.includes("logout")) {
    return "กดไอคอนออกจากระบบด้านขวาบนของแถบสีฟ้าได้เลยครับ ระบบจะถามยืนยันก่อนออกจากบัญชี";
  }

  if (text.includes("ติดต่อ") || text.includes("support")) {
    return "ไปที่แท็บตั้งค่า แล้วเลือกเมนูติดต่อเรา เพื่อดูช่องทางติดต่อ IT Support หรือหน่วยงานที่เกี่ยวข้องครับ";
  }

  return "รับทราบครับ ตอนนี้ผมเป็นโหมดทดลองแบบไม่ใช้ API ถ้าคุณใส่ CHAT_API_URL ในไฟล์นี้ ผมจะส่งคำถามไปให้ AI API แล้วแสดงคำตอบจริงให้ทันที";
};

const askBot = async (message, history) => {
  if (!CHAT_API_URL) {
    await new Promise((resolve) => setTimeout(resolve, 550));
    return buildLocalReply(message);
  }

  const response = await fetch(CHAT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.reply ?? data.message ?? "API ตอบกลับมาแล้ว แต่ไม่พบ field reply";
};

const ChatBubble = ({ item }) => {
  const isUser = item.role === "user";

  return (
    <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
      {!isUser && (
        <View style={styles.botAvatar}>
          <Ionicons name="sparkles" size={16} color={C.primary} />
        </View>
      )}

      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>
          {item.text}
        </Text>
      </View>
    </View>
  );
};

export default function ChatbotPage({ navigation }) {
  const { t } = useTranslation();
  const { user, logout } = useCurrentUser(navigation);
  const listRef = useRef(null);

  const QUICK_PROMPTS = [t("chatbot.q1"), t("chatbot.q2"), t("chatbot.q3"), t("chatbot.q4")];
  const INITIAL_MESSAGES = [{ id: "welcome", role: "bot", text: t("chatbot.welcome") }];

  const [messages, setMessages] = useState(() => INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd?.({ animated: true });
    }, 80);
    return () => clearTimeout(timer);
  }, [messages, sending]);

  const sendMessage = async (preset) => {
    const text = (preset ?? input).trim();
    if (!text || sending) return;

    const userMessage = { id: makeId(), role: "user", text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const reply = await askBot(text, nextMessages);
      setMessages((current) => [
        ...current,
        { id: makeId(), role: "bot", text: reply },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "bot",
          text: `${t("chatbot.connectError")} (${error.message})`,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#064e35" />
      <HeaderBar
        name={user.name}
        photoUrl={user.photoUrl}
        onNotification={() => navigation.navigate("Notifications")}
        onLogout={logout}
      />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={styles.titleBar}>
          <View style={styles.titleIcon}>
            <Ionicons name="chatbubble-ellipses" size={22} color={C.primary} />
          </View>
          <View style={styles.titleTextWrap}>
            <Text style={styles.title}>{t("chatbot.title")}</Text>
            <Text style={styles.subtitle}>{t("chatbot.subtitle")}</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {CHAT_API_URL ? t("chatbot.api") : t("chatbot.demo")}
            </Text>
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messages}
          ListFooterComponent={
            sending ? (
              <View style={styles.typingRow}>
                <ActivityIndicator size="small" color={C.primary} />
                <Text style={styles.typingText}>{t("chatbot.typing")}</Text>
              </View>
            ) : null
          }
        />

        <View style={styles.quickWrap}>
          <FlatList
            horizontal
            data={QUICK_PROMPTS}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => sendMessage(item)}
                activeOpacity={0.8}
                disabled={sending}
              >
                <Text style={styles.quickText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={t("chatbot.placeholder")}
            placeholderTextColor={C.dim}
            multiline
            maxLength={800}
            editable={!sending}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!input.trim() || sending) && styles.sendBtnDisabled,
            ]}
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  keyboard: { flex: 1 },
  titleBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  titleIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  titleTextWrap: { flex: 1 },
  title: { color: C.ink, fontSize: 17, fontWeight: "800" },
  subtitle: { color: C.sub, fontSize: 12, fontWeight: "600", marginTop: 2 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.primary,
  },
  statusText: { color: C.primaryDark, fontSize: 11, fontWeight: "800" },
  messages: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  messageRowUser: { justifyContent: "flex-end" },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.line,
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  botBubble: {
    backgroundColor: C.botBubble,
    borderBottomLeftRadius: 6,
    borderColor: C.line,
  },
  userBubble: {
    backgroundColor: C.userBubble,
    borderBottomRightRadius: 6,
    borderColor: C.userBubble,
  },
  bubbleText: {
    color: C.ink,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
  },
  userBubbleText: { color: "#fff" },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 40,
    paddingVertical: 4,
  },
  typingText: { color: C.dim, fontSize: 12, fontWeight: "700" },
  quickWrap: {
    borderTopWidth: 1,
    borderTopColor: C.line,
    backgroundColor: C.card,
  },
  quickList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  quickChip: {
    backgroundColor: C.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#c7eadb",
  },
  quickText: { color: C.primaryDark, fontSize: 12, fontWeight: "700" },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    backgroundColor: C.card,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 18 : 12,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: "#f8fbf9",
    color: C.ink,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 10,
    fontSize: 14,
    fontWeight: "500",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: C.dim,
  },
});
