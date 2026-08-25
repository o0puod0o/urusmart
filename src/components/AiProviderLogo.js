import React from "react";
import { Image } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

// OpenAI เป็น SVG ต้องวาดเอง (ไฟล์เป็น .svg ซึ่ง require ไม่ได้ตรงๆ ใน RN)
const LogoOpenAI = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A6.065 6.065 0 0010.034 0a6.046 6.046 0 00-5.776 4.189 6.046 6.046 0 00-4.017 2.91 6.06 6.06 0 00.753 7.105 5.985 5.985 0 00.516 4.91 6.046 6.046 0 006.511 2.9 6.046 6.046 0 005.222 2.911 6.046 6.046 0 005.777-4.19 6.046 6.046 0 004.017-2.909 6.06 6.06 0 00-.753-7.105zm-9.021 12.518a4.487 4.487 0 01-2.882-1.044l.142-.081 4.783-2.761a.795.795 0 00.399-.69v-6.741l2.024 1.168a.071.071 0 01.038.052v5.583a4.503 4.503 0 01-4.504 4.514zm-9.674-4.14a4.487 4.487 0 01-.538-3.018l.142.085 4.783 2.762a.793.793 0 00.798 0l5.843-3.373v2.335a.073.073 0 01-.029.063l-4.833 2.791a4.503 4.503 0 01-6.166-1.645zm-1.261-10.44a4.487 4.487 0 012.343-1.977v5.7a.795.795 0 00.399.691l5.843 3.373-2.024 1.168a.071.071 0 01-.068.004L4.093 14.03a4.503 4.503 0 01-.767-6.271zm16.612 3.864l-5.843-3.372 2.024-1.168a.071.071 0 01.068-.004l4.918 2.84a4.503 4.503 0 01-.698 8.123v-5.701a.795.795 0 00-.469-.718zm2.013-3.025l-.142-.085-4.783-2.762a.793.793 0 00-.798 0L9.385 9.264V6.929a.073.073 0 01.029-.063l4.833-2.791a4.503 4.503 0 016.166 1.644 4.487 4.487 0 01.538 3.018zm-12.71 4.184l-2.024-1.168a.071.071 0 01-.038-.052V6.979a4.503 4.503 0 017.386-3.469l-.142.081-4.783 2.761a.795.795 0 00-.399.69zm1.099-2.37l2.602-1.5 2.602 1.5v3l-2.602 1.5-2.602-1.5V10.41z"
      fill="#10A37F"
    />
  </Svg>
);

const LOGOS = {
  Claude:    require("../assets/ai-logo/Claude.png"),
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
  if (provider === "OpenAI") return <LogoOpenAI size={size} />;
  const source = LOGOS[provider];
  if (!source) return null;
  return (
    <Image
      source={source}
      style={{ width: size, height: size, resizeMode: "contain" }}
    />
  );
}
