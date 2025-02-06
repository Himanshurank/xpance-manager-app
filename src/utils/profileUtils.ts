import { supabase } from "../lib/supabase";

export const uploadProfilePhoto = async (userId: string, photoUri: string) => {
  try {
    // Validate inputs
    if (!userId || !photoUri) {
      throw new Error("Missing required parameters");
    }

    // Generate unique filename
    const filename = `${userId}-${Date.now()}.jpg`;
    const filePath = `${userId}/${filename}`;

    // Convert URI to Blob for React Native
    const response = await fetch(photoUri);
    const blob = await response.blob();

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from("profile_photos")
      .upload(filePath, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile_photos").getPublicUrl(filePath);

    // Update user's avatar_url
    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    return publicUrl;
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw error;
  }
};

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
