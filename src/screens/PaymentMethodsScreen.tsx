import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";

type PaymentMethodsScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const paymentMethods = [
  {
    id: "1",
    type: "Credit Card",
    last4: "4242",
    expiryDate: "12/24",
    brand: "visa",
    isDefault: true,
  },
  {
    id: "2",
    type: "Credit Card",
    last4: "1234",
    expiryDate: "09/25",
    brand: "mastercard",
    isDefault: false,
  },
];

export function PaymentMethodsScreen() {
  const navigation = useNavigation<PaymentMethodsScreenNavigationProp>();

  const handleAddPaymentMethod = () => {
    // Handle adding new payment method
  };

  const handleEditPaymentMethod = (id: string) => {
    // Handle editing payment method
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
        <Text style={styles.title}>Payment Methods</Text>
        <TouchableOpacity
          onPress={handleAddPaymentMethod}
          style={styles.addButton}
        >
          <Icon name="add" size={24} color="#1a73e8" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.paymentMethodsSection}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.paymentMethodItem}
              onPress={() => handleEditPaymentMethod(method.id)}
            >
              <View style={styles.cardInfo}>
                <Icon
                  name={method.brand === "visa" ? "credit-card" : "credit-card"}
                  size={32}
                  color="#1a73e8"
                />
                <View style={styles.cardDetails}>
                  <Text style={styles.cardType}>
                    {method.brand.toUpperCase()} •••• {method.last4}
                  </Text>
                  <Text style={styles.expiryDate}>
                    Expires {method.expiryDate}
                  </Text>
                </View>
              </View>
              <View style={styles.rightSection}>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
                <Icon name="chevron-right" size={24} color="#666" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.addPaymentButton}
          onPress={handleAddPaymentMethod}
        >
          <Icon name="add-circle-outline" size={24} color="#1a73e8" />
          <Text style={styles.addPaymentText}>Add New Payment Method</Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Icon name="lock" size={20} color="#666" />
          <Text style={styles.infoText}>
            Your payment information is encrypted and securely stored. We never
            store your full card details on our servers.
          </Text>
        </View>
      </ScrollView>
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
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  paymentMethodsSection: {
    padding: 16,
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 12,
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardDetails: {
    marginLeft: 12,
  },
  cardType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  expiryDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  defaultBadge: {
    backgroundColor: "#e8f0fe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  defaultText: {
    fontSize: 12,
    color: "#1a73e8",
    fontWeight: "500",
  },
  addPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: "#1a73e8",
    borderStyle: "dashed",
    borderRadius: 12,
  },
  addPaymentText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#1a73e8",
    fontWeight: "500",
  },
  infoSection: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#f8f9fa",
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
