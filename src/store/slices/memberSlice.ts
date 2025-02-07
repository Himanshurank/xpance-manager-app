import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase";
import { Member } from "../../types/types";
import Toaster from "../../utils/toasterConfig";
import { RootState } from "../store";

interface MemberState {
  members: Record<string, Member[]>; // groupId -> members[]
  loading: boolean;
  error: string | null;
}

const initialState: MemberState = {
  members: {},
  loading: false,
  error: null,
};

export const fetchMembers = createAsyncThunk<
  { groupId: string; members: Member[] },
  string
>("members/fetchMembers", async (groupId: string) => {
  const { data: memberData } = await supabase
    .from("group_members")
    .select("user_id, role, avatar_url")
    .eq("group_id", groupId);

  if (!memberData?.length) return { groupId, members: [] };

  const userIds = memberData.map((member) => member.user_id);
  const { data: userData } = await supabase
    .from("users")
    .select("id, name, email")
    .in("id", userIds);

  const transformedMembers = memberData.map((member) => {
    const user = userData?.find((u) => u.id === member.user_id);
    return {
      id: member.user_id,
      email: user?.email || "",
      name: user?.name || "Unknown",
      role: member.role,
      avatar_url: member.avatar_url || null,
    };
  });

  return {
    groupId,
    members: transformedMembers.sort((a, b) => {
      if (a.role === "admin" && b.role !== "admin") return -1;
      if (a.role !== "admin" && b.role === "admin") return 1;
      return a.name.localeCompare(b.name);
    }),
  };
});

const memberSlice = createSlice({
  name: "members",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        const { groupId, members } = action.payload;
        state.members[groupId] = members;
        state.loading = false;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch members";
        Toaster({
          type: "error",
          text1: "Error",
          text2: "Failed to load members",
        });
      });
  },
});

export const selectMembersByGroupId = (state: RootState, groupId: string) =>
  state.members.members[groupId] || [];

export default memberSlice.reducer;
