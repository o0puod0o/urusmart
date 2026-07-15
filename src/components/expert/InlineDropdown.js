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

const MAX_LIST_H = 300;

const InlineDropdown = ({
  label,
  value,
  options = [],
  onSelect,
  required = false,
  searchable = false,
  loading = false,
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

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
      {/* Label */}
      <Text style={{ fontSize: 12, fontWeight: "700", color: "#5a6a6f", marginBottom: 6, letterSpacing: 0.2 }}>
        {label}
        {required && <Text style={{ color: "#e05252" }}> *</Text>}
      </Text>

      {loading ? (
        <View style={styles.trigger}>
          <ActivityIndicator size="small" color="#007a5a" />
          <Text style={{ marginLeft: 8, fontSize: 13, color: "#9aa6b1" }}>กำลังโหลด...</Text>
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
              hasValue && styles.triggerSelected,
              open && styles.triggerOpen,
            ]}
          >
            {hasValue ? (
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 7 }}>
                <View style={styles.selectedDot} />
                <Text style={styles.selectedText} numberOfLines={1}>{selected.label}</Text>
              </View>
            ) : (
              <Text style={styles.placeholderText} numberOfLines={1}>
                {options[0]?.label ?? "เลือก..."}
              </Text>
            )}
            <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
              <Ionicons name="chevron-down" size={16} color={open || hasValue ? "#007a5a" : "#9aa6b1"} />
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
                            <Ionicons name="search-outline" size={14} color="#007a5a" />
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
                              <Ionicons name="close-circle" size={16} color="#9aa6b1" />
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
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#dde5e2",
    backgroundColor: "#f8fafb",
    gap: 8,
  },
  triggerSelected: {
    borderColor: "#a8d5be",
    backgroundColor: "#f4fbf7",
  },
  triggerOpen: {
    borderColor: "#007a5a",
    backgroundColor: "#eef8f3",
  },
  selectedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#007a5a",
    flexShrink: 0,
  },
  selectedText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2a2e",
  },
  placeholderText: {
    flex: 1,
    fontSize: 14,
    color: "#aab8b2",
    fontWeight: "400",
  },
  panel: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d0e8dc",
    overflow: "hidden",
    elevation: 16,
    shadowColor: "#064e35",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eef1f4",
    backgroundColor: "#f8fbf9",
  },
  searchIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#e6f4ef",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1f2a2e",
    paddingVertical: 0,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f6f4",
    gap: 10,
  },
  optionRowSelected: {
    backgroundColor: "#edf9f3",
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
    backgroundColor: "#007a5a",
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: "#3f4d50",
    fontWeight: "400",
    lineHeight: 20,
  },
  optionTextSelected: {
    color: "#007a5a",
    fontWeight: "700",
  },
  optionTextPlaceholder: {
    color: "#9aa6b1",
    fontStyle: "italic",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: "#9aa6b1",
    fontWeight: "500",
  },
};

export default InlineDropdown;
