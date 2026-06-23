import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedScrollHandler, 
  useSharedValue, 
  runOnJS, 
  useAnimatedStyle, 
  interpolate, 
  interpolateColor,
  Extrapolation,
  SharedValue
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';

const ITEM_HEIGHT = 120;
const VISIBLE_ITEMS = 3;

interface WheelPickerProps {
  value: number;
  onValueChange: (val: number) => void;
  min: number;
  max: number;
}

interface WheelItemProps {
  index: number;
  val: number;
  scrollY: SharedValue<number>;
}

const AnimatedTypography = Animated.createAnimatedComponent(Typography);

const WheelItem = React.memo(({ index, val, scrollY }: WheelItemProps) => {
  const itemStyle = useAnimatedStyle(() => {
    const position = index * ITEM_HEIGHT;
    const distance = Math.abs(scrollY.value - position);

    const scale = interpolate(
      distance,
      [0, ITEM_HEIGHT],
      [1, 0.4],
      Extrapolation.CLAMP
    );

    const color = interpolateColor(
      distance,
      [0, ITEM_HEIGHT / 2, ITEM_HEIGHT],
      [Colors.dark.background, Colors.dark.textSecondary, Colors.dark.textSecondary]
    );

    return {
      transform: [{ scale }],
      color,
    };
  });

  return (
    <Animated.View style={styles.itemContainer}>
      <AnimatedTypography style={[styles.itemText, itemStyle]}>
        {val}
      </AnimatedTypography>
    </Animated.View>
  );
});

export function WheelPicker({ value, onValueChange, min, max }: WheelPickerProps) {
  const scrollRef = useRef<Animated.ScrollView>(null);
  const [localValue, setLocalValue] = useState(value);
  const scrollY = useSharedValue(0);
  
  const itemsCount = max - min + 1;
  const items = Array.from({ length: itemsCount }, (_, i) => min + i);
  const paddingVertical = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);

  useEffect(() => {
    const initialIndex = value - min;
    const initialOffset = initialIndex * ITEM_HEIGHT;
    scrollY.value = initialOffset;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: initialOffset, animated: false });
    }, 100);
  }, []);

  const handleValueChange = useCallback((newVal: number) => {
    if (newVal !== localValue) {
      setLocalValue(newVal);
      onValueChange(newVal);
    }
  }, [localValue, onValueChange]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      const index = Math.round(event.contentOffset.y / ITEM_HEIGHT);
      let newVal = min + index;
      if (newVal < min) newVal = min;
      if (newVal > max) newVal = max;
      
      runOnJS(handleValueChange)(newVal);
    },
  });

  return (
    <View style={styles.container}>
      {/* Center White Background Highlight */}
      <View style={styles.centerHighlight} pointerEvents="none" />

      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ 
          paddingVertical,
        }}
      >
        {items.map((val, index) => (
          <WheelItem key={val} index={index} val={val} scrollY={scrollY} />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 40,
    right: 40,
    height: ITEM_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 36,
    zIndex: 0,
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  itemText: {
    fontSize: 100,
    fontFamily: 'WorkSans-Black',
    lineHeight: 110,
    textAlign: 'center',
  },
});
