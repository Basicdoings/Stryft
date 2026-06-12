import { GlassView } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import {
  memo,
  useEffect,
  useMemo,
  type ComponentProps,
  type FC,
  type FunctionComponent,
  type JSX,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MeasurementLayer } from "./components/measurement-layer";
import { PanelStack } from "./components/panel-stack";
import { TabToolbar } from "./components/tab-toolbar";
import { useCardMorph } from "./hooks/use-card-morph";
import { useDynamicLayout } from "./hooks/use-dynamic-layout";
import { useNavItems } from "./hooks/use-nav-items";
import { usePopupRenderer } from "./hooks/use-popup-renderer";
import { useViewTransition } from "./hooks/use-view-transition";
import type {
  IAnimatedTabBarProps,
  INavItem,
  IPalette,
} from "./typings/motion-tabs";
import { layoutStyles as styles } from "./utils/layout-styles";
import { palette } from "./utils/palette";
import { estimateToolbarWidth } from "./utils/toolbar-width";

const AnimatedTabBar: FC<IAnimatedTabBarProps> &
  FunctionComponent<IAnimatedTabBarProps> = memo<
    IAnimatedTabBarProps & ComponentProps<typeof AnimatedTabBar>
  >(
    (
      props: IAnimatedTabBarProps & ComponentProps<typeof AnimatedTabBar>,
    ): (ReactNode & ReactElement & JSX.Element) | null => {
      const { descriptors, navigation, renderPopupBody, state } = props;
      const insets = useSafeAreaInsets();
      const scheme = (useColorScheme() ?? "light") as "light" | "dark";
      const colors = useMemo<IPalette>(() => palette(scheme), [scheme]);
      const popupRenderer = usePopupRenderer(renderPopupBody);
      const items = useNavItems({ descriptors, state });

      // Split coach out of main items
      const mainItems = useMemo(() => items.filter((item) => item.routeName !== 'coach' && item.routeName !== 'progress'), [items]);
      const coachItem = useMemo(() => items.find((item) => item.routeName === 'coach'), [items]);

      const layout = useDynamicLayout();
      const transition = useViewTransition(mainItems);
      const toolbarTargetW = Math.max(
        layout.toolbarW,
        estimateToolbarWidth(mainItems, transition.view),
      );
      const motion = useCardMorph({
        sizes: layout.sizes,
        toolbarH: layout.toolbarH,
        toolbarMinW: layout.toolbarMinW,
        toolbarW: toolbarTargetW,
        view: transition.view,
      });

      const handlePress = (item: INavItem, index: number): void => {
        const isFocused = state.index === index;
        if (!isFocused) navigation.navigate(item.routeName);
        transition.setNextView(item);
      };

      return (
        <View
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFill, styles.root]}
        >
          <MeasurementLayer
            colors={colors}
            items={mainItems}
            onMeasure={layout.handleMeasure}
            renderPopupBody={popupRenderer}
          />
          {transition.view !== "default" && (
            <Pressable
              accessibilityLabel="Close menu"
              accessibilityRole="button"
              onPress={transition.close}
              style={StyleSheet.absoluteFill}
            />
          )}
          <View
            pointerEvents="box-none"
            style={[styles.dock, { paddingBottom: Math.max(insets.bottom, 12) }]}
          >
            <View pointerEvents="box-none" style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 16, width: '100%', height: 48 }}>
              <Animated.View style={[styles.cardShadow, motion.cardStyle, { flexShrink: 1, maxWidth: '100%', marginRight: 30 }]}>
                <GlassView
                  // intensity={60}
                  glassEffectStyle={"regular"}
                  style={[
                    styles.card,
                    {
                      borderColor: "#81858D",
                      borderWidth: 1.5,
                      ...Platform.select({
                        android: {
                          backgroundColor: "#393C43",
                        },
                      }),
                    },
                  ]}
                >
                  <PanelStack
                    colors={colors}
                    direction={transition.panelDirection}
                    items={mainItems}
                    onMeasure={layout.handleMeasure}
                    renderPopupBody={popupRenderer}
                    view={transition.view}
                    close={transition.close}
                  />
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.divider,
                      motion.dividerStyle,
                      { backgroundColor: colors.border },
                    ]}
                  />
                  <TabToolbar
                    colors={colors}
                    items={mainItems}
                    onLayout={layout.handleToolbarLayout}
                    onPress={handlePress}
                    view={transition.view}
                  />
                </GlassView>
              </Animated.View>

              {coachItem && (
                <Animated.View style={[styles.cardShadow, { position: 'absolute', right: 16, bottom: 0, width: 48, height: 48, borderRadius: 24, flexShrink: 0, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }]}>
                  <SpinningAccentBorder />
                  <GlassView
                    glassEffectStyle="regular"
                    style={[
                      {
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                      },
                      Platform.select({ android: { backgroundColor: "#F97316" } }),
                    ]}
                  >
                    <Pressable
                      onPress={() => {
                        const coachIndex = items.findIndex((i) => i.routeName === 'coach');
                        if (state.index !== coachIndex) navigation.navigate(coachItem.routeName);
                        transition.close();
                      }}
                      style={({ pressed }) => [
                        { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
                        { backgroundColor: state.index === items.findIndex((i) => i.routeName === 'coach') ? (colors as any).primary : 'transparent' },
                        pressed && { opacity: 0.7 }
                      ]}
                    >
                      {coachItem.icon(
                        state.index === items.findIndex((i) => i.routeName === 'coach'),
                        state.index === items.findIndex((i) => i.routeName === 'coach') ? '#fff' : colors.foreground,
                        22
                      )}
                    </Pressable>
                  </GlassView>
                </Animated.View>
              )}
            </View>
          </View>
        </View>
      );
    },
  );

export { AnimatedTabBar };

const SpinningAccentBorder = () => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle, { width: 100, height: 100, top: -26, left: -26 }]}>
      <LinearGradient
        colors={['#2563EB', '#111111', '#2563EB', '#111111', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
};

