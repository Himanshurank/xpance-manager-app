import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { CategoryData } from "../../types/types";

interface CategoryListProps {
  categories: CategoryData[];
  totalSpending: number;
}

export function CategoryList({ categories, totalSpending }: CategoryListProps) {
  const getAmount = (amount: unknown): number => Number(amount) || 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Categories</Text>
      {categories
        .sort((a, b) => getAmount(b.amount) - getAmount(a.amount))
        .map((category, index) => (
          <View key={index} style={styles.item}>
            <View style={styles.info}>
              <View style={[styles.dot, { backgroundColor: category.color }]} />
              <View style={styles.textContainer}>
                <Text style={styles.name}>{category.name}</Text>
                <Text style={styles.percentage}>
                  {((getAmount(category.amount) / totalSpending) * 100).toFixed(
                    1
                  )}
                  %
                </Text>
              </View>
            </View>
            <Text style={styles.amount}>
              ₹{getAmount(category.amount).toFixed(0)}
            </Text>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    color: "#1a1a1a",
    marginBottom: 2,
  },
  percentage: {
    fontSize: 12,
    color: "#666",
  },
  amount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
});
