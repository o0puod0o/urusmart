import React, { useRef, useState, useEffect } from "react";
import { Image, View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Modal } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import AppHeader from "../../../components/AppHeader";
import FormField from "../../../components/expert/FormField";
import InlineDropdown from "../../../components/expert/InlineDropdown";
import api from "../../../services/api";
import { formatThaiDate, parseISOToDate, toISODate } from "../../../utils/thaiDate";

// หาค่า ID จาก options — รองรับกรณีที่ backend ส่งชื่อมาแทน ID
const resolveId = (opts, value) => {
  if (!value) return "";
  const s = String(value);
  if (opts.some((o) => o.id === s)) return s;
  const byLabel = opts.find((o) => o.label === s);
  return byLabel ? byLabel.id : s;
};

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
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [photoUri, setPhotoUri] = useState(item?.photoUrl ?? item?.picture ?? null);
  const [newPhotoAsset, setNewPhotoAsset] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const refs = {
    firstname_th: useRef(null), lastname_th: useRef(null),
    firstname_en: useRef(null), lastname_en: useRef(null),
    branch: useRef(null), address: useRef(null),
    moo: useRef(null), road: useRef(null), tambon: useRef(null),
    amphoe: useRef(null), province: useRef(null), zipcode: useRef(null),
    phone_work: useRef(null), phone_mobile: useRef(null), email: useRef(null),
  };

  const toOptions = (placeholder, rows, idField = "id", labelField = "name") => [
    { id: "", label: placeholder },
    ...rows.map((r) => ({ id: String(r[idField]), label: r[labelField] })),
  ];

  useEffect(() => {
    const loadAll = async () => {
      const safe = (r) => {
        if (r.status !== "fulfilled") return [];
        const body = r.value?.data;
        if (Array.isArray(body)) return body;
        if (Array.isArray(body?.data)) return body.data;
        for (const key of ["items", "results", "list", "rows", "lines", "prefixes", "positions", "units"]) {
          if (Array.isArray(body?.[key])) return body[key];
        }
        return [];
      };
      const [pref, pos, ln, mu, su] = await Promise.allSettled([
        api.get("/prefixes"), api.get("/positions"), api.get("/lines"), api.get("/main-units"), api.get("/sub-units"),
      ]).then((results) => results.map(safe));
      if (__DEV__ && ln.length === 0) console.warn("[ProfileForm] GET /lines returned no data — check API response format");
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

  const fetchProfile = () => {
    setProfileError(false);
    setLoadingProfile(true);
    api.get("/me")
      .then((r) => {
        const data = r.data?.data ?? r.data;
        if (__DEV__) console.log("[ProfileForm] GET /me →", JSON.stringify({
          firstname_th: data?.firstname_th,
          line_id: data?.line_id, line: data?.line,
          birthdate: data?.birthdate,
          prefix_id: data?.prefix_id, sub_unit_id: data?.sub_unit_id,
        }));
        if (!data) return;
        setForm({
          id_card:       data.id_card ?? "",
          firstname_th:  data.firstname_th ?? "",
          lastname_th:   data.lastname_th ?? "",
          firstname_en:  data.firstname_en ?? "",
          lastname_en:   data.lastname_en ?? "",
          prefix:        String(data.prefix_id    || data.prefix    || ""),
          position:      String(data.position_id  || data.position  || ""),
          branch:        data.branch ?? "",
          line:          String(data.line_id       || data.line      || ""),
          address:       data.address ?? "",
          moo:           data.moo ?? "",
          road:          data.road ?? "",
          tambon:        data.tambon ?? "",
          amphoe:        data.amphoe ?? "",
          province:      data.province ?? "",
          zipcode:       data.zipcode ?? "",
          phone_work:    data.phone_work ?? "",
          phone_mobile:  data.phone_mobile ?? "",
          email:         data.email ?? "",
          birthdate:     data.birthdate ?? "",
          main_unit:     String(data.main_unit_id || data.main_unit || ""),
          sub_unit:      String(data.sub_unit_id  || data.sub_unit  || ""),
        });
        const photo = data.picture ?? data.photo_url ?? data.photoUrl ?? data.avatar ?? data.profile_image;
        if (photo) setPhotoUri(photo);
      })
      .catch((err) => {
        if (__DEV__) console.warn("[ProfileForm] GET /me:", err.message);
        setProfileError(true);
      })
      .finally(() => setLoadingProfile(false));
  };

  useEffect(() => { fetchProfile(); }, []);

  // หลังจาก options และ profile โหลดเสร็จ แปลงค่า dropdown จากชื่อเป็น ID (ถ้าจำเป็น)
  useEffect(() => {
    if (loadingOptions || loadingProfile) return;
    setForm((prev) => ({
      ...prev,
      prefix:    resolveId(options.prefixes,   prev.prefix),
      position:  resolveId(options.positions,  prev.position),
      line:      resolveId(options.lines,      prev.line),
      main_unit: resolveId(options.mainUnits,  prev.main_unit),
      sub_unit:  resolveId(options.subUnits,   prev.sub_unit),
    }));
  }, [loadingOptions, loadingProfile]);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (event.type === "dismissed" || !selectedDate) return;
    set("birthdate", toISODate(selectedDate));
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("research.profile.photoPermTitle"), t("research.profile.photoPermMsg")); return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setPhotoUri(asset.uri);
    setNewPhotoAsset(asset);
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("research.profile.photoPermTitle"), t("research.profile.photoPermMsg")); return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setPhotoUri(asset.uri);
    setNewPhotoAsset(asset);
  };

  const openPhotoPicker = () => {
    Alert.alert(t("research.profile.photo"), "", [
      { text: t("research.profile.photoGallery"), onPress: handlePickPhoto },
      { text: t("research.profile.photoCamera"), onPress: handleTakePhoto },
      { text: t("research.common.cancel"), style: "cancel" },
    ]);
  };

  const handleSave = async () => {
    if (!form.firstname_th.trim() || !form.lastname_th.trim()) {
      Alert.alert(t("research.profile.validation"), t("research.profile.validationMsg")); return;
    }
    try {
      if (newPhotoAsset) {
        const uri = newPhotoAsset.uri;
        const ext = uri.split(".").pop()?.toLowerCase() ?? "jpg";
        if (!["jpg", "jpeg", "png", "webp"].includes(ext)) {
          Alert.alert(t("research.common.warning"), "รองรับเฉพาะไฟล์ jpg, jpeg, png, webp เท่านั้น");
          return;
        }
        setUploadingPhoto(true);
        const fd = new FormData();
        fd.append("picture", { uri, name: `photo.${ext}`, type: `image/${ext}` });
        const photoRes = await api.post("/me/photo", fd, { headers: { "Content-Type": "multipart/form-data" } });
        const newUrl = photoRes.data?.photo_url;
        if (newUrl) setPhotoUri(newUrl);
        setNewPhotoAsset(null);
        setUploadingPhoto(false);
      }

      const payload = {
        id_card:      form.id_card,
        firstname_th: form.firstname_th.trim(),
        lastname_th:  form.lastname_th.trim(),
        firstname_en: form.firstname_en.trim(),
        lastname_en:  form.lastname_en.trim(),
        branch:       form.branch,
        address:      form.address,
        moo:          form.moo,
        road:         form.road,
        tambon:       form.tambon,
        amphoe:       form.amphoe,
        province:     form.province,
        zipcode:      form.zipcode,
        phone_work:   form.phone_work,
        phone_mobile: form.phone_mobile,
        email:        form.email,
        birthdate:    form.birthdate,
        ...(form.prefix    ? { prefix_id:    parseInt(form.prefix,    10) } : {}),
        ...(form.position  ? { position_id:  parseInt(form.position,  10) } : {}),
        ...(form.line      ? { line_id:      parseInt(form.line,      10) } : {}),
        ...(form.main_unit ? { main_unit_id: parseInt(form.main_unit, 10) } : {}),
        ...(form.sub_unit  ? { sub_unit_id:  parseInt(form.sub_unit,  10) } : {}),
      };

      await api.put("/me", payload);
      Alert.alert(t("research.profile.saveSuccess"), t("research.common.savedMsg"), [
        { text: t("research.profile.ok"), onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setUploadingPhoto(false);
      Alert.alert(t("research.common.saveFail"), err.response?.data?.message ?? err.message ?? t("research.common.apiError"));
    }
  };

  const handleReset = () => {
    Alert.alert(t("research.profile.resetConfirm"), t("research.profile.resetConfirmMsg"), [
      { text: t("research.common.cancel"), style: "cancel" },
      {
        text: t("research.profile.resetConfirm"),
        style: "destructive",
        onPress: () => setForm((p) => ({
          ...p,
          position: "", branch: "", line: "", address: "", moo: "", road: "",
          tambon: "", amphoe: "", province: "", zipcode: "",
          phone_work: "", phone_mobile: "", email: "", birthdate: "",
          main_unit: "", sub_unit: "",
        })),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#eef2f7]" behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <AppHeader title={t("research.profile.editTitle")} onBack={() => navigation.goBack()} />

      {(loadingProfile || loadingOptions) ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#1a6b3c" />
          <Text className="text-[13px] text-brand font-semibold">{t("research.common.loading")}</Text>
        </View>
      ) : profileError && !form.firstname_th ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Ionicons name="cloud-offline-outline" size={52} color="#dc2626" />
          <Text className="text-[15px] font-bold text-[#dc2626] text-center">โหลดข้อมูลไม่สำเร็จ</Text>
          <Text className="text-[13px] text-[#6b7280] text-center">ไม่สามารถดึงข้อมูลโปรไฟล์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง</Text>
          <TouchableOpacity className="bg-brand rounded-xl px-6 py-[13px] mt-2" onPress={fetchProfile}>
            <Text className="text-white text-[13px] font-bold">ลองใหม่</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View className="bg-white rounded-2xl border border-[#e8ecf0] overflow-hidden">

            {/* Photo upload */}
            <View className="px-4 py-3">
              <Text className="text-[12px] text-brand font-semibold mb-2">{t("research.profile.photo")}</Text>
              <View className="flex-row items-center gap-3">
                <View className="w-16 h-16 rounded-full overflow-hidden bg-[#e6f4ef] border-2 border-[#b8dfd0] items-center justify-center">
                  {photoUri ? (
                    <Image source={{ uri: photoUri }} className="w-full h-full" />
                  ) : (
                    <Ionicons name="person-outline" size={28} color="#1a6b3c" />
                  )}
                </View>
                <TouchableOpacity
                  className="flex-row items-center gap-2 bg-[#f0f4f8] rounded-lg px-[14px] py-[10px]"
                  activeOpacity={0.8}
                  onPress={openPhotoPicker}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? (
                    <ActivityIndicator size="small" color="#1a6b3c" />
                  ) : (
                    <Ionicons name="camera-outline" size={18} color="#1a6b3c" />
                  )}
                  <Text className="text-[13px] text-brand font-semibold">{t("research.profile.chooseFile")}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View className="h-px bg-[#f0f4f7]" />

            <FormField label={t("research.profile.idCard")} value={form.id_card} onChangeText={(v) => set("id_card", v)} keyboardType="numeric" onSubmitEditing={() => refs.firstname_th.current?.focus()} />
            <View className="h-px bg-[#f0f4f7]" />
            <FormField ref={refs.firstname_th} label={t("research.profile.firstnameTh")} value={form.firstname_th} onChangeText={(v) => set("firstname_th", v)} required onSubmitEditing={() => refs.lastname_th.current?.focus()} />
            <View className="h-px bg-[#f0f4f7]" />
            <FormField ref={refs.lastname_th} label={t("research.profile.lastnameTh")} value={form.lastname_th} onChangeText={(v) => set("lastname_th", v)} required onSubmitEditing={() => refs.firstname_en.current?.focus()} />
            <View className="h-px bg-[#f0f4f7]" />
            <FormField ref={refs.firstname_en} label={t("research.profile.firstnameEn")} value={form.firstname_en} onChangeText={(v) => set("firstname_en", v)} onSubmitEditing={() => refs.lastname_en.current?.focus()} />
            <View className="h-px bg-[#f0f4f7]" />
            <FormField ref={refs.lastname_en} label={t("research.profile.lastnameEn")} value={form.lastname_en} onChangeText={(v) => set("lastname_en", v)} onSubmitEditing={() => refs.branch.current?.focus()} />
            <View className="h-px bg-[#f0f4f7]" />
            <InlineDropdown label={t("research.profile.prefix")} value={form.prefix} options={options.prefixes} onSelect={(v) => set("prefix", v)} />
            <View className="h-px bg-[#f0f4f7]" />
            <InlineDropdown label={t("research.profile.position")} value={form.position} options={options.positions} onSelect={(v) => set("position", v)} />
            <View className="h-px bg-[#f0f4f7]" />
            <FormField ref={refs.branch} label={t("research.profile.branch")} value={form.branch} onChangeText={(v) => set("branch", v)} onSubmitEditing={() => refs.address.current?.focus()} />
            <View className="h-px bg-[#f0f4f7]" />
            <InlineDropdown label={t("research.profile.line")} value={form.line} options={options.lines} onSelect={(v) => set("line", v)} />
            <View className="h-px bg-[#f0f4f7]" />
            <FormField ref={refs.address} label={t("research.profile.address")} value={form.address} onChangeText={(v) => set("address", v)} onSubmitEditing={() => refs.moo.current?.focus()} />
            <View className="h-px bg-[#f0f4f7]" />
            <FormField ref={refs.moo} label={t("research.profile.moo")} value={form.moo} onChangeText={(v) => set("moo", v)} keyboardType="numeric" onSubmitEditing={() => refs.road.current?.focus()} />
            <View className="h-px bg-[#f0f4f7]" />
            <FormField ref={refs.road} label={t("research.profile.road")} value={form.road} onChangeText={(v) => set("road", v)} onSubmitEditing={() => refs.tambon.current?.focus()} />
            <View className="h-px bg-[#f0f4f7]" />
            <FormField ref={refs.tambon} label={t("research.profile.tambon")} value={form.tambon} onChangeText={(v) => set("tambon", v)} onSubmitEditing={() => refs.amphoe.current?.focus()} />
            <View className="h-px bg-[#f0f4f7]" />
            <FormField ref={refs.amphoe} label={t("research.profile.amphoe")} value={form.amphoe} onChangeText={(v) => set("amphoe", v)} onSubmitEditing={() => refs.province.current?.focus()} />
            <View className="h-px bg-[#f0f4f7]" />
            <FormField ref={refs.province} label={t("research.profile.province")} value={form.province} onChangeText={(v) => set("province", v)} onSubmitEditing={() => refs.zipcode.current?.focus()} />
            <View className="h-px bg-[#f0f4f7]" />
            <FormField ref={refs.zipcode} label={t("research.profile.zipcode")} value={form.zipcode} onChangeText={(v) => set("zipcode", v)} keyboardType="numeric" onSubmitEditing={() => refs.phone_work.current?.focus()} />
            <View className="h-px bg-[#f0f4f7]" />
            <FormField ref={refs.phone_work} label={t("research.profile.phoneWork")} value={form.phone_work} onChangeText={(v) => set("phone_work", v)} keyboardType="phone-pad" onSubmitEditing={() => refs.phone_mobile.current?.focus()} />
            <View className="h-px bg-[#f0f4f7]" />
            <FormField ref={refs.phone_mobile} label={t("research.profile.phoneMobile")} value={form.phone_mobile} onChangeText={(v) => set("phone_mobile", v)} keyboardType="phone-pad" onSubmitEditing={() => refs.email.current?.focus()} />
            <View className="h-px bg-[#f0f4f7]" />
            <FormField ref={refs.email} label={t("research.profile.email")} value={form.email} onChangeText={(v) => set("email", v)} keyboardType="email-address" returnKeyType="done" />
            <View className="h-px bg-[#f0f4f7]" />

            {/* Birthdate — calendar picker */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-[13px]"
              activeOpacity={0.7}
              onPress={() => setShowDatePicker(true)}
            >
              <Text className="flex-1 text-[13px] text-[#374151] font-medium">{t("research.profile.birthdate")}</Text>
              <Text className={`text-[13px] mr-2 ${form.birthdate ? "text-[#111827] font-semibold" : "text-[#9ca3af]"}`}>
                {form.birthdate ? formatThaiDate(form.birthdate) : "เลือกวันเกิด"}
              </Text>
              <Ionicons name="calendar-outline" size={18} color="#6b7280" />
            </TouchableOpacity>

            {/* iOS: spinner inside modal */}
            {showDatePicker && Platform.OS === "ios" && (
              <Modal transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
                <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
                  <View className="bg-white rounded-t-[20px] pb-8">
                    <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#f0f4f7]">
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text className="text-[15px] text-[#6b7280] font-semibold">{t("research.common.cancel")}</Text>
                      </TouchableOpacity>
                      <Text className="text-[15px] font-bold text-[#111827]">{t("research.profile.birthdate")}</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text className="text-[15px] text-brand font-bold">ตกลง</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={parseISOToDate(form.birthdate)}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                      locale="th-TH"
                      style={{ height: 200 }}
                    />
                  </View>
                </View>
              </Modal>
            )}

            {/* Android: native dialog */}
            {showDatePicker && Platform.OS === "android" && (
              <DateTimePicker
                value={parseISOToDate(form.birthdate)}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            <View className="h-px bg-[#f0f4f7]" />
            <InlineDropdown
              label={t("research.profile.mainUnit")}
              value={form.main_unit}
              options={options.mainUnits}
              onSelect={async (v) => {
                set("main_unit", v);
                set("sub_unit", "");
                if (v) {
                  try {
                    const r = await api.get("/sub-units", { params: { main_unit_id: v } });
                    const rows = r.data?.data ?? r.data ?? [];
                    if (rows.length > 0) {
                      setOptions((p) => ({ ...p, subUnits: toOptions(t("research.profile.subUnitPlaceholder"), rows) }));
                    }
                  } catch {
                    // keep full list if filter fails
                  }
                }
              }}
              searchable
            />
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
      )}
    </KeyboardAvoidingView>
  );
};

export default ProfileForm;
