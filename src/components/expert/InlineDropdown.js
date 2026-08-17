import React, { useRef, useState, useMemo, useEffect } from "react";
import {
  Animated,
  ActivityIndicator,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors, radius, shadows, spacing, typography } from "../../theme/tokens";

const MAX_LIST_H = 300;

const InlineDropdown = ({
  label,
  value,
  options = [],
  onSelect,
  placeholder,
  required = false,
  searchable = false,
  loading = false,
  containerStyle,
  triggerStyle,
  selectedTextStyle,
  placeholderTextStyle,
  panelStyle,
}) => {
  const { t } = useTranslation();
  const { height: screenHeight } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropPos, setDropPos] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const triggerRef = useRef(null);

  // animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-6)).current;
  const chevronAnim = useRef(new Animated.Value(0)).current;

  const selected = options.find((o) => String(o.id) === String(value) && o.id !== "");
  const hasValue = !!selected;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(chevronAnim, {
        toValue: open ? 1 : 0,
        duration: 200,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  }, [open]);

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(-6);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 160, useNativeDriver: Platform.OS !== "web" }),
      Animated.spring(slideAnim, { toValue: 0, speed: 28, bounciness: 4, useNativeDriver: Platform.OS !== "web" }),
    ]).start();
  };

  const animateOut = (cb) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: Platform.OS !== "web" }),
      Animated.timing(slideAnim, { toValue: -4, duration: 120, useNativeDriver: Platform.OS !== "web" }),
    ]).start(() => cb?.());
  };

  const handleOpen = () => {
    if (loading) return;
    triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const usable = screenHeight - keyboardHeight;
      const spaceBelow = usable - (pageY + height);
      const spaceAbove = pageY;
      const flipUp = spaceBelow < 220;
      const listH = flipUp
        ? Math.max(120, Math.min(MAX_LIST_H, spaceAbove - 24))
        : Math.max(120, Math.min(MAX_LIST_H, spaceBelow - 16));
      const top = flipUp
        ? Math.max(16, pageY - listH - 4)
        : pageY + height + 4;
      setDropPos({ top, left: pageX, width, maxHeight: listH });
      setOpen(true);
      setSearch("");
      animateIn();
    });
  };

  // ปรับ dropdown ให้ขึ้นเมื่อ keyboard โผล่
  useEffect(() => {
    if (!open) return;
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const onShow = (e) => {
      const kbH = e.endCoordinates.height;
      setKeyboardHeight(kbH);
      setDropPos((prev) => {
        if (!prev) return prev;
        const usable = screenHeight - kbH - 8;
        if (prev.top + prev.maxHeight > usable) {
          const newMaxH = Math.max(120, usable - prev.top);
          const newTop = newMaxH < 120 ? Math.max(16, usable - 120 - 4) : prev.top;
          return { ...prev, top: newTop, maxHeight: Math.max(120, usable - newTop) };
        }
        return prev;
      });
    };
    const onHide = () => setKeyboardHeight(0);
    const s1 = Keyboard.addListener(showEvent, onShow);
    const s2 = Keyboard.addListener(hideEvent, onHide);
    return () => { s1.remove(); s2.remove(); };
  }, [open, screenHeight]);

  const handleClose = () => {
    animateOut(() => {
      setOpen(false);
      setSearch("");
    });
  };

  const handleSelect = (id) => {
    onSelect(id);
    animateOut(() => {
      setOpen(false);
      setSearch("");
    });
  };

  const filteredOptions = useMemo(() => {
    if (!search.trim() || !searchable) return options;
    const q = search.toLowerCase();
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || String(o.id).toLowerCase().includes(q)
    );
  }, [options, search, searchable]);

  const chevronRotate = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const displayPlaceholder = placeholder ?? options[0]?.label ?? "เลือก...";

  return (
    <View style={[{ paddingHorizontal: spacing.card, paddingVertical: 8 }, containerStyle]}>
      {!!label && (
        <Text style={[styles.label, { marginBottom: 7 }]}>
          {label}
          {required && <Text style={{ color: colors.danger }}> *</Text>}
        </Text>
      )}

      {loading ? (
        <View style={[styles.trigger, triggerStyle]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>กำลังโหลด...</Text>
        </View>
      ) : (
        <>
          {/* Trigger */}
          <TouchableOpacity
            ref={triggerRef}
            onPress={handleOpen}
            activeOpacity={0.75}
            style={[
              styles.trigger,
              triggerStyle,
              hasValue && styles.triggerSelected,
              open && styles.triggerOpen,
            ]}
          >
            {hasValue ? (
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 7 }}>
                <View style={styles.selectedDot} />
                <Text style={[styles.selectedText, selectedTextStyle]} numberOfLines={1}>{selected.label}</Text>
              </View>
            ) : (
              <Text style={[styles.placeholderText, placeholderTextStyle]} numberOfLines={1}>
                {displayPlaceholder}
              </Text>
            )}
            <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
              <Ionicons name="chevron-down" size={16} color={open || hasValue ? colors.primary : colors.placeholder} />
            </Animated.View>
          </TouchableOpacity>

          {/* Modal dropdown */}
          <Modal
            visible={open}
            transparent
            animationType="none"
            statusBarTranslucent={Platform.OS === "android"}
            onRequestClose={handleClose}
          >
            <TouchableWithoutFeedback onPress={handleClose}>
              <View style={{ flex: 1, backgroundColor: "rgba(10,30,20,0.18)" }}>
                {dropPos && (
                  <TouchableWithoutFeedback onPress={() => {}}>
                    <Animated.View
                      style={[
                        styles.panel,
                        panelStyle,
                        {
                          top: dropPos.top,
                          left: dropPos.left,
                          width: dropPos.width,
                          maxHeight: dropPos.maxHeight,
                          opacity: fadeAnim,
                          transform: [{ translateY: slideAnim }],
                        },
                      ]}
                    >
                      {/* Search bar */}
                      {searchable && (
                        <View style={styles.searchBar}>
                          <View style={styles.searchIconWrap}>
                            <Ionicons name="search-outline" size={14} color={colors.primary} />
                          </View>
                          <TextInput
                            style={styles.searchInput}
                            placeholder={t("research.common.search") ?? "ค้นหา..."}
                            placeholderTextColor="#aab8b2"
                            value={search}
                            onChangeText={setSearch}
                            autoCorrect={false}
                            clearButtonMode="while-editing"
                          />
                          {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                              <Ionicons name="close-circle" size={16} color={colors.placeholder} />
                            </TouchableOpacity>
                          )}
                        </View>
                      )}

                      <ScrollView
                        bounces={false}
                        keyboardShouldPersistTaps="always"
                        showsVerticalScrollIndicator={false}
                      >
                        {filteredOptions.length > 0 ? (
                          filteredOptions.map((opt, i) => {
                            const isSelected = String(opt.id) === String(value);
                            const isPlaceholder = opt.id === "" || opt.id === null;
                            return (
                              <TouchableOpacity
                                key={`${opt.id}-${i}`}
                                onPress={() => handleSelect(opt.id)}
                                activeOpacity={0.65}
                                style={[
                                  styles.optionRow,
                                  isSelected && styles.optionRowSelected,
                                  i === filteredOptions.length - 1 && { borderBottomWidth: 0 },
                                ]}
                              >
                                <View style={styles.checkCircle}>
                                  {isSelected && (
                                    <View style={styles.checkCircleFilled}>
                                      <Ionicons name="checkmark" size={10} color="#fff" />
                                    </View>
                                  )}
                                </View>
                                <Text
                                  style={[
                                    styles.optionText,
                                    isSelected && styles.optionTextSelected,
                                    isPlaceholder && styles.optionTextPlaceholder,
                                  ]}
                                  numberOfLines={2}
                                >
                                  {opt.label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })
                        ) : (
                          <View style={styles.emptyState}>
                            <Ionicons name="search-outline" size={24} color="#c4d4cc" />
                            <Text style={styles.emptyText}>{t("research.common.notFound") ?? "ไม่พบรายการ"}</Text>
                          </View>
                        )}
                      </ScrollView>
                    </Animated.View>
                  </TouchableWithoutFeedback>
                )}
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = {
  label: {
    ...typography.label,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    paddingHorizontal: spacing.fieldX,
    paddingVertical: spacing.fieldY,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.fieldBg,
    gap: 8,
  },
  loadingText: {
    ...typography.caption,
    marginLeft: 8,
  },
  triggerSelected: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.primarySoft,
  },
  triggerOpen: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  selectedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
    flexShrink: 0,
  },
  selectedText: {
    flex: 1,
    ...typography.input,
  },
  placeholderText: {
    flex: 1,
    ...typography.input,
    color: colors.placeholder,
    fontWeight: "500",
  },
  panel: {
    position: "absolute",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#cfe6db",
    overflow: "hidden",
    ...shadows.floating,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.fieldBg,
  },
  searchIconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.xs,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    ...typography.input,
    fontWeight: "500",
    paddingVertical: 0,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#edf3f0",
    gap: 10,
  },
  optionRowSelected: {
    backgroundColor: colors.primarySoft,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#c4d4cc",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkCircleFilled: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "400",
    lineHeight: 20,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: "700",
  },
  optionTextPlaceholder: {
    color: colors.placeholder,
    fontStyle: "italic",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: colors.placeholder,
    fontWeight: "500",
  },
};

export default InlineDropdown;
