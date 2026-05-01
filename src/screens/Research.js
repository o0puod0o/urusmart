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
import AppHeader from "../components/AppHeader";

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
    const res = await fetch(`${BASE_URL}/api/experts/search?${query}`);
    if (!res.ok) throw new Error("search failed");
    return res.json();
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
  { id: "profile", label: "แก้ไขประวัติส่วนตัว", icon: "👤" },
  { id: "education", label: "จัดการข้อมูลประวัติการศึกษา", icon: "🎓" },
  { id: "work_history", label: "จัดการข้อมูลประวัติการทำงาน", icon: "💼" },
  { id: "admin_history", label: "จัดการข้อมูลประวัติการบริหาร", icon: "🏛️" },
];

const EXPERT_MENUS = [
  { id: "expertise", label: "จัดการข้อมูลความเชี่ยวชาญ", icon: "🔬" },
  { id: "interest", label: "จัดการข้อมูลความสนใจ", icon: "💡" },
  { id: "research", label: "จัดการข้อมูลผลงานวิจัย", icon: "📊" },
  {
    id: "journal",
    label: "จัดการข้อมูลบทความวิจัย/วิชาการ (Journal)",
    icon: "📰",
  },
  {
    id: "proceeding",
    label: "จัดการข้อมูลบทความวิจัย/วิชาการ (Proceeding)",
    icon: "📄",
  },
  {
    id: "book",
    label: "จัดการข้อมูลหนังสือ/ตำรา/เอกสารประกอบการสอน",
    icon: "📚",
  },
  { id: "patent", label: "จัดการข้อมูลทรัพย์สินทางปัญญา", icon: "💎" },
  { id: "award", label: "จัดการข้อมูลรางวัล", icon: "🏆" },
  { id: "speaker", label: "จัดการข้อมูลวิทยากร", icon: "🎤" },
  { id: "training", label: "ประวัติการฝึกอบรม/ศึกษาดูงาน", icon: "📋" },
  {
    id: "service",
    label: "จัดการข้อมูลการบริการวิชาการ/พันธกิจสัมพันธ์",
    icon: "🤝",
  },
  {
    id: "human_subjects",
    label: "จัดการข้อมูล Human Subjects Protection Standard Course",
    icon: "🛡️",
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
    <View style={[fullWidth && { width: "100%" }]}>
      {/* ปุ่มกด */}
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
        {/* ลูกศรหมุนเมื่อเปิด */}
        <Text
          style={[
            styles.dropdownArrow,
            open && { transform: [{ rotate: "180deg" }] },
          ]}
        >
          ⌄
        </Text>
      </TouchableOpacity>

      {/* List ขยายลงข้างล่าง inline (ไม่ใช้ absolute) */}
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
                  {opt.id === value && (
                    <Text style={styles.dropdownCheck}>✓</Text>
                  )}
                  <Text
                    style={[
                      styles.dropdownItemText,
                      opt.id === value && styles.dropdownItemTextActive,
                      opt.id === value ? { marginLeft: 0 } : { marginLeft: 20 },
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
        // mock ไว้ก่อน API พร้อม — เหมือนเว็บเลย
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
        // ความสนใจดึงจาก DB จริง ใส่ทั้งหมดไว้ก่อน
        setInterests([{ id: "", label: "ความสนใจทั้งหมด" }]);
      } finally {
        setLoadingInterests(false);
      }
    };
    load();
  }, []);

  // ✅ handlers อยู่ก่อน return
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

  // ✅ return เดียว
  return (
    <View style={styles.searchCard}>
      <Text style={styles.cardTitle}>🔍 สืบค้นข้อมูลผู้เชี่ยวชาญ</Text>

      <View style={styles.searchBody}>
        {/* Block 1: ค้นหาด้วยคำค้น */}
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

        {/* Block 2: ค้นหาตามกลุ่ม */}
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
            <Text style={styles.searchBtnText}>🔍 ค้นหา</Text>
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
        <Text style={styles.menuIcon}>{item.icon}</Text>
      </View>
      <Text style={styles.menuLabel}>{item.label}</Text>
    </View>
    <Text style={styles.chevron}>›</Text>
  </TouchableOpacity>
);

const SectionCard = ({ title, items, onPress }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
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
    navigation.navigate("ResearchList", {
      type: item.id,
      title: item.label,
      icon: item.icon,
    });
  };

  const handleSearch = (params) => {
    navigation.navigate("ResearchList", {
      type: "search",
      title: "ผลการค้นหา",
      icon: "🔍",
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
          title="✏️  ข้อมูลส่วนตัว"
          items={PERSONAL_MENUS}
          onPress={handleMenuPress}
        />
        <SectionCard
          title="📁  จัดการข้อมูลผู้เชี่ยวชาญ"
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
    zIndex: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a2e",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f8fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecf0",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 4,
  },
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
  dropdownItemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownCheck: {
    fontSize: 13,
    color: "#1a6b3c",
    fontWeight: "700",
    marginRight: 6,
    width: 14,
  },
  dropdownItemActive: {
    backgroundColor: "#f0faf4",
  },
  dropdownItemText: {
    fontSize: 13,
    color: "#444",
  },
  dropdownItemTextActive: {
    color: "#1a6b3c",
    fontWeight: "600",
  },
  orLine: { flex: 1, height: 1, backgroundColor: "#e8ecf0" },
  orText: { fontSize: 12, color: "#999" },
  searchInput: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#1a1a2e",
  },
  searchBtn: {
    backgroundColor: "#1a6b3c",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchBtnFull: {
    backgroundColor: "#1a6b3c",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
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
    backgroundColor: "#f0f4f8",
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: { fontSize: 18 },
  menuLabel: { fontSize: 13, color: "#1a1a2e", flex: 1, lineHeight: 18 },
  chevron: { fontSize: 22, color: "#ccc", fontWeight: "300" },
  divider: { height: 1, backgroundColor: "#f0f4f7", marginLeft: 64 },
});

export default Research;
