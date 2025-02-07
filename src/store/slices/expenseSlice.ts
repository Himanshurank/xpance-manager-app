import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase";
import { Expense } from "../../types/types";
import Toaster from "../../utils/toasterConfig";
import { RootState } from "../store";

interface ExpenseState {
  expenses: Record<string, Expense[]>; // groupId/userId -> expenses[]
  sharedExpenses: Record<string, Expense[]>;
  loading: boolean;
  error: string | null;
  lastFetched: Record<string, number>; // Track last fetch time for each groupId/userId
}

const initialState: ExpenseState = {
  expenses: {},
  sharedExpenses: {},
  loading: false,
  error: null,
  lastFetched: {},
};

// Cache duration in milliseconds (e.g., 5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

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

export const fetchExpenses = createAsyncThunk(
  "expenses/fetchExpenses",
  async (
    { groupId, userId }: { groupId?: string; userId?: string },
    { getState }
  ) => {
    const state = getState() as RootState;
    const id = groupId || userId;

    if (!id) return null; // Early return if no valid ID

    const lastFetched = state.expenses.lastFetched[id];

    // Return cached data if it's fresh
    if (lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
      return null; // Skip API call
    }

    let personalData: any[] = [];

    const { data: sharedExpenses, error: sharedError } = (await supabase
      .from("shared_expenses")
      .select(
        `
        id,
        description,
        amount,
        created_at,
        paid_by,
        category:expense_categories!inner (
          id, name, icon, color
        )
      `
      )
      .eq(groupId ? "group_id" : "paid_by", id)
      .order("created_at", { ascending: false })) as {
      data: ExpenseResponse[] | null;
      error: any;
    };

    if (!groupId && userId) {
      const { data, error: personalError } = await supabase
        .from("personal_expenses")
        .select(
          `
          id,
          description,
          amount,
          created_at,
          user_id,
          category:expense_categories!inner (
            id, name, icon, color
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

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
        category: {
          id: expense.category.id,
          name: expense.category.name,
          icon: expense.category.icon,
          color: expense.category.color,
        },
        paid_by: userMap[expense.paid_by] || { name: "Unknown" },
        paidById: expense.paid_by,
      })
    );

    const transformedPersonal = personalData?.map(
      (expense): Expense => ({
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        created_at: expense.created_at,
        category: {
          id: expense.category.id,
          name: expense.category.name,
          icon: expense.category.icon,
          color: expense.category.color,
        },
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

    return {
      id,
      allExpenses,
      sharedExpenses: transformedShared || [],
    };
  }
);

export const invalidateExpenseCache = createAsyncThunk(
  "expenses/invalidateCache",
  async (id: string) => id
);

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        if (action.payload) {
          // Only update if we got new data
          const { id, allExpenses, sharedExpenses } = action.payload;
          state.expenses[id] = allExpenses;
          state.sharedExpenses[id] = sharedExpenses;
          state.lastFetched[id] = Date.now();
        }
        state.loading = false;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch expenses";
        Toaster({
          type: "error",
          text1: "Error",
          text2: "Failed to load expenses",
        });
      })
      .addCase(invalidateExpenseCache.fulfilled, (state, action) => {
        delete state.lastFetched[action.payload];
      });
  },
});

// First, add proper typing for expenseData
interface UpdateExpenseData {
  id: string;
  description: string;
  amount: number;
  category_id: string;
  group_id?: string;
  paid_by?: string; // Changed from user_id since that's the column name in DB
}

export const updateExpenseAndRefresh = createAsyncThunk(
  "expenses/updateAndRefresh",
  async (expenseData: UpdateExpenseData, { dispatch }) => {
    try {
      const { error } = await supabase
        .from("shared_expenses")
        .update({
          description: expenseData.description,
          amount: expenseData.amount,
          category_id: expenseData.category_id,
          group_id: expenseData.group_id,
          paid_by: expenseData.paid_by, // Changed from user_id to paid_by
        })
        .eq("id", expenseData.id);

      if (error) throw error;

      await dispatch(
        invalidateExpenseCache(
          expenseData.group_id || expenseData.paid_by || ""
        )
      );
      await dispatch(
        fetchExpenses({
          groupId: expenseData.group_id,
          userId: expenseData.paid_by, // Changed to match the column name
        })
      );

      return expenseData;
    } catch (error) {
      Toaster({
        type: "error",
        text1: "Error",
        text2: "Failed to update expense",
      });
      throw error;
    }
  }
);

export const selectExpenses = createSelector(
  [(state: RootState) => state.expenses.expenses, (_, id?: string) => id],
  (expenses, id) => (id ? expenses[id] || [] : [])
);

export const selectSharedExpenses = createSelector(
  [(state: RootState) => state.expenses.sharedExpenses, (_, id?: string) => id],
  (sharedExpenses, id) => (id ? sharedExpenses[id] || [] : [])
);

export default expenseSlice.reducer;
