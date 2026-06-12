import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import apiService from "../../services/api";

const Avatar = ({ name, photoUrl, size = 52 }) => {
  const initial = name?.replace(/^(อาจารย์|ดร\.|ผศ\.|รศ\.)\s*/, "").trim()?.[0] ?? "อ";
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden", backgroundColor: "#e6f4ef", borderWidth: 2, borderColor: "#b8dfd0", alignItems: "center", justifyContent: "center" }}>
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={{ width: "100%", height: "100%" }} />
      ) : (
        <Text style={{ color: "#0f7a55", fontSize: size * 0.38, fontWeight: "900" }}>{initial}</Text>
      )}
    </View>
  );
};

export default function ResearchList({ navigation, route }) {
  const { t } = useTranslation();
  const { title, icon = "search-outline", searchParams = {} } = route?.params || {};

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiService.get("/profile-search", { params: searchParams });
        if (!cancelled) setResults(res.data?.data ?? res.data ?? []);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const renderItem = ({ item }) => {
    const name = item.full_name_th ?? item.full_name_en ?? item.name ?? item.full_name ?? "";
    const position = item.position ?? item.academic_position ?? "";
    const faculty = item.department_name_th ?? item.department_name_en ?? item.faculty ?? item.faculty_name ?? "";
    const photoUrl = item.picture ?? item.photoUrl ?? item.photo_url ?? item.avatar ?? "";
    const tags = [...(item.expertises ?? []), ...(item.interests ?? [])].slice(0, 3);

    return (
      <View
        className="bg-white rounded-[16px] border border-[#dce8e2] p-[14px] mb-3 flex-row gap-3"
        style={{ elevation: 2, shadowColor: "#064e35", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }}
      >
        <Avatar name={name} photoUrl={photoUrl} />
        <View className="flex-1">
          <Text className="text-[15px] font-extrabold text-[#0d1f18] leading-5" numberOfLines={1}>{name || "—"}</Text>
          {!!position && (
            <View className="flex-row items-center gap-1 mt-[3px]">
              <Ionicons name="ribbon-outline" size={11} color="#0f7a55" />
              <Text className="text-[12px] font-semibold text-[#0f7a55]" numberOfLines={1}>{position}</Text>
            </View>
          )}
          {!!faculty && (
            <Text className="text-[11px] text-[#8fa89f] font-medium mt-[2px]" numberOfLines={1}>{faculty}</Text>
          )}
          {tags.length > 0 && (
            <View className="flex-row flex-wrap gap-[5px] mt-[8px]">
              {tags.map((tag, i) => (
                <View key={i} className="bg-[#eef8f3] rounded-full px-[8px] py-[3px]">
                  <Text className="text-[10px] font-bold text-[#0a6644]" numberOfLines={1}>
                    {tag.name ?? tag.label ?? String(tag)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View className="justify-center">
          <Ionicons name="chevron-forward" size={16} color="#c4d4cc" />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f0f6f2]">
      {/* Header */}
      <View className="flex-row items-center bg-white border-b border-[#dce8e2] px-4 py-[14px] gap-3">
        <TouchableOpacity className="w-8 h-8 items-center justify-center" onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <Ionicons name="chevron-back" size={24} color="#0f7a55" />
        </TouchableOpacity>
        <View className="w-8 h-8 rounded-[10px] bg-[#e6f4ef] items-center justify-center">
          <Ionicons name={icon} size={16} color="#0f7a55" />
        </View>
        <Text className="flex-1 text-[17px] font-extrabold text-[#111c18]" numberOfLines={1}>{title ?? t("research.list.title")}</Text>
        {!loading && (
          <View className="bg-[#eef8f3] rounded-full px-3 py-[4px]">
            <Text className="text-[12px] font-bold text-[#0f7a55]">{results.length}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#0f7a55" />
          <Text className="text-[13px] text-[#8fa89f] font-semibold">{t("research.common.loading")}</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Ionicons name="cloud-offline-outline" size={44} color="#c4d4cc" />
          <Text className="text-[16px] font-bold text-[#0d1f18]">{t("research.list.errorTitle")}</Text>
          <Text className="text-[13px] text-[#8fa89f] text-center">{error}</Text>
        </View>
      ) : results.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <View className="w-24 h-24 rounded-full bg-white border border-[#dce8e2] items-center justify-center" style={{ elevation: 2 }}>
            <Ionicons name="search-outline" size={40} color="#c4d4cc" />
          </View>
          <Text className="text-[16px] font-bold text-[#0d1f18]">{t("research.list.noData")}</Text>
          <Text className="text-[13px] text-[#8fa89f] text-center font-medium">{t("research.list.desc")}</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.id ?? index}`}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 36 }}
        />
      )}
    </SafeAreaView>
  );
}
