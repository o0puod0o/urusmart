import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/tokens";

const FACE_ID_ICON = require("../assets/Face_ID.png");
const FINGERPRINT_ICON = require("../assets/Biometric.png");

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["biometric", "0", "delete"],
];

const PinKeypad = ({
  value = "",
  onDigit,
  onDelete,
  error,
  maxLength = 6,
  onBiometric,
  biometricIcon = "finger-print-outline",
  scale = 1,
  belowDots,
}) => {
  const dotSize = Math.round(16 * scale);
  const keySize = Math.round(72 * scale);
  const digitFontSize = Math.round(26 * scale);
  const deleteIconSize = Math.round(26 * scale);
  // Touch area ของ biometric ต้องเท่ากับปุ่มตัวเลข (keySize) แต่ตัว icon เองแสดง
  // ~72% ของพื้นที่นั้น (ระหว่าง 70-75% ตามสเปก) — ไม่ใช้พื้นที่เต็มวงกลม
  const biometricImageSize = Math.round(keySize * 0.72);
  const biometricIconSize = Math.round(keySize * 0.5);

  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ flexDirection: "row", gap: Math.round(14 * scale), marginBottom: Math.round(16 * scale) }}>
        {Array.from({ length: maxLength }).map((_, i) => (
          <View
            key={i}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              borderWidth: 1.5,
              borderColor: error ? colors.danger : "#111111",
              backgroundColor:
                i < value.length ? (error ? colors.danger : "#111111") : "transparent",
            }}
          />
        ))}
      </View>

      {/* สูงคงที่เสมอไม่ว่าจะมี error หรือไม่ — กัน numpad ขยับตำแหน่งตอน error โผล่ */}
      <View style={{ height: 32, marginBottom: Math.round(12 * scale), justifyContent: "center" }}>
        {belowDots}
      </View>

      <View style={{ width: Math.round(260 * scale) }}>
        {KEYS.map((row, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: Math.round(14 * scale) }}>
            {row.map((key, keyIndex) => {
              if (key === "") return <View key={keyIndex} style={{ width: keySize, height: keySize }} />;

              if (key === "biometric") {
                if (!onBiometric) return <View key={keyIndex} style={{ width: keySize, height: keySize, backgroundColor: "transparent" }} />;
                return (
                  <TouchableOpacity
                    key={keyIndex}
                    onPress={onBiometric}
                    activeOpacity={0.6}
                    style={{
                      width: keySize,
                      height: keySize,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "transparent",
                    }}
                  >
                    {biometricIcon === "faceid" || biometricIcon === "fingerprint" ? (
                      // สีถูก bake เข้าไปในตัวไฟล์ PNG แล้ว (ไม่ใช้ tintColor
                      // runtime) — บาง iOS/RN เวอร์ชันมี bug ที่ tintColor วาด
                      // เป็นกล่องทึบแทนที่จะ mask ตาม alpha จริงของภาพ local asset —
                      // ไม่ตั้ง backgroundColor/border ใดๆ ให้ Image เพื่อไม่ให้เกิด
                      // กรอบ/พื้นหลังทึบทับไอคอนที่ควรโปร่งใส
                      <Image
                        source={biometricIcon === "faceid" ? FACE_ID_ICON : FINGERPRINT_ICON}
                        style={{
                          width: biometricImageSize,
                          height: biometricImageSize,
                          backgroundColor: "transparent",
                        }}
                        resizeMode="contain"
                      />
                    ) : (
                      <Ionicons name={biometricIcon} size={biometricIconSize} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }

              if (key === "delete") {
                return (
                  <TouchableOpacity
                    key={keyIndex}
                    onPress={onDelete}
                    activeOpacity={0.7}
                    style={{ width: keySize, height: keySize, alignItems: "center", justifyContent: "center" }}
                  >
                    <Ionicons name="backspace-outline" size={deleteIconSize} color={colors.text} />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={keyIndex}
                  onPress={() => onDigit(key)}
                  activeOpacity={0.6}
                  disabled={value.length >= maxLength}
                  style={{
                    width: keySize,
                    height: keySize,
                    borderRadius: keySize / 2,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.fieldBg,
                  }}
                >
                  <Text style={{ fontSize: digitFontSize, fontWeight: "700", color: colors.text }}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

export default PinKeypad;
