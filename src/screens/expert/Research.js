import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AppHeader from "../../components/AppHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import apiService from "../../services/api";

export const api = {
  getExpertGroups: async () => {
    const res = await apiService.get("/interests");
    return res.data?.data ?? res.data ?? [];
  },
  getInterests: async () => {
    const res = await apiService.get("/interests");
    return res.data?.data ?? res.data ?? [];
  },
  searchExperts: async (params) => {
    try {
      const res = await apiService.get("/lecturers", { params });
      return { data: res.data?.data ?? res.data ?? [] };
    } catch {
      return { data: [] };
    }
  },
};

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
  { id: "profile",       label: t("research.screen.editProfile"),    icon: "person-outline" },
  { id: "education",     label: t("research.screen.manageEducation"), icon: "school-outline" },
  { id: "work_history",  label: t("research.screen.manageWork"),      icon: "briefcase-outline" },
  { id: "admin_history", label: t("research.screen.manageAdmin"),     icon: "business-outline" },
];

const getExpertMenus = (t) => [
  { id: "expertise",      label: t("research.screen.manageExpertise"), icon: "flask-outline" },
  { id: "interest",       label: t("research.screen.manageInterest"),  icon: "bulb-outline" },
  { id: "research",       label: t("research.screen.manageResearch"),  icon: "bar-chart-outline" },
  { id: "journal",        label: t("research.screen.manageJournal"),   icon: "newspaper-outline" },
  { id: "proceeding",     label: t("research.screen.manageProceeding"),icon: "document-text-outline" },
  { id: "book",           label: t("research.screen.manageBook"),      icon: "library-outline" },
  { id: "patent",         label: t("research.screen.managePatent"),    icon: "ribbon-outline" },
  { id: "award",          label: t("research.screen.manageAward"),     icon: "trophy-outline" },
  { id: "speaker",        label: t("research.screen.manageSpeaker"),   icon: "mic-outline" },
  { id: "training",       label: t("research.screen.manageTraining"),  icon: "clipboard-outline" },
  { id: "service",        label: t("research.screen.manageService"),   icon: "people-outline" },
  { id: "human_subjects", label: t("research.screen.manageHuman"),     icon: "shield-checkmark-outline" },
];

