import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ExpenseList } from "../components/ExpenseList";
import { useExpenses } from "../hooks/useExpenses";
import { useAuth } from "../hooks/useAuth";

export function AllExpensesScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { allExpenses, expensesLoading, fetchExpenses } = useExpenses(
    undefined,
    user?.id
  );

  useEffect(() => {
    if (user?.id) {
      fetchExpenses();
    }
  }, [user?.id]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>All Expenses</Text>
        <View style={styles.placeholder} />
      </View>

      <ExpenseList
        expenses={allExpenses}
        isLoading={expensesLoading}
        onEditExpense={(expense) => {
          // Handle edit expense
        }}
      />
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
});
