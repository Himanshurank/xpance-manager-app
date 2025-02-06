import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Expense } from "../types/types";
import Toaster from "../utils/toasterConfig";
import { User } from "@supabase/supabase-js";
interface ExpenseResponse {
  id: string;
  description: string;
  amount: number;
  created_at: string;
  paid_by: string;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

// Add interface for personal expense response
interface PersonalExpenseResponse {
  id: string;
  description: string;
  amount: number;
  created_at: string;
  user_id: string;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

export const useExpenses = (groupId?: string, userId?: string) => {
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [sharedExpenses, setSharedExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      setExpensesLoading(true);
      let personalData: any[] = [];

      // Modify shared expenses query based on groupId
      let { data: sharedExpenses, error: sharedError } = (await supabase
        .from("shared_expenses")
        .select(
          `
          id,
          description,
          amount,
          created_at,
          paid_by,
          category:expense_categories!inner (
            id,
            name,
            icon,
            color
          )
        `
        )

        .eq(groupId ? "group_id" : "paid_by", groupId || userId)
        .order("created_at", { ascending: false })) as {
        data: ExpenseResponse[] | null;
        error: any;
      };

      if (!groupId && userId) {
        const { data, error: personalError } = (await supabase
          .from("personal_expenses")
          .select(
            `
            id,
            description,
            amount,
            created_at,
            user_id,
            category:expense_categories!inner (
              id,
              name,
              icon,
              color
            )
          `
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false })) as {
          data: PersonalExpenseResponse[] | null;
          error: any;
        };

        if (personalError) throw personalError;
        personalData = data || [];
      }

      if (sharedError) throw sharedError;

      const userIds = [...new Set(sharedExpenses?.map((e) => e.paid_by) || [])];
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, name")
        .in("id", userIds);

      if (userError) throw userError;

      const userMap = Object.fromEntries(
        userData?.map((user) => [
          user.id,
          { name: user.id === userId ? "You" : user.name },
        ]) || []
      );

      const transformedShared = sharedExpenses?.map(
        (expense): Expense => ({
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          created_at: expense.created_at,
          category: expense.category,
          paid_by: userMap[expense.paid_by] || { name: "Unknown" },
          paidById: expense.paid_by,
        })
      );

      const transformedPersonal = personalData?.map(
        (expense: PersonalExpenseResponse): Expense => ({
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          created_at: expense.created_at,
          category: expense.category,
          paid_by: { name: "You" },
        })
      );

      const allExpenses = [
        ...(transformedShared || []),
        ...(transformedPersonal || []),
      ].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setAllExpenses(allExpenses);
      setSharedExpenses(transformedShared || []);
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

  return { allExpenses, sharedExpenses, expensesLoading, fetchExpenses };
};
