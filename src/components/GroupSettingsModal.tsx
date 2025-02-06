import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useGroups } from "../hooks/useGroups";
import { useAuth } from "../hooks/useAuth";
import { CreateGroupModal } from "./CreateGroupModal";
import { GroupDetails } from "../types/types";

interface GroupSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  groupDetails: GroupDetails;
  isAdmin: boolean;
  navigation: any;
  onGroupUpdated: (updatedGroup: GroupDetails) => void;
}

export function GroupSettingsModal({
  visible,
  onClose,
  groupDetails,
  isAdmin,
  navigation,
  onGroupUpdated,
}: GroupSettingsModalProps) {
  const { deleteGroup } = useGroups(useAuth().user?.id || "");
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { user } = useAuth();

  const handleDeleteGroup = () => {
    Alert.alert(
      "Delete Group",
      `Are you sure you want to delete "${groupDetails.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteGroup(groupDetails.id);
              onClose();
              navigation.goBack();
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      "Leave Group",
      `Are you sure you want to leave "${groupDetails.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            // TODO: Implement leave group functionality
            onClose();
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Group Settings</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.settingsList}>
              {isAdmin && (
                <>
                  <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => {
                      setShowEditModal(true);
                      onClose(); // Close settings modal
                    }}
                  >
                    <View style={styles.settingIcon}>
                      <Icon name="edit" size={24} color="#1a73e8" />
                    </View>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingTitle}>Edit Group</Text>
                      <Text style={styles.settingDescription}>
                        Change group name, icon, or color
                      </Text>
                    </View>
                    <Icon name="chevron-right" size={24} color="#666" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingIcon}>
                      <Icon name="people" size={24} color="#34A853" />
                    </View>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingTitle}>Manage Members</Text>
                      <Text style={styles.settingDescription}>
                        Add or remove members, change roles
                      </Text>
                    </View>
                    <Icon name="chevron-right" size={24} color="#666" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.settingItem}
                    onPress={handleDeleteGroup}
                    disabled={loading}
                  >
                    <View style={styles.settingIcon}>
                      <Icon name="delete" size={24} color="#EA4335" />
                    </View>
                    <View style={styles.settingInfo}>
                      <Text style={[styles.settingTitle, styles.deleteText]}>
                        Delete Group
                      </Text>
                      <Text style={styles.settingDescription}>
                        Permanently delete this group
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}

              {!isAdmin && (
                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={handleLeaveGroup}
                >
                  <View style={styles.settingIcon}>
                    <Icon name="exit-to-app" size={24} color="#EA4335" />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, styles.deleteText]}>
                      Leave Group
                    </Text>
                    <Text style={styles.settingDescription}>
                      Remove yourself from this group
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <CreateGroupModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={(groupDetails: GroupDetails) => {
          setShowEditModal(false);
          onClose(); // Close both modals
          onGroupUpdated(groupDetails);
        }}
        userId={user?.id || ""}
        mode="edit"
        groupData={groupDetails}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  closeButton: {
    padding: 4,
  },
  settingsList: {
    padding: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
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
  deleteText: {
    color: "#EA4335",
  },
});
