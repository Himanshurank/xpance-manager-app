import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Toaster from "../utils/toasterConfig";

interface Member {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
}

export function useGroupMembers(groupId: string) {
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from("group_members")
        .select("user_id, role")
        .eq("group_id", groupId);

      if (memberError) throw memberError;

      if (!memberData || memberData.length === 0) {
        setMembers([]);
        return;
      }

      const userIds = memberData.map((member) => member.user_id);
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, name, email")
        .in("id", userIds);

      if (userError) throw userError;

      const transformedMembers = memberData.map((member) => {
        const user = userData?.find((u) => u.id === member.user_id);
        return {
          id: member.user_id,
          email: user?.email || "",
          name: user?.name || "Unknown",
          role: member.role,
        };
      });

      const sortedMembers = transformedMembers.sort((a, b) => {
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (a.role !== "admin" && b.role === "admin") return 1;
        return a.name.localeCompare(b.name);
      });

      setMembers(sortedMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
      Toaster({
        type: "error",
        text1: "Error",
        text2: "Failed to load members",
      });
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchMembers();
    }
  }, [groupId]);

  return { members, membersLoading, fetchMembers };
}
