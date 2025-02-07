import { supabase } from "../lib/supabase";
import * as FileSystem from "expo-file-system";

export const uploadProfilePhoto = async (userId: string, photoUri: string) => {
  try {
    // Validate inputs
    if (!userId || !photoUri) {
      throw new Error("Missing required parameters");
    }

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(photoUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Generate unique filename
    const filename = `${userId}-${Date.now()}.jpg`;
    const filePath = `${userId}/${filename}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from("profile_photos")
      .upload(filePath, decode(base64), {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile_photos").getPublicUrl(filePath);

    // Update user metadata
    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    return publicUrl;
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw error;
  }
};

// Helper function to decode base64
function decode(base64: string) {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArrays.push(byteCharacters.charCodeAt(i));
  }
  return new Uint8Array(byteArrays);
}

export const deleteProfilePhoto = async (userId: string, photoUrl: string) => {
  try {
    const fileName = photoUrl.substring(photoUrl.lastIndexOf("/") + 1);
    const filePath = `${userId}/${fileName}`;

    const { error: deleteError } = await supabase.storage
      .from("profile_photos")
      .remove([filePath]);

    if (deleteError) throw deleteError;

    // Remove photo URL from user profile
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: null },
    });

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error("Error deleting photo:", error);
    return { error: "Failed to delete photo" };
  }
};
