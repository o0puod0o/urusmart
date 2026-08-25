import React from "react";
import { Image } from "react-native";

const LOGOS = {
  Claude:    require("../assets/ai-logo/Claude.png"),
  OpenAI:    require("../assets/ai-logo/openai.png"),
  Gemini:    require("../assets/ai-logo/Gemini.png"),
  Google:    require("../assets/ai-logo/Gemini.png"),
  "Meta AI": require("../assets/ai-logo/Meta_AI.png"),
  Mistral:   require("../assets/ai-logo/Mistral.png"),
  Qwen:      require("../assets/ai-logo/Qwen.png"),
  DeepSeek:  require("../assets/ai-logo/deepseek.png"),
  Nova:      require("../assets/ai-logo/nova_aws.png"),
  xAI:       require("../assets/ai-logo/xai.png"),
};

export default function AiProviderLogo({ provider, size = 24 }) {
  const source = LOGOS[provider];
  if (!source) return null;
  return (
    <Image
      source={source}
      style={{ width: size, height: size, resizeMode: "contain" }}
    />
  );
}
