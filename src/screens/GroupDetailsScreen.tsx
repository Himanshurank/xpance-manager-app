import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import Toaster from "../utils/toasterConfig";

interface GroupDetailsParams {
  id: string;
  name: string;
  icon: string;
  color: string;
  memberCount: number;
}

interface Member {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
}

interface MemberResponse {
  user_id: string;
  role: "admin" | "member";
  users: {
    name: string;
    email: string;
  };
}

export function GroupDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id, name, icon, color, memberCount } =
    route.params as GroupDetailsParams;
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const { user } = useAuth();

  const fetchMembers = async () => {
    try {
      // First get group members
      const { data: memberData, error: memberError } = await supabase
        .from("group_members")
        .select("user_id, role")
        .eq("group_id", id);

      if (memberError) throw memberError;

      if (!memberData) {
        setMembers([]);
        return;
      }

      // Then get user details for each member
      const userIds = memberData.map((member) => member.user_id);
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, name, email")
        .in("id", userIds);

      if (userError) throw userError;

      // Combine the data
      const transformedMembers: Member[] = memberData.map((member) => {
        const user = userData?.find((u) => u.id === member.user_id);
        return {
          id: member.user_id,
          email: user?.email || "",
          name: user?.name || "Unknown",
          role: member.role,
        };
      });

      setMembers(transformedMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
      Toaster({
        type: "error",
        text1: "Error",
        text2: "Failed to load members",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [id]);

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
          <View style={[styles.groupIcon, { backgroundColor: color }]}>
            <Icon name={icon} size={24} color="#fff" />
          </View>
          <Text style={styles.groupName}>{name}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="more-vert" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: "#34A853" }]}>
            <Icon name="add" size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>Add Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: "#1a73e8" }]}>
            <Icon name="person-add" size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>Add Member</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: "#EA4335" }]}>
            <Icon name="receipt-long" size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>Settle Up</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Members Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Members ({memberCount})</Text>
            <TouchableOpacity onPress={() => setShowMembersModal(true)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {/* Show first 3 members in the preview */}
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

        {/* Recent Expenses Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.emptyState}>
            <Icon name="receipt" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No expenses yet</Text>
            <Text style={styles.emptyStateSubText}>
              Add your first expense to start tracking
            </Text>
          </View>
        </View>
      </ScrollView>

      <MembersModal />
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
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
});
