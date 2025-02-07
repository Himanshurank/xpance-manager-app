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
import { useAppSelector } from "../store/user/userStore";
import { CreateGroupModal } from "../components/CreateGroupModal";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import GroupList from "../components/GroupList";
import EmptyGroup from "../components/EmptyGroup";
import { useGroups } from "../hooks/useGroups";

type RootStackParamList = {
  GroupDetails: {
    id: string;
    name: string;
    icon: string;
    color: string;
    memberCount: number;
  };
};

export function GroupScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAppSelector((state) => state.auth);
  const { groups, groupsLoading, fetchGroups } = useGroups(user?.id || "");

  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, [user]);

  if (groupsLoading) {
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
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="add" size={24} color="#1a73e8" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.groupList}>
          {/* Recent Groups */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Groups</Text>
            {groups.length > 0 && (
              <GroupList groups={groups} loading={groupsLoading} />
            )}
          </View>
          {/* All Groups */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Groups</Text>
            {groups.length === 0 && !groupsLoading && (
              <EmptyGroup setModalVisible={setModalVisible} />
            )}
            {groups.length > 0 && (
              <GroupList groups={groups} loading={groupsLoading} />
            )}
          </View>
        </View>
      </ScrollView>

      <CreateGroupModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchGroups}
        userId={user?.id || ""}
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
});
