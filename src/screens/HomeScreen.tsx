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
import { PlatformView } from "../components/PlatformView";
import { useAuth } from "../hooks/useAuth";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CreateGroupModal } from "../components/CreateGroupModal";
import EmptyGroup from "../components/EmptyGroup";
import GroupList from "../components/GroupList";
import { useGroups } from "../hooks/useGroups";
import { ExpenseList } from "../components/ExpenseList";
import { useExpenses } from "../hooks/useExpenses";
import { useIncome } from "../hooks/useIncome";
import { AddIncomeModal } from "../components/AddIncomeModal";
import { AddExpenseModal } from "../components/AddExpenseModal";
import Toaster from "../utils/toasterConfig";
import { Expense, RootStackParamList } from "../types/types";

const { StatusBarManager } = NativeModules;
const { width } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const { user } = useAuth();
  const { groups, groupsLoading, fetchGroups } = useGroups(user?.id || "");
  const { allExpenses, expensesLoading, fetchExpenses } = useExpenses(
    undefined,
    user?.id
  );
  const {
    income,
    balance,
    loading: incomeLoading,
    fetchIncome,
  } = useIncome(user?.id);

  const [statusBarHeight, setStatusBarHeight] = React.useState(0);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateGroupModal, setIsCreateGroupModal] = useState(false);
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>();
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

  useEffect(() => {
    if (user?.id) {
      fetchExpenses();
      fetchIncome();
    }
  }, [user?.id]);

  const menuItems = [
    { icon: "dashboard", label: "Home" },
    { icon: "group", label: "Group" },
    { icon: "account-balance-wallet", label: "Transaction" },
    { icon: "pie-chart", label: "Analytics" },
    { icon: "settings", label: "Profile" },
  ];

  const handleEditExpense = (expense: Expense) => {
    if (expense.paidById !== user?.id) {
      Toaster({
        type: "error",
        text1: "Error",
        text2: "You can only edit your own expenses",
      });
      return;
    }
    setExpenseToEdit(expense);
    setShowAddExpenseModal(true);
  };

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
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
            style={styles.avatarButton}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.user_metadata?.name?.[0].toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sidebar Modal */}
      <Modal
        visible={isSidebarOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => toggleSidebar(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => toggleSidebar(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.sidebar}
            onPress={(e) => e.stopPropagation()}
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
                    navigation.navigate(item.label as keyof RootStackParamList);
                    toggleSidebar(false);
                  }}
                >
                  <Icon name={item.icon} size={24} color="#1a1a1a" />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
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
          <Text style={styles.balanceAmount}>
            ₹ {balance < 0 ? "-" : ""}
            {Math.abs(balance).toFixed(2)}
            {balance < 0 && <Text style={styles.negativeIndicator}> DR</Text>}
          </Text>
          <View style={styles.balanceStats}>
            <View style={styles.statItem}>
              <View style={styles.incomeContainer}>
                <View>
                  <Text style={styles.statLabel}>Monthly Income</Text>
                  <Text style={[styles.statAmount, styles.incomeText]}>
                    ₹{income?.amount?.toFixed(2) || "0.00"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowAddIncomeModal(true)}
                  style={styles.addButton}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.incomeContainer}>
                <View>
                  <Text style={styles.statLabel}>Balance</Text>
                  <Text
                    style={[
                      styles.statAmount,
                      balance >= 0 ? styles.incomeText : styles.expenseText,
                    ]}
                  >
                    ₹{Math.abs(balance).toFixed(2)}
                    {balance < 0 && (
                      <Text style={styles.negativeIndicator}> DR</Text>
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.expenseActionButton}
              onPress={() => setShowAddExpenseModal(true)}
            >
              <View style={styles.expenseIconContainer}>
                <Icon name="receipt-long" size={20} color="#EA4335" />
              </View>
              <Text style={styles.expenseActionText}>Add Expense</Text>
              <Icon name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
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
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Transaction")}
            >
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>
          <ExpenseList
            expenses={allExpenses}
            isLoading={expensesLoading}
            onEditExpense={handleEditExpense}
          />
        </PlatformView>

        <View style={styles.groupsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Groups</Text>
            <TouchableOpacity
              style={styles.addGroupButton}
              onPress={() => {
                setIsCreateGroupModal(true);
              }}
            >
              <Text style={styles.addGroupButtonText}>+ Create Group</Text>
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

      <AddIncomeModal
        visible={showAddIncomeModal}
        onClose={() => setShowAddIncomeModal(false)}
        onSuccess={fetchIncome}
      />

      <AddExpenseModal
        visible={showAddExpenseModal}
        expense={expenseToEdit}
        onClose={() => {
          setShowAddExpenseModal(false);
          setExpenseToEdit(undefined);
        }}
        onSuccess={() => {
          fetchExpenses();
          fetchIncome();
          setExpenseToEdit(undefined);
        }}
      />
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
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1a73e8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#1a1a1a",
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
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  seeAllButton: {
    color: "#1a73e8",
    fontSize: 14,
    fontWeight: "500",
  },
  groupsSection: {
    padding: 16,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#34a853",
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: -2, // Visual alignment
  },
  incomeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  addGroupButton: {
    backgroundColor: "#1a73e8",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addGroupButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  negativeIndicator: {
    fontSize: 12,
    color: "#EA4335",
  },
  expenseButton: {
    backgroundColor: "#EA4335", // Red color for expense button
  },
  actionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  expenseActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  expenseIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fee8e7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  expenseActionText: {
    flex: 1,
    fontSize: 15,
    color: "#1a1a1a",
    fontWeight: "500",
  },
});
