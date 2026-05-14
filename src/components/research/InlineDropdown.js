import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const InlineDropdown = ({
  label,
  value,
  options,
  onSelect,
  required,
  searchable = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = options.find((o) => o.id === value);

  const filteredOptions = useMemo(() => {
    if (!search?.trim() || !searchable) return options;
    const lower = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(lower) ||
        String(opt.id).toLowerCase().includes(lower),
    );
  }, [options, search, searchable]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TouchableOpacity
        style={[styles.dropdown, open && styles.dropdownOpen]}
        onPress={() => {
          setOpen(!open);
          setSearch("");
        }}
        activeOpacity={0.8}
      >
        <Text
          style={[styles.dropdownText, !selected?.id && { color: "#bbb" }]}
          numberOfLines={1}
        >
          {selected?.id ? selected.label : options[0]?.label}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color="#888"
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.list}>
          {searchable && (
            <View style={styles.searchBox}>
              <Ionicons name="search" size={16} color="#888" />
              <TextInput
                style={styles.searchInput}
                placeholder="ค้นหา..."
                placeholderTextColor="#999"
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
            </View>
          )}
          <ScrollView
            nestedScrollEnabled
            bounces={false}
            style={{ maxHeight: 260 }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.item, opt.id === value && styles.itemActive]}
                  onPress={() => {
                    onSelect(opt.id);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <View style={styles.itemRow}>
                    <View style={styles.checkBox}>
                      {opt.id === value && (
                        <Ionicons name="checkmark" size={13} color="#1a6b3c" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.itemText,
                        opt.id === value && styles.itemTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>ไม่พบรายการ</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingVertical: 12 },
  label: { fontSize: 12, color: "#888", fontWeight: "500", marginBottom: 6 },
  required: { color: "#e74c3c" },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#e8ecf0",
  },
  dropdownOpen: {
    borderColor: "#1a6b3c",
    backgroundColor: "#f0faf4",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownText: { fontSize: 14, color: "#1a1a2e", flex: 1 },
  list: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#1a6b3c",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f7",
    backgroundColor: "#fafafa",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#1a1a2e",
    paddingVertical: 0,
  },
  item: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f7",
  },
  itemActive: { backgroundColor: "#f0faf4" },
  itemRow: { flexDirection: "row", alignItems: "center" },
  checkBox: { width: 20, alignItems: "center", marginRight: 6 },
  itemText: { fontSize: 13, color: "#444", flex: 1 },
  itemTextActive: { color: "#1a6b3c", fontWeight: "600" },
});

export default InlineDropdown;
