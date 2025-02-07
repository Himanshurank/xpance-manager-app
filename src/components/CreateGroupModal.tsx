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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAppDispatch } from "../store/store";
import { createGroup, updateGroup } from "../store/slices/groupSlice";
import Toaster from "../utils/toasterConfig";
import { GroupDetails } from "../types/types";

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (groupDetails: GroupDetails) => void;
  userId: string;
  mode?: "create" | "edit";
  groupData?: GroupDetails;
}

const ICONS = [
  "people",
  "home",
  "school",
  "work",
  "movie",
  "restaurant",
  "flight",
  "celebration",
] as const;

const COLORS = [
  "#1a73e8", // Blue
  "#34A853", // Green
  "#EA4335", // Red
  "#FBBC05", // Yellow
  "#9C27B0", // Purple
  "#FF9800", // Orange
  "#795548", // Brown
  "#607D8B", // Blue Grey
] as const;

type IconType = (typeof ICONS)[number];
type ColorType = (typeof COLORS)[number];

export function CreateGroupModal({
  visible,
  onClose,
  onSuccess,
  userId,
  mode = "create",
  groupData,
}: CreateGroupModalProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<IconType>("people");
  const [selectedColor, setSelectedColor] = useState<ColorType>("#1a73e8");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && groupData && visible) {
      setName(groupData.name);
      if (ICONS.includes(groupData.icon as IconType)) {
        setSelectedIcon(groupData.icon as IconType);
      }
      if (COLORS.includes(groupData.color as ColorType)) {
        setSelectedColor(groupData.color as ColorType);
      }
    } else if (!visible) {
      resetForm();
    }
  }, [mode, groupData, visible]);

  const resetForm = () => {
    if (mode === "create") {
      setName("");
      setSelectedIcon("people");
      setSelectedColor("#1a73e8");
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Toaster({
        type: "error",
        text1: "Error",
        text2: "Group name is required",
      });
      return;
    }

    if (!userId) {
      Toaster({
        type: "error",
        text1: "Error",
        text2: "User not authenticated",
      });
      return;
    }

    setLoading(true);

    try {
      if (mode === "edit" && groupData) {
        const result = await dispatch(
          updateGroup({
            groupId: groupData.id,
            updatedData: {
              name: name.trim(),
              icon: selectedIcon,
              color: selectedColor,
            },
          })
        ).unwrap();

        if (result) {
          onSuccess({
            id: groupData.id,
            name: name.trim(),
            icon: selectedIcon,
            color: selectedColor,
            memberCount: groupData.memberCount ?? 0,
          });
          onClose();
        }
      } else {
        const result = await dispatch(
          createGroup({
            name: name.trim(),
            icon: selectedIcon,
            color: selectedColor,
            created_by: userId,
          })
        ).unwrap();

        if (result) {
          Toaster({
            type: "success",
            text1: "Success",
            text2: "Group created successfully",
          });
          onSuccess({
            id: result.id,
            name: name.trim(),
            icon: selectedIcon,
            color: selectedColor,
            memberCount: groupData?.memberCount ?? 0,
          });
          onClose();
        }
      }
    } catch (error) {
      console.error(
        `Error ${mode === "edit" ? "updating" : "creating"} group:`,
        error
      );
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
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {mode === "edit" ? "Edit Group" : "Create New Group"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Group Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter group name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Select Icon</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.iconScroll}
            >
              {ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconButton,
                    {
                      backgroundColor:
                        selectedIcon === icon ? selectedColor : "#f5f5f5",
                    },
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Icon
                    name={icon}
                    size={24}
                    color={selectedIcon === icon ? "#fff" : "#666"}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Select Color</Text>
            <View style={styles.colorGrid}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.createButton,
                { backgroundColor: selectedColor },
                loading && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.createButtonText}>
                  {mode === "edit" ? "Save Changes" : "Create Group"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    color: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  iconScroll: {
    flexDirection: "row",
    marginBottom: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  createButton: {
    backgroundColor: "#1a73e8",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
});
