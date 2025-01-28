import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import Toaster from "../utils/toasterConfig";

interface Group {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  member_count: number;
}

interface GroupData {
  groups: {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    created_by: string;
  };
}

export function GroupScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentGroups, setRecentGroups] = useState<Group[]>([]);

  const fetchGroups = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Get groups where user is a member
      const { data: memberGroups, error: memberError } = await supabase
        .from("group_members")
        .select("group_id");

      if (memberError) throw memberError;

      const groupIds = memberGroups?.map((mg) => mg.group_id) || [];

      // Get full group details
      const { data: groups, error: groupsError } = await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds);

      if (groupsError) throw groupsError;

      if (!groups) {
        setGroups([]);
        setRecentGroups([]);
        return;
      }

      const transformedGroups: Group[] = groups.map((group) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        created_at: group.created_at,
        member_count: 0,
      }));

      // Get member counts
      for (let group of transformedGroups) {
        const { count } = await supabase
          .from("group_members")
          .select("*", { count: "exact", head: true })
          .eq("group_id", group.id);

        group.member_count = count || 0;
      }

      const sortedGroups = transformedGroups.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setGroups(sortedGroups);
      setRecentGroups(sortedGroups.slice(0, 3));
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      Toaster({
        type: "error",
        text1: "Error",
        text2: "Failed to load groups",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Groups</Text>
        <TouchableOpacity style={styles.addButton}>
          <Icon name="add" size={24} color="#1a73e8" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Recent Groups */}
        {recentGroups.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Groups</Text>
            <View style={styles.groupList}>
              {recentGroups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={styles.groupItem}
                  onPress={() => {
                    // Handle group selection
                  }}
                >
                  <View style={styles.groupIcon}>
                    <Icon name="group" size={24} color="#1a73e8" />
                  </View>
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupMembers}>
                      {group.member_count}{" "}
                      {group.member_count === 1 ? "member" : "members"}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* All Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Groups</Text>
          <View style={styles.groupList}>
            {groups.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="groups" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>No groups yet</Text>
                <Text style={styles.emptyStateSubText}>
                  Create a group to start managing expenses together
                </Text>
                <TouchableOpacity style={styles.createButton}>
                  <Text style={styles.createButtonText}>Create New Group</Text>
                </TouchableOpacity>
              </View>
            ) : (
              groups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={styles.groupItem}
                  onPress={() => {
                    // Handle group selection
                  }}
                >
                  <View style={styles.groupIcon}>
                    <Icon name="group" size={24} color="#1a73e8" />
                  </View>
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupMembers}>
                      {group.member_count}{" "}
                      {group.member_count === 1 ? "member" : "members"}
                    </Text>
                    {group.description && (
                      <Text style={styles.groupDescription} numberOfLines={1}>
                        {group.description}
                      </Text>
                    )}
                  </View>
                  <Icon name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>
              ))
            )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  groupList: {
    marginTop: 8,
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e8f0fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 12,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 16,
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
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: "#1a73e8",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  groupDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});
