import { Platform } from "react-native";

export const colors = {
  primary: "#0f7a55",
  primaryDark: "#064e35",
  primaryMuted: "#e8f5ee",
  primarySoft: "#f2faf6",
  surface: "#ffffff",
  appBg: "#eaf5ef",
  fieldBg: "#f8fbf9",
  fieldDisabled: "#f3f6f4",
  rowBg: "#ffffff",
  rowEditingBg: "#ccf0e2",
  editActionBg: "#fff0d6",
  border: "#dce8e2",
  borderStrong: "#a8d5be",
  text: "#101b17",
  textMuted: "#5f746b",
  textSoft: "#8fa89f",
  placeholder: "#aab8b2",
  danger: "#dc2626",
  warning: "#c95b05",

  // ชุดสีข้อความมาตรฐาน — ใช้แทนเฉดเทาที่กระจายกันในแต่ละไฟล์เดิม
  // (contrast ผ่าน WCAG AA บนพื้นขาว/#eaf5ef ทั้งคู่ ยกเว้น mutedText ที่ตั้งใจให้จางกว่าเพื่อ placeholder/ข้อความรองสุด)
  primaryText: "#101b17",
  secondaryText: "#4a5c54",
  mutedText: "#7c8f86",
  successText: "#0f7a55",
  dangerText: "#dc2626",
};

export const radius = {
  xs: 8,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
};

export const spacing = {
  screen: 16,
  fieldX: 14,
  fieldY: 12,
  card: 16,
};

export const typography = {
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    color: colors.textMuted,
  },
  input: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
    color: colors.text,
  },
  caption: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    color: colors.textSoft,
  },
};

export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: colors.primaryDark,
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 3 },
    default: {},
  }),
  floating: Platform.select({
    ios: {
      shadowColor: colors.primaryDark,
      shadowOpacity: 0.16,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 10 },
    },
    android: { elevation: 16 },
    default: {},
  }),
};

export const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 };
