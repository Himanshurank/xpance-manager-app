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
import { Accordion } from "../components/common/Accordion";

type HelpSupportScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const supportItems = [
  {
    icon: "email",
    label: "Email Support",
    description: "support@example.com",
    color: "#34a853",
    action: "email",
    content: "For general inquiries and support",
  },
  {
    icon: "help-outline",
    label: "FAQs",
    description: "Common questions answered",
    color: "#fbbc04",
    action: "faq",
    content: [
      {
        question: "How do I create a new group?",
        answer:
          "Tap the + button on the Groups screen to create a new group. Enter the group name and add members.",
      },
      {
        question: "How do I add expenses?",
        answer:
          "In a group, tap 'Add Expense' and enter the expense details including amount and split type.",
      },
      {
        question: "How do I settle up?",
        answer:
          "Use the 'Settle Up' button in a group to see who owes whom and mark debts as settled.",
      },
      {
        question: "Can I edit or delete expenses?",
        answer:
          "Yes, you can edit or delete expenses you've created by tapping on the expense and using the edit/delete options.",
      },
    ],
  },
  {
    icon: "description",
    label: "User Guide",
    description: "Learn how to use the app",
    color: "#ea4335",
    action: "guide",
    content: [
      {
        title: "Getting Started",
        steps: [
          "Create an account or sign in",
          "Create a group for your expenses",
          "Add members to your group",
          "Start adding expenses",
        ],
      },
      {
        title: "Managing Expenses",
        steps: [
          "Add expenses with details",
          "Split expenses equally or custom",
          "View expense history",
          "Settle up with group members",
        ],
      },
      {
        title: "Group Management",
        steps: [
          "Add/remove members",
          "Update group settings",
          "View member balances",
          "Archive groups",
        ],
      },
    ],
  },
  {
    icon: "feedback",
    label: "Send Feedback",
    description: "Help us improve",
    color: "#9334ea",
    action: "feedback",
    content: "Share your experience and suggestions to help us improve the app",
  },
];

export function HelpSupportScreen() {
  const navigation = useNavigation<HelpSupportScreenNavigationProp>();

  const renderFAQContent = () => {
    const faqs = supportItems.find((item) => item.action === "faq")?.content;
    if (!Array.isArray(faqs)) return null;

    return faqs.map((faq: any, index: number) => (
      <View key={index} style={styles.faqItem}>
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <Text style={styles.faqAnswer}>{faq.answer}</Text>
      </View>
    ));
  };

  const renderGuideContent = () => {
    const guide = supportItems.find((item) => item.action === "guide")?.content;
    if (!Array.isArray(guide)) return null;

    return guide.map((section: any, index: number) => (
      <View key={index} style={styles.guideSection}>
        <Text style={styles.guideTitle}>{section.title}</Text>
        {section.steps.map((step: string, stepIndex: number) => (
          <View key={stepIndex} style={styles.guideStep}>
            <Text style={styles.stepNumber}>{stepIndex + 1}.</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    ));
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
          <Accordion title="Email Support" icon="email" iconColor="#34a853">
            <TouchableOpacity
              onPress={() => Linking.openURL("mailto:rankhimanshu@gmail.com")}
              style={styles.emailButton}
            >
              <Text style={styles.emailButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </Accordion>

          <Accordion
            title="Frequently Asked Questions"
            icon="help-outline"
            iconColor="#fbbc04"
          >
            {renderFAQContent()}
          </Accordion>

          <Accordion title="User Guide" icon="description" iconColor="#ea4335">
            {renderGuideContent()}
          </Accordion>

          <Accordion title="Send Feedback" icon="feedback" iconColor="#9334ea">
            <Text style={styles.feedbackText}>
              Share your experience and suggestions to help us improve the app
            </Text>
            <TouchableOpacity
              style={styles.emailButton}
              onPress={() => Linking.openURL("mailto:rankhimanshu@gmail.com")}
            >
              <Text style={styles.emailButtonText}>Send Feedback</Text>
            </TouchableOpacity>
          </Accordion>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Support Hours</Text>
          <Text style={styles.contactText}>
            Monday - Friday: 9:00 AM - 6:00 PM
          </Text>
          <Text style={styles.contactText}>
            Saturday - Sunday: 10:00 AM - 4:00 PM
          </Text>
          <Text style={styles.timeZone}>(Eastern Time)</Text>
        </View>

        <View style={styles.versionSection}>
          <Text style={styles.versionText}>App Version: 1.0.0</Text>
          <TouchableOpacity style={styles.termsButton}>
            <Text style={styles.termsText}>Terms & Privacy Policy</Text>
          </TouchableOpacity>
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
  emailButton: {
    backgroundColor: "#1a73e8",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  emailButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
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
  versionSection: {
    padding: 16,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  versionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  termsButton: {
    padding: 8,
  },
  termsText: {
    fontSize: 14,
    color: "#1a73e8",
    textDecorationLine: "underline",
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  guideSection: {
    marginBottom: 20,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  guideStep: {
    flexDirection: "row",
    marginBottom: 8,
  },
  stepNumber: {
    width: 24,
    fontSize: 14,
    color: "#666",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  feedbackText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
