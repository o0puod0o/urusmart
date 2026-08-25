import React from "react";
import { Image } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

// ── Claude (Anthropic) — "A" shape ────────────────────────
const LogoClaude = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Path d="M21.8 6L8 34h5.6l2.9-7h11.4l2.9 7H36L22.2 6h-.4zm-.9 7.6L25 24h-8.2l4.1-10.4z" fill="#D4622A" />
  </Svg>
);

// ── OpenAI — flower/bloom shape ────────────────────────────
const LogoOpenAI = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Path
      d="M37.1 16.4a9.4 9.4 0 00-.8-7.7 9.7 9.7 0 00-10.5-4.7A9.7 9.7 0 0017.3 0a9.7 9.7 0 00-9.3 6.7 9.7 9.7 0 00-6.4 4.7 9.7 9.7 0 001.2 11.4 9.4 9.4 0 00.8 7.7 9.7 9.7 0 0010.5 4.6 9.7 9.7 0 008.4 4.7 9.7 9.7 0 009.3-6.7 9.7 9.7 0 006.5-4.7 9.7 9.7 0 00-1.2-11.3v-.7zm-14.5 20.2a7.2 7.2 0 01-4.6-1.7l.2-.1 7.7-4.4a1.3 1.3 0 00.6-1.1V18l3.2 1.9v9a7.2 7.2 0 01-7.1 7.7zm-15.6-6.6a7.2 7.2 0 01-.8-4.9l.2.1 7.7 4.5a1.3 1.3 0 001.3 0l9.4-5.4v3.7l-7.8 4.5a7.2 7.2 0 01-10-2.5zm-2-17a7.2 7.2 0 013.8-3.2v9.1a1.3 1.3 0 00.6 1.1l9.4 5.4-3.3 1.9L8 23a7.2 7.2 0 01-1.2-10v.7zm26.8 6.2L22.4 14l3.2-1.9 7.5 4.3a7.2 7.2 0 01-1.1 13l-8-4.7 3.3-1.9v-7.5zm3.2-4.9l-.2-.1-7.7-4.4A1.3 1.3 0 0026 9.8V3.5l7.7 4.5a7.2 7.2 0 011.3 13v-6.7zm-20.4 6.7l-3.2-1.9V10a7.2 7.2 0 0111.9-5.5l-.2.1-7.7 4.4a1.3 1.3 0 00-.6 1.1v10.7l-2.2-1.3v2zm1.7-3.8l4.2-2.4 4.2 2.4v4.8l-4.2 2.4-4.2-2.4V18z"
      fill="#10A37F"
    />
  </Svg>
);

// ── Gemini — 4-pointed star ────────────────────────────────
const LogoGemini = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Defs>
      <LinearGradient id="gem" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor="#4285F4" />
        <Stop offset="0.5" stopColor="#9B72CB" />
        <Stop offset="1" stopColor="#D96570" />
      </LinearGradient>
    </Defs>
    <Path d="M20 40C20 30.6 12.4 23 3 23 12.4 23 20 15.4 20 6c0 9.4 7.6 17 17 17-9.4 0-17 7.6-17 17z" fill="url(#gem)" />
  </Svg>
);

// ── DeepSeek — use downloaded PNG ─────────────────────────
const LogoDeepSeekImg = ({ size }) => (
  <Image
    source={require("../../assets/ai-logos/deepseek.png")}
    style={{ width: size, height: size, resizeMode: "contain" }}
  />
);

// ── Meta AI — infinity/M shape ─────────────────────────────
const LogoMeta = ({ size }) => (
  <Image
    source={require("../../assets/ai-logos/meta.png")}
    style={{ width: size, height: size, resizeMode: "contain" }}
  />
);

// ── Mistral — orange grid ──────────────────────────────────
const LogoMistral = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Rect x="0" y="0" width="11" height="11" fill="#F7541B" />
    <Rect x="14.5" y="0" width="11" height="11" fill="#F7541B" />
    <Rect x="29" y="0" width="11" height="11" fill="#F7541B" />
    <Rect x="0" y="14.5" width="11" height="11" fill="#F7541B" />
    <Rect x="14.5" y="14.5" width="11" height="11" fill="#F7541B" />
    <Rect x="29" y="14.5" width="11" height="11" fill="#F7541B" />
    <Rect x="0" y="29" width="11" height="11" fill="#F7541B" />
    <Rect x="14.5" y="29" width="11" height="11" fill="#F7541B" />
    <Rect x="29" y="29" width="11" height="11" fill="#F7541B" />
  </Svg>
);

// ── Amazon Nova — AWS arrow ────────────────────────────────
const LogoNova = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Path d="M20 4L4 13v14l16 9 16-9V13L20 4z" fill="none" stroke="#FF9900" strokeWidth="2.5" />
    <Path d="M4 13l16 9 16-9M20 22v9" stroke="#FF9900" strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

// ── xAI — X shape ─────────────────────────────────────────
const LogoXAI = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Path d="M6 6l28 28M34 6L6 34" stroke="#111" strokeWidth="4.5" strokeLinecap="round" />
  </Svg>
);

// ── Qwen — Q circle ───────────────────────────────────────
const LogoQwen = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Circle cx="20" cy="20" r="16" fill="none" stroke="#615FFF" strokeWidth="3.5" />
    <Circle cx="20" cy="20" r="6" fill="#615FFF" />
    <Path d="M24 24l5 5" stroke="#615FFF" strokeWidth="3.5" strokeLinecap="round" />
  </Svg>
);

const LOGO_MAP = {
  Claude:    LogoClaude,
  OpenAI:    LogoOpenAI,
  Gemini:    LogoGemini,
  Google:    LogoGemini,
  DeepSeek:  LogoDeepSeekImg,
  "Meta AI": LogoMeta,
  Mistral:   LogoMistral,
  Nova:      LogoNova,
  xAI:       LogoXAI,
  Qwen:      LogoQwen,
};

export default function AiProviderLogo({ provider, size = 24 }) {
  const Logo = LOGO_MAP[provider];
  if (!Logo) return null;
  return <Logo size={size} />;
}
