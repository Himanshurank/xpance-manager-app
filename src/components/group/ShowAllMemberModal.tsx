import {
  Modal,
  TouchableOpacity,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Member } from "../../types/types";
import { useAuth } from "../../hooks/useAuth";
interface ShowAllMemberModalProps {
  showMembersModal: boolean;
  setShowMembersModal: (showMembersModal: boolean) => void;
  members: Member[];
}

export const ShowAllMemberModal = (props: ShowAllMemberModalProps) => {
  const { showMembersModal, setShowMembersModal, members } = props;
  const { user } = useAuth();
  return (
    <Modal
      visible={showMembersModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowMembersModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowMembersModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
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
                    {member.avatar_url ? (
                      <Image
                        source={{ uri: member.avatar_url }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Text style={styles.avatarText}>
                        {member.name[0].toUpperCase()}
                      </Text>
                    )}
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
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default ShowAllMemberModal;

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
  closeButton: {
    padding: 8,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
