import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { PieChart } from "react-native-chart-kit";
import { useExpenses } from "../hooks/useExpenses";
import { useAuth } from "../hooks/useAuth";
import {
  TimeRangeSelector,
  type TimeRange,
} from "../components/analytics/TimeRangeSelector";
import { SpendingSummary } from "../components/analytics/SpendingSummary";
import { CategoryList } from "../components/analytics/CategoryList";
import {
  getFilteredExpenses,
  getCategoryData,
} from "../utils/expenseAnalytics";

const { width } = Dimensions.get("window");

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

  const filteredExpenses = getFilteredExpenses(allExpenses, selectedRange);
  const categoryData = getCategoryData(filteredExpenses);
  const totalSpending = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const averageSpending = filteredExpenses.length
    ? totalSpending / filteredExpenses.length
    : 0;

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
        <TimeRangeSelector
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
        />
        <SpendingSummary
          totalSpending={totalSpending}
          averageSpending={averageSpending}
        />

        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Spending by Category</Text>
            <Text style={styles.totalAmount}>₹{totalSpending.toFixed(0)}</Text>
          </View>
          <View style={styles.chartContent}>
            <PieChart
              data={categoryData}
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

        <CategoryList categories={categoryData} totalSpending={totalSpending} />
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
});
