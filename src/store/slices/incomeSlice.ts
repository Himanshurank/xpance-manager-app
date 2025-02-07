import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase";
import Toaster from "../../utils/toasterConfig";
import { RootState } from "../store";

interface Income {
  id: string;
  amount: number;
  month: string;
}

interface IncomeState {
  income: Record<string, Income | null>;
  balance: Record<string, number>;
  loading: boolean;
  error: string | null;
  lastFetched: Record<string, number>;
}

const initialState: IncomeState = {
  income: {},
  balance: {},
  loading: false,
  error: null,
  lastFetched: {},
};

const CACHE_DURATION = 5 * 60 * 1000;

export const fetchIncome = createAsyncThunk(
  "income/fetchIncome",
  async (userId: string, { getState }) => {
    const state = getState() as RootState;
    const lastFetched = state.income.lastFetched[userId];

    if (lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
      return null;
    }

    const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

    // Fetch income for current month
    const { data: incomeData, error: incomeError } = await supabase
      .from("user_income")
      .select("*")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .single();

    if (incomeError && incomeError.code !== "PGRST116") throw incomeError;

    // Get shared expenses
    const { data: sharedExpenses, error: sharedError } = await supabase
      .from("shared_expenses")
      .select("amount")
      .eq("paid_by", userId);

    // Get personal expenses
    const { data: personalExpenses, error: personalError } = await supabase
      .from("personal_expenses")
      .select("amount")
      .eq("user_id", userId);

    if (sharedError) throw sharedError;
    if (personalError) throw personalError;

    const totalSharedExpenses = (sharedExpenses || []).reduce(
      (sum, exp) => sum + exp.amount,
      0
    );

    const totalPersonalExpenses = (personalExpenses || []).reduce(
      (sum, exp) => sum + exp.amount,
      0
    );

    const currentIncome = incomeData?.amount || 0;
    const balance = currentIncome - totalSharedExpenses - totalPersonalExpenses;

    return {
      userId,
      income: incomeData,
      balance,
    };
  }
);

export const updateIncome = createAsyncThunk(
  "income/updateIncome",
  async (
    { userId, amount }: { userId: string; amount: number },
    { dispatch }
  ) => {
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

    // Refresh income data
    await dispatch(fetchIncome(userId));

    Toaster({
      type: "success",
      text1: "Success",
      text2: "Income updated successfully",
    });

    return data;
  }
);

const incomeSlice = createSlice({
  name: "income",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncome.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIncome.fulfilled, (state, action) => {
        if (action.payload) {
          const { userId, income, balance } = action.payload;
          state.income[userId] = income;
          state.balance[userId] = balance;
          state.lastFetched[userId] = Date.now();
        }
        state.loading = false;
      })
      .addCase(fetchIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch income";
        Toaster({
          type: "error",
          text1: "Error",
          text2: "Failed to load income data",
        });
      })
      .addCase(updateIncome.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update income";
        Toaster({
          type: "error",
          text1: "Error",
          text2: "Failed to update income",
        });
      });
  },
});

export const selectIncome = createSelector(
  [(state: RootState) => state.income.income, (_, userId?: string) => userId],
  (income, userId) => (userId ? income[userId] : null)
);

export const selectBalance = createSelector(
  [(state: RootState) => state.income.balance, (_, userId?: string) => userId],
  (balance, userId) => (userId ? balance[userId] || 0 : 0)
);

export default incomeSlice.reducer;
