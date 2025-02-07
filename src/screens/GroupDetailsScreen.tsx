import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Toaster from "../utils/toasterConfig";
import { useGroupMembers } from "../hooks/useGroupMembers";
import { GroupSettingsModal } from "../components/GroupSettingsModal";
import { NavigationProp } from "@react-navigation/native";
import { Expense, GroupDetails } from "../types/types";
import { AddExpenseModal } from "../components/AddExpenseModal";
import { ExpenseList } from "../components/ExpenseList";
import { useExpenses } from "../hooks/useExpenses";
import { SettleUpModal } from "../components/SettleUpModal";
import { AddMemberModal } from "../components/group/AddMemberModal";
import { ShowAllMemberModal } from "../components/group/ShowAllMemberModal";
import { GroupHeader } from "../components/group/GroupHeader";
import { QuickActions } from "../components/group/QuickActions";

export function GroupDetailsScreen() {
  const route = useRoute<any>();
  const navigation =
    useNavigation<NavigationProp<{ GroupDetails: GroupDetails }>>();
  const { user } = useAuth();
  const { id: groupId, name, icon, color, memberCount } = route.params;
  const { members, membersLoading, fetchMembers } = useGroupMembers(groupId);
  const { sharedExpenses, expensesLoading, fetchExpenses } =
    useExpenses(groupId);

  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<GroupDetails>(route.params);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>();
  const [showSettleUpModal, setShowSettleUpModal] = useState(false);

  const isAdmin = members.find((m) => m.id === user?.id)?.role === "admin";

  useEffect(() => {
    if (currentGroup) {
      navigation.setParams({
        id: groupId,
        name: currentGroup.name,
        icon: currentGroup.icon,
        color: currentGroup.color,
        memberCount: currentGroup.memberCount,
      });
    }
  }, [currentGroup]);

  useEffect(() => {
    fetchMembers();
    fetchExpenses();
  }, [groupId]);

  if (membersLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  const handleAddMember = async (email: string) => {
    setAddingMember(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email.toLowerCase())
        .single();

      if (userError) {
        Toaster({ type: "error", text1: "Error", text2: "User not found" });
        return;
      }

      const { data: existingMember } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", groupId)
        .eq("user_id", userData.id)
        .single();

      if (existingMember) {
        Toaster({
          type: "error",
          text1: "Error",
          text2: "User is already a member",
        });
        return;
      }

      await supabase
        .from("group_members")
        .insert([{ group_id: groupId, user_id: userData.id, role: "member" }]);

      Toaster({
        type: "success",
        text1: "Success",
        text2: "Member added successfully",
      });
      setShowAddMemberModal(false);
      fetchMembers();
    } catch (error: any) {
      Toaster({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to add member",
      });
    } finally {
      setAddingMember(false);
    }
  };

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
      <GroupHeader
        name={name}
        icon={icon}
        color={color}
        navigation={navigation}
        onSettingsPress={() => setShowSettingsModal(true)}
      />

      <QuickActions
        onAddExpense={() => setShowAddExpenseModal(true)}
        onAddMember={() => setShowAddMemberModal(true)}
        onSettleUp={() => setShowSettleUpModal(true)}
      />

      <View style={styles.content}>
        {/* Members Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Members ({memberCount || 0})
            </Text>
            <TouchableOpacity onPress={() => setShowMembersModal(true)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {members.slice(0, 3).map((member) => (
            <View key={member.id} style={styles.memberPreview}>
              {member.avatar_url ? (
                <Image
                  source={{ uri: member.avatar_url }}
                  style={styles.memberAvatar}
                />
              ) : (
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {member.name[0].toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.memberPreviewName}>{member.name}</Text>
            </View>
          ))}
        </View>

        {/* Expense Summary Section */}
        <View style={styles.section}>
          <View style={styles.expenseSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Expenses</Text>
              <Text style={styles.summaryAmount}>
                ₹
                {sharedExpenses
                  .map((exp) => exp.amount)
                  .reduce((a, b) => a + b, 0)
                  .toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Your Expenses</Text>
              <Text style={styles.summaryAmount}>
                ₹
                {sharedExpenses
                  .reduce(
                    (sum, exp) =>
                      exp.paidById === user?.id ? sum + exp.amount : sum,
                    0
                  )
                  .toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* All Expenses Section */}
        <View style={[styles.section, styles.expensesSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Expenses</Text>
            <TouchableOpacity
              style={styles.addExpenseButton}
              onPress={() => setShowAddExpenseModal(true)}
            >
              <Icon name="add" size={20} color="#fff" />
              <Text style={styles.addExpenseText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
          <ExpenseList
            expenses={sharedExpenses}
            isLoading={expensesLoading}
            onEditExpense={handleEditExpense}
          />
        </View>
      </View>

      <ShowAllMemberModal
        showMembersModal={showMembersModal}
        setShowMembersModal={setShowMembersModal}
        members={members}
      />
      <AddMemberModal
        visible={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onAdd={handleAddMember}
        loading={addingMember}
      />
      <GroupSettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        groupDetails={currentGroup}
        isAdmin={isAdmin}
        navigation={navigation}
        onGroupUpdated={setCurrentGroup}
      />
      <AddExpenseModal
        visible={showAddExpenseModal}
        groupId={groupId}
        expense={expenseToEdit}
        onClose={() => {
          setShowAddExpenseModal(false);
          setExpenseToEdit(undefined);
        }}
        onSuccess={() => {
          fetchMembers();
          fetchExpenses();
          setExpenseToEdit(undefined);
        }}
      />
      <SettleUpModal
        visible={showSettleUpModal}
        onClose={() => setShowSettleUpModal(false)}
        members={members}
        expenses={sharedExpenses}
        userId={user?.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  section: {
    backgroundColor: "#fff",
    marginBottom: 8,
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
  seeAllText: {
    fontSize: 14,
    color: "#1a73e8",
    fontWeight: "500",
  },
  memberPreview: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1a73e8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  memberPreviewName: {
    fontSize: 16,
    color: "#1a1a1a",
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  expenseSummary: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 16,
  },
  expensesSection: {
    flex: 1,
    marginBottom: 0,
  },
  addExpenseButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a73e8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addExpenseText: {
    color: "#fff",
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
  },
  memberAvatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
