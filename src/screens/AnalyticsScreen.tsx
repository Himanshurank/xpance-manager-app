import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useExpenses } from "../hooks/useExpenses";
import { useAuth } from "../hooks/useAuth";
import { PieChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

const timeRanges = ["Week", "Month", "Year"];
type TimeRange = (typeof timeRanges)[number];

const pastelColors = [
  "#FFB3BA",
  "#BAFFC9",
  "#BAE1FF",
  "#FFFFBA",
  "#FFB3F7",
  "#E0BBE4",
  "#957DAD",
  "#FEC8D8",
  "#D4F0F0",
  "#FFDFD3",
];

export function AnalyticsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { allExpenses, fetchExpenses } = useExpenses(undefined, user?.id);
  const [selectedRange, setSelectedRange] = useState<TimeRange>("Month");

  useEffect(() => {
    if (user?.id) {
      fetchExpenses();
    }
  }, [user?.id]);

  const getFilteredExpenses = () => {
    const now = new Date();
    const expenses = allExpenses.filter((expense) => {
      const expenseDate = new Date(expense.created_at);
      switch (selectedRange) {
        case "Week":
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          return expenseDate >= weekAgo;
        case "Month":
          return (
            expenseDate.getMonth() === now.getMonth() &&
            expenseDate.getFullYear() === now.getFullYear()
          );
        case "Year":
          return expenseDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
    return expenses;
  };

  const getCategoryData = () => {
    const filteredExpenses = getFilteredExpenses();
    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      const category = expense.category.name;
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([name], index) => ({
      name,
      amount: categoryTotals[name],
      color: pastelColors[index % pastelColors.length],
      legendFontColor: "#1a1a1a",
      legendFontSize: 12,
    }));
  };

  const getTotalSpending = () => {
    const filteredExpenses = getFilteredExpenses();
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getAverageSpending = () => {
    const filteredExpenses = getFilteredExpenses();
    return filteredExpenses.length
      ? getTotalSpending() / filteredExpenses.length
      : 0;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                selectedRange === range && styles.selectedTimeRange,
              ]}
              onPress={() => setSelectedRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  selectedRange === range && styles.selectedTimeRangeText,
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Spending</Text>
            <Text style={styles.summaryValue}>
              ₹{getTotalSpending().toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Average per Transaction</Text>
            <Text style={styles.summaryValue}>
              ₹{getAverageSpending().toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Spending by Category</Text>
            <Text style={styles.totalAmount}>
              ₹{getTotalSpending().toFixed(0)}
            </Text>
          </View>
          <View style={styles.chartContent}>
            <PieChart
              data={getCategoryData()}
              width={width * 0.8}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(26, 115, 232, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="0"
              hasLegend={false}
              center={[width * 0.2, 0]}
              absolute
            />
          </View>
        </View>

        <View style={styles.topCategoriesContainer}>
          <Text style={styles.chartTitle}>All Categories</Text>
          {getCategoryData()
            .sort((a, b) => b.amount - a.amount)
            .map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: category.color },
                    ]}
                  />
                  <View style={styles.categoryTextContainer}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryPercentage}>
                      {((category.amount / getTotalSpending()) * 100).toFixed(
                        1
                      )}
                      %
                    </Text>
                  </View>
                </View>
                <Text style={styles.categoryAmount}>
                  ₹{category.amount.toFixed(0)}
                </Text>
              </View>
            ))}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },

  timeRangeContainer: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "center",
    gap: 8,
  },
  timeRangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  selectedTimeRange: {
    backgroundColor: "#1a73e8",
  },
  timeRangeText: {
    color: "#666",
    fontWeight: "500",
  },
  selectedTimeRangeText: {
    color: "#fff",
  },
  summaryContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  chartSection: {
    backgroundColor: "#fff",
    padding: 16,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a73e8",
  },
  chartContent: {
    flexDirection: "column",
    alignItems: "center",
  },
  pieContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "center",
  },
  topCategoriesContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 16,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    color: "#1a1a1a",
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 12,
    color: "#666",
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
});
