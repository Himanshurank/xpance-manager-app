import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../lib/supabase";
import Toaster from "../utils/toasterConfig";
import { useAppSelector } from "../store/user/userStore";
import { Expense } from "../types/types";

const { height } = Dimensions.get("window");

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  groupId?: string;
  onSuccess?: () => void;
  expense?: Expense;
}

export function AddExpenseModal({
  visible,
  onClose,
  groupId,
  onSuccess,
  expense,
}: AddExpenseModalProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [amount, setAmount] = useState(expense?.amount.toString() || "");
  const [description, setDescription] = useState(expense?.description || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    expense?.category?.id || ""
  );
  const [splitType, setSplitType] = useState<"equal" | "percentage" | "custom">(
    "equal"
  );
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (visible && expense) {
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setSelectedCategory(expense.category.id);
    } else if (!visible) {
      setDescription("");
      setAmount("");
      setSelectedCategory("");
    }
  }, [visible, expense]);

  useEffect(() => {
    if (visible) {
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
  }, [visible]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("expense_categories")
      .select("*")
      .in("type", ["shared", "both"]);

    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }

    setCategories(data || []);
  };

  const handleSubmit = async () => {
    if (!amount || !description || !selectedCategory) {
      Toaster({
        type: "error",
        text1: "Error",
        text2: "Please fill all required fields",
      });
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        description,
        amount: parseFloat(amount),
        category_id: selectedCategory,
        paid_by: user?.id,
        group_id: groupId,
      };

      if (expense) {
        // Update existing expense
        const { error } = await supabase
          .from(groupId ? "shared_expenses" : "personal_expenses")
          .update(expenseData)
          .eq("id", expense.id);

        if (error) throw error;
        Toaster({ type: "success", text1: "Expense updated successfully" });
      } else {
        // Create new expense
        const { error } = await supabase
          .from(groupId ? "shared_expenses" : "personal_expenses")
          .insert([expenseData]);

        if (error) throw error;
        Toaster({ type: "success", text1: "Expense added successfully" });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving expense:", error);
      Toaster({
        type: "error",
        text1: "Error",
        text2: "Failed to save expense",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
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
            <Text style={styles.modalTitle}>Add Expense</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            {/* Amount Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Amount*</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="Enter amount"
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description*</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="What's this expense for?"
              />
            </View>

            {/* Category Selection */}
            <Text style={styles.label}>Category*</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    selectedCategory === category.id && styles.selectedCategory,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Icon name={category.icon} size={24} color={category.color} />
                  <Text style={styles.categoryText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Split Type Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Split Type</Text>
              <View style={styles.splitTypeContainer}>
                {["equal", "percentage", "custom"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.splitTypeButton,
                      splitType === type && styles.selectedSplitType,
                    ]}
                    onPress={() => setSplitType(type as any)}
                  >
                    <Text
                      style={[
                        styles.splitTypeText,
                        splitType === type && styles.selectedSplitTypeText,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Add Expense</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: "80%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    padding: 5,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  categoriesContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  categoryItem: {
    alignItems: "center",
    padding: 10,
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    minWidth: 80,
  },
  selectedCategory: {
    borderColor: "#1a73e8",
    backgroundColor: "#f0f7ff",
  },
  categoryText: {
    marginTop: 5,
    fontSize: 12,
  },
  splitTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  splitTypeButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
  },
  selectedSplitType: {
    borderColor: "#1a73e8",
    backgroundColor: "#1a73e8",
  },
  splitTypeText: {
    color: "#333",
  },
  selectedSplitTypeText: {
    color: "white",
  },
  submitButton: {
    backgroundColor: "#1a73e8",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
