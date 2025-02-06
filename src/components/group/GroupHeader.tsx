import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { NavigationProp } from "@react-navigation/native";

interface Props {
  name: string;
  icon: string;
  color: string;
  navigation: NavigationProp<any>;
  onSettingsPress: () => void;
}

export function GroupHeader({
  name,
  icon,
  color,
  navigation,
  onSettingsPress,
}: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Icon name="arrow-back" size={24} color="#1a1a1a" />
      </TouchableOpacity>
      <View style={styles.headerTitle}>
        <View
          style={[styles.groupIcon, { backgroundColor: color || "#1a73e8" }]}
        >
          <Icon name={icon || "group"} size={24} color="#fff" />
        </View>
        <Text style={styles.groupName}>{name || ""}</Text>
      </View>
      <TouchableOpacity style={styles.moreButton} onPress={onSettingsPress}>
        <Icon name="more-vert" size={24} color="#1a1a1a" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  moreButton: {
    padding: 8,
  },
});
