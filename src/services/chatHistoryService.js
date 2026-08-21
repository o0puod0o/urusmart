import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../config";

const HISTORY_LIMIT = 120;
const API_HISTORY_LIMIT = 20;
const TITLE_LIMIT = 48;
const PREVIEW_LIMIT = 84;

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const trimText = (value, limit) => {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trim()}...`;
};

const getStoredUser = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
};

const getUserHistoryId = (user = {}) =>
  user.id ??
  user.user_id ??
  user.teacher_id ??
  user.code ??
  user.email ??
  user.full_name_en ??
  user.full_name_th ??
  "anonymous";

export const createChatMessage = (role, text, extra = {}) => ({
  id: extra.id ?? makeId(),
  role,
  text: String(text ?? ""),
  createdAt: extra.createdAt ?? new Date().toISOString(),
  ...extra,
});

const normalizeMessage = (message) => {
  if (!message || typeof message !== "object") return null;
  if (message.error) return null;

  const role = message.role === "bot" || message.role === "assistant"
    ? "bot"
    : "user";
  const text = String(message.text ?? message.content ?? "").trim();
  if (!text) return null;

  return createChatMessage(role, text, {
    id: message.id,
    createdAt: message.createdAt,
  });
};

const normalizeMessages = (messages = []) =>
  messages
    .map(normalizeMessage)
    .filter(Boolean)
    .slice(-HISTORY_LIMIT);

const getConversationTitle = (messages = []) => {
  const firstUser = messages.find((message) => message.role === "user" && message.text);
  return trimText(firstUser?.text || "แชทใหม่", TITLE_LIMIT);
};

const getConversationPreview = (messages = []) => {
  const lastMessage = [...messages]
    .reverse()
    .find((message) => !message.error && message.text);
  return trimText(lastMessage?.text || "", PREVIEW_LIMIT);
};

const normalizeConversation = (conversation) => {
  if (!conversation || typeof conversation !== "object" || !conversation.id) {
    return null;
  }

  return {
    id: String(conversation.id),
    title: trimText(conversation.title || "แชทใหม่", TITLE_LIMIT),
    preview: trimText(conversation.preview || "", PREVIEW_LIMIT),
    messageCount: Number(conversation.messageCount || 0),
    pinned: Boolean(conversation.pinned),
    customTitle: Boolean(conversation.customTitle),
    createdAt: conversation.createdAt || new Date().toISOString(),
    updatedAt: conversation.updatedAt || conversation.createdAt || new Date().toISOString(),
  };
};

export async function getChatHistoryKey() {
  const user = await getStoredUser();
  return `${STORAGE_KEYS.CHAT_HISTORY_PREFIX}${getUserHistoryId(user)}`;
}

const getIndexKey = (baseKey) => `${baseKey}:index`;
const getActiveKey = (baseKey) => `${baseKey}:active`;
const getThreadKey = (baseKey, conversationId) => `${baseKey}:thread:${conversationId}`;

const readIndex = async (baseKey) => {
  try {
    const raw = await AsyncStorage.getItem(getIndexKey(baseKey));
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeConversation)
      .filter(Boolean)
      .sort(sortConversations);
  } catch (_) {
    return [];
  }
};

const sortConversations = (a, b) => {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  return new Date(b.updatedAt) - new Date(a.updatedAt);
};

const writeIndex = async (baseKey, conversations) => {
  const safeConversations = conversations
    .map(normalizeConversation)
    .filter(Boolean)
    .sort(sortConversations);
  await AsyncStorage.setItem(getIndexKey(baseKey), JSON.stringify(safeConversations));
  return safeConversations;
};

const migrateLegacyHistory = async (baseKey) => {
  try {
    const raw = await AsyncStorage.getItem(baseKey);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed) || !parsed.length) return [];

    const messages = normalizeMessages(parsed);
    if (!messages.length) return [];

    const now = messages[messages.length - 1]?.createdAt || new Date().toISOString();
    const conversation = {
      id: makeId(),
      title: getConversationTitle(messages),
    preview: getConversationPreview(messages),
    messageCount: messages.length,
    pinned: false,
    customTitle: false,
    createdAt: messages[0]?.createdAt || now,
    updatedAt: now,
  };

    await AsyncStorage.setItem(getThreadKey(baseKey, conversation.id), JSON.stringify(messages));
    await AsyncStorage.setItem(getActiveKey(baseKey), conversation.id);
    await AsyncStorage.removeItem(baseKey);
    return writeIndex(baseKey, [conversation]);
  } catch (_) {
    return [];
  }
};

export async function loadChatConversations() {
  const baseKey = await getChatHistoryKey();
  const conversations = await readIndex(baseKey);
  if (conversations.length) return conversations;
  return migrateLegacyHistory(baseKey);
}

export async function loadChatMessages(conversationId) {
  if (!conversationId) return [];
  const baseKey = await getChatHistoryKey();
  try {
    const raw = await AsyncStorage.getItem(getThreadKey(baseKey, conversationId));
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return normalizeMessages(parsed);
  } catch (_) {
    return [];
  }
}

export async function loadActiveChat() {
  const baseKey = await getChatHistoryKey();
  const conversations = await loadChatConversations();
  const activeId = await AsyncStorage.getItem(getActiveKey(baseKey));
  const conversationId = conversations.some((item) => item.id === activeId)
    ? activeId
    : conversations[0]?.id ?? null;

  const messages = await loadChatMessages(conversationId);
  return { conversationId, messages, conversations };
}

export async function setActiveChat(conversationId) {
  const baseKey = await getChatHistoryKey();
  if (conversationId) {
    await AsyncStorage.setItem(getActiveKey(baseKey), String(conversationId));
  } else {
    await AsyncStorage.removeItem(getActiveKey(baseKey));
  }
}

export async function saveChatHistory(messages = [], conversationId = null) {
  const baseKey = await getChatHistoryKey();
  const safeMessages = normalizeMessages(messages);
  if (!safeMessages.length) {
    return {
      conversationId,
      conversations: await readIndex(baseKey),
    };
  }

  const nextConversationId = conversationId || makeId();
  const existing = await readIndex(baseKey);
  const now = new Date().toISOString();
  const oldConversation = existing.find((item) => item.id === nextConversationId);
  const nextConversation = {
    id: nextConversationId,
    title: oldConversation?.customTitle
      ? oldConversation.title
      : getConversationTitle(safeMessages),
    preview: getConversationPreview(safeMessages),
    messageCount: safeMessages.length,
    pinned: oldConversation?.pinned || false,
    customTitle: oldConversation?.customTitle || false,
    createdAt: oldConversation?.createdAt || safeMessages[0]?.createdAt || now,
    updatedAt: safeMessages[safeMessages.length - 1]?.createdAt || now,
  };
  const nextIndex = [
    nextConversation,
    ...existing.filter((item) => item.id !== nextConversationId),
  ];

  await AsyncStorage.setItem(
    getThreadKey(baseKey, nextConversationId),
    JSON.stringify(safeMessages),
  );
  await AsyncStorage.setItem(getActiveKey(baseKey), nextConversationId);
  const conversations = await writeIndex(baseKey, nextIndex);
  return { conversationId: nextConversationId, conversations };
}

export async function updateChatConversation(conversationId, patch = {}) {
  const baseKey = await getChatHistoryKey();
  const conversations = await readIndex(baseKey);
  const nextConversations = conversations.map((item) => {
    if (item.id !== conversationId) return item;
    const nextTitle = patch.title == null
      ? item.title
      : trimText(patch.title, TITLE_LIMIT);
    return {
      ...item,
      ...patch,
      title: nextTitle || item.title,
      customTitle: patch.title == null ? item.customTitle : true,
    };
  });

  return writeIndex(baseKey, nextConversations);
}

export async function clearChatHistory(conversationId = null) {
  const baseKey = await getChatHistoryKey();
  if (!conversationId) {
    await AsyncStorage.removeItem(baseKey);
    await AsyncStorage.removeItem(getIndexKey(baseKey));
    await AsyncStorage.removeItem(getActiveKey(baseKey));
    return [];
  }

  const conversations = await readIndex(baseKey);
  const nextConversations = conversations.filter((item) => item.id !== conversationId);
  await AsyncStorage.removeItem(getThreadKey(baseKey, conversationId));
  await writeIndex(baseKey, nextConversations);

  const activeId = await AsyncStorage.getItem(getActiveKey(baseKey));
  if (activeId === conversationId) {
    const nextActiveId = nextConversations[0]?.id ?? null;
    if (nextActiveId) {
      await AsyncStorage.setItem(getActiveKey(baseKey), nextActiveId);
    } else {
      await AsyncStorage.removeItem(getActiveKey(baseKey));
    }
  }

  return nextConversations;
}

export function toChatApiHistory(messages = []) {
  return messages
    .filter((message) => !message.error)
    .map(normalizeMessage)
    .filter(Boolean)
    .slice(-API_HISTORY_LIMIT)
    .map((message) => ({
      role: message.role === "bot" ? "assistant" : "user",
      content: message.text,
    }));
}
