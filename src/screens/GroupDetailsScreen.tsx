import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
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

interface AddMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (email: string) => Promise<void>;
  loading: boolean;
}

export function GroupDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<
    NavigationProp<{
      GroupDetails: GroupDetails;
    }>
  >();
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

  const onGroupUpdated = (updatedGroup: GroupDetails) => {
    setCurrentGroup(updatedGroup);
  };

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

  const MembersModal = () => (
    <Modal
      visible={showMembersModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowMembersModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Group Members</Text>
            <TouchableOpacity
              onPress={() => setShowMembersModal(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.membersList}>
            {members.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <View style={styles.memberInfo}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.avatarText}>
                      {member.name[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  </View>
                </View>
                <View style={styles.memberRole}>
                  <Text
                    style={[
                      styles.roleText,
                      member.role === "admin" && styles.adminRole,
                    ]}
                  >
                    {member.role}
                  </Text>
                  {user?.id === member.id && (
                    <Text style={styles.youText}>(You)</Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const handleAddMember = async (email: string) => {
    setAddingMember(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email.toLowerCase())
        .single();

      if (userError) {
        Toaster({
          type: "error",
          text1: "Error",
          text2: "User not found",
        });
        return;
      }

      const { data: existingMember, error: memberCheckError } = await supabase
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

      const { error: addError } = await supabase.from("group_members").insert([
        {
          group_id: groupId,
          user_id: userData.id,
          role: "member",
        },
      ]);

      if (addError) throw addError;

      Toaster({
        type: "success",
        text1: "Success",
        text2: "Member added successfully",
      });

      setShowAddMemberModal(false);
      fetchMembers();
    } catch (error: any) {
      console.error("Error adding member:", error);
      Toaster({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to add member",
      });
    } finally {
      setAddingMember(false);
    }
  };

  const AddMemberModal = ({
    visible,
    onClose,
    onAdd,
    loading,
  }: AddMemberModalProps) => {
    const [email, setEmail] = useState("");

    const handleSubmit = async () => {
      if (!email.trim()) {
        Toaster({
          type: "error",
          text1: "Error",
          text2: "Please enter an email address",
        });
        return;
      }
      await onAdd(email.trim());
      setEmail("");
    };

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Member</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Member Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.addButton]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.addButtonText}>Add Member</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
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
      {/* Header */}
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
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setShowSettingsModal(true)}
        >
          <Icon name="more-vert" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowAddExpenseModal(true)}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#34A853" }]}>
            <Icon name="add" size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>Add Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowAddMemberModal(true)}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#1a73e8" }]}>
            <Icon name="person-add" size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>Add Member</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowSettleUpModal(true)}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#EA4335" }]}>
            <Icon name="receipt-long" size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>Settle Up</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Members Section */}
        {!membersLoading && (
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
                <View style={styles.memberAvatar}>
                  <Text style={styles.avatarText}>
                    {member.name[0].toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.memberPreviewName}>{member.name}</Text>
              </View>
            ))}
          </View>
        )}

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

      <MembersModal />
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
        onGroupUpdated={onGroupUpdated}
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
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  actionButton: {
    alignItems: "center",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: "#1a1a1a",
    fontWeight: "500",
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
  emptyState: {
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  membersList: {
    padding: 20,
  },
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1a73e8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  memberEmail: {
    fontSize: 14,
    color: "#666",
  },
  memberRole: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleText: {
    fontSize: 12,
    color: "#666",
    textTransform: "capitalize",
  },
  adminRole: {
    color: "#1a73e8",
    fontWeight: "500",
  },
  youText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  memberPreview: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  memberPreviewName: {
    fontSize: 16,
    color: "#1a1a1a",
    marginLeft: 12,
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  addButton: {
    backgroundColor: "#1a73e8",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
});
