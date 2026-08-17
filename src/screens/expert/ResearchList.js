import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AppHeader from "../../components/AppHeader";
import StateView from "../../components/StateView";
import { stripNamePrefix } from "../../utils/name";
import { fixPhotoUrl } from "../../utils/image";
import apiService from "../../services/api";
import { colors, radius, shadows } from "../../theme/tokens";
import { getExpertGroupLabel } from "../../constants/expertGroups";

// ── Avatar ─────────────────────────────────────────────────
const Avatar = ({ name, photoUrl, index }) => {
  const initial = name?.replace(/^(อาจารย์|ดร\.|ผศ\.|รศ\.)\s*/, "").trim()?.[0] ?? "อ";
  return (
    <View style={{ position: "relative", flexShrink: 0 }}>
      <View style={{
        width: 76, height: 76, borderRadius: 38,
        overflow: "hidden",
        backgroundColor: "#c8e6d6",
        borderWidth: 2.5, borderColor: "#007a5a",
        alignItems: "center", justifyContent: "center",
      }}>
        {photoUrl
          ? <Image source={{ uri: photoUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          : <Text style={{ fontSize: 28, fontWeight: "900", color: "#007a5a" }}>{initial}</Text>
        }
      </View>
      {/* ลำดับ */}
      <View style={{
        position: "absolute", bottom: -2, right: -2,
        backgroundColor: "#007a5a", borderRadius: 10,
        minWidth: 20, height: 20,
        paddingHorizontal: 5,
        alignItems: "center", justifyContent: "center",
        borderWidth: 2, borderColor: "#fff",
      }}>
        <Text style={{ fontSize: 10, fontWeight: "900", color: "#fff" }}>{index + 1}</Text>
      </View>
    </View>
  );
};

// ── Chip ───────────────────────────────────────────────────
const Chip = ({ label, color = "#007a5a", bg = "#e6f4ef", border = "#9fd4bc" }) => (
  <View style={{ backgroundColor: bg, borderWidth: 1, borderColor: border, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, marginRight: 5, marginBottom: 4 }}>
    <Text style={{ fontSize: 11, fontWeight: "700", color }} numberOfLines={1}>{label}</Text>
  </View>
);

const readRows = (response) => response.data?.data ?? response.data ?? [];

const fetchProfileSearch = async (params) => {
  const response = await apiService.get("/profile-search", { params });
  return readRows(response);
};

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .replace(/^กลุ่ม/, "")
    .replace(/\s+/g, " ")
    .toLowerCase();

const getExpertiseNames = (item) => {
  const expertises = Array.isArray(item?.expertises) ? item.expertises : [];
  return expertises
    .map((e) => {
      if (e?.name || e?.label || e?.expertise_name) {
        return e.name ?? e.label ?? e.expertise_name;
      }
      if (e?.group_id) return getExpertGroupLabel(e.group_id);
      return e;
    })
    .filter(Boolean);
};

const getExpertiseGroupIds = (item) => {
  const expertises = Array.isArray(item?.expertises) ? item.expertises : [];
  return expertises
    .map((e) => e?.group_id ?? e?.expertise_group_id)
    .filter((id) => id !== undefined && id !== null && id !== "");
};

const filterRowsByExpertise = (rows, expertise, groupId) => {
  const groupTarget = groupId ? String(groupId) : "";
  if (groupTarget) {
    const matchedByGroupId = rows.filter((item) =>
      getExpertiseGroupIds(item).some((id) => String(id) === groupTarget),
    );
    if (matchedByGroupId.length > 0) return matchedByGroupId;
  }

  const target = normalizeText(expertise);
  if (!target) return rows;

  return rows.filter((item) =>
    getExpertiseNames(item).some((name) => normalizeText(name) === target),
  );
};

const fetchProfileSearchWithFallback = async (searchParams) => {
  const rows = await fetchProfileSearch(searchParams);
  if (!searchParams?.expertise && !searchParams?.expertise_group_id) return rows;

  const filteredRows = filterRowsByExpertise(
    rows,
    searchParams.expertise,
    searchParams.expertise_group_id ?? searchParams.group_id,
  );
  if (filteredRows.length > 0) return filteredRows;

  const keyword = searchParams.expertise;
  const groupId = searchParams.expertise_group_id ?? searchParams.group_id;
  const fallbacks = [
    { expertise_group_id: groupId },
    { group_id: groupId },
    { search_by: "expertise", keyword },
    { search_by: "expertise_group", keyword },
    { expertise_group: keyword },
    { expert_group: keyword },
  ];

  for (const params of fallbacks) {
    const fallbackRows = await fetchProfileSearch(params);
    const filteredFallbackRows = filterRowsByExpertise(fallbackRows, keyword, groupId);
    if (__DEV__) {
      console.log(
        "[ResearchList] expertise fallback:",
        params,
        fallbackRows.length,
        "→ filtered:",
        filteredFallbackRows.length,
      );
    }
    if (filteredFallbackRows.length > 0) return filteredFallbackRows;
  }

  return filteredRows;
};

// ── ExpertCard ─────────────────────────────────────────────
const ExpertCard = ({ item, index, onPress }) => {
  const { t } = useTranslation();
  const name      = stripNamePrefix(item.full_name_th ?? item.full_name_en ?? item.name ?? item.full_name ?? "");
  const position  = item.position ?? item.academic_position ?? "";
  const faculty   = item.faculty_name_th ?? item.department_name_th ?? item.faculty ?? item.faculty_name ?? "";
  const dept      = item.department_name_th ?? item.unit_name_th ?? "";
  const photoUrl  = fixPhotoUrl(item.picture ?? item.photoUrl ?? item.photo_url ?? item.avatar ?? "");
  const expertises = (item.expertises ?? []).map((e) => e.name ?? e.label ?? String(e)).filter(Boolean);
  const interests  = (item.interests  ?? []).map((e) => e.name ?? e.label ?? String(e)).filter(Boolean);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        marginBottom: 12,
        overflow: "hidden",
        ...shadows.card,
      }}
    >
      {/* Green top border */}
      <View style={{ height: 3, backgroundColor: "#007a5a" }} />

      <View style={{ padding: 14, gap: 12 }}>
        {/* Row 1: Avatar + Info */}
        <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
          <Avatar name={name} photoUrl={photoUrl} index={index} />

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#0a1a12", lineHeight: 22, letterSpacing: -0.2 }} numberOfLines={2}>
              {name || "—"}
            </Text>

            {!!position && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", backgroundColor: "#e6f4ef", borderWidth: 1, borderColor: "#9fd4bc", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginTop: 5 }}>
                <Ionicons name="ribbon-outline" size={11} color="#007a5a" />
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#007a5a" }} numberOfLines={1}>{position}</Text>
              </View>
            )}

            {!!(faculty || dept) && (
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 4, marginTop: 5 }}>
                <Ionicons name="business-outline" size={12} color="#a0b8b0" style={{ marginTop: 1 }} />
                <Text style={{ fontSize: 11, color: "#5a7a6e", flex: 1, lineHeight: 16 }} numberOfLines={2}>
                  {[faculty, dept !== faculty ? dept : ""].filter(Boolean).join("  ·  ")}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: "#eef4f1" }} />

        {/* Row 2: Expertise + Interest chips */}
        <View style={{ gap: 8 }}>
          {/* ความเชี่ยวชาญ */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 5 }}>
              <View style={{ width: 18, height: 18, borderRadius: 5, backgroundColor: "#007a5a", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="settings-sharp" size={11} color="#fff" />
              </View>
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#005c42", letterSpacing: 0.3 }}>{t("research.screen.expertiseLabel")}</Text>
            </View>
            {expertises.length > 0
              ? <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {expertises.slice(0, 4).map((tag, i) => <Chip key={i} label={tag} />)}
                  {expertises.length > 4 && <Chip label={`+${expertises.length - 4}`} color="#6b8f80" bg="#f0f8f4" border="#c4ddd5" />}
                </View>
              : <Text style={{ fontSize: 12, color: colors.textSoft, fontStyle: "italic", marginLeft: 2 }}>—</Text>
            }
          </View>

          {/* ความสนใจ */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 5 }}>
              <View style={{ width: 18, height: 18, borderRadius: 5, backgroundColor: "#f59e0b", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="star" size={11} color="#fff" />
              </View>
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#92600a", letterSpacing: 0.3 }}>{t("research.screen.interestLabel")}</Text>
            </View>
            {interests.length > 0
              ? <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {interests.slice(0, 4).map((tag, i) => <Chip key={i} label={tag} color="#92600a" bg="#fff8e7" border="#f5c842" />)}
                  {interests.length > 4 && <Chip label={`+${interests.length - 4}`} color="#b08050" bg="#fffaf0" border="#e8d0a0" />}
                </View>
              : <Text style={{ fontSize: 12, color: colors.textSoft, fontStyle: "italic", marginLeft: 2 }}>—</Text>
            }
          </View>
        </View>

        {/* Row 3: CTA button */}
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 6,
            backgroundColor: "#007a5a", borderRadius: 10,
            paddingHorizontal: 14, paddingVertical: 8,
          }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>{t("research.screen.viewExpert")}</Text>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Screen ─────────────────────────────────────────────────
export default function ResearchList({ navigation, route }) {
  const { t } = useTranslation();
  const { searchParams = {} } = route?.params || {};

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const rows = await fetchProfileSearchWithFallback(searchParams);
        if (!cancelled) setResults(rows);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBg }}>
      <AppHeader title={t("research.screen.expertList")} onBack={() => navigation.goBack()} />

      {/* Content */}
      {loading ? (
        <StateView type="loading" title={t("research.common.loading")} />
      ) : error ? (
        <StateView type="error" title={t("research.list.errorTitle")} message={error} />
      ) : results.length === 0 ? (
        <StateView icon="search-outline" title={t("research.list.noData")} message={t("research.list.desc")} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, i) => `${item.id ?? i}`}
          ListHeaderComponent={
            <Text style={{ fontSize: 12, color: "#8fa89f", fontWeight: "600", paddingHorizontal: 14, paddingTop: 14, paddingBottom: 4 }}>
              {t("research.screen.foundCount", { count: results.length })}
            </Text>
          }
          renderItem={({ item, index }) => (
            <ExpertCard
              item={item}
              index={index}
              onPress={() => navigation.navigate("ProfileDetail", { id: item.id })}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 4, paddingBottom: 40 }}
        />
      )}
    </View>
  );
}
