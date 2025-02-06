import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";

type HelpSupportScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const supportItems = [
  {
    icon: "chat",
    label: "Live Chat",
    description: "Chat with our support team",
    color: "#1a73e8",
    action: "chat",
  },
  {
    icon: "email",
    label: "Email Support",
    description: "support@example.com",
    color: "#34a853",
    action: "email",
  },
  {
    icon: "help-outline",
    label: "FAQs",
    description: "Frequently asked questions",
    color: "#fbbc04",
    action: "faq",
  },
  {
    icon: "description",
    label: "User Guide",
    description: "Learn how to use the app",
    color: "#ea4335",
    action: "guide",
  },
  {
    icon: "feedback",
    label: "Send Feedback",
    description: "Help us improve",
    color: "#9334ea",
    action: "feedback",
  },
];

export function HelpSupportScreen() {
  const navigation = useNavigation<HelpSupportScreenNavigationProp>();

  const handleSupportAction = (action: string) => {
    switch (action) {
      case "email":
        Linking.openURL("mailto:support@example.com");
        break;
      case "chat":
        // Implement live chat
        break;
      case "faq":
        // Navigate to FAQ screen
        break;
      case "guide":
        // Navigate to user guide
        break;
      case "feedback":
        // Open feedback form
        break;
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
        <Text style={styles.title}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.supportSection}>
          {supportItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.supportItem}
              onPress={() => handleSupportAction(item.action)}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: item.color }]}
              >
                <Icon name={item.icon} size={24} color="#fff" />
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact Hours</Text>
          <Text style={styles.contactText}>
            Monday - Friday: 9:00 AM - 6:00 PM
          </Text>
          <Text style={styles.contactText}>
            Saturday - Sunday: 10:00 AM - 4:00 PM
          </Text>
          <Text style={styles.timeZone}>(Eastern Time)</Text>
        </View>

        <View style={styles.infoSection}>
          <Icon name="info" size={20} color="#666" />
          <Text style={styles.infoText}>
            For urgent matters outside business hours, please email us and we'll
            respond as soon as possible.
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
  supportSection: {
    padding: 16,
  },
  supportItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  contactSection: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    marginHorizontal: 16,
    borderRadius: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  timeZone: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  infoSection: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#f8f9fa",
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
