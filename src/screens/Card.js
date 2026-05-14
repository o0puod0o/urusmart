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
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";

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

// ปี พ.ศ. ถัดไป (ค.ศ. + 543 + 1)
const nextThaiYear = () => String(new Date().getFullYear() + 544);

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

const TABS = [
  { key: "info", icon: "person-circle-outline", label: "ข้อมูล" },
  { key: "qr", icon: "qr-code-outline", label: "QR Code" },
  { key: "barcode", icon: "barcode-outline", label: "บาร์โค้ด" },
];
// ─────────────────────────────────────────────────────────────────────────────

export default function Cardpage() {
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
        title: "Digital Staff Card – URUSmart",
        message: [
          "บัตรประจำตัวอาจารย์",
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
  const t = teacher ?? EMPTY;
  const ini = initial(t.name);
  const affiliation = [t.faculty, t.department].filter(Boolean).join(" · ");
  const qrValue = `URUSMART:${t.employeeId}:${t.email}`;
  const expireYear = nextThaiYear();

  return (
    <SafeAreaView style={s.screen}>
      {/* ══ Header ══ */}
      <View style={s.header}>
        {/* decorative blobs */}
        <View style={[s.blob, s.blobTR]} />
        <View style={[s.blob, s.blobBL]} />

        {/* avatar */}
        <View style={s.hAvatar}>
          <Text style={s.hAvatarText}>{ini}</Text>
        </View>

        {/* center logo */}
        <View style={s.hCenter}>
          <Image source={logo} style={s.hLogo} resizeMode="contain" />
          <Text style={s.hTag}>Digital Staff Card</Text>
        </View>

        {/* actions */}
        <View style={s.hActions}>
          <TouchableOpacity
            style={s.hBtn}
            onPress={handleShare}
            activeOpacity={0.75}
          >
            <Ionicons name="share-outline" size={20} color={C.g500} />
          </TouchableOpacity>
          <TouchableOpacity style={s.hBtn} activeOpacity={0.75}>
            <Ionicons name="notifications-outline" size={20} color={C.g500} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── offline / error banner ── */}
      {error && (
        <View style={s.errorBanner}>
          <Ionicons name="wifi-outline" size={14} color={C.gold} />
          <Text style={s.errorText}>
            ไม่สามารถเชื่อมต่อ API – แสดงข้อมูลสำรอง
          </Text>
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
                    <Text style={s.activeBadgeText}>ACTIVE STAFF</Text>
                  </View>
                </View>

                <Text style={s.bandTitle}>บัตรประจำตัวอาจารย์</Text>

                <View style={s.empIdRow}>
                  <Ionicons
                    name="id-card-outline"
                    size={12}
                    color="rgba(255,255,255,0.75)"
                  />
                  <Text style={s.empIdText}>{t.employeeId}</Text>
                </View>
              </View>

              {/* ── Photo bubble (sits on band seam) ── */}
              <View style={s.photoWrap}>
                {t.photoUrl ? (
                  <Image source={{ uri: t.photoUrl }} style={s.photo} />
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
                  <Text style={s.loadingText}>กำลังโหลดข้อมูลบัตร…</Text>
                </View>
              ) : (
                <>
                  {/* ── Name & position ── */}
                  <View style={s.nameBlock}>
                    <Text style={s.teacherName}>{t.name}</Text>
                    <View style={s.posPill}>
                      <Ionicons
                        name="ribbon-outline"
                        size={13}
                        color={C.g500}
                      />
                      <Text style={s.posText}>{t.position}</Text>
                    </View>
                  </View>

                  {/* ── Tab bar ── */}
                  <View style={s.tabBar}>
                    {TABS.map((tab) => {
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
                            {tab.label}
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
                          label="สังกัด"
                          value={affiliation}
                        />
                        <Divider />
                        <InfoRow
                          icon="mail-outline"
                          label="อีเมล"
                          value={t.email}
                        />
                        <Divider />
                        <InfoRow
                          icon="call-outline"
                          label="เบอร์โทรศัพท์"
                          value={t.phone}
                        />
                        <Divider />
                        <InfoRow
                          icon="id-card-outline"
                          label="รหัสพนักงาน"
                          value={t.employeeId}
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
                        <Text style={s.codeLabel}>
                          สแกนเพื่อดูข้อมูลอาจารย์
                        </Text>
                        <Text style={s.codeSub}>{t.employeeId}</Text>
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
                        <Text style={s.codeLabel}>{t.employeeId}</Text>
                        <Text style={s.codeSub}>Employee Barcode</Text>
                      </View>
                    )}
                  </View>
                </>
              )}

              {/* ── Footer ── */}
              <View style={s.cardFooter}>
                <View>
                  <Text style={s.footerBrand}>URUSMART</Text>
                  <Text style={s.footerSub}>STAFF ID CARD</Text>
                </View>
                <View style={s.expireRow}>
                  <Ionicons name="time-outline" size={11} color={C.dim} />
                  <Text style={s.expireText}>หมดอายุ {expireYear}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ══ Share CTA ══ */}
          <TouchableOpacity
            style={s.shareBtn}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Ionicons name="share-social-outline" size={19} color={C.card} />
            <Text style={s.shareBtnText}>แชร์บัตรประจำตัว</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  // blobs (reusable shape)
  blob: { borderRadius: 999, position: "absolute" },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.g50,
    borderBottomColor: C.line,
    borderBottomWidth: 1,
    minHeight: 72,
    overflow: "hidden",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  blobTR: {
    width: 160,
    height: 160,
    backgroundColor: "rgba(15,122,85,0.10)",
    right: -60,
    top: -70,
  },
  blobBL: {
    width: 100,
    height: 100,
    backgroundColor: "rgba(15,122,85,0.07)",
    left: -30,
    bottom: -40,
  },
  hAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.g500,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.card,
    zIndex: 1,
  },
  hAvatarText: { color: C.card, fontSize: 20, fontWeight: "900" },
  hCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    top: 10,
  },
  hLogo: { width: 110, height: 44 },
  hTag: {
    color: C.g700,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginTop: -2,
  },
  hActions: { flexDirection: "row", gap: 8, marginLeft: "auto", zIndex: 1 },
  hBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.card,
    borderColor: C.line,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

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
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 48,
  },

  // ── Card shadow wrapper ──
  cardShadow: {
    width: "100%",
    maxWidth: 390,
    shadowColor: C.g900,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 8,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 26,
    borderColor: C.line,
    borderWidth: 1,
    overflow: "hidden",
  },

  // ── Band ──
  band: {
    backgroundColor: C.g500,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 72, // space for photo bubble overlap
    overflow: "hidden",
  },
  bandBlobTR: {
    width: 160,
    height: 160,
    backgroundColor: "rgba(255,255,255,0.09)",
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
  bandLogo: { width: 110, height: 50, tintColor: C.card },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.card,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activeBadgeText: {
    color: C.g500,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  bandTitle: {
    color: C.card,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 24,
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
    width: 120,
    height: 120,
    borderRadius: 22,
    marginTop: -60,
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
  photo: { width: "100%", height: "100%", borderRadius: 18 },
  photoFallback: {
    flex: 1,
    backgroundColor: C.g100,
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitial: { color: C.g500, fontSize: 58, fontWeight: "900" },

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
    paddingTop: 16,
  },
  teacherName: {
    color: C.ink,
    fontSize: 20,
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
    marginTop: 9,
  },
  posText: { color: C.g700, fontSize: 12, fontWeight: "900" },

  // ── Tab bar ──
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 18,
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
    paddingBottom: 24,
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

  // ── Card footer ──
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.g20,
    borderTopColor: C.line,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  footerBrand: {
    color: C.g500,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  footerSub: {
    color: C.dim,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  expireRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  expireText: { color: C.dim, fontSize: 11, fontWeight: "700" },

  // ── Share button ──
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 16,
    width: "100%",
    maxWidth: 390,
    backgroundColor: C.g500,
    borderRadius: 16,
    paddingVertical: 15,
    shadowColor: C.g500,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  shareBtnText: { color: C.card, fontSize: 15, fontWeight: "900" },
});
