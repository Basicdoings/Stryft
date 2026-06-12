import { useEffect } from 'react';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { 
  useFonts, 
  WorkSans_400Regular, 
  WorkSans_500Medium, 
  WorkSans_600SemiBold, 
  WorkSans_700Bold, 
  WorkSans_800ExtraBold 
} from '@expo-google-fonts/work-sans';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

const StryftTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
    card: Colors.dark.background,
  },
} as any;

export default function RootLayout() {
  const [loaded, error] = useFonts({
    WorkSans_400Regular,
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    WorkSans_700Bold,
    WorkSans_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ThemeProvider value={StryftTheme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.dark.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="landing" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="assessment" />
        <Stack.Screen name="mission" />
        <Stack.Screen name="reward" />
        <Stack.Screen name="checkin" />
        <Stack.Screen name="today" />
        <Stack.Screen name="meals" />
        <Stack.Screen name="shopping-list" />
        <Stack.Screen name="checkin-celebration" />
        <Stack.Screen name="avatar" />
        <Stack.Screen name="cosmetics" />
        <Stack.Screen name="rewards" />
        <Stack.Screen name="future-self" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="community" />
        <Stack.Screen name="premium" />
        <Stack.Screen name="safety" />
      </Stack>
    </ThemeProvider>
  );
}
