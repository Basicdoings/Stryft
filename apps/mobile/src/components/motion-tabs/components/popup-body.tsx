import React, { memo } from 'react';
import { View, StyleSheet, Dimensions, Image, Text, Pressable } from 'react-native';
import type { FC, FunctionComponent, JSX, ReactElement, ReactNode } from "react";
import type { IPopupRenderContext } from "../typings/motion-tabs";

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const HOME_ACTIONS = [
  { icon: 'body-outline', text: 'Future Self Prediction', route: '/future-self' },
  { icon: 'calendar-outline', text: 'Weekly Check-in', route: '/checkin' },
  { icon: 'person-circle-outline', text: 'Interactive Avatar', route: '/avatar' },
] as const;

const PLAN_ACTIONS = [
  { icon: 'shield-outline', text: 'Today\'s Mission', route: '/mission' },
  { icon: 'restaurant-outline', text: 'Meal Plan', route: '/meals' },
  { icon: 'shirt-outline', text: 'Cosmetics & Gear', route: '/cosmetics' },
] as const;

const PROFILE_ACTIONS = [
  { icon: 'stats-chart-outline', text: 'View Progress', route: '/(tabs)/progress' },
  { icon: 'people-outline', text: 'Explore Community', route: '/community' },
  { icon: 'log-out-outline', text: 'Log Out', route: '/auth/signin' },
] as const;

function TabIcon({ name, color, size }: { name: any; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

const MenuList = ({ items, colors, close }: { items: readonly any[], colors: any, close: () => void }) => {
  const router = useRouter();
  return (
    <View style={styles.menuPad}>
      {items.map((item) => (
        <Pressable
          key={item.text}
          onPress={() => {
            if (item.route) router.push(item.route);
            close();
          }}
          style={({ pressed }) => [
            styles.menuRow,
            { backgroundColor: pressed ? colors.hover || 'rgba(255,255,255,0.1)' : "transparent" },
          ]}
        >
          <TabIcon name={item.icon} size={20} color={colors.muted || '#A1A1AA'} />
          <Text style={[styles.menuText, { color: colors.foreground || '#FFF' }]}>
            {item.text}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const HomePopupBody: FC<IPopupRenderContext> = memo(({ colors, close }) => (
  <View style={styles.tinyCard}>
    <MenuList items={HOME_ACTIONS} colors={colors} close={close} />
  </View>
));

const PlanPopupBody: FC<IPopupRenderContext> = memo(({ colors, close }) => (
  <View style={styles.tinyCard}>
    <MenuList items={PLAN_ACTIONS} colors={colors} close={close} />
  </View>
));

const ProfilePopupBody: FC<IPopupRenderContext> = memo(({ colors, close }) => (
  <View style={styles.tinyCard}>
    <View style={[styles.profileCard, { borderBottomColor: colors.border || 'rgba(255,255,255,0.1)' }]}>
      <Image 
        source={{ uri: 'https://i.pravatar.cc/150?u=stryft_user' }} 
        style={styles.pfp} 
      />
      <View style={styles.profileDetailsContainer}>
        <Text style={[styles.profileName, { color: colors.foreground || '#FFF' }]}>Alex Stryft</Text>
        <Text style={[styles.profileLevel, { color: colors.primary || '#42D392' }]}>Lvl 12 Titan</Text>
        <Text style={[styles.profileTiny, { color: colors.muted || '#A1A1AA' }]}>Warrior Physique · 7 Day Streak</Text>
      </View>
    </View>
    <MenuList items={PROFILE_ACTIONS} colors={colors} close={close} />
  </View>
));

const PopupBody: FC<IPopupRenderContext> & FunctionComponent<IPopupRenderContext> = (
  context: IPopupRenderContext
): (ReactNode & ReactElement & JSX.Element) | null => {
  if (context.route.name === "index") return <HomePopupBody {...context} />;
  if (context.route.name === "plan") return <PlanPopupBody {...context} />;
  if (context.route.name === "profile") return <ProfilePopupBody {...context} />;
  return null;
};

const styles = StyleSheet.create({
  tinyCard: {
    minWidth: 260,
    maxWidth: 320,
  },
  menuPad: {
    padding: 12,
    paddingTop: 8,
    paddingBottom: 20,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  pfp: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#42D392',
  },
  profileDetailsContainer: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  profileLevel: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  profileTiny: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export { PopupBody };
