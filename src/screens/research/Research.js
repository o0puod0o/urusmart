import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";

const BASE_URL = "https://your-api.example.com";

export const api = {
  getExpertGroups: async () => {
    const res = await fetch(`${BASE_URL}/api/expert-groups`);
    if (!res.ok) throw new Error("fetch expert groups failed");
    return res.json();
  },
  getInterests: async () => {
    const res = await fetch(`${BASE_URL}/api/interests`);
    if (!res.ok) throw new Error("fetch interests failed");
    return res.json();
  },
  searchExperts: async (params) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await fetch(`${BASE_URL}/api/experts/search?${query}`);
      if (!res.ok) throw new Error("search failed");
      return res.json();
    } catch {
      return { data: [] };
    }
  },
};

const SEARCH_BY_OPTIONS = [
  { id: "", label: "ค้นหาจาก" },
  { id: "firstname", label: "ชื่อ" },
  { id: "lastname", label: "นามสกุล" },
  { id: "expertise_group", label: "กลุ่มความเชี่ยวชาญ" },
  { id: "interest", label: "ความสนใจ" },
  { id: "research", label: "ผลงานวิจัย" },
  { id: "proceeding", label: "Proceeding" },
  { id: "journal", label: "Journal" },
];

const PERSONAL_MENUS = [
  { id: "profile", label: "แก้ไขประวัติส่วนตัว", icon: "person-outline" },
  {
    id: "education",
    label: "จัดการข้อมูลประวัติการศึกษา",
    icon: "school-outline",
  },
  {
    id: "work_history",
    label: "จัดการข้อมูลประวัติการทำงาน",
    icon: "briefcase-outline",
  },
  {
    id: "admin_history",
    label: "จัดการข้อมูลประวัติการบริหาร",
    icon: "business-outline",
  },
];

const EXPERT_MENUS = [
  {
    id: "expertise",
    label: "จัดการข้อมูลความเชี่ยวชาญ",
    icon: "flask-outline",
  },
  { id: "interest", label: "จัดการข้อมูลความสนใจ", icon: "bulb-outline" },
  {
    id: "research",
    label: "จัดการข้อมูลผลงานวิจัย",
    icon: "bar-chart-outline",
  },
  {
    id: "journal",
    label: "จัดการข้อมูลบทความวิจัย/วิชาการ (Journal)",
    icon: "newspaper-outline",
  },
  {
    id: "proceeding",
    label: "จัดการข้อมูลบทความวิจัย/วิชาการ (Proceeding)",
    icon: "document-text-outline",
  },
  {
    id: "book",
    label: "จัดการข้อมูลหนังสือ/ตำรา/เอกสารประกอบการสอน",
    icon: "library-outline",
  },
  {
    id: "patent",
    label: "จัดการข้อมูลทรัพย์สินทางปัญญา",
    icon: "ribbon-outline",
  },
  { id: "award", label: "จัดการข้อมูลรางวัล", icon: "trophy-outline" },
  { id: "speaker", label: "จัดการข้อมูลวิทยากร", icon: "mic-outline" },
  {
    id: "training",
    label: "ประวัติการฝึกอบรม/ศึกษาดูงาน",
    icon: "clipboard-outline",
  },
  {
    id: "service",
    label: "จัดการข้อมูลการบริการวิชาการ/พันธกิจสัมพันธ์",
    icon: "people-outline",
  },
  {
    id: "human_subjects",
    label: "จัดการข้อมูล Human Subjects Protection Standard Course",
    icon: "shield-checkmark-outline",
  },
];

