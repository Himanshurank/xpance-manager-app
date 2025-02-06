import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "./src/screens/LoginScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { useAuth } from "./src/hooks/useAuth";
import { View, ActivityIndicator } from "react-native";
import { SignupScreen } from "./src/screens/SignupScreen";
import Toast from "react-native-toast-message";
import { GroupScreen } from "./src/screens/GroupScreen";
import { GroupDetailsScreen } from "./src/screens/GroupDetailsScreen";
import { AllExpensesScreen } from "./src/screens/AllExpensesScreen";

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Group: undefined;
  GroupDetails: undefined;
  AllExpenses: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Group" component={GroupScreen} />
              <Stack.Screen
                name="GroupDetails"
                component={GroupDetailsScreen}
              />
              <Stack.Screen
                name="AllExpenses"
                component={AllExpensesScreen}
                options={{ headerShown: false }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
}
