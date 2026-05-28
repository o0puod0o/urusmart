import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const C = {
  bg: "#f0f6f2",
  card: "#ffffff",
  g500: "#0f7a55",
  ink: "#111c18",
  sub: "#4a5e56",
  line: "#dce8e2",
};

export default function ResearchList({ navigation, route }) {
  const { t } = useTranslation();
  const { title, icon = "document-text-outline" } = route?.params || {};

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Ionicons name="chevron-back" size={24} color={C.g500} />
        </TouchableOpacity>
        <Text style={styles.title}>{title ?? t("research.list.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        <View style={styles.emptyCard}>
          <Ionicons name={icon} size={34} color={C.g500} />
          <Text style={styles.emptyTitle}>{t("research.list.noData")}</Text>
          <Text style={styles.emptyText}>{t("research.list.desc")}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "800", color: C.ink },
  headerSpacer: { width: 32 },
  body: { flex: 1, padding: 16 },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    padding: 24,
    minHeight: 180,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "800",
    color: C.ink,
  },
  emptyText: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    color: C.sub,
    lineHeight: 20,
  },
});
