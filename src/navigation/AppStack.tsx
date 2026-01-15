import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProblemScreen from "../screens/ProblemScreen";
import SolutionScreen from "../screens/SolutionScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";

export type AppStackParamList = {
  Home: undefined;
  SubmitAnswer: { todayKey: string; questionId: string };
  Solution: { todayKey: string; questionId: string };
  Analytics: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
      <Stack.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{ 
          headerShown: true,
          title: "Analytics",
          headerStyle: { backgroundColor: '#fff' },
          headerShadowVisible: false,
        }} 
      />
    </Stack.Navigator>
  );
};

export default AppStack;
