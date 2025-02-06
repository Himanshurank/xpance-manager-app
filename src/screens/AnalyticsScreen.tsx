import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Share,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { PieChart } from "react-native-chart-kit";
import { useExpenses } from "../hooks/useExpenses";
import { useAuth } from "../hooks/useAuth";
import { TimeRangeSelector } from "../components/analytics/TimeRangeSelector";
import { SpendingSummary } from "../components/analytics/SpendingSummary";
import { CategoryList } from "../components/analytics/CategoryList";
import {
  getCategoryData,
  getFilteredExpenses,
} from "../utils/expenseAnalytics";
import { ETimeRange } from "../types/Enums";
import { Expense } from "../types/types";
import Toaster from "../utils/toasterConfig";
import { generateAnalyticsReport } from "../utils/pdfGenerator";

const { width } = Dimensions.get("window");

export function AnalyticsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { allExpenses, fetchExpenses } = useExpenses(undefined, user?.id);
  const [selectedRange, setSelectedRange] = useState<ETimeRange>(
    ETimeRange.Today
  );
  const [filteredData, setFilteredData] = useState<Expense[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchExpenses();
    }
  }, [user?.id]);

  useEffect(() => {
    const filtered = getFilteredExpenses(allExpenses, selectedRange);
    setFilteredData(filtered);
  }, [allExpenses, selectedRange]);

  const categoryData = getCategoryData(filteredData);
  const totalSpending = filteredData.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const averageSpending = filteredData.length
    ? totalSpending / filteredData.length
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

        <View style={styles.downloadSection}>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={async () => {
              try {
                if (filteredData.length === 0) {
                  Toaster({
                    type: "info",
                    text1: "No Data",
                    text2: `No expenses found for ${selectedRange} period`,
                  });
                  return;
                }

                const filePath = await generateAnalyticsReport(
                  selectedRange,
                  totalSpending,
                  averageSpending,
                  categoryData,
                  filteredData,
                  user?.user_metadata?.name || "User",
                  user?.email || ""
                );

                if (filePath) {
                  await Share.share({
                    url: `file://${filePath}`,
                    title: "Expense Report",
                  });

                  Toaster({
                    type: "success",
                    text1: "Success",
                    text2: "Report generated successfully!",
                  });
                }
              } catch (error) {
                Toaster({
                  type: "error",
                  text1: "Error",
                  text2: "Failed to generate report",
                });
              }
            }}
          >
            <Icon
              name="download"
              size={20}
              color="#fff"
              style={styles.downloadIcon}
            />
            <Text style={styles.downloadText}>Download Report</Text>
          </TouchableOpacity>
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
  rangeSelector: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  rangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  selectedRange: {
    backgroundColor: "#1a73e8",
  },
  rangeText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  selectedRangeText: {
    color: "#fff",
  },
  downloadSection: {
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  downloadButton: {
    backgroundColor: "#1a73e8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  downloadIcon: {
    marginRight: 8,
  },
  downloadText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
