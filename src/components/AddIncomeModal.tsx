import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { supabase } from "../lib/supabase";
import Toaster from "../utils/toasterConfig";
import { useAuth } from "../hooks/useAuth";

interface AddIncomeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddIncomeModal({
  visible,
  onClose,
  onSuccess,
}: AddIncomeModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!amount || !user?.id) return;
    try {
      setLoading(true);
      const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

      const { error } = await supabase.from("user_income").upsert(
        {
          user_id: user.id,
          amount: parseFloat(amount),
          month: currentMonth,
        },
        { onConflict: "user_id,month" }
      );

      if (error) throw error;
      onSuccess?.();
      onClose();
      setAmount("");
      Toaster({ type: "success", text1: "Income updated" });
    } catch (error) {
      console.error("Error adding income:", error);
      Toaster({ type: "error", text1: "Failed to update income" });
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
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modal}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Monthly Income</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, !amount && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading || !amount}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "400",
    color: "#1a1a1a",
    marginRight: 8,
  },
  input: {
    fontSize: 32,
    fontWeight: "400",
    color: "#1a1a1a",
    minWidth: 120,
    textAlign: "left",
  },
  button: {
    backgroundColor: "#1a73e8",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
