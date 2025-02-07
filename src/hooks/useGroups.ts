// import { useState } from "react";
// import { supabase } from "../lib/supabase";
// import { Group } from "../types/types";
// import Toaster from "../utils/toasterConfig";

// export const useGroups = (userId: string) => {
//   const [groups, setGroups] = useState<Group[]>([]);
//   const [groupsLoading, setGroupsLoading] = useState(true);

//   const fetchGroups = async () => {
//     if (!userId) {
//       setGroupsLoading(false);
//       return;
//     }

//     try {
//       setGroupsLoading(true);
//       const { data: memberGroups, error: memberError } = await supabase
//         .from("group_members")
//         .select("group_id")
//         .eq("user_id", userId);

//       if (memberError) throw memberError;

//       if (!memberGroups || memberGroups.length === 0) {
//         setGroups([]);
//         return;
//       }

//       const groupIds = memberGroups.map((mg) => mg.group_id);
//       const { data: groupsData, error: groupsError } = await supabase
//         .from("groups")
//         .select("*")
//         .in("id", groupIds);

//       if (groupsError) throw groupsError;

//       if (!groupsData) {
//         setGroups([]);
//         return;
//       }

//       const groupsWithCounts = await Promise.all(
//         groupsData.map(async (group) => {
//           const { count } = await supabase
//             .from("group_members")
//             .select("*", { count: "exact", head: true })
//             .eq("group_id", group.id);

//           return {
//             ...group,
//             member_count: count || 0,
//           };
//         })
//       );

//       setGroups(groupsWithCounts);
//     } catch (error) {
//       console.error("Error fetching groups:", error);
//       Toaster({
//         type: "error",
//         text1: "Error",
//         text2: "Failed to load groups",
//       });
//     } finally {
//       setGroupsLoading(false);
//     }
//   };

//   // Create a new group
//   const createGroup = async (
//     groupData: Omit<Group, "id" | "created_at" | "updated_at" | "member_count">
//   ) => {
//     try {
//       const { data, error } = await supabase
//         .from("groups")
//         .insert([groupData])
//         .select()
//         .single();

//       if (error) throw error;

//       // No need to manually create group_member - trigger will handle it
//       await fetchGroups(); // Refresh groups list

//       Toaster({
//         type: "success",
//         text1: "Success",
//         text2: "Group created successfully",
//       });

//       return data;
//     } catch (error) {
//       console.error("Error creating group:", error);
//       Toaster({
//         type: "error",
//         text1: "Error",
//         text2: "Failed to create group",
//       });
//       throw error;
//     }
//   };

//   // Update a group
//   const updateGroup = async (groupId: string, updatedData: Partial<Group>) => {
//     try {
//       const { data, error } = await supabase
//         .from("groups")
//         .update({
//           name: updatedData.name,
//           icon: updatedData.icon,
//           color: updatedData.color,
//         })
//         .eq("id", groupId)
//         .select()
//         .single();

//       if (error) {
//         console.error("Update error:", error);
//         throw error;
//       }

//       // Immediately update local state with complete data
//       setGroups((prevGroups) =>
//         prevGroups.map((group) =>
//           group.id === groupId
//             ? { ...group, ...data } // Use returned data instead of updatedData
//             : group
//         )
//       );

//       Toaster({
//         type: "success",
//         text1: "Success",
//         text2: "Group updated successfully",
//       });

//       return data;
//     } catch (error: any) {
//       console.error("Error updating group:", error);
//       Toaster({
//         type: "error",
//         text1: "Error",
//         text2: error.message || "Failed to update group",
//       });
//       return null;
//     }
//   };

//   // Delete a group
//   const deleteGroup = async (groupId: string) => {
//     try {
//       const { error } = await supabase
//         .from("groups")
//         .delete()
//         .eq("id", groupId);

//       if (error) throw error;

//       await fetchGroups(); // Refresh groups list
//       return true;
//     } catch (error) {
//       console.error("Error deleting group:", error);
//       Toaster({
//         type: "error",
//         text1: "Error",
//         text2: "Failed to delete group",
//       });
//       return false;
//     }
//   };

//   return {
//     groups,
//     groupsLoading,
//     fetchGroups,
//     createGroup,
//     updateGroup,
//     deleteGroup,
//   };
// };
