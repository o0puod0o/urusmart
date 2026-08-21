import api from "./api";

export const sendChatMessage = (message, conversationId = null) =>
  api.post(
    "/chat",
    {
      message,
      ...(conversationId ? { conversation_id: conversationId } : {}),
    },
    { timeout: 30000 },
  );

export const fetchChatConversations = () =>
  api.get("/chat/conversations", {
    timeout: 15000,
    suppressAuthRedirect: true,
    suppressErrorLog: true,
  });

export const createChatConversation = (title = "แชทใหม่") =>
  api.post(
    "/chat/conversations",
    { title },
    {
      timeout: 15000,
      suppressAuthRedirect: true,
      suppressErrorLog: true,
    },
  );

export const fetchChatConversationMessages = (conversationId) =>
  api.get(`/chat/conversations/${conversationId}/messages`, {
    timeout: 15000,
    suppressAuthRedirect: true,
    suppressErrorLog: true,
  });

export const updateChatConversationRemote = (conversationId, patch = {}) =>
  api.patch(`/chat/conversations/${conversationId}`, patch, {
    timeout: 15000,
    suppressAuthRedirect: true,
    suppressErrorLog: true,
  });

export const deleteChatConversationRemote = (conversationId) =>
  api.delete(`/chat/conversations/${conversationId}`, {
    timeout: 15000,
    suppressAuthRedirect: true,
    suppressErrorLog: true,
  });

export const fetchChatHistory = (perPage = 50) =>
  api.get("/chat/history", {
    params: { per_page: perPage },
    timeout: 15000,
    suppressAuthRedirect: true,
    suppressErrorLog: true,
  });

export const clearRemoteChatHistory = () =>
  api.delete("/chat/history", {
    timeout: 15000,
    suppressAuthRedirect: true,
    suppressErrorLog: true,
  });
