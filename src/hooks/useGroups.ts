import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Group } from "../types/types";
import Toaster from "../utils/toasterConfig";

export const useGroups = (userId: string) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  // Get all groups for a user
  const fetchGroups = async () => {
    if (!userId) {
      setGroupsLoading(false);
      return;
    }

    try {
      setGroupsLoading(true);

      const { data: memberGroups, error: memberError } = (await supabase
        .from("group_members")
        .select(
          `
          group_id,
          groups (
            id,
            name,
            description,
            created_at,
            icon,
            color
          )
        `
        )
        .eq("user_id", userId)) as {
        data: { group_id: string; groups: Group }[] | null;
        error: any;
      };

      if (memberError) throw memberError;

      if (!memberGroups || memberGroups.length === 0) {
        setGroups([]);
        return;
      }

      const transformedGroups = await Promise.all(
        memberGroups
          .filter((mg) => mg.groups)
          .map(async (mg) => {
            const { count } = await supabase
              .from("group_members")
              .select("*", { count: "exact", head: true })
              .eq("group_id", mg.group_id);

            return {
              ...mg.groups,
              icon: mg.groups.icon || "group",
              color: mg.groups.color || "#1a73e8",
              member_count: count || 0,
              created_by: userId,
              updated_at: mg.groups.created_at,
            };
          })
      );

      const sortedGroups = transformedGroups.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setGroups(sortedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      Toaster({
        type: "error",
        text1: "Error",
        text2: "Failed to load groups",
      });
    } finally {
      setGroupsLoading(false);
    }
  };

  // Create a new group
  const createGroup = async (
    groupData: Omit<Group, "id" | "created_at" | "updated_at" | "member_count">
  ) => {
    try {
      const { data, error } = await supabase
        .from("groups")
        .insert([groupData])
        .select()
        .single();

      if (error) throw error;

      // No need to manually create group_member - trigger will handle it
      await fetchGroups(); // Refresh groups list
      
      Toaster({
        type: "success",
        text1: "Success",
        text2: "Group created successfully",
      });

      return data;
    } catch (error) {
      console.error("Error creating group:", error);
      Toaster({
        type: "error",
        text1: "Error",
        text2: "Failed to create group",
      });
      throw error;
    }
  };

  // Update a group
  const updateGroup = async (groupId: string, updates: Partial<Group>) => {
    try {
      const { data, error } = await supabase
        .from("groups")
        .update(updates)
        .eq("id", groupId)
        .select()
        .single();

      if (error) throw error;

      await fetchGroups(); // Refresh groups list
      return data;
    } catch (error) {
      console.error("Error updating group:", error);
      Toaster({
        type: "error",
        text1: "Error",
        text2: "Failed to update group",
      });
      return null;
    }
  };

  // Delete a group
  const deleteGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", groupId);

      if (error) throw error;

      await fetchGroups(); // Refresh groups list
      return true;
    } catch (error) {
      console.error("Error deleting group:", error);
      Toaster({
        type: "error",
        text1: "Error",
        text2: "Failed to delete group",
      });
      return false;
    }
  };

  return {
    groups,
    groupsLoading,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
  };
};
