import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Expense } from "../types/types";
import Toaster from "../utils/toasterConfig";

interface ExpenseResponse {
  id: string;
  description: string;
  amount: number;
  created_at: string;
  paid_by: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
}

export const useExpenses = (groupId?: string, userId?: string) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      let query = supabase
        .from("shared_expenses")
        .select(
          `
          id,
          description,
          amount,
          created_at,
          paid_by,
          category:expense_categories!inner (
            name,
            icon,
            color
          )
        `
        )
        .order("created_at", { ascending: false });

      // If groupId is provided, filter by group
      if (groupId) {
        query = query.eq("group_id", groupId);
      }
      // If userId is provided, filter by user's expenses
      if (userId) {
        query = query.eq("paid_by", userId);
      }

      const { data, error } = await query.returns<ExpenseResponse[]>();

      if (error) throw error;

      const userIds = [
        ...new Set(data?.map((expense) => expense.paid_by) || []),
      ];
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, name")
        .in("id", userIds);

      if (userError) throw userError;

      const userMap = Object.fromEntries(
        userData?.map((user) => [user.id, { name: user.name }]) || []
      );

      const transformedData = data?.map((expense) => ({
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        created_at: expense.created_at,
        category: expense.category,
        paid_by: userMap[expense.paid_by] || { name: "Unknown" },
      }));

      setExpenses(transformedData || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      Toaster({
        type: "error",
        text1: "Error",
        text2: "Failed to load expenses",
      });
    } finally {
      setExpensesLoading(false);
    }
  };

  return { expenses, expensesLoading, fetchExpenses };
};
