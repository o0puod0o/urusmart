/**
 * Cardpage.jsx – Digital Staff Card (URUSmart)
 *
 * ── API Setup ───────────────────────────────────────────────────────────────
 * แก้ค่าต่อไปนี้ตาม backend จริง:
 *   BASE_URL      → URL ของ server
 *   API_ENDPOINT  → path ที่ใช้ดึงข้อมูลบัตร
 *   AUTH_HEADER   → ถ้า API ต้องการ token ให้ uncomment แล้วใส่ค่า
 *
 * Response JSON ที่ API ควรส่งกลับ (รองรับหลายรูปแบบ field name):
 *   { data: { name, position, faculty, department, email, phone, employeeId, photoUrl } }
 *   หรือ    { name, position, faculty, department, email, phone, employeeId, photoUrl }
 * ────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { useTranslation } from "react-i18next";
import HeaderBar from "../components/HeaderBar";
import useCurrentUser from "../hook/useCurrentUser";

const logo = require("../assets/urusmartlogo.png");

// ─── API Config ──────────────────────────────────────────────────────────────
const BASE_URL = "https://your-api.example.com"; // TODO: ใส่ URL จริง
const API_ENDPOINT = "/api/teacher-card"; // TODO: ใส่ path จริง
// const AUTH_TOKEN = "Bearer YOUR_TOKEN_HERE";   // TODO: uncomment ถ้าต้องการ auth

const apiFetch = async (path) => {
  const headers = {
    "Content-Type": "application/json",
    // Authorization: AUTH_TOKEN,                // TODO: uncomment ถ้าต้องการ auth
  };
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};
// ─────────────────────────────────────────────────────────────────────────────

// ─── Theme ───────────────────────────────────────────────────────────────────
const C = {
  // Greens
  g900: "#064e35",
  g700: "#0a6644",
  g500: "#0f7a55", // primary
  g300: "#5aab8a",
  g100: "#d4efe5",
  g50: "#eef8f3",
  g20: "#f6fcf9",
  // Neutrals
  ink: "#111c18",
  sub: "#4a5e56",
  dim: "#8fa89f",
  line: "#dce8e2",
  card: "#ffffff",
  bg: "#f0f6f2",
  // Accent
  gold: "#c9a227",
};
// ─────────────────────────────────────────────────────────────────────────────

// ─── Data helpers ─────────────────────────────────────────────────────────────
// ข้อมูลว่างไว้รอ API — ไม่มีข้อมูล hardcode
const EMPTY = {
  name: "",
  position: "",
  faculty: "",
  department: "",
  email: "",
  phone: "",
  employeeId: "",
  photoUrl: "",
};

const normalize = (d) => ({
  name: d.name ?? d.full_name ?? d.teacher_name ?? "",
  position: d.position ?? d.academic_position ?? "",
  faculty: d.faculty ?? d.faculty_name ?? "",
  department: d.department ?? d.program ?? d.major ?? "",
  email: d.email ?? d.teacher_email ?? "",
  phone: d.phone ?? d.tel ?? d.mobile ?? "",
  employeeId: d.employeeId ?? d.employee_id ?? d.staff_id ?? "",
  photoUrl: d.photoUrl ?? d.photo_url ?? d.avatar ?? "",
});

const initial = (name) =>
  name?.replace(/^(อาจารย์|ดร\.|ผศ\.|รศ\.)\s*/, "")?.trim()?.[0] ?? "อ";
// ─────────────────────────────────────────────────────────────────────────────

// ─── Sub-components ───────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <View style={s.infoRow}>
    <View style={s.infoIconWrap}>
      <Ionicons name={icon} size={15} color={C.g500} />
    </View>
    <View style={s.infoTextWrap}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value || "—"}</Text>
    </View>
  </View>
);

const Divider = () => <View style={s.divider} />;

const TAB_KEYS = [
  { key: "info", icon: "person-circle-outline", tKey: "card.tabInfo" },
  { key: "qr", icon: "qr-code-outline", tKey: "card.tabQr" },
  { key: "barcode", icon: "barcode-outline", tKey: "card.tabBarcode" },
];
// ─────────────────────────────────────────────────────────────────────────────

