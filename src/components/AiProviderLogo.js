import React from "react";
import { Image } from "react-native";
import { Asset } from "expo-asset";

// normalize provider name จาก backend ให้ตรงกับ key ที่ใช้
const PROVIDER_ALIAS = {
  anthropic:    "Claude",
  claude:       "Claude",
  openai:       "OpenAI",
  "open ai":    "OpenAI",
  google:       "Gemini",
  gemini:       "Gemini",
  deepseek:     "DeepSeek",
  "deep seek":  "DeepSeek",
  meta:         "Meta AI",
  "meta ai":    "Meta AI",
  llama:        "Meta AI",
  mistral:      "Mistral",
  amazon:       "Nova",
  aws:          "Nova",
  nova:         "Nova",
  "nova (aws)": "Nova",
  qwen:         "Qwen",
  alibaba:      "Qwen",
  xai:          "xAI",
  grok:         "xAI",
};

export function normalizeProvider(provider) {
  if (!provider) return provider;
  return PROVIDER_ALIAS[provider.toLowerCase()] ?? provider;
}

const LOGOS = {
  Claude:    require("../assets/ai-logo/Claude.png"),
  OpenAI:    require("../assets/ai-logo/openai.png"),
  Gemini:    require("../assets/ai-logo/Gemini.png"),
  "Meta AI": require("../assets/ai-logo/Meta_AI.png"),
  Mistral:   require("../assets/ai-logo/Mistral.png"),
  Qwen:      require("../assets/ai-logo/Qwen.png"),
  DeepSeek:  require("../assets/ai-logo/deepseek.png"),
  Nova:      require("../assets/ai-logo/nova_aws.png"),
  xAI:       require("../assets/ai-logo/xai.png"),
};

// โหลด logo ทั้งหมดล่วงหน้าตอน app เริ่ม กัน modal เลือกโมเดลขึ้นแบบทยอยโหลด
Asset.loadAsync(Object.values(LOGOS)).catch(() => {});

export default function AiProviderLogo({ provider, size = 24 }) {
  const normalized = normalizeProvider(provider);
  const source = LOGOS[normalized];
  if (!source) return null;
  return (
    <Image
      source={source}
      style={{ width: size, height: size, resizeMode: "contain" }}
    />
  );
}
