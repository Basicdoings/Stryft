import { AnimatedTabBar } from '@/components/motion-tabs';
import { PopupBody } from '@/components/motion-tabs/components/popup-body';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 0 }, // Motion tabs require this
      }}
      tabBar={(props) => <AnimatedTabBar {...(props as any)} renderPopupBody={(context) => <PopupBody {...context} />} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            // Using a local image asset
            <TabIcon imageSource={require('@/assets/images/general/home.png')} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          tabBarLabel: 'Plan',
          tabBarIcon: ({ color, size }) => (
            <TabIcon imageSource={require('@/assets/images/general/health_plus.png')} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          tabBarLabel: 'Coach',
          tabBarIcon: ({ color, size }) => (
            <TabIcon imageSource={require('@/assets/images/general/chat_bubble.png')} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarLabel: 'Progress',
          href: null,
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="stats-chart" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <TabIcon imageSource={require('@/assets/images/general/user.png')} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

// Temporary inline TabIcon if it doesn't exist in components
import { Ionicons } from '@expo/vector-icons';
import { Image, OpaqueColorValue } from 'react-native';

function TabIcon({ name, color, size, imageSource }: { name?: keyof typeof Ionicons.glyphMap; color: string | OpaqueColorValue; size: number; imageSource?: any }) {
  if (imageSource) {
    return <Image source={imageSource} style={{ width: size, height: size, tintColor: color }} resizeMode="contain" />;
  }
  return <Ionicons name={name as any} size={size} color={color} />;
}
