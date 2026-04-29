import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Linking,
} from "react-native";

const ServiceIconItem = ({
  icon,
  label,
  url,
  onPress,
  bgColor = "#e8f5ee",
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      <View style={[styles.box, { backgroundColor: bgColor }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: 5,
  },
  box: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#00000008",
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontSize: 9,
    color: "#555",
    textAlign: "center",
    lineHeight: 13,
  },
});

export default ServiceIconItem;
