import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Group } from "../types/types";
import Toaster from "../utils/toasterConfig";

export const useGroups = (userId: string) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  const fetchGroups = async () => {
    if (!userId) {
      setGroupsLoading(false);
      return;
    }

    try {
      setGroupsLoading(true);
      const { data: memberGroups, error: memberError } = await supabase
        .from("group_members")
        .select("group_id");

      if (memberError) throw memberError;

      const groupIds = memberGroups?.map((mg) => mg.group_id) || [];

      const { data: groups, error: groupsError } = await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds);

      if (groupsError) throw groupsError;

      if (!groups) {
        setGroups([]);
        return;
      }

      const transformedGroups: Group[] = groups.map((group) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        created_at: group.created_at,
        member_count: 0,
        icon: group.icon,
        color: group.color,
      }));

      // Get member counts
      for (let group of transformedGroups) {
        const { count } = await supabase
          .from("group_members")
          .select("*", { count: "exact", head: true })
          .eq("group_id", group.id);

        group.member_count = count || 0;
      }

      const sortedGroups = transformedGroups.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setGroups(sortedGroups);
    } catch (error: any) {
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

  return { groups, groupsLoading, fetchGroups };
};
