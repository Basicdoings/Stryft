import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { Colors } from '@/constants/theme';

const StryftTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
    card: Colors.dark.background,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={StryftTheme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.dark.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="assessment" />
        <Stack.Screen name="mission" />
        <Stack.Screen name="reward" />
        <Stack.Screen name="checkin" />
        <Stack.Screen name="today" />
        <Stack.Screen name="progress" />
        <Stack.Screen name="meals" />
        <Stack.Screen name="shopping-list" />
        <Stack.Screen name="checkin-celebration" />
        <Stack.Screen name="avatar" />
        <Stack.Screen name="cosmetics" />
        <Stack.Screen name="rewards" />
        <Stack.Screen name="future-self" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="plan" />
        <Stack.Screen name="coach" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="community" />
        <Stack.Screen name="premium" />
        <Stack.Screen name="safety" />
      </Stack>
    </ThemeProvider>
  );
}
