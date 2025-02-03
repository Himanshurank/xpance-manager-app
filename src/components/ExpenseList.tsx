import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { formatDistanceToNow } from "date-fns";
import { Expense } from "../types/types";

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
}

export function ExpenseList({ expenses, isLoading }: ExpenseListProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading expenses...</Text>
      </View>
    );
  }

  if (expenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="receipt-long" size={48} color="#ccc" />
        <Text style={styles.emptyText}>No expenses yet</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {expenses.map((expense) => (
        <View key={expense.id} style={styles.expenseItem}>
          <View style={styles.categoryIcon}>
            <Icon
              name={expense.category.icon}
              size={24}
              color={expense.category.color}
            />
          </View>
          <View style={styles.expenseDetails}>
            <Text style={styles.description}>{expense.description}</Text>
            <Text style={styles.metadata}>
              Paid by {expense.paid_by.name} •{" "}
              {formatDistanceToNow(new Date(expense.created_at))} ago
            </Text>
          </View>
          <Text style={styles.amount}>₹{expense.amount.toFixed(2)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  expenseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  metadata: {
    fontSize: 14,
    color: "#666",
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
});
