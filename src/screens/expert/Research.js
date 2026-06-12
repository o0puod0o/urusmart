import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AppHeader from "../../components/AppHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import apiService from "../../services/api";

// ── กลุ่มความเชี่ยวชาญ (hardcoded — id ตรงกับค่าที่ backend รับ) ──
const EXPERT_GROUPS = [
  { id: "", label: "กรุณาเลือกกลุ่มความเชี่ยวชาญ" },
  { id: "กลุ่มครุศาสตร์ ศึกษาศาสตร์พลศึกษา และพลศึกษา", label: "กลุ่มครุศาสตร์ ศึกษาศาสตร์พลศึกษา และพลศึกษา" },
  { id: "กลุ่มบริหาร พาณิชยศาสตร์ การบัญชี การท่องเที่ยวและโรงแรม เศรษฐศาสตร์", label: "กลุ่มบริหาร พาณิชยศาสตร์ การบัญชี การท่องเที่ยวและโรงแรม เศรษฐศาสตร์" },
  { id: "กลุ่มมนุษยศาสตร์และสังคมศาสตร์", label: "กลุ่มมนุษยศาสตร์และสังคมศาสตร์" },
  { id: "กลุ่มวิชาวิทยาศาสตร์กายภาพและชีวภาพ", label: "กลุ่มวิชาวิทยาศาสตร์กายภาพและชีวภาพ" },
  { id: "กลุ่มวิทยาศาสตร์สุขภาพ", label: "กลุ่มวิทยาศาสตร์สุขภาพ" },
  { id: "กลุ่มวิศวกรรมศาสตร์", label: "กลุ่มวิศวกรรมศาสตร์" },
  { id: "กลุ่มศิลปกรรมศาสตร์", label: "กลุ่มศิลปกรรมศาสตร์" },
  { id: "กลุ่มสถาปัตยกรรมศาสตร์", label: "กลุ่มสถาปัตยกรรมศาสตร์" },
  { id: "กลุ่มเกษตรศาสตร์", label: "กลุ่มเกษตรศาสตร์" },
];

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

const InlineDropdown = ({ value, options, placeholder, onSelect, loading, fullWidth }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);
  return (
    <View style={fullWidth ? { width: "100%" } : {}}>
      <TouchableOpacity
        className={`flex-row items-center rounded-xl px-[14px] py-3 gap-1 ${open ? "bg-[#e8f5ee] border-[1.5px] border-brand" : "bg-[#f4f6f8] border border-[#e8ecf0]"}`}
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
        <View className="bg-white border-[1.5px] border-t-0 border-brand rounded-bl-xl rounded-br-xl overflow-hidden max-h-[220px]">
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
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedInterest, setSelectedInterest] = useState("");
  const [interests, setInterests] = useState([{ id: "", label: "กรุณาเลือกความสนใจ" }]);
  const [loadingInterests, setLoadingInterests] = useState(true);

  useEffect(() => {
    apiService.get("/ref/search-options")
      .then((r) => {
        const rows = r.data?.interests ?? r.data?.data ?? [];
        if (rows.length > 0) {
          setInterests([{ id: "", label: "กรุณาเลือกความสนใจ" }, ...rows.map((i) => ({ id: i.name ?? i.id, label: i.name }))]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingInterests(false));
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
          <InlineDropdown value={searchBy} options={SEARCH_BY_OPTIONS} placeholder={t("research.screen.selectSearchType")} onSelect={setSearchBy} fullWidth />
          <View className="flex-row items-center gap-2">
            <TextInput
              className="flex-1 bg-[#f4f6f8] border border-[#e8ecf0] rounded-xl px-3 py-3 text-[13px] text-[#1a1a2e]"
              placeholder={t("research.screen.keyword")}
              placeholderTextColor="#aaa"
              value={keyword}
              onChangeText={setKeyword}
              onSubmitEditing={() => onSearch({ expertise_group: selectedGroup || "all", interest: selectedInterest || "all", keyword })}
              returnKeyType="search"
            />
            <TouchableOpacity className="bg-brand rounded-xl px-4 py-3" onPress={() => onSearch({ expertise_group: selectedGroup || "all", interest: selectedInterest || "all", keyword })}>
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
          <InlineDropdown value={selectedGroup} options={EXPERT_GROUPS} placeholder={t("research.screen.selectGroup")} onSelect={setSelectedGroup} fullWidth />
          <InlineDropdown value={selectedInterest} options={interests} placeholder={t("research.screen.selectInterest")} onSelect={setSelectedInterest} loading={loadingInterests} fullWidth />
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 bg-brand rounded-xl py-[13px]"
            onPress={() => onSearch({ expertise_group: selectedGroup || "all", interest: selectedInterest || "all" })}
          >
            <Ionicons name="search-outline" size={16} color="#fff" />
            <Text className="text-white text-[13px] font-semibold">{t("research.screen.search")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const MenuItem = ({ item, onPress, isLast }) => (
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
    <View className="w-7 h-7 rounded-full bg-[#f4f6f8] items-center justify-center">
      <Ionicons name="chevron-forward" size={14} color="#bbb" />
    </View>
  </TouchableOpacity>
);

const SectionCard = ({ title, sectionIcon, gradColors, items, onPress }) => (
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
      <MenuItem key={item.id} item={item} onPress={onPress} isLast={index === items.length - 1} />
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
    <View className="flex-1 bg-[#eaf5ef]">
      <AppHeader title="ระบบฐานข้อมูลผู้เชี่ยวชาญ" onBack={() => navigation.goBack()} />
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
        />
        <SectionCard
          title={t("research.screen.expertManage")}
          sectionIcon="folder-open-outline"
          gradColors={["#064e35", "#0a6644"]}
          items={EXPERT_MENUS}
          onPress={handleMenuPress}
        />
      </ScrollView>
    </View>
  );
};

export default Research;
