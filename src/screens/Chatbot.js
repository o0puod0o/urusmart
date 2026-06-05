import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, FlatList, KeyboardAvoidingView,
  Platform, StatusBar, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import HeaderBar from "../components/HeaderBar";
import useCurrentUser from "../hook/useCurrentUser";

const CHAT_API_URL = "";
const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const buildLocalReply = (message) => {
  const text = message.trim().toLowerCase();
  if (!text) return "พิมพ์คำถามมาได้เลยครับ";
  if (text.includes("วิจัย") || text.includes("research"))
    return "ถ้าต้องการจัดการผลงานวิจัย ให้ไปที่หน้าหลักแล้วเลือกเมนู e-Research จากนั้นเลือกเพิ่มหรือแก้ไขรายการที่ต้องการครับ";
  if (text.includes("ตาราง") || text.includes("สอน") || text.includes("งาน"))
    return "ตอนนี้หน้านี้ถูกเปลี่ยนเป็นแชทบอทแล้วครับ ถ้าต้องการให้บอทอ่านตารางจริง ให้ต่อ API ที่ส่งข้อมูลตารางของอาจารย์มาให้บอทสรุปได้";
  if (text.includes("ออกจากระบบ") || text.includes("logout"))
    return "กดไอคอนออกจากระบบด้านขวาบนของแถบสีฟ้าได้เลยครับ ระบบจะถามยืนยันก่อนออกจากบัญชี";
  if (text.includes("ติดต่อ") || text.includes("support"))
    return "ไปที่แท็บตั้งค่า แล้วเลือกเมนูติดต่อเรา เพื่อดูช่องทางติดต่อ IT Support หรือหน่วยงานที่เกี่ยวข้องครับ";
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
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  return data.reply ?? data.message ?? "API ตอบกลับมาแล้ว แต่ไม่พบ field reply";
};

const ChatBubble = ({ item }) => {
  const isUser = item.role === "user";
  return (
    <View className={`flex-row items-end gap-2 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <View className="w-[30px] h-[30px] rounded-[15px] bg-[#e6f5ef] border border-[#dce8e2] items-center justify-center">
          <Ionicons name="sparkles" size={16} color="#0f7a55" />
        </View>
      )}
      <View
        className={`max-w-[78%] rounded-[18px] px-[14px] py-[10px] border ${
          isUser
            ? "bg-primary border-primary rounded-br-[6px]"
            : "bg-white border-[#dce8e2] rounded-bl-[6px]"
        }`}
      >
        <Text className={`text-[14px] leading-[21px] font-medium ${isUser ? "text-white" : "text-[#102019]"}`}>
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
    const timer = setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 80);
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
      setMessages((cur) => [...cur, { id: makeId(), role: "bot", text: reply }]);
    } catch (error) {
      setMessages((cur) => [...cur, { id: makeId(), role: "bot", text: `${t("chatbot.connectError")} (${error.message})` }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <View className="flex-1 bg-[#f0f6f2]">
      <StatusBar barStyle="light-content" backgroundColor="#064e35" />
      <HeaderBar name={user.name} photoUrl={user.photoUrl} onNotification={() => navigation.navigate("Notifications")} onLogout={logout} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        {/* Title bar */}
        <View className="flex-row items-center gap-3 bg-white border-b border-[#dce8e2] px-4 py-[14px]">
          <View className="w-11 h-11 rounded-[14px] bg-[#e6f5ef] items-center justify-center">
            <Ionicons name="chatbubble-ellipses" size={22} color="#0f7a55" />
          </View>
          <View className="flex-1">
            <Text className="text-[#102019] text-[17px] font-extrabold">{t("chatbot.title")}</Text>
            <Text className="text-[#587066] text-[12px] font-semibold mt-[2px]">{t("chatbot.subtitle")}</Text>
          </View>
          <View className="flex-row items-center gap-[6px] bg-[#e6f5ef] rounded-[999px] px-[10px] py-[5px]">
            <View className="w-[7px] h-[7px] rounded-[4px] bg-primary" />
            <Text className="text-[#064e35] text-[11px] font-extrabold">
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
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, gap: 12 }}
          ListFooterComponent={
            sending ? (
              <View className="flex-row items-center gap-2 pl-10 py-1">
                <ActivityIndicator size="small" color="#0f7a55" />
                <Text className="text-[#8fa89f] text-[12px] font-bold">{t("chatbot.typing")}</Text>
              </View>
            ) : null
          }
        />

        {/* Quick prompts */}
        <View className="border-t border-[#dce8e2] bg-white">
          <FlatList
            horizontal
            data={QUICK_PROMPTS}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="bg-[#e6f5ef] rounded-[999px] px-[13px] py-2 border border-[#c7eadb]"
                onPress={() => sendMessage(item)}
                activeOpacity={0.8}
                disabled={sending}
              >
                <Text className="text-[#064e35] text-[12px] font-bold">{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Composer */}
        <View
          className="flex-row items-end gap-[10px] bg-white px-4 pt-[10px]"
          style={{ paddingBottom: Platform.OS === "ios" ? 18 : 12 }}
        >
          <TextInput
            className="flex-1 min-h-[44px] max-h-[110px] rounded-[16px] border border-[#dce8e2] bg-[#f8fbf9] text-[#102019] px-[14px] pt-[11px] pb-[10px] text-[14px] font-medium"
            value={input}
            onChangeText={setInput}
            placeholder={t("chatbot.placeholder")}
            placeholderTextColor="#8fa89f"
            multiline
            maxLength={800}
            editable={!sending}
          />
          <TouchableOpacity
            className={`w-11 h-11 rounded-[15px] items-center justify-center ${!input.trim() || sending ? "bg-[#8fa89f]" : "bg-primary"}`}
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
