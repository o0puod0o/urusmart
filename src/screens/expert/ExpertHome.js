import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AppHeader from "../../components/AppHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import apiService from "../../services/api";
import useMenuCounts from "../../hook/useMenuCounts";
import { colors, radius } from "../../theme/tokens";
import {
  getExpertGroupSearchOptions,
  normalizeExpertGroupRows,
} from "../../constants/expertGroups";
import { sanitizeAcademicText } from "../../utils/inputSanitize";

const getSearchByOptions = (t) => [
  { id: "", label: t("research.screen.from") },
  { id: "firstname", label: t("research.screen.firstName") },
  { id: "lastname", label: t("research.screen.lastName") },
  { id: "expertise_group", label: t("research.screen.expertGroup") },
  { id: "interest", label: t("research.screen.interest") },
  { id: "research", label: t("research.screen.researchWork") },
  { id: "proceeding", label: "Proceeding" },
  { id: "journal", label: "Journal" },
];

const getPersonalMenus = (t) => [
  { id: "profile",       label: t("research.screen.editProfile"),    icon: "person-outline",    color: "#0f7a55", bg: "#e8f5ee" },
  { id: "education",     label: t("research.screen.manageEducation"), icon: "school-outline",    color: "#185fa5", bg: "#e8f0fb" },
  { id: "work_history",  label: t("research.screen.manageWork"),      icon: "briefcase-outline", color: "#c95b05", bg: "#fff3e0" },
  { id: "admin_history", label: t("research.screen.manageAdmin"),     icon: "business-outline",  color: "#4527a0", bg: "#ede7f6" },
];

const getExpertMenus = (t) => [
  { id: "expertise",      label: t("research.screen.manageExpertise"), icon: "flask-outline",            color: "#0f7a55", bg: "#e8f5ee" },
  { id: "interest",       label: t("research.screen.manageInterest"),  icon: "bulb-outline",             color: "#f57f17", bg: "#fff8e1" },
  { id: "research",       label: t("research.screen.manageResearch"),  icon: "bar-chart-outline",        color: "#185fa5", bg: "#e8f0fb" },
  { id: "journal",        label: t("research.screen.manageJournal"),   icon: "newspaper-outline",        color: "#00838f", bg: "#e0f7fa" },
  { id: "proceeding",     label: t("research.screen.manageProceeding"),icon: "document-text-outline",    color: "#4527a0", bg: "#ede7f6" },
  { id: "book",           label: t("research.screen.manageBook"),      icon: "library-outline",          color: "#2e7d32", bg: "#e8f5e9" },
  { id: "patent",         label: t("research.screen.managePatent"),    icon: "ribbon-outline",           color: "#7b1fa2", bg: "#f3e5f5" },
  { id: "award",          label: t("research.screen.manageAward"),     icon: "trophy-outline",           color: "#e65100", bg: "#fff3e0" },
  { id: "speaker",        label: t("research.screen.manageSpeaker"),   icon: "mic-outline",              color: "#c62828", bg: "#fce4ec" },
  { id: "training",       label: t("research.screen.manageTraining"),  icon: "clipboard-outline",        color: "#1565c0", bg: "#e3f2fd" },
  { id: "service",        label: t("research.screen.manageService"),   icon: "people-outline",           color: "#0f7a55", bg: "#e8f5ee" },
  { id: "human_subjects", label: t("research.screen.manageHuman"),     icon: "shield-checkmark-outline", color: "#bf360c", bg: "#fbe9e7" },
];

const cleanParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== ""),
  );

