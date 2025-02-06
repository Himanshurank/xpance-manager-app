import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface Props {
  onAddExpense: () => void;
  onAddMember: () => void;
  onSettleUp: () => void;
}

export function QuickActions({ onAddExpense, onAddMember, onSettleUp }: Props) {
  return (
    <View style={styles.quickActions}>
      <TouchableOpacity style={styles.actionButton} onPress={onAddExpense}>
        <View style={[styles.actionIcon, { backgroundColor: "#34A853" }]}>
          <Icon name="add" size={24} color="#fff" />
        </View>
        <Text style={styles.actionText}>Add Expense</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={onAddMember}>
        <View style={[styles.actionIcon, { backgroundColor: "#1a73e8" }]}>
          <Icon name="person-add" size={24} color="#fff" />
        </View>
        <Text style={styles.actionText}>Add Member</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={onSettleUp}>
        <View style={[styles.actionIcon, { backgroundColor: "#EA4335" }]}>
          <Icon name="receipt-long" size={24} color="#fff" />
        </View>
        <Text style={styles.actionText}>Settle Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
