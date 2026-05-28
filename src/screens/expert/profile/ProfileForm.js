//แก้ไขประวัติส่วนตัว
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AppHeader from "../../../components/AppHeader";
import FormField from "../../../components/expert/FormField";
import InlineDropdown from "../../../components/expert/InlineDropdown";

const API_BASE = "https://your-api.example.com/api";

const ProfileForm = ({ navigation, route }) => {
  const { t } = useTranslation();
  const item = route.params?.item;

  const [form, setForm] = useState({
    id_card: item?.id_card || "",
    firstname_th: item?.firstname_th || "",
    lastname_th: item?.lastname_th || "",
    firstname_en: item?.firstname_en || "",
    lastname_en: item?.lastname_en || "",
    prefix: item?.prefix || "",
    position: item?.position || "",
    branch: item?.branch || "",
    line: item?.line || "",
    address: item?.address || "",
    moo: item?.moo || "",
    road: item?.road || "",
    tambon: item?.tambon || "",
    amphoe: item?.amphoe || "",
    province: item?.province || "",
    zipcode: item?.zipcode || "",
    phone_work: item?.phone_work || "",
    phone_mobile: item?.phone_mobile || "",
    email: item?.email || "",
    birthdate: item?.birthdate || "",
    main_unit: item?.main_unit || "",
    sub_unit: item?.sub_unit || "",
  });

  // ─── Dropdown options จาก DB ────────────
  const [options, setOptions] = useState({
    prefixes: [],
    positions: [],
    lines: [],
    mainUnits: [],
    subUnits: [],
  });
  const [loadingOptions, setLoadingOptions] = useState(true);

  const toOptions = (
    placeholderText,
    rows,
    idField = "id",
    labelField = "name",
  ) => [
    { id: "", label: placeholderText },
    ...rows.map((r) => ({ id: String(r[idField]), label: r[labelField] })),
  ];

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [pref, pos, ln, mu, su] = await Promise.all([
          fetch(`${API_BASE}/prefixes`).then((r) => r.json()),
          fetch(`${API_BASE}/positions`).then((r) => r.json()),
          fetch(`${API_BASE}/lines`).then((r) => r.json()),
          fetch(`${API_BASE}/main-units`).then((r) => r.json()),
          fetch(`${API_BASE}/sub-units`).then((r) => r.json()),
        ]);

        setOptions({
          prefixes: toOptions(t("research.profile.prefixPlaceholder"), pref),
          positions: toOptions(t("research.profile.positionPlaceholder"), pos),
          lines: toOptions(t("research.profile.linePlaceholder"), ln),
          mainUnits: toOptions(t("research.profile.mainUnitPlaceholder"), mu),
          subUnits: toOptions(t("research.profile.subUnitPlaceholder"), su),
        });
      } catch (err) {
        console.error(err);
        Alert.alert(
          t("research.profile.loadFail"),
          t("research.profile.loadFailMsg"),
        );
      } finally {
        setLoadingOptions(false);
      }
    };
    loadAll();
  }, []);

  // ถ้าต้องการให้ sub_unit ขึ้นกับ main_unit ให้โหลดใหม่ตอน main_unit เปลี่ยน
  useEffect(() => {
    if (!form.main_unit) return;
    fetch(`${API_BASE}/sub-units?main_unit_id=${form.main_unit}`)
      .then((r) => r.json())
      .then((rows) =>
        setOptions((p) => ({
          ...p,
          subUnits: toOptions(rows, "subUnits", "id", "name"),
        })),
      )
      .catch((err) => console.error(err));
  }, [form.main_unit]);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSave = () => {
    if (!form.firstname_th.trim() || !form.lastname_th.trim()) {
      Alert.alert(
        t("research.profile.validation"),
        t("research.profile.validationMsg"),
      );
      return;
    }
    Alert.alert(
      t("research.profile.saveSuccess"),
      t("research.common.savedMsg"),
      [{ text: t("research.profile.ok"), onPress: () => navigation.goBack() }],
    );
  };

  const handleReset = () => {
    Alert.alert(
      t("research.profile.resetConfirm"),
      t("research.profile.resetConfirmMsg"),
      [
        { text: t("research.common.cancel"), style: "cancel" },
        {
          text: t("research.profile.resetConfirm"),
          style: "destructive",
          onPress: () =>
            setForm((p) =>
              Object.keys(p).reduce((acc, k) => ({ ...acc, [k]: "" }), {}),
            ),
        },
      ],
    );
  };

  if (loadingOptions) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1a6b3c" />
        <Text style={{ marginTop: 12, color: "#1a6b3c" }}>
          {t("research.common.loading")}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <AppHeader
        title={t("research.profile.editTitle")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{t("research.profile.photo")}</Text>
            <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={18} color="#1a6b3c" />
              <Text style={styles.uploadText}>
                {t("research.profile.chooseFile")}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />

          <FormField
            label={t("research.profile.idCard")}
            value={form.id_card}
            onChangeText={(v) => set("id_card", v)}
            keyboardType="numeric"
          />
          <View style={styles.divider} />

          <FormField
            label={t("research.profile.firstnameTh")}
            value={form.firstname_th}
            onChangeText={(v) => set("firstname_th", v)}
            required
          />
          <View style={styles.divider} />
          <FormField
            label={t("research.profile.lastnameTh")}
            value={form.lastname_th}
            onChangeText={(v) => set("lastname_th", v)}
            required
          />
          <View style={styles.divider} />

          <FormField
            label={t("research.profile.firstnameEn")}
            value={form.firstname_en}
            onChangeText={(v) => set("firstname_en", v)}
          />
          <View style={styles.divider} />
          <FormField
            label={t("research.profile.lastnameEn")}
            value={form.lastname_en}
            onChangeText={(v) => set("lastname_en", v)}
          />
          <View style={styles.divider} />

          <InlineDropdown
            label={t("research.profile.prefix")}
            value={form.prefix}
            options={options.prefixes}
            onSelect={(v) => set("prefix", v)}
          />
          <View style={styles.divider} />

          <InlineDropdown
            label={t("research.profile.position")}
            value={form.position}
            options={options.positions}
            onSelect={(v) => set("position", v)}
          />
          <View style={styles.divider} />

          <FormField
            label={t("research.profile.branch")}
            value={form.branch}
            onChangeText={(v) => set("branch", v)}
          />
          <View style={styles.divider} />

          <InlineDropdown
            label={t("research.profile.line")}
            value={form.line}
            options={options.lines}
            onSelect={(v) => set("line", v)}
          />
          <View style={styles.divider} />

          <FormField
            label={t("research.profile.address")}
            value={form.address}
            onChangeText={(v) => set("address", v)}
          />
          <View style={styles.divider} />
          <FormField
            label={t("research.profile.moo")}
            value={form.moo}
            onChangeText={(v) => set("moo", v)}
            keyboardType="numeric"
          />
          <View style={styles.divider} />
          <FormField
            label={t("research.profile.road")}
            value={form.road}
            onChangeText={(v) => set("road", v)}
          />
          <View style={styles.divider} />
          <FormField
            label={t("research.profile.tambon")}
            value={form.tambon}
            onChangeText={(v) => set("tambon", v)}
          />
          <View style={styles.divider} />
          <FormField
            label={t("research.profile.amphoe")}
            value={form.amphoe}
            onChangeText={(v) => set("amphoe", v)}
          />
          <View style={styles.divider} />
          <FormField
            label={t("research.profile.province")}
            value={form.province}
            onChangeText={(v) => set("province", v)}
          />
          <View style={styles.divider} />
          <FormField
            label={t("research.profile.zipcode")}
            value={form.zipcode}
            onChangeText={(v) => set("zipcode", v)}
            keyboardType="numeric"
          />
          <View style={styles.divider} />

          <FormField
            label={t("research.profile.phoneWork")}
            value={form.phone_work}
            onChangeText={(v) => set("phone_work", v)}
            keyboardType="phone-pad"
          />
          <View style={styles.divider} />
          <FormField
            label={t("research.profile.phoneMobile")}
            value={form.phone_mobile}
            onChangeText={(v) => set("phone_mobile", v)}
            keyboardType="phone-pad"
          />
          <View style={styles.divider} />
          <FormField
            label={t("research.profile.email")}
            value={form.email}
            onChangeText={(v) => set("email", v)}
            keyboardType="email-address"
          />
          <View style={styles.divider} />
          <FormField
            label={t("research.profile.birthdate")}
            value={form.birthdate}
            onChangeText={(v) => set("birthdate", v)}
          />
          <View style={styles.divider} />

          <InlineDropdown
            label={t("research.profile.mainUnit")}
            value={form.main_unit}
            options={options.mainUnits}
            onSelect={(v) => {
              set("main_unit", v);
              set("sub_unit", "");
            }}
            searchable
          />
          <View style={styles.divider} />

          <InlineDropdown
            label={t("research.profile.subUnit")}
            value={form.sub_unit}
            options={options.subUnits}
            onSelect={(v) => set("sub_unit", v)}
            searchable
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>
                {t("research.profile.editTitle")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>
                {t("research.common.reset")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2f7" },
  center: { justifyContent: "center", alignItems: "center" },
  body: { padding: 14, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8ecf0",
    overflow: "hidden",
  },
  divider: { height: 1, backgroundColor: "#f0f4f7" },
  fieldWrap: { paddingHorizontal: 16, paddingVertical: 12 },
  fieldLabel: {
    fontSize: 12,
    color: "#1a6b3c",
    fontWeight: "600",
    marginBottom: 8,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f0f4f8",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  uploadText: { fontSize: 13, color: "#1a6b3c", fontWeight: "600" },
  btnRow: { flexDirection: "row", gap: 10, padding: 16 },
  saveBtn: {
    flex: 1,
    backgroundColor: "#1a6b3c",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  resetBtn: {
    backgroundColor: "#17a2b8",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 13,
    alignItems: "center",
  },
  resetBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});

export default ProfileForm;
