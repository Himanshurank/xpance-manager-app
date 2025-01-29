import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const EmptyGroup = (props: { setModalVisible: (value: boolean) => void }) => {
  return (
    <View style={styles.emptyState}>
      <MaterialIcons name="groups" size={48} color="#ccc" />
      <Text style={styles.emptyStateText}>No groups yet</Text>
      <Text style={styles.emptyStateSubText}>
        Create a group to start managing expenses together
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => props.setModalVisible(true)}
      >
        <Text style={styles.createButtonText}>Create New Group</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmptyGroup;

const styles = StyleSheet.create({
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
});
