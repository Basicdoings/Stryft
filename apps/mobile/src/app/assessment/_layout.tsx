import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function AssessmentLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: Colors.dark.background }
    }}>
      <Stack.Screen name="gender" />
      <Stack.Screen name="goal" />
      <Stack.Screen name="weight" />
      <Stack.Screen name="age" />
      <Stack.Screen name="fitnessLevel" />
      <Stack.Screen name="limitations" />
      <Stack.Screen name="commitment" />
      <Stack.Screen name="mealExceptions" />
      <Stack.Screen name="exercisePreferences" />
      <Stack.Screen name="supplements" />
      <Stack.Screen name="supplementDetails" />
      <Stack.Screen name="calorieGoal" />
      <Stack.Screen name="sleepQuality" />
      <Stack.Screen name="measurements" />
      <Stack.Screen name="timeline" />
      <Stack.Screen name="scan" />
      <Stack.Screen name="bodyAnalysis" options={{ gestureEnabled: false }} />
      <Stack.Screen name="prediction" />
      <Stack.Screen name="journey" />
    </Stack>
  );
}
