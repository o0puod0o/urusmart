import React, { useMemo, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AppHeader from "../../../components/AppHeader";
import FormContainer from "../../../components/expert/FormContainer";
import KeyboardAwareScrollView from "../../../components/expert/KeyboardAwareScrollView";
import InlineDropdown from "../../../components/expert/InlineDropdown";
import useResource from "../../../hook/useResource";
import useConfirm from "../../../hook/useConfirm";
import useSubmitLock from "../../../hook/useSubmitLock";
import { getExpertLink, getExpertTitle, getExpertYear } from "../../../utils/expertFields";
import { normalizeOptionalUrl } from "../../../utils/url";

const BASE_YEAR_LIST = Array.from({ length: 2569 - 2533 + 1 }, (_, i) => ({
  id: String(2569 - i),
  label: String(2569 - i),
}));

const ProceedingForm = ({ navigation }) => {
  const { t } = useTranslation();
  const yearOptions = useMemo(
    () => [
      { id: "", label: t("research.common.selectYear") },
      ...BASE_YEAR_LIST,
    ],
    [t],
  );
  const { confirm, ConfirmDialog } = useConfirm();
  const submitOnce = useSubmitLock();
  const { items, loading, saving, create, update, remove } =
    useResource("/proceedings");
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ year: "", reference: "", url: "" });

  const urlRef = useRef(null);
  const tableItems = useMemo(
    () => [...items].sort((a, b) => Number(a.id) - Number(b.id)),
    [items],
  );
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const openEdit = (e) => {
    setEditingItem(e);
    setForm({
      year: getExpertYear(e),
      reference: getExpertTitle(e),
      url: getExpertLink(e),
    });
  };
  const openNew = () => {
    setEditingItem(null);
    setForm({ year: "", reference: "", url: "" });
  };

  const handleSave = () => submitOnce(async () => {
    if (!form.year || !form.reference.trim()) {
      Alert.alert(
        t("research.common.warning"),
        t("research.proceeding.validation"),
      );
      return;
    }
    const reference = form.reference.trim();
    const normalizedUrl = normalizeOptionalUrl(form.url);
    if (!normalizedUrl.ok) {
      Alert.alert(
        t("research.common.warning"),
        t("research.common.urlInvalid"),
      );
      return;
    }
    const payload = {
      year: form.year,
      name: reference,
      reference,
      title: reference,
      url: normalizedUrl.url,
    };
    try {
      editingItem
        ? await update(editingItem.id, payload)
        : await create(payload);
      Alert.alert(
        editingItem
          ? t("research.common.editSuccess")
          : t("research.common.addSuccess"),
        t("research.common.savedMsg"),
      );
      openNew();
    } catch (err) {
      Alert.alert(
        t("research.common.saveFail"),
        err.message ?? t("research.common.apiError"),
      );
    }
  });

  const handleDelete = (entry) => {
    const doDelete = async () => {
      try {
        await remove(entry.id);
      } catch (err) {
        Alert.alert(t("research.common.deleteFail"), err.message);
      }
    };
    if (Platform.OS === "web") {
      if (window.confirm(t("research.common.deleteConfirm"))) doDelete();
    } else {
      Alert.alert(
        t("research.common.deleteTitle"),
        t("research.common.deleteConfirm"),
        [
          { text: t("research.common.cancel"), style: "cancel" },
          {
            text: t("research.common.deleteBtn"),
            style: "destructive",
            onPress: doDelete,
          },
        ],
      );
    }
  };

  return (
    <FormContainer className="flex-1 bg-[#f5f7f8]">
      <AppHeader title="Proceeding" onBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingHorizontal: 14,
          paddingTop: 18,
          paddingBottom: 60,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <View
          className="flex-row items-center bg-white border border-[#eef1f4] rounded-2xl px-[14px] py-[14px] mb-4"
          style={{ elevation: 1 }}
        >
          <View className="w-11 h-11 rounded-xl bg-[#e6f4ef] items-center justify-center mr-3">
            <Ionicons name="document-text" size={22} color="#007a5a" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-[#6b7a82] uppercase tracking-[0.8px]">
              {t("research.common.manageData")}
            </Text>
            <Text className="text-[19px] font-black text-[#3f4d50] mt-[2px]">
              Proceeding
            </Text>
          </View>
          <View className="bg-[#007a5a] rounded-full min-w-9 px-[10px] py-[5px] items-center">
            <Text className="text-white text-[13px] font-black">
              {items.length}
            </Text>
          </View>
        </View>

        {/* Table */}
        <View
          className="bg-white rounded-2xl border border-[#eef1f4] overflow-hidden mb-4"
          style={{ elevation: 1 }}
        >
          <View className="flex-row items-center gap-2 bg-[#e6f4ef] border-b border-[#eef1f4] px-[14px] py-[11px]">
            <Ionicons name="list-outline" size={16} color="#00614a" />
            <Text className="text-[13px] font-extrabold text-[#00614a]">
              {t("research.proceeding.listTitle")}
            </Text>
          </View>
          {loading ? (
            <View className="flex-row items-center justify-center py-9 gap-[10px]">
              <ActivityIndicator size="small" color="#007a5a" />
              <Text className="text-[13px] text-[#6b7a82]">
                {t("research.common.loading")}
              </Text>
            </View>
          ) : tableItems.length === 0 ? (
            <View className="items-center py-9">
              <Ionicons name="folder-open-outline" size={42} color="#9aa6b1" />
              <Text className="text-[14px] font-bold text-[#1f2a2e] mt-[10px]">
                {t("research.proceeding.noData")}
              </Text>
              <Text className="text-[12px] text-[#6b7a82] mt-1">
                {t("research.common.addBelow")}
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View className="flex-row items-center bg-white px-3 py-3 border-b border-[#e3e7eb]">
                  {[
                    { w: 40, l: t("research.common.no"), align: "left" },
                    { w: 86, l: t("research.common.year"), align: "left" },
                    { w: 220, l: t("research.journal.colRef"), align: "left" },
                    { w: 160, l: "URL", align: "left" },
                    { w: 92, l: t("research.common.manage"), align: "center" },
                  ].map((c, i) => (
                    <Text
                      key={i}
                      className="text-[11px] font-extrabold text-[#6b7a82] uppercase tracking-[0.5px] px-1"
                      style={{
                        width: c.w,
                        textAlign: c.align,
                      }}
                    >
                      {c.l}
                    </Text>
                  ))}
                </View>
                {tableItems.map((entry, index) => (
                  <View
                    key={entry.id ?? index}
                    className="flex-row items-center px-3 py-3 border-b border-[#eef1f4]"
                    style={[
                      editingItem?.id === entry.id
                        ? { backgroundColor: "#ccf0e2" }
                        : {},
                    ]}
                  >
                    <Text
                      className="text-[13px] font-bold text-[#1f2a2e] text-left px-1"
                      style={{ width: 40 }}
                    >
                      {index + 1}
                    </Text>
                    <View className="px-1" style={{ width: 86 }}>
                      <View className="self-start bg-[#e6f4ef] rounded-full px-[10px] py-[3px]">
                        <Text className="text-[#00614a] text-[12px] font-extrabold">
                          {getExpertYear(entry)}
                        </Text>
                      </View>
                    </View>
                    <Text
                      className="text-[13px] font-semibold text-[#1f2a2e] leading-5 px-3"
                      style={{
                        width: 220,
                        borderLeftWidth: 1,
                        borderLeftColor: "#eef1f4",
                      }}
                      numberOfLines={3}
                    >
                      {getExpertTitle(entry)}
                    </Text>
                    <Text
                      className="text-[12px] font-semibold text-[#007a5a] leading-5 px-3"
                      style={{
                        width: 160,
                        borderLeftWidth: 1,
                        borderLeftColor: "#eef1f4",
                      }}
                      numberOfLines={2}
                    >
                      {getExpertLink(entry)}
                    </Text>
                    <View
                      className="flex-row gap-[6px] justify-center px-1"
                      style={{ width: 92 }}
                    >
                      <TouchableOpacity
                        className="w-[34px] h-[34px] rounded-lg bg-[#fff0d6] items-center justify-center"
                        onPress={() => openEdit(entry)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="create-outline"
                          size={17}
                          color="#a8631a"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="w-[34px] h-[34px] rounded-lg bg-[#fde7e7] items-center justify-center"
                        onPress={() => handleDelete(entry)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={17}
                          color="#df4c4b"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Form */}
        <View
          className="bg-white border border-[#eef1f4] rounded-2xl overflow-hidden"
          style={{ elevation: 1 }}
        >
          <View className="flex-row items-center justify-between border-b border-[#eef1f4] px-4 py-3 mb-2">
            <View className="flex-row items-center">
              <Ionicons
                name={editingItem ? "create" : "add-circle"}
                size={18}
                color="#007a5a"
              />
              <Text className="text-[16px] font-black text-[#3f4d50] ml-2">
                {editingItem
                  ? t("research.proceeding.editForm")
                  : t("research.proceeding.addForm")}
              </Text>
            </View>
          </View>
          <InlineDropdown
            label={t("research.common.yearField")}
            value={form.year}
            options={yearOptions}
            onSelect={(v) => setField("year", v)}
            required
            searchable
          />
          <View className="h-px bg-[#f0f4f7]" />
          <View className="px-4 py-3">
            <Text className="text-[13px] font-semibold text-brand mb-[6px]">
              {t("research.journal.fieldRef")}
              <Text className="text-[#e74c3c]"> *</Text>
            </Text>
            <TextInput
              className="bg-[#f8fafb] border border-[#e8ecf0] rounded-[10px] px-3 py-[12px] text-[13px] text-[#1a1a2e]"
              value={form.reference}
              onChangeText={(v) => setField("reference", v)}
              placeholder={t("research.journal.placeholderRef")}
              placeholderTextColor="#bbb"
              maxLength={500}
              returnKeyType="next"
              onSubmitEditing={() => urlRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>
          <View className="h-px bg-[#f0f4f7]" />
          <View className="px-4 py-3">
            <Text className="text-[13px] font-semibold text-brand mb-[6px]">
              URL:
            </Text>
            <TextInput
              ref={urlRef}
              className="bg-[#f8fafb] border border-[#e8ecf0] rounded-[10px] px-3 py-[12px] text-[13px] text-[#1a1a2e]"
              value={form.url}
              onChangeText={(v) => setField("url", v)}
              placeholder="https://..."
              placeholderTextColor="#bbb"
              autoCapitalize="none"
              keyboardType="url"
              returnKeyType="done"
            />
          </View>
          <View className="flex-row gap-[10px] p-4 pt-[14px]">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-2 bg-[#007a5a] rounded-xl py-[13px]"
              style={{ elevation: 2, opacity: saving ? 0.65 : 1 }}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name={editingItem ? "checkmark-circle" : "add-circle"}
                    size={18}
                    color="#fff"
                  />
                  <Text className="text-white text-[14px] font-black">
                    {editingItem
                      ? t("research.proceeding.saveEdit")
                      : t("research.proceeding.saveAdd")}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-[#fef2f2] border-[1.5px] border-[#dc2626] rounded-xl px-[18px] flex-row items-center gap-[6px]"
              onPress={() =>
                confirm({
                  title: t("research.common.resetFormTitle"),
                  message: t("research.common.resetFormMessage"),
                  icon: "refresh",
                  onConfirm: openNew,
                })
              }
              activeOpacity={0.85}
            >
              <Ionicons name="refresh" size={16} color="#dc2626" />
              <Text className="text-[#dc2626] text-[14px] font-black">
                {t("research.common.reset")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
      <ConfirmDialog />
    </FormContainer>
  );
};

export default ProceedingForm;
