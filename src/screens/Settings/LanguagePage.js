import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../../i18n/i18n";

const COLORS = {
  primary: "#1a6b3c",
  primaryDark: "#14532d",
  primarySoft: "#e8f5ee",
  bg: "#f0f4f1",
  card: "#ffffff",
  ink: "#1a1a2e",
  sub: "#5a6a60",
  dim: "#8a9a90",
  line: "#e0ebe4",
};

const LANGUAGES = [
  { code: "th", label: "ภาษาไทย", nativeLabel: "Thai", flag: "🇹🇭" },
  { code: "en", label: "English", nativeLabel: "อังกฤษ", flag: "🇬🇧" },
];

export default function LanguagePage() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = useState(i18n.language);

  const handleSelect = async (code) => {
    setSelected(code);
    await changeLanguage(code);
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t("language.title")}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.body}
      >
        <Text style={s.sectionLabel}>{t("language.select")}</Text>

        <View style={s.card}>
          {LANGUAGES.map((lang, i) => {
            const active = selected === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[
                  s.row,
                  i < LANGUAGES.length - 1 && s.rowBorder,
                  active && s.rowActive,
                ]}
                onPress={() => handleSelect(lang.code)}
                activeOpacity={0.7}
              >
                <Text style={s.flag}>{lang.flag}</Text>
                <View style={s.textWrap}>
                  <Text style={[s.rowTitle, active && { color: COLORS.primary }]}>
                    {lang.label}
                  </Text>
                  <Text style={s.rowSub}>{lang.nativeLabel}</Text>
                </View>
                {active ? (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                ) : (
                  <View style={{ width: 24 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={s.noteCard}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
          <Text style={s.noteText}>{t("language.note")}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 54 : (StatusBar.currentHeight ?? 24) + 10,
    paddingBottom: 14,
    backgroundColor: COLORS.primary,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#fff" },

  body: { paddingBottom: 40 },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.dim,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.line },
  rowActive: { backgroundColor: COLORS.primarySoft },
  flag: { fontSize: 32 },
  textWrap: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: "700", color: COLORS.ink },
  rowSub: { fontSize: 12, color: COLORS.sub, marginTop: 2 },

  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  noteText: { flex: 1, fontSize: 12, color: COLORS.sub, lineHeight: 18 },
});
