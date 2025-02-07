import React from "react";
import { StyleSheet, View, Text } from "react-native";

interface SpendingSummaryProps {
  totalSpending: number;
  averageSpending: number;
  expenses: Expense[];
  timeRange: ETimeRange;
  loading: boolean;
}

export function SpendingSummary({
  totalSpending,
  averageSpending,
  expenses,
  timeRange,
  loading,
}: SpendingSummaryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Total Spending</Text>
        <Text style={styles.value}>₹{totalSpending.toFixed(2)}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Average per Transaction</Text>
        <Text style={styles.value}>₹{averageSpending.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
  },
});