// ─── InlineDropdown ───────────────────────
const InlineDropdown = ({
  value,
  options,
  placeholder,
  onSelect,
  loading,
  fullWidth,
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <View style={fullWidth && { width: "100%" }}>
      <TouchableOpacity
        style={[styles.dropdown, open && styles.dropdownOpen]}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#888" style={{ flex: 1 }} />
        ) : (
          <Text
            style={[styles.dropdownText, !selected?.id && { color: "#aaa" }]}
            numberOfLines={1}
          >
            {selected?.id ? selected.label : placeholder}
          </Text>
        )}
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color="#888"
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownInlineList}>
          <ScrollView
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            bounces={false}
          >
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.dropdownItem,
                  opt.id === value && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  onSelect(opt.id);
                  setOpen(false);
                }}
              >
                <View style={styles.dropdownItemRow}>
                  <View style={styles.dropdownCheckBox}>
                    {opt.id === value && (
                      <Ionicons name="checkmark" size={14} color="#1a6b3c" />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.dropdownItemText,
                      opt.id === value && styles.dropdownItemTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// ─── SearchSection ────────────────────────
const SearchSection = ({ onSearch }) => {
  const [searchBy, setSearchBy] = useState("");
  const [keyword, setKeyword] = useState("");
  const [expertGroups, setExpertGroups] = useState([]);
  const [interests, setInterests] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedInterest, setSelectedInterest] = useState("");
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingInterests, setLoadingInterests] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingGroups(true);
        const groups = await api.getExpertGroups();
        setExpertGroups([
          { id: "", label: "กลุ่มความเชี่ยวชาญทั้งหมด" },
          ...groups,
        ]);
      } catch {
        setExpertGroups([
          { id: "", label: "กลุ่มความเชี่ยวชาญทั้งหมด" },
          { id: "1", label: "กลุ่มครุศาสตร์ ศึกษาศาสตร์พลศึกษา และพลศึกษา" },
          {
            id: "2",
            label:
              "กลุ่มบริหาร พาณิชยศาสตร์ การบัญชี การท่องเที่ยวและโรงแรม เศรษฐศาสตร์",
          },
          { id: "3", label: "กลุ่มมนุษยศาสตร์และสังคมศาสตร์" },
          { id: "4", label: "กลุ่มวิชาวิทยาศาสตร์กายภาพและชีวภาพ" },
          { id: "5", label: "กลุ่มวิทยาศาสตร์สุขภาพ" },
          { id: "6", label: "กลุ่มวิศวกรรมศาสตร์" },
          { id: "7", label: "กลุ่มศิลปกรรมศาสตร์" },
        ]);
      } finally {
        setLoadingGroups(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingInterests(true);
        const data = await api.getInterests();
        setInterests([{ id: "", label: "ความสนใจทั้งหมด" }, ...data]);
      } catch {
        setInterests([{ id: "", label: "ความสนใจทั้งหมด" }]);
      } finally {
        setLoadingInterests(false);
      }
    };
    load();
  }, []);

  const handleKeywordSearch = () => {
    onSearch({ searchBy, keyword });
  };

  const handleGroupSearch = () => {
    onSearch({
      searchBy: "group",
      expertGroup: selectedGroup,
      interest: selectedInterest,
    });
  };

  return (
    <View style={styles.searchCard}>
      {/* Header */}
      <View style={styles.cardTitleRow}>
        <Ionicons name="search-outline" size={16} color="#1a6b3c" />
        <Text style={styles.cardTitle}>สืบค้นข้อมูลผู้เชี่ยวชาญ</Text>
      </View>

      <View style={styles.searchBody}>
        {/* Block 1 */}
        <View style={styles.searchBlock}>
          <Text style={styles.blockLabel}>ค้นหาด้วยคำค้น</Text>
          <InlineDropdown
            value={searchBy}
            options={SEARCH_BY_OPTIONS}
            placeholder="เลือกประเภทการค้นหา"
            onSelect={setSearchBy}
            fullWidth
          />
          <View style={styles.inputRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="ระบุคำค้น..."
              placeholderTextColor="#aaa"
              value={keyword}
              onChangeText={setKeyword}
              onSubmitEditing={handleKeywordSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={handleKeywordSearch}
            >
              <Text style={styles.searchBtnText}>ค้นหา</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>หรือ</Text>
          <View style={styles.orLine} />
        </View>

        {/* Block 2 */}
        <View style={styles.searchBlock}>
          <Text style={styles.blockLabel}>ค้นหาตามกลุ่มความเชี่ยวชาญ</Text>
          <InlineDropdown
            value={selectedGroup}
            options={expertGroups}
            placeholder="เลือกกลุ่มความเชี่ยวชาญ"
            onSelect={setSelectedGroup}
            loading={loadingGroups}
            fullWidth
          />
          <InlineDropdown
            value={selectedInterest}
            options={interests}
            placeholder="เลือกความสนใจ"
            onSelect={setSelectedInterest}
            loading={loadingInterests}
            fullWidth
          />
          <TouchableOpacity
            style={styles.searchBtnFull}
            onPress={handleGroupSearch}
          >
            <Ionicons name="search-outline" size={16} color="#fff" />
            <Text style={styles.searchBtnText}> ค้นหา</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ─── MenuItem / SectionCard ───────────────
const MenuItem = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={() => onPress(item)}
    activeOpacity={0.7}
  >
    <View style={styles.menuLeft}>
      <View style={styles.iconBox}>
        <Ionicons name={item.icon} size={20} color="#1a6b3c" />
      </View>
      <Text style={styles.menuLabel}>{item.label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#ccc" />
  </TouchableOpacity>
);

const SectionCard = ({ title, sectionIcon, items, onPress }) => (
  <View style={styles.card}>
    <View style={styles.cardTitleRow}>
      <Ionicons name={sectionIcon} size={16} color="#1a6b3c" />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {items.map((item, index) => (
      <View key={item.id}>
        <MenuItem item={item} onPress={onPress} />
        {index < items.length - 1 && <View style={styles.divider} />}
      </View>
    ))}
  </View>
);

// ─── Main Screen ──────────────────────────
const Research = ({ navigation }) => {
  const handleMenuPress = (item) => {
    if (item.id === "profile") {
      navigation.navigate("ProfileForm", { item: null });
      return;
    }
    if (item.id === "education") {
      navigation.navigate("EducationForm");
      return;
    }
    if (item.id === "work_history") {
      navigation.navigate("WorkHistoryForm");
      return;
    }
    if (item.id === "admin_history") {
      navigation.navigate("AdminHistoryForm");
      return;
    }
    if (item.id === "expertise") {
      navigation.navigate("ExpertiseForm", { item: null });
      return;
    }
    if (item.id === "interest") {
      navigation.navigate("InterestForm", { item: null });
      return;
    }
    if (item.id === "journal") {
      navigation.navigate("JournalForm", { item: null });
      return;
    }
    if (item.id === "proceeding") {
      navigation.navigate("ProceedingForm", { item: null });
      return;
    }
    if (item.id === "book") {
      navigation.navigate("BookForm", { item: null });
      return;
    }
    if (item.id === "patent") {
      navigation.navigate("PatentForm", { item: null });
      return;
    }
    if (item.id === "award") {
      navigation.navigate("AwardForm", { item: null });
      return;
    }
    if (item.id === "speaker") {
      navigation.navigate("SpeakerForm", { item: null });
      return;
    }
    if (item.id === "training") {
      navigation.navigate("TrainingForm", { item: null });
      return;
    }
    if (item.id === "service") {
      navigation.navigate("ServiceForm", { item: null });
      return;
    }
    if (item.id === "human_subjects") {
      navigation.navigate("HumanSubjectsForm", { item: null });
      return;
    }
    navigation.navigate("ResearchForm", {
      type: item.id,
      title: item.label,
      icon: item.icon,
    });
  };

  const handleSearch = (params) => {
    navigation.navigate("ResearchList", {
      type: "search",
      title: "ผลการค้นหา",
      icon: "search-outline",
      searchParams: params,
    });
  };

  return (
    <View style={styles.container}>
      <AppHeader title="e-Research" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SearchSection onSearch={handleSearch} />
        <SectionCard
          title="ข้อมูลส่วนตัว"
          sectionIcon="pencil-outline"
          items={PERSONAL_MENUS}
          onPress={handleMenuPress}
        />
        <SectionCard
          title="จัดการข้อมูลผู้เชี่ยวชาญ"
          sectionIcon="folder-open-outline"
          items={EXPERT_MENUS}
          onPress={handleMenuPress}
        />
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2f7" },
  body: { padding: 14, paddingBottom: 30, gap: 14 },

  searchCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8ecf0",
    paddingBottom: 12,
    overflow: "visible",
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f8fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecf0",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a2e",
  },

  searchBody: { padding: 14, gap: 10 },
  searchBlock: { gap: 8 },
  blockLabel: { fontSize: 12, fontWeight: "600", color: "#666" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },

  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  dropdownOpen: {
    backgroundColor: "#e8f5ee",
    borderWidth: 1.5,
    borderColor: "#1a6b3c",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownText: { fontSize: 13, color: "#1a1a2e", flex: 1 },
  dropdownInlineList: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: "#1a6b3c",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: "hidden",
    maxHeight: 220,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f7",
  },
  dropdownItemRow: { flexDirection: "row", alignItems: "center" },
  dropdownCheckBox: {
    width: 20,
    alignItems: "center",
    marginRight: 6,
  },
  dropdownItemActive: { backgroundColor: "#f0faf4" },
  dropdownItemText: { fontSize: 13, color: "#444", flex: 1 },
  dropdownItemTextActive: { color: "#1a6b3c", fontWeight: "600" },

  orRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    gap: 8,
  },
  orLine: { flex: 1, height: 1, backgroundColor: "#e8ecf0" },
  orText: { fontSize: 12, color: "#999" },

  searchInput: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 13,
    color: "#1a1a2e",
  },
  searchBtn: {
    backgroundColor: "#1a6b3c",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBtnFull: {
    backgroundColor: "#1a6b3c",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  searchBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8ecf0",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  menuLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#eef7f2",
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { fontSize: 13, color: "#1a1a2e", flex: 1, lineHeight: 18 },
  divider: { height: 1, backgroundColor: "#f0f4f7", marginLeft: 64 },
});

export default Research;
