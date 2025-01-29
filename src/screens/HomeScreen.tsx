import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  NativeModules,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import Toaster from "../utils/toasterConfig";
import { PlatformView } from "../components/PlatformView";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CreateGroupModal } from "../components/CreateGroupModal";
import { Group } from "../types/types";
import EmptyGroup from "../components/EmptyGroup";
import GroupList from "../components/GroupList";
import { useGroups } from "../hooks/useGroups";

const { StatusBarManager } = NativeModules;
const { width } = Dimensions.get("window");

type RootStackParamList = {
  Group: undefined;
  GroupDetails: {
    id: string;
    name: string;
    icon: string;
    color: string;
    memberCount: number;
  };
  // add other screens here
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const { user, signOut } = useAuth();
  const { groups, groupsLoading, fetchGroups } = useGroups(user?.id || "");

  const [statusBarHeight, setStatusBarHeight] = React.useState(0);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateGroupModal, setIsCreateGroupModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const navigation = useNavigation<NavigationProp>();

  React.useEffect(() => {
    if (Platform.OS === "ios") {
      StatusBarManager.getHeight((statusBarFrameData: { height: number }) => {
        setStatusBarHeight(statusBarFrameData.height - 30);
      });
    }
  }, []);

  const topPadding =
    Platform.OS === "ios"
      ? { paddingTop: statusBarHeight }
      : { paddingTop: StatusBar.currentHeight ?? 0 };

  const toggleSidebar = (show: boolean) => {
    setSidebarOpen(show);
    Animated.timing(slideAnim, {
      toValue: show ? 0 : -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  const menuItems = [
    { icon: "dashboard", label: "Dashboard" },
    { icon: "group", label: "Groups" },
    { icon: "account-balance-wallet", label: "Transactions" },
    { icon: "pie-chart", label: "Analytics" },
    { icon: "settings", label: "Settings" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, topPadding]}>
        <TouchableOpacity
          onPress={() => toggleSidebar(true)}
          style={styles.menuButton}
        >
          <Icon name="menu" size={24} color="#1a1a1a" />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {user?.user_metadata?.name || "User"}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {(user?.user_metadata?.name?.[0] || "U").toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sidebar Modal */}
      <Modal
        visible={isSidebarOpen}
        transparent={true}
        animationType="none"
        onRequestClose={() => toggleSidebar(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => toggleSidebar(false)}
        >
          <Animated.View
            style={[
              styles.sidebar,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={styles.sidebarHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => toggleSidebar(false)}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => {
                    if (item.label === "Groups") {
                      navigation.navigate("Group");
                    }
                    toggleSidebar(false);
                  }}
                >
                  <Icon name={item.icon} size={24} color="#1a1a1a" />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
              <Icon name="logout" size={24} color="#EA4335" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PlatformView
          style={styles.balanceCard}
          ios={{
            style: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
            },
          }}
          android={{
            style: {
              elevation: 4,
            },
          }}
        >
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>₹24,500.00</Text>
          <View style={styles.balanceStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={[styles.statAmount, styles.incomeText]}>
                ₹32,500
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Expenses</Text>
              <Text style={[styles.statAmount, styles.expenseText]}>
                ₹8,000
              </Text>
            </View>
          </View>
        </PlatformView>

        <PlatformView
          style={styles.transactionsContainer}
          ios={{
            style: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
            },
          }}
          android={{
            style: {
              elevation: 4,
            },
          }}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>

          {[1, 2, 3].map((item) => (
            <TouchableOpacity key={item} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                <Text style={styles.transactionIconText}>🛒</Text>
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>Grocery Shopping</Text>
                <Text style={styles.transactionDate}>Today, 2:30 PM</Text>
              </View>
              <Text style={styles.transactionAmount}>-₹2,500</Text>
            </TouchableOpacity>
          ))}
        </PlatformView>

        <View style={styles.groupsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Groups</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setIsCreateGroupModal(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Create Group</Text>
            </TouchableOpacity>
          </View>

          {isCreateGroupModal && (
            <CreateGroupModal
              visible={isCreateGroupModal}
              onClose={() => setIsCreateGroupModal(false)}
              onSuccess={() => {
                setIsCreateGroupModal(false);
              }}
              userId={user?.id || ""}
            />
          )}

          {groups.length === 0 && !groupsLoading && (
            <EmptyGroup setModalVisible={setIsCreateGroupModal} />
          )}
          {groups.length > 0 && (
            <GroupList groups={groups} loading={groupsLoading} />
          )}
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  menuButton: {
    padding: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userDetails: {
    marginRight: 12,
    alignItems: "flex-end",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  userEmail: {
    fontSize: 12,
    color: "#666",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1a73e8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sidebar: {
    width: "80%",
    maxWidth: 300,
    backgroundColor: "#fff",
    height: "100%",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 16,
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  menuItems: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemText: {
    marginLeft: 16,
    fontSize: 16,
    color: "#1a1a1a",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: "auto",
    marginBottom: 20,
  },
  logoutText: {
    marginLeft: 16,
    fontSize: 16,
    color: "#EA4335",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  balanceCard: {
    margin: 16,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  balanceLabel: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginVertical: 8,
  },
  balanceStats: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statItem: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 20,
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  statAmount: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 4,
  },
  incomeText: {
    color: "#34A853",
  },
  expenseText: {
    color: "#EA4335",
  },
  transactionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  seeAllButton: {
    color: "#1a73e8",
    fontSize: 14,
    fontWeight: "500",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Platform.OS === "ios" ? 12 : 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    ...Platform.select({
      android: {
        paddingHorizontal: 4,
      },
    }),
  },
  transactionIcon: {
    width: Platform.OS === "ios" ? 36 : 40,
    height: Platform.OS === "ios" ? 36 : 40,
    borderRadius: Platform.OS === "ios" ? 18 : 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 18,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  transactionDate: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EA4335",
  },
  groupsSection: {
    padding: 16,
  },
  addButton: {
    backgroundColor: "#1a73e8",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
