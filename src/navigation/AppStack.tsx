import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "../screens/DashboardScreen";
import ProblemScreen from "../screens/ProblemScreen";
import SolutionScreen from "../screens/SolutionScreen";
import ProblemsListScreen from "../screens/ProblemsListScreen";
import ProblemDetailScreen from "../screens/ProblemDetailScreen";

export type AppStackParamList = {
  Dashboard: undefined;
  Home: undefined;
  ProblemsList: undefined;
  ProblemDetail: { problemId: string };
  SubmitAnswer: { todayKey: string; questionId: string };
  Solution: { todayKey: string; questionId: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Home" component={ProblemScreen} />
      <Stack.Screen name="ProblemsList" component={ProblemsListScreen} />
      <Stack.Screen name="ProblemDetail" component={ProblemDetailScreen} />
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
