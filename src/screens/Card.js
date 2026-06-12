import React, { useEffect, useRef, useState } from "react";
import {
  Animated, Image, ScrollView, Share, StatusBar,
  Text, TouchableOpacity, View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import Barcode from "react-native-barcode-svg";
import { useTranslation } from "react-i18next";
import HeaderBar from "../components/HeaderBar";
import useCurrentUser from "../hook/useCurrentUser";
import api from "../services/api";

const logo = require("../assets/urusmartlogo.png");

const normalize = (d) => {
  const firstName = d.firstname_th ?? d.firstname_en ?? "";
  const lastName  = d.lastname_th  ?? d.lastname_en  ?? "";
  const fullName  = d.name ?? d.full_name ?? d.teacher_name ??
    (firstName ? `${firstName} ${lastName}`.trim() : "");

  return {
    name:       fullName,
    position:   d.position_name ?? d.position_label ?? d.position ?? d.academic_position ?? "",
    faculty:    d.faculty ?? d.faculty_name ?? d.main_unit_name ?? d.main_unit ?? "",
    department: d.department ?? d.program ?? d.major ?? d.sub_unit_name ?? d.sub_unit ?? d.branch ?? "",
    email:      d.email ?? d.teacher_email ?? "",
    phone:      d.phone ?? d.tel ?? d.mobile ?? d.phone_work ?? d.phone_mobile ?? "",
    employeeId: d.employeeId ?? d.employee_id ?? d.staff_id ?? d.id_card ?? "",
    photoUrl:   d.photoUrl ?? d.photo_url ?? d.avatar ?? d.picture ?? d.profile_image ?? "",
  };
};

const initial = (name) =>
  name?.replace(/^(อาจารย์|ดร\.|ผศ\.|รศ\.)\s*/, "")?.trim()?.[0] ?? "อ";

// ── Skeleton row แสดงระหว่างรอ API ──────────────────────────────
const SkeletonRow = ({ pulse }) => (
  <View className="flex-row items-center py-[10px] gap-3">
    <Animated.View className="w-[30px] h-[30px] rounded-[10px] bg-[#e0ebe6]" style={{ opacity: pulse }} />
    <View className="flex-1 gap-[6px]">
      <Animated.View className="h-[9px] w-1/3 rounded-full bg-[#e0ebe6]" style={{ opacity: pulse }} />
      <Animated.View className="h-[13px] w-3/4 rounded-full bg-[#d4e8de]" style={{ opacity: pulse }} />
    </View>
  </View>
);

const InfoRow = ({ icon, label, value }) => (
  <View className="flex-row items-start py-[10px]">
    <View className="w-[34px] h-[34px] rounded-xl bg-[#eef8f3] border border-[#d4efe5] items-center justify-center mr-3 mt-[1px]">
      <Ionicons name={icon} size={16} color="#0f7a55" />
    </View>
    <View className="flex-1">
      <Text className="text-[#8fa89f] text-[10px] font-extrabold uppercase tracking-[0.6px] mb-[3px]">{label}</Text>
      <Text className="text-[#111c18] text-[14px] font-bold leading-5">{value || "—"}</Text>
    </View>
  </View>
);

const Divider = () => <View className="h-px bg-[#eef4f0] mx-1" />;

const TAB_KEYS = [
  { key: "info",    icon: "person-circle-outline", tKey: "card.tabInfo" },
  { key: "qr",     icon: "qr-code-outline",        tKey: "card.tabQr" },
  { key: "barcode", icon: "barcode-outline",        tKey: "card.tabBarcode" },
];

const cardShadow = {
  shadowColor: "#064e35", shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.14, shadowRadius: 22, elevation: 8,
};
const photoShadow = {
  shadowColor: "#064e35", shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.18, shadowRadius: 16, elevation: 6,
};
const tabActiveShadow = {
  shadowColor: "#064e35", shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
};

export default function Cardpage({ navigation }) {
  const { t } = useTranslation();
  const { user, logout } = useCurrentUser(navigation);

  // แสดงข้อมูล user ทันที ไม่รอ API
  const [teacher, setTeacher] = useState(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info");

  // Animation เริ่มทันที ไม่รอ API
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  // Skeleton pulse animation
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // แสดง card ทันที
    Animated.parallel([
      Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true, tension: 70, friction: 9 }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 70, friction: 9 }),
    ]).start();

    // skeleton pulse
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();

    // fetch API in background
    let cancelled = false;
    (async () => {
      try {
        setApiLoading(true);
        const res = await api.get("/me");
        if (!cancelled) setTeacher(normalize(res.data?.data ?? res.data));
      } catch (e) {
        if (!cancelled) { setError(e.message); setTeacher(normalize({})); }
      } finally {
        if (!cancelled) { setApiLoading(false); pulse.stop(); }
      }
    })();

    return () => { cancelled = true; pulse.stop(); };
  }, []);

  // merge: API data > user data > empty
  const raw = teacher ?? {};
  const tc = {
    name:       raw.name       || user.name       || t("card.defaultName"),
    position:   raw.position   || "",
    faculty:    raw.faculty    || user.faculty     || "",
    department: raw.department || "",
    email:      raw.email      || "",
    phone:      raw.phone      || "",
    employeeId: raw.employeeId || "",
    photoUrl:   raw.photoUrl   || user.photoUrl   || "",
  };
  const ini = initial(tc.name);
  const affiliation = [tc.faculty, tc.department].filter(Boolean).join(" · ");
  const qrValue = `URUSMART:${tc.employeeId || "000"}:${tc.email || ""}`;

  const handleShare = async () => {
    try {
      await Share.share({
        title: "Digital Staff Card – URUSmart",
        message: [
          t("card.shareMsg"),
          tc.name, tc.position,
          affiliation,
          `Email: ${tc.email}`,
          `โทร: ${tc.phone}`,
        ].join("\n"),
      });
    } catch {}
  };

  return (
    <View className="flex-1 bg-[#f0f6f2]">
      <StatusBar barStyle="light-content" backgroundColor="#0a6644" />
      <HeaderBar
        name={tc.name || user.name}
        photoUrl={tc.photoUrl || user.photoUrl}
        onNotification={() => navigation.navigate("Notifications")}
        onLogout={logout}
      />

      {error && (
        <View className="flex-row items-center gap-[6px] bg-[#fffbea] border-b border-[#f5e09a] px-4 py-[7px]">
          <Ionicons name="cloud-offline-outline" size={14} color="#c9a227" />
          <Text className="text-[#7a5e00] text-[12px] font-bold">{t("card.offline")}</Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, alignItems: "center", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 36 }}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: "100%", maxWidth: 440 }}
          className="items-center"
        >
          {/* ══ Card ══ */}
          <View className="w-full" style={cardShadow}>
            <View className="bg-white rounded-[22px] overflow-hidden border border-[#dce8e2]">

              {/* ── Header band with gradient ── */}
              <LinearGradient
                colors={["#064e35", "#0a6644", "#0f7a55"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 64, overflow: "hidden" }}
              >
                {/* blobs */}
                <View className="absolute w-[180px] h-[180px] rounded-full" style={{ right: -55, top: -60, backgroundColor: "rgba(255,255,255,0.07)" }} />
                <View className="absolute w-[120px] h-[120px] rounded-full" style={{ left: -35, bottom: -50, backgroundColor: "rgba(255,255,255,0.05)" }} />
                <View className="absolute w-[80px] h-[80px] rounded-full" style={{ right: 60, bottom: -20, backgroundColor: "rgba(255,255,255,0.04)" }} />

                {/* Top row */}
                <View className="flex-row items-center justify-between">
                  <Image source={logo} style={{ width: 110, height: 48, tintColor: "#fff" }} resizeMode="contain" />
                  <View className="flex-row items-center gap-[5px] bg-white/20 border border-white/30 rounded-full px-3 py-[5px]">
                    <View className="w-[7px] h-[7px] rounded-full bg-[#4ade80]" />
                    <Text className="text-white text-[10px] font-extrabold tracking-[0.6px]">{t("card.activeBadge")}</Text>
                  </View>
                </View>

                <Text className="text-white text-[20px] font-black mt-5 tracking-[0.2px]">{t("card.title")}</Text>
                <Text className="text-white/60 text-[11px] font-semibold mt-[4px]">Uttaradit Rajabhat University</Text>

                {!!tc.employeeId && (
                  <View className="flex-row items-center gap-[5px] mt-3 self-start bg-white/10 rounded-full px-3 py-[5px]">
                    <Ionicons name="id-card-outline" size={12} color="rgba(255,255,255,0.8)" />
                    <Text className="text-white/80 text-[11px] font-bold">{tc.employeeId}</Text>
                  </View>
                )}
              </LinearGradient>

              {/* ── Photo (sits on band seam) ── */}
              <View
                className="self-center w-[112px] h-[112px] rounded-full bg-white overflow-hidden"
                style={{ marginTop: -56, borderWidth: 4, borderColor: "#fff", ...photoShadow }}
              >
                {tc.photoUrl ? (
                  <Image source={{ uri: tc.photoUrl }} className="w-full h-full" />
                ) : (
                  <LinearGradient colors={["#d4efe5", "#b8dfd0"]} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: "#0f7a55", fontSize: 52, fontWeight: "900" }}>{ini}</Text>
                  </LinearGradient>
                )}
              </View>

              {/* ── Name & position ── */}
              <View className="items-center px-5 pt-3 pb-[2px]">
                <Text className="text-[#111c18] text-[20px] font-black text-center leading-7 tracking-[-0.3px]">
                  {tc.name}
                </Text>
                {!!tc.position && (
                  <View className="flex-row items-center gap-[5px] mt-[8px] bg-[#eef8f3] border border-[#d4efe5] rounded-full px-4 py-[6px]">
                    <Ionicons name="ribbon-outline" size={13} color="#0f7a55" />
                    <Text className="text-[#0a6644] text-[12px] font-bold">{tc.position}</Text>
                  </View>
                )}
                {!!affiliation && (
                  <Text className="text-[#8fa89f] text-[12px] font-semibold mt-[6px] text-center">{affiliation}</Text>
                )}
              </View>

              {/* ── Divider line ── */}
              <View className="h-px bg-[#f0f6f2] mx-5 mt-4" />

              {/* ── Tab bar ── */}
              <View className="flex-row mx-4 mt-4 bg-[#f4fbf7] rounded-[14px] border border-[#dce8e2] p-1 gap-[3px]">
                {TAB_KEYS.map((tab) => {
                  const active = activeTab === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      className={`flex-1 flex-row items-center justify-center gap-1 py-[10px] rounded-[11px] ${active ? "bg-white" : ""}`}
                      style={active ? tabActiveShadow : {}}
                      onPress={() => setActiveTab(tab.key)}
                      activeOpacity={0.75}
                    >
                      <Ionicons name={tab.icon} size={16} color={active ? "#0f7a55" : "#a0b8ae"} />
                      <Text className={`text-[11px] ${active ? "text-primary font-extrabold" : "text-[#a0b8ae] font-semibold"}`}>
                        {t(tab.tKey)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ── Tab content ── */}
              <View className="px-5 pt-4 pb-6">
                {activeTab === "info" && (
                  <View>
                    {apiLoading ? (
                      <>
                        <SkeletonRow pulse={pulseAnim} />
                        <Divider />
                        <SkeletonRow pulse={pulseAnim} />
                        <Divider />
                        <SkeletonRow pulse={pulseAnim} />
                        <Divider />
                        <SkeletonRow pulse={pulseAnim} />
                      </>
                    ) : (
                      <>
                        <InfoRow icon="business-outline" label={t("card.affiliation")} value={affiliation} />
                        <Divider />
                        <InfoRow icon="mail-outline" label={t("card.email")} value={tc.email} />
                        <Divider />
                        <InfoRow icon="call-outline" label={t("card.phone")} value={tc.phone} />
                        <Divider />
                        <InfoRow icon="id-card-outline" label={t("card.employeeId")} value={tc.employeeId} />
                      </>
                    )}
                  </View>
                )}

                {activeTab === "qr" && (
                  <View className="items-center py-4">
                    <View
                      className="bg-white rounded-[20px] p-5 border border-[#dce8e2]"
                      style={{ shadowColor: "#064e35", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 }}
                    >
                      <QRCode value={qrValue} size={180} color="#064e35" backgroundColor="#ffffff" />
                    </View>
                    <Text className="text-[#111c18] text-[13px] font-extrabold mt-4 text-center">{t("card.scanQr")}</Text>
                    <Text className="text-[#8fa89f] text-[11px] font-semibold mt-1">{tc.employeeId || "—"}</Text>
                  </View>
                )}

                {activeTab === "barcode" && (
                  <View className="items-center py-4">
                    {tc.employeeId ? (
                      <View
                        className="bg-white rounded-[20px] p-5 border border-[#dce8e2]"
                        style={{ shadowColor: "#064e35", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 }}
                      >
                        <Barcode value={tc.employeeId} format="CODE128" width={1.8} height={80} lineColor="#064e35" background="#ffffff" />
                      </View>
                    ) : (
                      <View
                        className="bg-white rounded-[20px] p-5 border border-[#dce8e2] items-center justify-center"
                        style={{ width: 200, height: 110, shadowColor: "#064e35", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 }}
                      >
                        <Ionicons name="barcode-outline" size={36} color="#c4d4cc" />
                        <Text className="text-[12px] text-[#c4d4cc] font-semibold mt-2">{t("card.noEmployeeId")}</Text>
                      </View>
                    )}
                    <Text className="text-[#111c18] text-[13px] font-extrabold mt-4 text-center tracking-[2px]">
                      {tc.employeeId || "—"}
                    </Text>
                    <Text className="text-[#8fa89f] text-[11px] font-semibold mt-1">{t("card.employeeBarcode")}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* ══ Share Button ══ */}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-[10px] mt-4 w-full bg-white border border-[#d4efe5] rounded-[18px] py-4"
            style={{ shadowColor: "#064e35", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 }}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <View className="w-8 h-8 rounded-full bg-[#eef8f3] items-center justify-center">
              <Ionicons name="share-social-outline" size={17} color="#0a6644" />
            </View>
            <Text className="text-[#0a6644] text-[15px] font-extrabold">{t("card.share")}</Text>
          </TouchableOpacity>

          {/* ── Footer note ── */}
          <View className="flex-row items-center gap-[5px] mt-4 opacity-40">
            <Ionicons name="shield-checkmark-outline" size={12} color="#0a6644" />
            <Text className="text-[#0a6644] text-[10px] font-bold">URUSmart Official Digital Card</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
