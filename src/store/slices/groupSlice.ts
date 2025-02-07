import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase";
import { Group } from "../../types/types";
import Toaster from "../../utils/toasterConfig";
import { RootState } from "../store";

interface GroupState {
  groups: Group[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: GroupState = {
  groups: [],
  loading: false,
  error: null,
  lastFetched: null,
};

// Cache duration in milliseconds (e.g., 5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const fetchGroups = createAsyncThunk(
  "groups/fetchGroups",
  async (userId: string, { getState }) => {
    const state = getState() as RootState;
    const { groups, lastFetched } = state.groups;

    // If we have cached data and it's still fresh, use it
    if (
      groups.length > 0 &&
      lastFetched &&
      Date.now() - lastFetched < CACHE_DURATION
    ) {
      return groups;
    }

    // Otherwise fetch from API
    const { data: memberGroups } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId);

    if (!memberGroups?.length) return [];

    const groupIds = memberGroups.map((mg) => mg.group_id);
    const { data: groupsData } = await supabase
      .from("groups")
      .select("*")
      .in("id", groupIds);

    if (!groupsData) return [];

    const groupsWithCounts = await Promise.all(
      groupsData.map(async (group) => {
        const { count } = await supabase
          .from("group_members")
          .select("*", { count: "exact", head: true })
          .eq("group_id", group.id);

        return {
          ...group,
          member_count: count || 0,
        };
      })
    );

    return groupsWithCounts;
  }
);

export const createGroup = createAsyncThunk(
  "groups/createGroup",
  async (
    groupData: Omit<Group, "id" | "created_at" | "updated_at" | "member_count">
  ) => {
    const { data, error } = await supabase
      .from("groups")
      .insert([groupData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
);

export const updateGroup = createAsyncThunk(
  "groups/updateGroup",
  async ({
    groupId,
    updatedData,
  }: {
    groupId: string;
    updatedData: Partial<Group>;
  }) => {
    const { data, error } = await supabase
      .from("groups")
      .update({
        name: updatedData.name,
        icon: updatedData.icon,
        color: updatedData.color,
      })
      .eq("id", groupId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
);

export const deleteGroup = createAsyncThunk(
  "groups/deleteGroup",
  async (groupId: string) => {
    const { error } = await supabase.from("groups").delete().eq("id", groupId);

    if (error) throw error;
    return groupId;
  }
);

const groupSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    invalidateCache: (state) => {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.groups = action.payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch groups";
        Toaster({
          type: "error",
          text1: "Error",
          text2: "Failed to load groups",
        });
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.groups.push(action.payload);
        Toaster({
          type: "success",
          text1: "Success",
          text2: "Group created successfully",
        });
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        const index = state.groups.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
        Toaster({
          type: "success",
          text1: "Success",
          text2: "Group updated successfully",
        });
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter((g) => g.id !== action.payload);
      });
  },
});

export const { invalidateCache } = groupSlice.actions;
export default groupSlice.reducer;

// Selector to get group by ID from store
export const selectGroupById = (state: RootState, groupId: string) =>
  state.groups.groups.find((g) => g.id === groupId);