const InlineDropdown = ({ value, options, placeholder, onSelect, loading, fullWidth }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);
  return (
    <View style={fullWidth ? { width: "100%" } : {}}>
      <TouchableOpacity
        className={`flex-row items-center rounded-[10px] px-[14px] py-3 gap-1 ${open ? "bg-[#e8f5ee] border-[1.5px] border-brand rounded-bl-none rounded-br-none" : "bg-[#f0f4f8]"}`}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#888" style={{ flex: 1 }} />
        ) : (
          <Text className="flex-1 text-[13px] text-[#1a1a2e]" style={!selected?.id ? { color: "#aaa" } : {}} numberOfLines={1}>
            {selected?.id ? selected.label : placeholder}
          </Text>
        )}
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color="#888" />
      </TouchableOpacity>
      {open && (
        <View className="bg-white border-[1.5px] border-t-0 border-brand rounded-bl-[10px] rounded-br-[10px] overflow-hidden max-h-[220px]">
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator bounces={false}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                className={`px-[14px] py-3 border-b border-[#f0f4f7] ${opt.id === value ? "bg-[#f0faf4]" : ""}`}
                onPress={() => { onSelect(opt.id); setOpen(false); }}
              >
                <View className="flex-row items-center">
                  <View className="w-5 items-center mr-[6px]">
                    {opt.id === value && <Ionicons name="checkmark" size={14} color="#1a6b3c" />}
                  </View>
                  <Text className={`flex-1 text-[13px] ${opt.id === value ? "text-brand font-semibold" : "text-[#444]"}`}>{opt.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const SearchSection = ({ onSearch }) => {
  const { t } = useTranslation();
  const SEARCH_BY_OPTIONS = getSearchByOptions(t);
  const [searchBy, setSearchBy] = useState("");
  const [keyword, setKeyword] = useState("");
  const [expertGroups, setExpertGroups] = useState([]);
  const [interests, setInterests] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedInterest, setSelectedInterest] = useState("");
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingInterests, setLoadingInterests] = useState(false);

  useEffect(() => {
    setLoadingGroups(true);
    api.getExpertGroups()
      .then((groups) => setExpertGroups([{ id: "", label: t("research.screen.allGroups") }, ...groups]))
      .catch(() => setExpertGroups([{ id: "", label: t("research.screen.allGroups") }]))
      .finally(() => setLoadingGroups(false));
  }, []);

  useEffect(() => {
    setLoadingInterests(true);
    api.getInterests()
      .then((data) => setInterests([{ id: "", label: t("research.screen.allInterests") }, ...data]))
      .catch(() => setInterests([{ id: "", label: t("research.screen.allInterests") }]))
      .finally(() => setLoadingInterests(false));
  }, []);

  return (
    <View className="bg-white rounded-2xl border border-[#e8ecf0]">
      <View className="flex-row items-center gap-2 px-4 py-3 bg-[#f8fafb] border-b border-[#e8ecf0] rounded-tl-2xl rounded-tr-2xl">
        <Ionicons name="search-outline" size={16} color="#1a6b3c" />
        <Text className="text-[13px] font-semibold text-[#1a1a2e]">{t("research.screen.searchTitle")}</Text>
      </View>
      <View className="p-[14px] gap-[10px]">
        <View className="gap-2">
          <Text className="text-[12px] font-semibold text-[#666]">{t("research.screen.searchByKeyword")}</Text>
          <InlineDropdown value={searchBy} options={SEARCH_BY_OPTIONS} placeholder={t("research.screen.selectSearchType")} onSelect={setSearchBy} fullWidth />
          <View className="flex-row items-center gap-2">
            <TextInput
              className="flex-1 bg-[#f0f4f8] rounded-[10px] px-3 py-3 text-[13px] text-[#1a1a2e]"
              placeholder={t("research.screen.keyword")}
              placeholderTextColor="#aaa"
              value={keyword}
              onChangeText={setKeyword}
              onSubmitEditing={() => onSearch({ searchBy, keyword })}
              returnKeyType="search"
            />
            <TouchableOpacity className="bg-brand rounded-[10px] px-4 py-3" onPress={() => onSearch({ searchBy, keyword })}>
              <Text className="text-white text-[13px] font-semibold">{t("research.screen.search")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center px-1 gap-2">
          <View className="flex-1 h-px bg-[#e8ecf0]" />
          <Text className="text-[12px] text-[#999]">{t("research.screen.or")}</Text>
          <View className="flex-1 h-px bg-[#e8ecf0]" />
        </View>

        <View className="gap-2">
          <Text className="text-[12px] font-semibold text-[#666]">{t("research.screen.searchByGroup")}</Text>
          <InlineDropdown value={selectedGroup} options={expertGroups} placeholder={t("research.screen.selectGroup")} onSelect={setSelectedGroup} loading={loadingGroups} fullWidth />
          <InlineDropdown value={selectedInterest} options={interests} placeholder={t("research.screen.selectInterest")} onSelect={setSelectedInterest} loading={loadingInterests} fullWidth />
          <TouchableOpacity
            className="flex-row items-center justify-center bg-brand rounded-[10px] py-[13px]"
            onPress={() => onSearch({ searchBy: "group", expertGroup: selectedGroup, interest: selectedInterest })}
          >
            <Ionicons name="search-outline" size={16} color="#fff" />
            <Text className="text-white text-[13px] font-semibold ml-1">{t("research.screen.search")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const MenuItem = ({ item, onPress }) => (
  <TouchableOpacity className="flex-row items-center justify-between px-4 py-[13px]" onPress={() => onPress(item)} activeOpacity={0.7}>
    <View className="flex-row items-center flex-1 gap-3">
      <View className="w-9 h-9 rounded-[10px] bg-[#eef7f2] items-center justify-center">
        <Ionicons name={item.icon} size={20} color="#1a6b3c" />
      </View>
      <Text className="text-[13px] text-[#1a1a2e] flex-1 leading-[18px]">{item.label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#ccc" />
  </TouchableOpacity>
);

const SectionCard = ({ title, sectionIcon, items, onPress }) => (
  <View className="bg-white rounded-2xl border border-[#e8ecf0] overflow-hidden">
    <View className="flex-row items-center gap-2 px-4 py-3 bg-[#f8fafb] border-b border-[#e8ecf0]">
      <Ionicons name={sectionIcon} size={16} color="#1a6b3c" />
      <Text className="text-[13px] font-semibold text-[#1a1a2e]">{title}</Text>
    </View>
    {items.map((item, index) => (
      <View key={item.id}>
        <MenuItem item={item} onPress={onPress} />
        {index < items.length - 1 && <View className="h-px bg-[#f0f4f7] ml-16" />}
      </View>
    ))}
  </View>
);

const Research = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const PERSONAL_MENUS = getPersonalMenus(t);
  const EXPERT_MENUS = getExpertMenus(t);

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
    <View className="flex-1 bg-[#eef2f7]">
      <AppHeader title="ระบบฐานข้อมูลผู้เชี่ยวชาญ (Expert)" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{ padding: 14, paddingBottom: 30 + insets.bottom, gap: 14 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SearchSection onSearch={(params) => navigation.navigate("ResearchList", { type: "search", title: t("research.screen.searchResult"), icon: "search-outline", searchParams: params })} />
        <SectionCard title={t("research.screen.personalInfo")} sectionIcon="pencil-outline" items={PERSONAL_MENUS} onPress={handleMenuPress} />
        <SectionCard title={t("research.screen.expertManage")} sectionIcon="folder-open-outline" items={EXPERT_MENUS} onPress={handleMenuPress} />
      </ScrollView>
    </View>
  );
};

export default Research;
