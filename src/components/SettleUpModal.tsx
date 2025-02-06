import React, { useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface SettleUpModalProps {
  visible: boolean;
  onClose: () => void;
  members: any[];
  expenses: any[];
  userId?: string;
}

const { height } = Dimensions.get("window");

export function SettleUpModal({
  visible,
  onClose,
  members,
  expenses,
  userId,
}: SettleUpModalProps) {
  const slideAnim = useRef(new Animated.Value(height)).current;

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

  const balances = members.map((member) => {
    const paid = expenses
      .filter((exp) => exp.paidById === member.id)
      .reduce((sum, exp) => sum + exp.amount, 0);
    const share = expenses.reduce(
      (sum, exp) => sum + exp.amount / members.length,
      0
    );
    return {
      ...member,
      balance: paid - share,
    };
  });

  const getSettlements = () => {
    const debtors = balances
      .filter((m) => m.balance < 0)
      .sort((a, b) => a.balance - b.balance);
    const creditors = balances
      .filter((m) => m.balance > 0)
      .sort((a, b) => b.balance - a.balance);

    const settlements = [];

    for (const debtor of debtors) {
      let remaining = Math.abs(debtor.balance);

      for (const creditor of creditors) {
        if (remaining <= 0 || creditor.balance <= 0) continue;

        const amount = Math.min(remaining, creditor.balance);
        if (amount > 0) {
          settlements.push({
            from: debtor,
            to: creditor,
            amount: Number(amount.toFixed(2)),
          });
          remaining -= amount;
          creditor.balance -= amount;
        }
      }
    }

    return settlements;
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
            <Text style={styles.modalTitle}>Settle Up</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.balancesList}>
            {balances.map((member) => (
              <View key={member.id} style={styles.balanceItem}>
                <View style={styles.memberInfo}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.avatarText}>
                      {member.name[0].toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.memberName}>
                    {member.id === userId ? "You" : member.name}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.balanceAmount,
                    member.balance > 0 ? styles.positive : styles.negative,
                  ]}
                >
                  {member.balance > 0 ? "+" : ""}₹{member.balance.toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.settlementSection}>
            <Text style={styles.sectionTitle}>Settlements</Text>
            <ScrollView style={styles.settlementsList}>
              {getSettlements().map((settlement, index) => (
                <View key={index} style={styles.settlementItem}>
                  <View style={styles.settlementParties}>
                    <Text style={styles.partyName}>
                      {settlement.from.id === userId
                        ? "You"
                        : settlement.from.name}
                    </Text>
                    <View style={styles.arrowContainer}>
                      <Icon name="arrow-forward" size={20} color="#666" />
                    </View>
                    <Text style={styles.partyName}>
                      {settlement.to.id === userId ? "You" : settlement.to.name}
                    </Text>
                  </View>
                  <Text style={styles.settlementAmount}>
                    ₹{settlement.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.settleActions}>
            <TouchableOpacity style={styles.settleButton}>
              <Icon name="check-circle" size={20} color="#fff" />
              <Text style={styles.settleButtonText}>Mark as Settled</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  closeButton: {
    padding: 4,
  },
  balancesList: {
    padding: 20,
  },
  balanceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1a73e8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  positive: {
    color: "#34A853",
  },
  negative: {
    color: "#EA4335",
  },
  settleActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  settleButton: {
    backgroundColor: "#34A853",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
  },
  settleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  settlementSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  settlementsList: {
    maxHeight: 200,
  },
  settlementItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settlementParties: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  partyName: {
    fontSize: 16,
    color: "#1a1a1a",
    flex: 1,
  },
  arrowContainer: {
    paddingHorizontal: 12,
  },
  settlementAmount: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginLeft: 12,
  },
});
