import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { RootStackParamList } from "../../types/types";
import { User } from "@supabase/supabase-js";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "@react-navigation/native";

const menuItems = [
  {
    icon: "dashboard",
    label: "Home",
    title: "Home",
    description: "Overview & quick actions",
  },
  {
    icon: "group",
    label: "Group",
    title: "Groups",
    description: "Manage shared expenses",
  },
  {
    icon: "receipt-long",
    label: "Transaction",
    title: "Transactions",
    description: "View all expenses",
  },
  {
    icon: "pie-chart",
    label: "Analytics",
    title: "Analytics",
    description: "Spending insights",
  },
  {
    icon: "help-outline",
    label: "HelpSupport",
    title: "Help",
    description: "Support & guides",
  },
  {
    icon: "settings",
    label: "Profile",
    title: "Settings",
    description: "App preferences",
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  slideAnim: Animated.Value;
  user: User;
}

export const Sidebar = ({ isOpen, onClose, slideAnim, user }: SidebarProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <Animated.View
      style={[
        styles.sidebar,
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <View style={styles.sidebarContent}>
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.avatarText}>
              {user?.user_metadata?.name?.[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.user_metadata?.name || "User"}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.menuList}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                navigation.navigate(item.label as keyof RootStackParamList);
                onClose();
              }}
            >
              <View style={styles.menuItemIcon}>
                <Icon name={item.icon} size={24} color="#1a73e8" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemLabel}>{item.title}</Text>
                <Text style={styles.menuItemDescription}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: "85%",
    maxWidth: 360,
    backgroundColor: "#fff",
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
  sidebarContent: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1a73e8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  menuList: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemContent: {
    marginLeft: 12,
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  menuItemDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  versionInfo: {
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  versionText: {
    fontSize: 12,
    color: "#666",
  },
});
