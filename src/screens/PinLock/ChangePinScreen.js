import React, { useState } from "react";
import { Alert, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PinKeypad from "../../components/PinKeypad";
import { colors } from "../../theme/tokens";
import { setPin, verifyPin } from "../../services/pinService";
import { getCurrentUserId } from "../../services/userSecurityKeys";

const PIN_LENGTH = 6;

// เปลี่ยน PIN — step 1 ยืนยันตัวตนด้วย PIN เดิมเท่านั้น (ไม่รับ Biometric แทน
// เพื่อไม่ให้เปลี่ยน PIN ทำหน้าที่ซ้ำกับ Reset PIN), step 2/3 ตั้ง PIN ใหม่ + ยืนยัน
export default function ChangePinScreen({ navigation }) {
  const { t } = useTranslation();
  const { top } = useSafeAreaInsets();

  const [step, setStep] = useState("verify"); // "verify" | "enter" | "confirm"
  const [firstPin, setFirstPin] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleDigit = async (digit) => {
    if (saving || value.length >= PIN_LENGTH) return;
    const next = value + digit;
    setError(false);
    setValue(next);

    if (next.length !== PIN_LENGTH) return;

    if (step === "verify") {
      const userId = await getCurrentUserId();
      const ok = userId ? await verifyPin(userId, next) : false;
      if (!ok) {
        setError(true);
        setValue("");
        return;
      }
      setValue("");
      setStep("enter");
      return;
    }

    if (step === "enter") {
      setTimeout(() => {
        setFirstPin(next);
        setValue("");
        setStep("confirm");
      }, 150);
      return;
    }

    // step === "confirm"
    if (next !== firstPin) {
      setError(true);
      setTimeout(() => {
        setFirstPin("");
        setValue("");
        setStep("enter");
        setError(false);
      }, 700);
      return;
    }

    setSaving(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Missing current userId");
      await setPin(userId, next);
      Alert.alert(t("security.pinSetSuccessTitle"), t("security.pinSetSuccessMsg"), [
        { text: t("security.close"), onPress: () => navigation.goBack() },
      ]);
    } catch (_) {
      setError(true);
      setValue("");
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (saving) return;
    setError(false);
    setValue((prev) => prev.slice(0, -1));
  };

  const promptText =
    step === "verify"
      ? t("security.oldPinPrompt")
      : step === "enter"
      ? t("security.pinEnterPrompt")
      : t("security.pinConfirmPrompt");

  return (
    <View className="flex-1 bg-[#eaf5ef]">
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View
        className="bg-primary flex-row items-center px-4 pb-[14px]"
        style={{ paddingTop: top + 10, backgroundColor: colors.primary }}
      >
        <TouchableOpacity
          className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[17px] font-extrabold text-white mr-9">
          {t("security.changePin")}
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-[15px] font-semibold text-[#5f746b] mb-6">{promptText}</Text>

        <PinKeypad
          value={value}
          onDigit={handleDigit}
          onDelete={handleDelete}
          error={error}
          maxLength={PIN_LENGTH}
          belowDots={
            error && (
              <Text className="text-[13px] font-semibold text-[#dc2626] text-center">
                {step === "confirm" ? t("security.pinMismatch") : t("security.pinWrong")}
              </Text>
            )
          }
        />
      </View>
    </View>
  );
}
