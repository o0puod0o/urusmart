import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AppHeader from "../../../components/AppHeader";
import FormField from "../../../components/expert/FormField";
import InlineDropdown from "../../../components/expert/InlineDropdown";
import api from "../../../services/api";

const ProfileForm = ({ navigation, route }) => {
  const { t } = useTranslation();
  const item = route.params?.item;

  const [form, setForm] = useState({
    id_card: item?.id_card || "", firstname_th: item?.firstname_th || "", lastname_th: item?.lastname_th || "",
    firstname_en: item?.firstname_en || "", lastname_en: item?.lastname_en || "",
    prefix: item?.prefix || "", position: item?.position || "", branch: item?.branch || "",
    line: item?.line || "", address: item?.address || "", moo: item?.moo || "",
    road: item?.road || "", tambon: item?.tambon || "", amphoe: item?.amphoe || "",
    province: item?.province || "", zipcode: item?.zipcode || "",
    phone_work: item?.phone_work || "", phone_mobile: item?.phone_mobile || "",
    email: item?.email || "", birthdate: item?.birthdate || "",
    main_unit: item?.main_unit || "", sub_unit: item?.sub_unit || "",
  });

  const [options, setOptions] = useState({ prefixes: [], positions: [], lines: [], mainUnits: [], subUnits: [] });
  const [loadingOptions, setLoadingOptions] = useState(true);

  const toOptions = (placeholder, rows, idField = "id", labelField = "name") => [
    { id: "", label: placeholder },
    ...rows.map((r) => ({ id: String(r[idField]), label: r[labelField] })),
  ];

  useEffect(() => {
    const loadAll = async () => {
      const safe = (r) => (r.status === "fulfilled" ? (r.value?.data?.data ?? r.value?.data ?? []) : []);
      const [pref, pos, ln, mu, su] = await Promise.allSettled([
        api.get("/prefixes"), api.get("/positions"), api.get("/lines"), api.get("/main-units"), api.get("/sub-units"),
      ]).then((results) => results.map(safe));
      setOptions({
        prefixes: toOptions(t("research.profile.prefixPlaceholder"), pref),
        positions: toOptions(t("research.profile.positionPlaceholder"), pos),
        lines: toOptions(t("research.profile.linePlaceholder"), ln),
        mainUnits: toOptions(t("research.profile.mainUnitPlaceholder"), mu),
        subUnits: toOptions(t("research.profile.subUnitPlaceholder"), su),
      });
      setLoadingOptions(false);
    };
    loadAll();
  }, []);

  useEffect(() => {
    if (!form.main_unit) return;
    api.get("/sub-units", { params: { main_unit_id: form.main_unit } })
      .then((r) => setOptions((p) => ({ ...p, subUnits: toOptions(t("research.profile.subUnitPlaceholder"), r.data?.data ?? r.data ?? []) })))
      .catch((err) => console.error(err));
  }, [form.main_unit]);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    if (!form.firstname_th.trim() || !form.lastname_th.trim()) {
      Alert.alert(t("research.profile.validation"), t("research.profile.validationMsg")); return;
    }
    try {
      await api.put("/me", form);
      Alert.alert(t("research.profile.saveSuccess"), t("research.common.savedMsg"), [{ text: t("research.profile.ok"), onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert(t("research.common.saveFail"), t("research.common.apiError"));
    }
  };

  const handleReset = () => {
    Alert.alert(t("research.profile.resetConfirm"), t("research.profile.resetConfirmMsg"), [
      { text: t("research.common.cancel"), style: "cancel" },
      { text: t("research.profile.resetConfirm"), style: "destructive", onPress: () => setForm((p) => Object.keys(p).reduce((acc, k) => ({ ...acc, [k]: "" }), {})) },
    ]);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#eef2f7]" behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <AppHeader title={t("research.profile.editTitle")} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View className="bg-white rounded-2xl border border-[#e8ecf0] overflow-hidden">
          {loadingOptions && (
            <View className="flex-row items-center gap-2 bg-[#f0faf5] px-4 py-[10px] border-b border-[#d4ece2]">
              <ActivityIndicator size="small" color="#1a6b3c" />
              <Text className="text-[12px] text-brand font-semibold">{t("research.common.loading")}</Text>
            </View>
          )}

          {/* Photo upload */}
          <View className="px-4 py-3">
            <Text className="text-[12px] text-brand font-semibold mb-2">{t("research.profile.photo")}</Text>
            <TouchableOpacity className="flex-row items-center gap-2 bg-[#f0f4f8] rounded-lg px-[14px] py-[10px] self-start" activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={18} color="#1a6b3c" />
              <Text className="text-[13px] text-brand font-semibold">{t("research.profile.chooseFile")}</Text>
            </TouchableOpacity>
          </View>
          <View className="h-px bg-[#f0f4f7]" />

          <FormField label={t("research.profile.idCard")} value={form.id_card} onChangeText={(v) => set("id_card", v)} keyboardType="numeric" />
          <View className="h-px bg-[#f0f4f7]" />
          <FormField label={t("research.profile.firstnameTh")} value={form.firstname_th} onChangeText={(v) => set("firstname_th", v)} required />
          <View className="h-px bg-[#f0f4f7]" />
          <FormField label={t("research.profile.lastnameTh")} value={form.lastname_th} onChangeText={(v) => set("lastname_th", v)} required />
          <View className="h-px bg-[#f0f4f7]" />
          <FormField label={t("research.profile.firstnameEn")} value={form.firstname_en} onChangeText={(v) => set("firstname_en", v)} />
          <View className="h-px bg-[#f0f4f7]" />
          <FormField label={t("research.profile.lastnameEn")} value={form.lastname_en} onChangeText={(v) => set("lastname_en", v)} />
          <View className="h-px bg-[#f0f4f7]" />
          <InlineDropdown label={t("research.profile.prefix")} value={form.prefix} options={options.prefixes} onSelect={(v) => set("prefix", v)} />
          <View className="h-px bg-[#f0f4f7]" />
          <InlineDropdown label={t("research.profile.position")} value={form.position} options={options.positions} onSelect={(v) => set("position", v)} />
          <View className="h-px bg-[#f0f4f7]" />
          <FormField label={t("research.profile.branch")} value={form.branch} onChangeText={(v) => set("branch", v)} />
          <View className="h-px bg-[#f0f4f7]" />
          <InlineDropdown label={t("research.profile.line")} value={form.line} options={options.lines} onSelect={(v) => set("line", v)} />
          <View className="h-px bg-[#f0f4f7]" />
          <FormField label={t("research.profile.address")} value={form.address} onChangeText={(v) => set("address", v)} />
          <View className="h-px bg-[#f0f4f7]" />
          <FormField label={t("research.profile.moo")} value={form.moo} onChangeText={(v) => set("moo", v)} keyboardType="numeric" />
          <View className="h-px bg-[#f0f4f7]" />
          <FormField label={t("research.profile.road")} value={form.road} onChangeText={(v) => set("road", v)} />
          <View className="h-px bg-[#f0f4f7]" />
          <FormField label={t("research.profile.tambon")} value={form.tambon} onChangeText={(v) => set("tambon", v)} />
          <View className="h-px bg-[#f0f4f7]" />
          <FormField label={t("research.profile.amphoe")} value={form.amphoe} onChangeText={(v) => set("amphoe", v)} />
          <View className="h-px bg-[#f0f4f7]" />
          <FormField label={t("research.profile.province")} value={form.province} onChangeText={(v) => set("province", v)} />
          <View className="h-px bg-[#f0f4f7]" />
          <FormField label={t("research.profile.zipcode")} value={form.zipcode} onChangeText={(v) => set("zipcode", v)} keyboardType="numeric" />
          <View className="h-px bg-[#f0f4f7]" />
          <FormField label={t("research.profile.phoneWork")} value={form.phone_work} onChangeText={(v) => set("phone_work", v)} keyboardType="phone-pad" />
          <View className="h-px bg-[#f0f4f7]" />
          <FormField label={t("research.profile.phoneMobile")} value={form.phone_mobile} onChangeText={(v) => set("phone_mobile", v)} keyboardType="phone-pad" />
          <View className="h-px bg-[#f0f4f7]" />
          <FormField label={t("research.profile.email")} value={form.email} onChangeText={(v) => set("email", v)} keyboardType="email-address" />
          <View className="h-px bg-[#f0f4f7]" />
          <FormField label={t("research.profile.birthdate")} value={form.birthdate} onChangeText={(v) => set("birthdate", v)} />
          <View className="h-px bg-[#f0f4f7]" />
          <InlineDropdown label={t("research.profile.mainUnit")} value={form.main_unit} options={options.mainUnits} onSelect={(v) => { set("main_unit", v); set("sub_unit", ""); }} searchable />
          <View className="h-px bg-[#f0f4f7]" />
          <InlineDropdown label={t("research.profile.subUnit")} value={form.sub_unit} options={options.subUnits} onSelect={(v) => set("sub_unit", v)} searchable />

          <View className="flex-row gap-[10px] p-4">
            <TouchableOpacity className="flex-1 bg-brand rounded-[10px] py-[13px] items-center" onPress={handleSave}>
              <Text className="text-white text-[13px] font-semibold">{t("research.profile.editTitle")}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#fef2f2] border border-[#dc2626] rounded-[10px] px-5 py-[13px] flex-row items-center gap-[6px] justify-center" onPress={handleReset}>
              <Ionicons name="refresh" size={16} color="#dc2626" />
              <Text className="text-[#dc2626] text-[13px] font-semibold">{t("research.common.reset")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfileForm;