export default function Cardpage({ navigation }) {
  const { t } = useTranslation();
  const { user, logout } = useCurrentUser(navigation);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ── Fetch ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const json = await apiFetch(API_ENDPOINT);
        if (!cancelled) setTeacher(normalize(json.data ?? json));
      } catch (e) {
        if (!cancelled) {
          console.warn("Teacher card API error:", e.message);
          setError(e.message);
          setTeacher(normalize(EMPTY)); // API ล้มเหลว — แสดงข้อมูลว่าง
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          Animated.spring(fadeAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 60,
            friction: 9,
          }).start();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleShare = async () => {
    if (!teacher) return;
    try {
      await Share.share({
        title: `Digital Staff Card – URUSmart`,
        message: [
          t("card.shareMsg"),
          teacher.name,
          teacher.position,
          `${teacher.faculty} ${teacher.department}`,
          `Email: ${teacher.email}`,
          `โทร: ${teacher.phone}`,
        ].join("\n"),
      });
    } catch {}
  };

  // ── Derived values ──
  const rawTeacher = teacher ?? EMPTY;
  const tc = {
    ...rawTeacher,
    name: rawTeacher.name || user.name || t("card.defaultName"),
    position: rawTeacher.position || "",
    faculty: rawTeacher.faculty || user.faculty || "",
    photoUrl: rawTeacher.photoUrl || user.photoUrl || "",
  };
  const ini = initial(tc.name);
  const affiliation = [tc.faculty, tc.department].filter(Boolean).join(" · ");
  const qrValue = `URUSMART:${tc.employeeId}:${tc.email}`;

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0a6644" />
      {/* ══ Header ══ */}
      <HeaderBar
        name={tc.name || user.name}
        photoUrl={tc.photoUrl || user.photoUrl}
        onNotification={() => navigation.navigate("Notifications")}
        onLogout={logout}
      />

      {/* ── offline / error banner ── */}
      {error && (
        <View style={s.errorBanner}>
          <Ionicons name="wifi-outline" size={14} color={C.gold} />
          <Text style={s.errorText}>{t("card.offline")}</Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
          {/* ══ Card ══ */}
          <View style={s.cardShadow}>
            <View style={s.card}>
              {/* ── Top band ── */}
              <View style={s.band}>
                <View style={[s.blob, s.bandBlobTR]} />
                <View style={[s.blob, s.bandBlobBL]} />

                <View style={s.bandRow}>
                  <Image
                    source={logo}
                    style={s.bandLogo}
                    resizeMode="contain"
                  />
                  <View style={s.activeBadge}>
                    <Ionicons
                      name="shield-checkmark"
                      size={11}
                      color={C.g500}
                    />
                    <Text style={s.activeBadgeText}>{t("card.activeBadge")}</Text>
                  </View>
                </View>

                <Text style={s.bandTitle}>{t("card.title")}</Text>

                {!!tc.employeeId && (
                  <View style={s.empIdRow}>
                    <Ionicons
                      name="id-card-outline"
                      size={12}
                      color="rgba(255,255,255,0.75)"
                    />
                    <Text style={s.empIdText}>{tc.employeeId}</Text>
                  </View>
                )}
              </View>

              {/* ── Photo bubble (sits on band seam) ── */}
              <View style={s.photoWrap}>
                {tc.photoUrl ? (
                  <Image source={{ uri: tc.photoUrl }} style={s.photo} />
                ) : (
                  <View style={s.photoFallback}>
                    <Text style={s.photoInitial}>{ini}</Text>
                  </View>
                )}
              </View>

              {/* ── Loading state ── */}
              {loading ? (
                <View style={s.loadingBox}>
                  <ActivityIndicator color={C.g500} />
                  <Text style={s.loadingText}>{t("card.loading")}</Text>
                </View>
              ) : (
                <>
                  {/* ── Name & position ── */}
                  <View style={s.nameBlock}>
                    <Text style={s.teacherName}>{tc.name}</Text>
                    {!!tc.position && (
                      <View style={s.posPill}>
                        <Ionicons
                          name="ribbon-outline"
                          size={13}
                          color={C.g500}
                        />
                        <Text style={s.posText}>{tc.position}</Text>
                      </View>
                    )}
                  </View>

                  {/* ── Tab bar ── */}
                  <View style={s.tabBar}>
                    {TAB_KEYS.map((tab) => {
                      const active = activeTab === tab.key;
                      return (
                        <TouchableOpacity
                          key={tab.key}
                          style={[s.tab, active && s.tabActive]}
                          onPress={() => setActiveTab(tab.key)}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name={tab.icon}
                            size={16}
                            color={active ? C.g500 : C.dim}
                          />
                          <Text
                            style={[s.tabLabel, active && s.tabLabelActive]}
                          >
                            {t(tab.tKey)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* ── Tab content ── */}
                  <View style={s.tabContent}>
                    {activeTab === "info" && (
                      <View>
                        <InfoRow
                          icon="business-outline"
                          label={t("card.affiliation")}
                          value={affiliation}
                        />
                        <Divider />
                        <InfoRow
                          icon="mail-outline"
                          label={t("card.email")}
                          value={tc.email}
                        />
                        <Divider />
                        <InfoRow
                          icon="call-outline"
                          label={t("card.phone")}
                          value={tc.phone}
                        />
                        <Divider />
                        <InfoRow
                          icon="id-card-outline"
                          label={t("card.employeeId")}
                          value={tc.employeeId}
                        />
                      </View>
                    )}

                    {activeTab === "qr" && (
                      <View style={s.centerBlock}>
                        <View style={s.qrFrame}>
                          <QRCode
                            value={qrValue}
                            size={172}
                            color={C.g900}
                            backgroundColor={C.card}
                          />
                        </View>
                        <Text style={s.codeLabel}>{t("card.scanQr")}</Text>
                        <Text style={s.codeSub}>{tc.employeeId}</Text>
                      </View>
                    )}

                    {activeTab === "barcode" && (
                      <View style={s.centerBlock}>
                        <View style={s.barcodeFrame}>
                          {Array.from({ length: 46 }).map((_, i) => (
                            <View
                              key={i}
                              style={[
                                s.bar,
                                {
                                  width: i % 7 === 0 ? 4 : i % 3 === 0 ? 2 : 1,
                                  backgroundColor:
                                    i % 11 === 0 ? C.g300 : C.g900,
                                },
                              ]}
                            />
                          ))}
                        </View>
                        <Text style={s.codeLabel}>{tc.employeeId}</Text>
                        <Text style={s.codeSub}>{t("card.employeeBarcode")}</Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>

          {/* ══ Share CTA ══ */}
          <TouchableOpacity
            style={s.shareBtn}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Ionicons name="share-social-outline" size={19} color={C.g700} />
            <Text style={s.shareBtnText}>{t("card.share")}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  // blobs (reusable shape)
  blob: { borderRadius: 999, position: "absolute" },

  // ── Error banner ──
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fffbea",
    borderBottomColor: "#f5e09a",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  errorText: { color: "#7a5e00", fontSize: 12, fontWeight: "700" },

  // ── Scroll ──
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // ── Card shadow wrapper ──
  cardShadow: {
    width: "100%",
    maxWidth: 420,
    shadowColor: C.g900,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 5,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderColor: C.line,
    borderWidth: 1,
    overflow: "hidden",
  },

  // ── Band ──
  band: {
    backgroundColor: C.g700,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 58,
    overflow: "hidden",
  },
  bandBlobTR: {
    width: 160,
    height: 160,
    backgroundColor: "rgba(255,255,255,0.08)",
    right: -48,
    top: -52,
  },
  bandBlobBL: {
    width: 130,
    height: 130,
    backgroundColor: "rgba(255,255,255,0.06)",
    left: -40,
    bottom: -60,
  },
  bandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bandLogo: { width: 104, height: 46, tintColor: C.card },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.card,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  activeBadgeText: {
    color: C.g500,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  bandTitle: {
    color: C.card,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 18,
    letterSpacing: 0.2,
  },
  empIdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  empIdText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "700",
  },

  // ── Photo ──
  photoWrap: {
    alignSelf: "center",
    width: 108,
    height: 108,
    borderRadius: 54,
    marginTop: -54,
    backgroundColor: C.card,
    borderWidth: 4,
    borderColor: C.card,
    shadowColor: C.g900,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 5,
    overflow: "hidden",
  },
  photo: { width: "100%", height: "100%", borderRadius: 50 },
  photoFallback: {
    flex: 1,
    backgroundColor: C.g100,
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitial: { color: C.g500, fontSize: 50, fontWeight: "900" },

  // ── Loading ──
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 36,
  },
  loadingText: { color: C.dim, fontSize: 13, fontWeight: "700" },

  // ── Name block ──
  nameBlock: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  teacherName: {
    color: C.ink,
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 28,
  },
  posPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.g50,
    borderRadius: 999,
    borderColor: C.g100,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 8,
  },
  posText: { color: C.g700, fontSize: 12, fontWeight: "900" },

  // ── Tab bar ──
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: C.g20,
    borderRadius: 14,
    borderColor: C.line,
    borderWidth: 1,
    padding: 4,
    gap: 3,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 9,
    borderRadius: 11,
  },
  tabActive: {
    backgroundColor: C.card,
    shadowColor: C.g900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  tabLabel: { fontSize: 11, color: C.dim, fontWeight: "700" },
  tabLabelActive: { color: C.g500, fontWeight: "900" },

  // ── Tab content ──
  tabContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 22,
  },

  // ── Info rows ──
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  infoIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: C.g50,
    borderColor: C.g100,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 1,
  },
  infoTextWrap: { flex: 1 },
  infoLabel: { color: C.dim, fontSize: 11, fontWeight: "800", marginBottom: 2 },
  infoValue: { color: C.ink, fontSize: 14, fontWeight: "800", lineHeight: 20 },
  divider: { height: 1, backgroundColor: C.line, marginHorizontal: 2 },

  // ── QR / Barcode ──
  centerBlock: { alignItems: "center", paddingVertical: 12 },
  qrFrame: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderColor: C.line,
    borderWidth: 1,
    padding: 16,
    shadowColor: C.g900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  barcodeFrame: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: C.card,
    borderRadius: 12,
    borderColor: C.line,
    borderWidth: 1,
    height: 76,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  bar: { height: "100%", marginHorizontal: 0.6 },
  codeLabel: {
    color: C.ink,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 14,
    textAlign: "center",
  },
  codeSub: { color: C.dim, fontSize: 11, fontWeight: "700", marginTop: 3 },

  // ── Share button ──
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 16,
    width: "100%",
    maxWidth: 420,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.g100,
    borderRadius: 16,
    paddingVertical: 15,
    shadowColor: C.g900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  shareBtnText: { color: C.g700, fontSize: 15, fontWeight: "900" },
});
