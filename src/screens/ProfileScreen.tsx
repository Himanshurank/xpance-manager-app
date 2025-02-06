import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";

const menuItems = [
  {
    icon: "account-circle",
    label: "Personal Information",
    color: "#1a73e8",
  },
  {
    icon: "notifications",
    label: "Notifications",
    color: "#fbbc04",
  },
  {
    icon: "security",
    label: "Security",
    color: "#34a853",
  },
  {
    icon: "payment",
    label: "Payment Methods",
    color: "#ea4335",
  },
  {
    icon: "help",
    label: "Help & Support",
    color: "#9334ea",
  },
];

export function ProfileScreen() {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.editButton}>
          <Icon name="edit" size={24} color="#1a73e8" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.user_metadata?.name?.[0].toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity style={styles.changePhotoButton}>
              <Icon name="camera-alt" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user?.user_metadata?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View
                style={[styles.iconContainer, { backgroundColor: item.color }]}
              >
                <Icon name={item.icon} size={24} color="#fff" />
              </View>
              <Text style={styles.menuItemText}>{item.label}</Text>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Icon name="logout" size={24} color="#ea4335" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    padding: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1a73e8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "600",
  },
  changePhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1a73e8",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#666",
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
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginTop: 24,
  },
  logoutText: {
    marginLeft: 16,
    fontSize: 16,
    color: "#ea4335",
    fontWeight: "500",
  },
});
