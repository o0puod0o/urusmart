import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StatusBar, Alert, Vibration,
} from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSequence, withTiming, withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { savePin, verifyPin } from "../../services/pinService";
import AppHeader from "../../components/AppHeader";

const PIN_LENGTH = 6;
const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "⌫"],
];

const TITLES = {
  set:    { 1: "ตั้งค่า PIN ใหม่",     2: "ยืนยัน PIN อีกครั้ง" },
  change: { 1: "ป้อน PIN ปัจจุบัน",   2: "ป้อน PIN ใหม่",       3: "ยืนยัน PIN ใหม่" },
  reset:  { 1: "ตั้งค่า PIN ใหม่",     2: "ยืนยัน PIN อีกครั้ง" },
};

const HEADER_LABELS = {
  set: "ตั้งค่า PIN",
  change: "เปลี่ยน PIN",
  reset: "รีเซ็ต PIN",
};

export default function PinScreen({ navigation, route }) {
  const { mode = "set" } = route.params ?? {};
  const insets = useSafeAreaInsets();

  const [pin, setPin] = useState("");
  const [step, setStep] = useState(1);
  const [firstPin, setFirstPin] = useState("");
  const [error, setError] = useState("");

  const shakeX = useSharedValue(0);

  const shake = () => {
    shakeX.value = withSequence(
      withTiming(-12, { duration: 55 }),
      withTiming(12, { duration: 55 }),
      withTiming(-8, { duration: 55 }),
      withTiming(8, { duration: 55 }),
      withSpring(0),
    );
    Vibration.vibrate(200);
  };

  const handleComplete = async (enteredPin) => {
    if (mode === "set" || mode === "reset") {
      if (step === 1) {
        setFirstPin(enteredPin);
        setPin("");
        setStep(2);
        setError("");
      } else {
        if (enteredPin === firstPin) {
          await savePin(enteredPin);
          Alert.alert("สำเร็จ", "ตั้งค่า PIN เรียบร้อยแล้ว", [
            { text: "ตกลง", onPress: () => navigation.goBack() },
          ]);
        } else {
          shake();
          setError("PIN ไม่ตรงกัน กรุณาลองใหม่");
          setPin("");
        }
      }
    } else if (mode === "change") {
      if (step === 1) {
        const ok = await verifyPin(enteredPin);
        if (ok) {
          setPin("");
          setStep(2);
          setError("");
        } else {
          shake();
          setError("PIN ไม่ถูกต้อง กรุณาลองใหม่");
          setPin("");
        }
      } else if (step === 2) {
        setFirstPin(enteredPin);
        setPin("");
        setStep(3);
        setError("");
      } else {
        if (enteredPin === firstPin) {
          await savePin(enteredPin);
          Alert.alert("สำเร็จ", "เปลี่ยน PIN เรียบร้อยแล้ว", [
            { text: "ตกลง", onPress: () => navigation.goBack() },
          ]);
        } else {
          shake();
          setError("PIN ไม่ตรงกัน กรุณาลองใหม่");
          setPin("");
        }
      }
    }
  };

  const handleKey = (key) => {
    if (key === "⌫") {
      setPin((p) => p.slice(0, -1));
      setError("");
      return;
    }
    if (pin.length >= PIN_LENGTH) return;
    const newPin = pin + key;
    setPin(newPin);
    if (newPin.length === PIN_LENGTH) {
      setTimeout(() => handleComplete(newPin), 120);
    }
  };

  const dotsStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const currentTitle = TITLES[mode]?.[step] ?? "ป้อน PIN";

  return (
    <View className="flex-1 bg-[#eaf5ef]">
      <StatusBar barStyle="light-content" backgroundColor="#064e35" />
      <AppHeader
        title={HEADER_LABELS[mode]}
        onBack={() => navigation.goBack()}
      />

      <View
        className="flex-1 items-center justify-center"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        {/* Icon */}
        <LinearGradient
          colors={["#0a6644", "#0f7a55"]}
          style={{ width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 20 }}
        >
          <Ionicons name="keypad-outline" size={30} color="#fff" />
        </LinearGradient>

        {/* Title */}
        <Text className="text-[20px] font-bold text-[#064e35] mb-1">{currentTitle}</Text>
        <Text className="text-[13px] text-gray-400 mb-8">กรอก {PIN_LENGTH} หลัก</Text>

        {/* PIN dots */}
        <Animated.View className="flex-row gap-4 mb-3" style={dotsStyle}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 16, height: 16, borderRadius: 8,
                backgroundColor: i < pin.length ? "#0f7a55" : "#d1d5db",
                transform: [{ scale: i < pin.length ? 1.15 : 1 }],
              }}
            />
          ))}
        </Animated.View>

        {/* Error */}
        <View className="h-6 mb-6 items-center justify-center">
          {!!error && (
            <Text className="text-[13px] text-red-500 font-semibold">{error}</Text>
          )}
        </View>

        {/* Keypad */}
        <View style={{ gap: 12 }}>
          {KEYS.map((row, ri) => (
            <View key={ri} style={{ flexDirection: "row", gap: 20, justifyContent: "center" }}>
              {row.map((key, ki) =>
                key === "" ? (
                  <View key={ki} style={{ width: 80, height: 80 }} />
                ) : (
                  <TouchableOpacity
                    key={ki}
                    onPress={() => handleKey(key)}
                    activeOpacity={0.75}
                    style={{
                      width: 80, height: 80, borderRadius: 40,
                      backgroundColor: "#fff",
                      alignItems: "center", justifyContent: "center",
                      elevation: 3,
                      shadowColor: "#064e35", shadowOpacity: 0.1,
                      shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
                    }}
                  >
                    {key === "⌫" ? (
                      <Ionicons name="backspace-outline" size={26} color="#0f7a55" />
                    ) : (
                      <Text style={{ fontSize: 28, fontWeight: "700", color: "#064e35" }}>
                        {key}
                      </Text>
                    )}
                  </TouchableOpacity>
                )
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
