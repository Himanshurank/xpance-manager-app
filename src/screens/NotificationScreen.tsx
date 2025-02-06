import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

const CustomToggle = ({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
}) => (
  <TouchableOpacity
    onPress={() => onValueChange(!value)}
    style={[
      styles.toggleContainer,
      { backgroundColor: value ? "#1a73e8" : "#f0f0f0" },
    ]}
  >
    <View
      style={[
        styles.toggleCircle,
        { transform: [{ translateX: value ? 16 : 0 }] },
      ]}
    />
  </TouchableOpacity>
);

export function NotificationScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    expenseAlerts: true,
    groupUpdates: true,
    balanceReminders: true,
    weeklyReport: true,
  });

  const updateNotificationSetting = async (key: string, value: boolean) => {
    try {
      setSettings((prev) => ({ ...prev, [key]: value }));

      // Update in Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          notification_settings: {
            ...settings,
            [key]: value,
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error updating notification settings:", error);
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
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Settings</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive push notifications on your device
              </Text>
            </View>
            <CustomToggle
              value={settings.pushEnabled}
              onValueChange={(value) =>
                updateNotificationSetting("pushEnabled", value)
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Email Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications via email
              </Text>
            </View>
            <CustomToggle
              value={settings.emailEnabled}
              onValueChange={(value) =>
                updateNotificationSetting("emailEnabled", value)
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Expense Alerts</Text>
              <Text style={styles.settingDescription}>
                New expenses and payment reminders
              </Text>
            </View>
            <CustomToggle
              value={settings.expenseAlerts}
              onValueChange={(value) =>
                updateNotificationSetting("expenseAlerts", value)
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Group Updates</Text>
              <Text style={styles.settingDescription}>
                Changes in group members and settings
              </Text>
            </View>
            <CustomToggle
              value={settings.groupUpdates}
              onValueChange={(value) =>
                updateNotificationSetting("groupUpdates", value)
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Balance Reminders</Text>
              <Text style={styles.settingDescription}>
                Periodic balance and settlement reminders
              </Text>
            </View>
            <CustomToggle
              value={settings.balanceReminders}
              onValueChange={(value) =>
                updateNotificationSetting("balanceReminders", value)
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Weekly Report</Text>
              <Text style={styles.settingDescription}>
                Weekly summary of your expenses
              </Text>
            </View>
            <CustomToggle
              value={settings.weeklyReport}
              onValueChange={(value) =>
                updateNotificationSetting("weeklyReport", value)
              }
            />
          </View>
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
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
  },
  toggleContainer: {
    width: 40,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: "center",
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 2,
  },
});
