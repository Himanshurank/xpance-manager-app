import { useState } from "react";
import { supabase } from "../lib/supabase";
import Toaster from "../utils/toasterConfig";

interface Income {
  id: string;
  amount: number;
  month: string;
}

export const useIncome = (userId?: string) => {
  const [income, setIncome] = useState<Income | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchIncome = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

      // Fetch income for current month
      const { data: incomeData, error: incomeError } = await supabase
        .from("user_income")
        .select("*")
        .eq("user_id", userId)
        .eq("month", currentMonth)
        .single();

      if (incomeError && incomeError.code !== "PGRST116") throw incomeError;

      // Fetch total expenses for current month
      const { data: expensesData, error: expensesError } = await supabase
        .from("shared_expenses")
        .select("amount")
        .eq("paid_by", userId)
        .gte("created_at", currentMonth)
        .lte("created_at", new Date().toISOString());

      if (expensesError) throw expensesError;

      const totalExpenses =
        expensesData?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
      const currentIncome = incomeData?.amount || 0;

      setIncome(incomeData);
      setBalance(currentIncome - totalExpenses);
    } catch (error) {
      console.error("Error fetching income:", error);
      Toaster({
        type: "error",
        text1: "Error",
        text2: "Failed to load income data",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateIncome = async (amount: number) => {
    if (!userId) return;

    try {
      const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

      const { data, error } = await supabase
        .from("user_income")
        .upsert(
          {
            user_id: userId,
            amount,
            month: currentMonth,
          },
          {
            onConflict: "user_id,month",
          }
        )
        .select()
        .single();

      if (error) throw error;

      setIncome(data);
      await fetchIncome(); // Refresh balance

      Toaster({
        type: "success",
        text1: "Success",
        text2: "Income updated successfully",
      });
    } catch (error) {
      console.error("Error updating income:", error);
      Toaster({
        type: "error",
        text1: "Error",
        text2: "Failed to update income",
      });
    }
  };

  return { income, balance, loading, fetchIncome, updateIncome };
};
