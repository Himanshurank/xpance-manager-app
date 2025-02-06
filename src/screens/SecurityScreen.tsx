import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";

type SecurityScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const securityItems = [
  {
    icon: "lock",
    label: "Change Password",
    type: "navigate",
    color: "#34a853",
  },
  {
    icon: "fingerprint",
    label: "Biometric Authentication",
    type: "toggle",
    color: "#1a73e8",
  },
  {
    icon: "security",
    label: "Two-Factor Authentication",
    type: "toggle",
    color: "#fbbc04",
  },
  {
    icon: "devices",
    label: "Manage Devices",
    type: "navigate",
    color: "#ea4335",
  },
  {
    icon: "history",
    label: "Login History",
    type: "navigate",
    color: "#9334ea",
  },
];

export function SecurityScreen() {
  const navigation = useNavigation<SecurityScreenNavigationProp>();
  const [toggleStates, setToggleStates] = React.useState({
    "Biometric Authentication": false,
    "Two-Factor Authentication": false,
  });

  const handleToggle = (label: string) => {
    setToggleStates((prev) => ({
      ...prev,
      [label]: !prev[label as keyof typeof prev],
    }));
  };

  const handleMenuPress = (item: (typeof securityItems)[0]) => {
    if (item.type === "navigate") {
      switch (item.label) {
        case "Change Password":
          // Handle password change navigation or modal
          break;
        case "Manage Devices":
          // Handle devices navigation
          break;
        case "Login History":
          // Handle login history navigation
          break;
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.menuSection}>
          {securityItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item)}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: item.color }]}
              >
                <Icon name={item.icon} size={24} color="#fff" />
              </View>
              <Text style={styles.menuItemText}>{item.label}</Text>
              {item.type === "toggle" ? (
                <Switch
                  value={toggleStates[item.label as keyof typeof toggleStates]}
                  onValueChange={() => handleToggle(item.label)}
                  trackColor={{ false: "#767577", true: "#34a853" }}
                  thumbColor="#fff"
                />
              ) : (
                <Icon name="chevron-right" size={24} color="#666" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Icon name="info" size={20} color="#666" />
          <Text style={styles.infoText}>
            Enable two-factor authentication for enhanced account security. We
            recommend using biometric authentication for quick and secure
            access.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  menuSection: {
    padding: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a1a",
  },
  infoSection: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#f8f9fa",
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
