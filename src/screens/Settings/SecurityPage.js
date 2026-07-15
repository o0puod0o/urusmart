import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StatusBar, Switch, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAuthToken } from "../../services/authStorage";
import {
  checkSupport,
  setBiometricEnabled,
  isBiometricEnabled,
  saveBiometricToken,
  clearBiometricToken,
} from "../../services/biometricService";

export default function SecurityPage() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { top } = useSafeAreaInsets();

  const [biometric, setBiometric]         = useState(false);
  const [biometricInfo, setBiometricInfo] = useState(null);
  const [checking, setChecking]           = useState(true);

  useEffect(() => {
    (async () => {
      const [enabled, support] = await Promise.all([
        isBiometricEnabled(),
        checkSupport(),
      ]);
      setBiometric(enabled && support.supported);
      setBiometricInfo(support);
      setChecking(false);
    })();
  }, []);

  const toggleBiometric = async (val) => {
    if (!biometricInfo?.supported) {
      Alert.alert(
        t("security.notSupportedTitle"),
        t(
          `security.reason.${biometricInfo?.reasonCode ?? "unknown"}`,
          { defaultValue: t("security.biometricSub") },
        ),
      );
      return;
    }

    if (val) {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert(
          t("security.verifyFailTitle"),
          t("security.verifyFailMsg"),
        );
        return;
      }

      try {
        await saveBiometricToken(
          token,
          t("security.enablePrompt", { label: biometricLabel }),
        );
      } catch (_) {
        Alert.alert(
          t("security.verifyFailTitle"),
          t("security.verifyFailMsg"),
        );
        return;
      }

      setBiometric(true);
      await setBiometricEnabled(true);
      Alert.alert(
        t("security.enabledTitle"),
        t("security.enabledMsg", { label: biometricLabel }),
      );
    } else {
      Alert.alert(
        t("security.disableTitle"),
        t("security.disableMsg"),
        [
          { text: t("security.cancel"), style: "cancel" },
          {
            text: t("security.close"),
            style: "destructive",
            onPress: async () => {
              setBiometric(false);
              await setBiometricEnabled(false);
              await clearBiometricToken();
            },
          },
        ],
      );
    }
  };

  const biometricLabel = biometricInfo?.hasFaceId ? "Face ID" : t("security.biometricFinger");
  const biometricIcon  = biometricInfo?.hasFaceId ? "scan-outline" : "finger-print-outline";

  return (
    <View className="flex-1 bg-[#eaf5ef]">
      <StatusBar barStyle="light-content" backgroundColor="#0f7a55" />

      <View className="bg-primary flex-row items-center justify-between px-4 pb-[14px]" style={{ paddingTop: top + 10 }}>
        <TouchableOpacity
          className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text className="text-[17px] font-extrabold text-white">{t("security.title")}</Text>
        <View className="w-9" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-[12px] font-bold text-[#8a9a90] px-5 pt-5 pb-2 uppercase tracking-[0.8px]">
          {t("security.section")}
        </Text>

        <View className="bg-white rounded-2xl mx-4 overflow-hidden border border-[#e0ebe4]">
          <View className="flex-row items-center gap-[14px] px-4 py-[16px]">
            <View className="w-10 h-10 rounded-xl bg-brand items-center justify-center">
              <Ionicons name={biometricIcon} size={20} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-[#101b17]">{t("security.biometric")}</Text>
              {checking ? (
                <Text className="text-[12px] text-[#aaa] mt-[2px]">{t("security.checking")}</Text>
              ) : !biometricInfo?.supported ? (
                <Text className="text-[12px] text-[#e65100] mt-[2px]">
                  {biometricInfo?.reason ?? t("security.biometricSub")}
                </Text>
              ) : biometric ? (
                <Text className="text-[12px] text-[#0f7a55] font-semibold mt-[2px]">{t("security.active")}</Text>
              ) : (
                <Text className="text-[12px] font-medium text-[#5a6a60] mt-[2px]">{t("security.biometricSub")}</Text>
              )}
            </View>
            <Switch
              value={biometric}
              onValueChange={toggleBiometric}
              disabled={checking || !biometricInfo?.supported}
              trackColor={{ false: "#dfe8e3", true: "#1a6b3c" }}
              thumbColor="#fff"
              ios_backgroundColor="#dfe8e3"
            />
          </View>
        </View>

        {biometricInfo?.supported && (
          <View className="flex-row items-start gap-2 bg-[#e8f5ee] rounded-[14px] mx-4 mt-4 p-[14px] border border-[#e0ebe4]">
            <Ionicons name="information-circle-outline" size={16} color="#1a6b3c" />
            <Text className="flex-1 text-[12px] text-[#5a6a60] leading-[18px]">
              {t("security.biometricNote", { label: biometricLabel })}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
