import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useAppSelector } from "../store/user/userStore";
import { supabase } from "../lib/supabase";
import Toaster from "../utils/toasterConfig";
import { uploadProfilePhoto, deleteProfilePhoto } from "../utils/profileUtils";
import * as ImagePicker from "expo-image-picker";

const { height } = Dimensions.get("window");

export function PersonalInformationScreen() {
  const navigation = useNavigation();
  const { user } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || "",
    email: user?.email || "",
    phone: user?.user_metadata?.phone || "",
    currency: user?.user_metadata?.currency || "₹",
    occupation: user?.user_metadata?.occupation || "",
    address: user?.user_metadata?.address || "",
    dateOfBirth: user?.user_metadata?.dateOfBirth || "",
  });

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const currencies = [
    { symbol: "₹", name: "INR - Indian Rupee" },
    { symbol: "$", name: "USD - US Dollar" },
    { symbol: "€", name: "EUR - Euro" },
    { symbol: "£", name: "GBP - British Pound" },
    { symbol: "¥", name: "JPY - Japanese Yen" },
  ];

  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.user_metadata?.name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        currency: user.user_metadata?.currency || "₹",
        occupation: user.user_metadata?.occupation || "",
        address: user.user_metadata?.address || "",
        dateOfBirth: user.user_metadata?.dateOfBirth || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (showCurrencyModal) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showCurrencyModal]);

  const handleSave = async () => {
    try {
      if (!user) return;

      const { error } = await supabase.auth.updateUser({
        data: {
          name: formData.name,
          phone: formData.phone,
          occupation: formData.occupation,
          address: formData.address,
          dateOfBirth: formData.dateOfBirth,
          currency: formData.currency,
        },
      });

      if (error) throw error;

      // You might want to dispatch an action to update the Redux store here
      // dispatch(updateUserMetadata(formData));

      Toaster({
        type: "success",
        text1: "Success",
        text2: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Toaster({
        type: "error",
        text1: "Error",
        text2: "Failed to update profile",
      });
    }
  };

  const handleProfilePhotoUpload = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Toaster({
          type: "error",
          text1: "Error",
          text2: "Permission to access camera roll is required!",
        });
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const url = await uploadProfilePhoto(
          user?.id || "",
          result.assets[0].uri
        );
        if (url) {
          Toaster({
            type: "success",
            text1: "Success",
            text2: "Profile photo updated!",
          });
        }
      }
    } catch (error) {
      Toaster({
        type: "error",
        text1: "Error",
        text2: "Failed to update profile photo",
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>Personal Information</Text>
        <TouchableOpacity onPress={handleSave} style={styles.editButton}>
          <Text style={styles.editButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profilePhotoSection}>
        <TouchableOpacity onPress={handleProfilePhotoUpload}>
          {user?.user_metadata?.avatar_url ? (
            <Image
              source={{ uri: user.user_metadata.avatar_url }}
              style={styles.profilePhoto}
            />
          ) : (
            <View style={styles.profilePhotoPlaceholder}>
              <Icon name="person" size={40} color="#666" />
            </View>
          )}
          <TouchableOpacity style={styles.editPhotoButton}>
            <Icon name="camera-alt" size={16} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Enter your full name"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={formData.email}
                editable={false}
              />
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                keyboardType="phone-pad"
                placeholder="Enter your phone number"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Occupation</Text>
              <TextInput
                style={styles.input}
                value={formData.occupation}
                onChangeText={(text) =>
                  setFormData({ ...formData, occupation: text })
                }
                placeholder="Enter your occupation"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={formData.address}
                onChangeText={(text) =>
                  setFormData({ ...formData, address: text })
                }
                multiline
                numberOfLines={3}
                placeholder="Enter your address"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                value={formData.dateOfBirth}
                onChangeText={(text) =>
                  setFormData({ ...formData, dateOfBirth: text })
                }
                placeholder="DD/MM/YYYY"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <TouchableOpacity
              style={styles.preferenceItem}
              onPress={() => setShowCurrencyModal(true)}
            >
              <View>
                <Text style={styles.preferenceLabel}>Currency</Text>
                <Text style={styles.preferenceValue}>{formData.currency}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCurrencyModal(false)}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.currencyList}>
              {currencies.map((curr, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.currencyItem}
                  onPress={() => {
                    setFormData({ ...formData, currency: curr.symbol });
                    setShowCurrencyModal(false);
                  }}
                >
                  <Text style={styles.currencySymbol}>{curr.symbol}</Text>
                  <Text style={styles.currencyName}>{curr.name}</Text>
                  {formData.currency === curr.symbol && (
                    <Icon name="check" size={20} color="#1a73e8" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  editButtonText: {
    color: "#1a73e8",
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: "#1a1a1a",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#666",
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  preferenceLabel: {
    fontSize: 16,
    color: "#1a1a1a",
    marginBottom: 4,
  },
  preferenceValue: {
    fontSize: 14,
    color: "#666",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  currencyList: {
    padding: 16,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    width: 40,
  },
  currencyName: {
    fontSize: 16,
    color: "#1a1a1a",
    flex: 1,
    marginLeft: 12,
  },
  profilePhotoSection: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePhotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  editPhotoButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#1a73e8",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
});
