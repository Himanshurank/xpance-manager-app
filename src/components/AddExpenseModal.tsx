import React, { useState, useEffect } from "react";
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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../lib/supabase";
import Toaster from "../utils/toasterConfig";
import { useAuth } from "../hooks/useAuth";

interface Member {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
}

interface ExpenseData {
  amount: number;
  category_id: string;
  description: string;
  paid_by: string | undefined;
  group_id?: string;
  split_type?: "equal" | "percentage" | "custom";
}

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  groupId?: string;
  onSuccess?: () => void;
  members?: Member[];
}

export function AddExpenseModal({
  visible,
  onClose,
  groupId,
  onSuccess,
  members,
}: AddExpenseModalProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [splitType, setSplitType] = useState<"equal" | "percentage" | "custom">(
    "equal"
  );
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

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
      // If no groupId, it's a personal expense
      if (!groupId) {
        const { error: personalExpenseError } = await supabase
          .from("personal_expenses")
          .insert([
            {
              amount: parseFloat(amount),
              category_id: selectedCategory,
              description,
              user_id: user?.id,
            },
          ]);

        if (personalExpenseError) throw personalExpenseError;
      } else {
        // Group expense logic
        const expenseData: ExpenseData = {
          amount: parseFloat(amount),
          category_id: selectedCategory,
          description,
          paid_by: user?.id,
          group_id: groupId,
          split_type: splitType,
        };

        const { data: expense, error: expenseError } = await supabase
          .from("shared_expenses")
          .insert([expenseData])
          .select()
          .single();

        if (expenseError) throw expenseError;

        // Handle group expense participants
        if (members) {
          const shareAmount =
            splitType === "equal" ? parseFloat(amount) / members.length : 0;
          const participantsData = members.map((member) => ({
            expense_id: expense.id,
            user_id: member.id,
            share_amount: shareAmount,
            share_percentage:
              splitType === "equal" ? 100 / members.length : null,
          }));

          const { error: participantsError } = await supabase
            .from("expense_participants")
            .insert(participantsData);

          if (participantsError) throw participantsError;
        }
      }

      Toaster({
        type: "success",
        text1: "Success",
        text2: "Expense added successfully",
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error adding expense:", error);
      Toaster({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to add expense",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
                      selectedCategory === category.id &&
                        styles.selectedCategory,
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Icon
                      name={category.icon}
                      size={24}
                      color={category.color}
                    />
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
          </View>
        </View>
      </KeyboardAvoidingView>
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