const ResearchDropdown = ({
  value,
  options,
  placeholder,
  onSelect,
  loading = false,
  searchable = false,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = useMemo(
    () => options.find((o) => String(o.id) === String(value) && o.id !== ""),
    [options, value],
  );

  const handleSelect = useCallback((id) => {
    onSelect(id);
    setSearch("");
    setOpen(false);
  }, [onSelect]);

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter(
      (option) =>
        String(option.label ?? "").toLowerCase().includes(q) ||
        String(option.id ?? "").toLowerCase().includes(q),
    );
  }, [options, search, searchable]);

  const renderOption = useCallback(
    (opt, index) => {
      const isSelected = String(opt.id) === String(value);
      const isPlaceholder = opt.id === "";

      return (
        <TouchableOpacity
          key={`${opt.id}-${index}`}
          className={`px-[14px] py-3 border-b border-[#f0f4f7] ${
            isSelected ? "bg-[#f0faf4]" : ""
          }`}
          onPress={() => handleSelect(opt.id)}
          activeOpacity={0.75}
        >
          <View className="flex-row items-center">
            <View className="w-5 items-center mr-[6px]">
              {isSelected && (
                <Ionicons name="checkmark" size={14} color={colors.primary} />
              )}
            </View>
            <Text
              className={`flex-1 text-[13px] ${
                isSelected
                  ? "text-brand font-semibold"
                  : isPlaceholder
                    ? "text-[#9aa6b1]"
                    : "text-[#444]"
              }`}
              numberOfLines={2}
            >
              {opt.label}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [handleSelect, value],
  );

  return (
    <View>
      <TouchableOpacity
        className={`flex-row items-center rounded-xl px-[14px] py-3 gap-1 ${
          open
            ? "bg-[#e8f5ee] border-[1.5px] border-brand"
            : "bg-[#f4f6f8] border border-[#e8ecf0]"
        }`}
        onPress={() => {
          if (!loading) {
            setSearch("");
            setOpen((prev) => !prev);
          }
        }}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#888" style={{ flex: 1 }} />
        ) : (
          <Text
            className="flex-1 text-[13px] text-[#1a1a2e]"
            style={!selected ? { color: "#aaa" } : {}}
            numberOfLines={1}
          >
            {selected ? selected.label : placeholder}
          </Text>
        )}
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={open || selected ? colors.primary : "#888"}
        />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <KeyboardAvoidingView
          className="flex-1 justify-center px-5"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ backgroundColor: "rgba(10, 20, 16, 0.28)" }}
        >
          <TouchableOpacity
            className="absolute inset-0"
            activeOpacity={1}
            onPress={() => setOpen(false)}
          />
          <View className="bg-white rounded-2xl overflow-hidden border border-[#d4ece2]">
            <View className="flex-row items-center px-4 py-3 bg-[#f0faf5] border-b border-[#d4ece2]">
              <Text
                className="flex-1 text-[14px] font-bold text-[#0a3d2a]"
                numberOfLines={1}
              >
                {selected ? selected.label : placeholder}
              </Text>
              <TouchableOpacity
                className="w-8 h-8 rounded-full items-center justify-center bg-white"
                onPress={() => setOpen(false)}
              >
                <Ionicons name="close" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {searchable && (
              <View className="flex-row items-center gap-2 px-3 py-3 bg-[#f8fafb] border-b border-[#edf3f0]">
                <View className="w-8 h-8 rounded-[10px] bg-[#e8f5ee] items-center justify-center">
                  <Ionicons name="search-outline" size={15} color={colors.primary} />
                </View>
                <TextInput
                  className="flex-1 text-[14px] text-[#1a1a2e] font-medium"
                  style={{ paddingVertical: 0 }}
                  placeholder={t("research.common.search")}
                  placeholderTextColor="#aab8b2"
                  value={search}
                  onChangeText={(text) => setSearch(sanitizeAcademicText(text))}
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                />
                {search.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearch("")}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={18} color="#9aa6b1" />
                  </TouchableOpacity>
                )}
              </View>
            )}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item, index }) => renderOption(item, index)}
              ListEmptyComponent={
                <View className="items-center py-8">
                  <Ionicons name="search-outline" size={28} color="#c4d4cc" />
                  <Text className="text-[13px] text-[#9aa6b1] font-semibold mt-2">
                    {t("research.common.notFound")}
                  </Text>
                </View>
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              bounces={false}
              initialNumToRender={16}
              maxToRenderPerBatch={16}
              updateCellsBatchingPeriod={16}
              windowSize={7}
              style={{ maxHeight: 360 }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const SearchSection = ({ onSearch }) => {
  const { t } = useTranslation();
  const SEARCH_BY_OPTIONS = getSearchByOptions(t);
  const fallbackExpertGroups = getExpertGroupSearchOptions(
    t("research.screen.selectGroupPlaceholder"),
  );
  const [searchBy, setSearchBy] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedInterest, setSelectedInterest] = useState("");
  const [expertGroups, setExpertGroups] = useState(fallbackExpertGroups);
  const [rawInterests, setRawInterests] = useState([]);
  const [loadingExpertGroups, setLoadingExpertGroups] = useState(true);
  const [loadingInterests, setLoadingInterests] = useState(true);
  const interestOptions = [{ id: "", label: t("research.screen.selectInterestPlaceholder") }, ...rawInterests];

  const normalizeInterestOptions = (rows) =>
    (Array.isArray(rows) ? rows : [])
      .map((interest) => {
        if (typeof interest === "string") {
          return { id: interest, label: interest };
        }

        const label =
          interest?.name ??
          interest?.label ??
          interest?.interest_name ??
          interest?.interest_name_th ??
          interest?.interest_name_en ??
          interest?.title;
        const id =
          interest?.id ??
          interest?.interest_id ??
          interest?.value ??
          label;

        return label ? { id, label } : null;
      })
      .filter(Boolean);

  const submitSearch = (params) => {
    const cleaned = cleanParams(params);
    if (__DEV__) console.log("[Research] profile-search params:", cleaned);
    onSearch(cleaned);
  };

  const runKeywordSearch = () => {
    submitSearch({
      search_by: searchBy,
      keyword: keyword.trim(),
    });
  };

  const runGroupSearch = () => {
    if (selectedInterest) {
      const selectedInterestOption = rawInterests.find(
        (interest) => String(interest.id) === String(selectedInterest),
      );
      submitSearch({
        search_by: "interest",
        keyword: selectedInterestOption?.label ?? selectedInterest,
      });
      return;
    }

    const selectedGroupOption = expertGroups.find(
      (group) => String(group.id) === String(selectedGroup),
    );

    submitSearch({
      expertise_group_id: selectedGroup,
      group_id: selectedGroup,
      expertise: selectedGroupOption?.label ?? "",
    });
  };

  useEffect(() => {
    Promise.allSettled([
      apiService.get("/ref/search-options"),
      apiService.get("/ref/expertise-groups"),
    ])
      .then(([searchOptionsResult, expertiseGroupsResult]) => {
        if (searchOptionsResult.status === "fulfilled") {
          const r = searchOptionsResult.value;
          const rows = r.data?.interests ?? r.data?.data ?? [];
          const options = normalizeInterestOptions(rows);
          if (options.length > 0) {
            setRawInterests(options);
          }
        }

        if (expertiseGroupsResult.status === "fulfilled") {
          const r = expertiseGroupsResult.value;
          const rows =
            r.data?.expertise_groups ??
            r.data?.groups ??
            r.data?.data ??
            r.data ??
            [];

          if (Array.isArray(rows) && rows.length > 0) {
            setExpertGroups(
              normalizeExpertGroupRows(
                rows,
                t("research.screen.selectGroupPlaceholder"),
              ),
            );
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoadingExpertGroups(false);
        setLoadingInterests(false);
      });
  }, []);

  return (
    <View className="bg-white rounded-2xl overflow-hidden border border-[#e8ecf0]">
      <LinearGradient colors={["#f0faf5", "#e8f5ee"]} style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#d4ece2" }}>
        <View className="flex-row items-center gap-2">
          <View className="w-7 h-7 rounded-[9px] bg-brand items-center justify-center">
            <Ionicons name="search-outline" size={15} color="#fff" />
          </View>
          <Text className="text-[13px] font-bold text-[#0a3d2a]">{t("research.screen.searchTitle")}</Text>
        </View>
      </LinearGradient>
      <View className="p-[14px] gap-[10px]">
        <View className="gap-2">
          <Text className="text-[11px] font-bold text-[#888] uppercase tracking-[0.5px]">{t("research.screen.searchByKeyword")}</Text>
          <ResearchDropdown
            value={searchBy}
            options={SEARCH_BY_OPTIONS}
            placeholder={t("research.screen.selectSearchType")}
            onSelect={setSearchBy}
          />
          <View className="flex-row items-center gap-2">
            <TextInput
              className="flex-1 bg-[#f4f6f8] border border-[#e8ecf0] rounded-xl px-3 py-3 text-[13px] text-[#1a1a2e]"
              placeholder={t("research.screen.keyword")}
              placeholderTextColor="#aaa"
              value={keyword}
              onChangeText={(text) => setKeyword(sanitizeAcademicText(text))}
              onSubmitEditing={runKeywordSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              className="px-4 py-3"
              style={{ backgroundColor: colors.primary, borderRadius: radius.md, minHeight: 48, justifyContent: "center" }}
              onPress={runKeywordSearch}
            >
              <Text className="text-white text-[13px] font-semibold">{t("research.screen.search")}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="flex-1 h-px bg-[#e8ecf0]" />
          <Text className="text-[11px] text-[#bbb] font-semibold">{t("research.screen.or")}</Text>
          <View className="flex-1 h-px bg-[#e8ecf0]" />
        </View>
        <View className="gap-2">
          <Text className="text-[11px] font-bold text-[#888] uppercase tracking-[0.5px]">{t("research.screen.searchByGroup")}</Text>
          <ResearchDropdown
            value={selectedGroup}
            options={expertGroups}
            placeholder={t("research.screen.selectGroupPlaceholder")}
            onSelect={(value) => {
              setSelectedGroup(value);
              if (value) setSelectedInterest("");
            }}
            loading={loadingExpertGroups}
            searchable
          />
          <ResearchDropdown
            value={selectedInterest}
            options={interestOptions}
            placeholder={t("research.screen.selectInterestPlaceholder")}
            onSelect={(value) => {
              setSelectedInterest(value);
              if (value) setSelectedGroup("");
            }}
            loading={loadingInterests}
            searchable
          />
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 bg-brand rounded-xl py-[13px]"
            onPress={runGroupSearch}
          >
            <Ionicons name="search-outline" size={16} color="#fff" />
            <Text className="text-white text-[13px] font-semibold">{t("research.screen.search")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const CountBadge = ({ count, color, bg, loading }) => {
  if (loading) {
    return (
      <View style={{ width: 28, height: 20, borderRadius: 10, backgroundColor: "#f0f0f0", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
        <ActivityIndicator size="small" color="#ccc" style={{ transform: [{ scale: 0.6 }] }} />
      </View>
    );
  }
  const display = count === null ? "—" : count === 0 ? "0" : String(count);
  return (
    <View style={{
      minWidth: 26, height: 20, borderRadius: 10,
      backgroundColor: bg, paddingHorizontal: 6,
      alignItems: "center", justifyContent: "center", marginRight: 8,
    }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color, letterSpacing: 0.2 }}>{display}</Text>
    </View>
  );
};

const MenuItem = ({ item, onPress, isLast, count, countLoading }) => (
  <TouchableOpacity
    className={`flex-row items-center justify-between px-4 py-[14px] ${!isLast ? "border-b border-[#f4f6f8]" : ""}`}
    onPress={() => onPress(item)}
    activeOpacity={0.7}
  >
    <View className="flex-row items-center flex-1 gap-3">
      <View className="w-[38px] h-[38px] rounded-xl items-center justify-center" style={{ backgroundColor: item.bg }}>
        <Ionicons name={item.icon} size={19} color={item.color} />
      </View>
      <Text className="text-[13px] font-semibold text-[#1a1a2e] flex-1 leading-5">{item.label}</Text>
    </View>
    <View className="flex-row items-center">
      {count !== undefined && (
        <CountBadge count={count} color={item.color} bg={item.bg} loading={countLoading} />
      )}
      <View className="w-7 h-7 rounded-full bg-[#f4f6f8] items-center justify-center">
        <Ionicons name="chevron-forward" size={14} color="#bbb" />
      </View>
    </View>
  </TouchableOpacity>
);

const SectionCard = ({ title, sectionIcon, gradColors, items, onPress, counts, countLoading }) => (
  <View className="bg-white rounded-2xl overflow-hidden border border-[#e8ecf0]">
    <LinearGradient colors={gradColors} style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#e8ecf0" }}>
      <View className="flex-row items-center gap-2">
        <View className="w-7 h-7 rounded-[9px] bg-white/30 items-center justify-center">
          <Ionicons name={sectionIcon} size={15} color="#fff" />
        </View>
        <Text className="text-[13px] font-bold text-white">{title}</Text>
        <View className="ml-auto bg-white/25 rounded-full px-2 py-[2px]">
          <Text className="text-white text-[11px] font-bold">{items.length}</Text>
        </View>
      </View>
    </LinearGradient>
    {items.map((item, index) => (
      <MenuItem
        key={item.id}
        item={item}
        onPress={onPress}
        isLast={index === items.length - 1}
        count={counts ? counts[item.id] : undefined}
        countLoading={countLoading}
      />
    ))}
  </View>
);

const ExpertHome = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const PERSONAL_MENUS = getPersonalMenus(t);
  const EXPERT_MENUS = getExpertMenus(t);
  const { counts, loading: countsLoading, refetch: refetchCounts } = useMenuCounts();

  useFocusEffect(
    useCallback(() => {
      refetchCounts();
    }, [refetchCounts]),
  );

  const handleMenuPress = (item) => {
    const routes = {
      profile: () => navigation.navigate("ProfileForm", { item: null }),
      education: () => navigation.navigate("EducationForm"),
      work_history: () => navigation.navigate("WorkHistoryForm"),
      admin_history: () => navigation.navigate("AdminHistoryForm"),
      expertise: () => navigation.navigate("ExpertiseForm", { item: null }),
      interest: () => navigation.navigate("InterestForm", { item: null }),
      journal: () => navigation.navigate("JournalForm", { item: null }),
      proceeding: () => navigation.navigate("ProceedingForm", { item: null }),
      book: () => navigation.navigate("BookForm", { item: null }),
      patent: () => navigation.navigate("PatentForm", { item: null }),
      award: () => navigation.navigate("AwardForm", { item: null }),
      speaker: () => navigation.navigate("SpeakerForm", { item: null }),
      training: () => navigation.navigate("TrainingForm", { item: null }),
      service: () => navigation.navigate("ServiceForm", { item: null }),
      human_subjects: () => navigation.navigate("HumanSubjectsForm", { item: null }),
    };
    if (routes[item.id]) { routes[item.id](); return; }
    navigation.navigate("ResearchForm", { type: item.id, title: item.label, icon: item.icon });
  };

  return (
    <View className="flex-1 bg-[#eaf5ef]">
      <AppHeader title={t("research.screen.expertDb")} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{ padding: 14, paddingBottom: 30 + insets.bottom, gap: 14 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SearchSection onSearch={(params) => navigation.navigate("ResearchList", { type: "search", title: t("research.screen.searchResult"), icon: "search-outline", searchParams: params })} />
        <SectionCard
          title={t("research.screen.personalInfo")}
          sectionIcon="person-outline"
          gradColors={["#1a9068", "#0f7a55"]}
          items={PERSONAL_MENUS}
          onPress={handleMenuPress}
          counts={counts}
          countLoading={countsLoading}
        />
        <SectionCard
          title={t("research.screen.expertManage")}
          sectionIcon="folder-open-outline"
          gradColors={["#064e35", "#0a6644"]}
          items={EXPERT_MENUS}
          onPress={handleMenuPress}
          counts={counts}
          countLoading={countsLoading}
        />
      </ScrollView>
    </View>
  );
};

export default ExpertHome;
