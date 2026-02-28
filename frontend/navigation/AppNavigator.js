import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { COLORS } from "../config/colors";
import { useAuth } from "../context/AuthContext";

import AdminDashboard from "../screens/AdminDashboard";
import InstructorDashboard from "../screens/InstructorDashboard";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import StudentDashboard from "../screens/StudentDashboard";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );

  if (!user)
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user.role === "admin" && (
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        )}
        {user.role === "instructor" && (
          <Stack.Screen
            name="InstructorDashboard"
            component={InstructorDashboard}
          />
        )}
        {user.role === "student" && (
          <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.light,
  },
});

export default AppNavigator;
