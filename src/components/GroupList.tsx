import React from "react";
import { useNavigation } from "@react-navigation/native";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Group } from "../types/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  GroupDetails: {
    id: string;
    name: string;
    icon: string;
    color: string;
    memberCount: number;
  };
};

type TProps = {
  groups: Group[];
  loading: boolean;
};

const GroupList = ({ groups, loading }: TProps) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (loading && !groups.length) {
    return <ActivityIndicator size="large" color="#1a73e8" />;
  }

  return (
    <View>
      {groups.map((group) => (
        <TouchableOpacity
          key={group.id}
          style={styles.groupItem}
          onPress={() => {
            navigation.navigate("GroupDetails", {
              id: group.id,
              name: group.name,
              icon: group.icon,
              color: group.color,
              memberCount: group.member_count ?? 0,
            });
          }}
        >
          <View style={styles.groupIcon}>
            <MaterialIcons name="group" size={24} color="#1a73e8" />
          </View>
          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.groupMembers}>
              {group.member_count}{" "}
              {group.member_count === 1 ? "member" : "members"}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default GroupList;

const styles = StyleSheet.create({
  groupList: {
    marginTop: 8,
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e8f0fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 12,
    color: "#666",
  },
});
