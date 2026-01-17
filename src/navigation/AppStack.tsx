import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "../screens/DashboardScreen";
import ProblemScreen from "../screens/ProblemScreen";
import SolutionScreen from "../screens/SolutionScreen";

export type AppStackParamList = {
  Dashboard: undefined;
  Home: undefined;
  SubmitAnswer: { todayKey: string; questionId: string };
  Solution: { todayKey: string; questionId: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Home" component={ProblemScreen} />
      <Stack.Screen 
        name="Solution" 
        component={SolutionScreen} 
        options={{ 
          headerShown: true,
          title: "Solution",
          headerStyle: { backgroundColor: '#fff' },
          headerShadowVisible: false,
        }} 
      />
    </Stack.Navigator>
  );
};

export default AppStack;
