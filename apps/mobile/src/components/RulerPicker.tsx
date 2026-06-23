import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedScrollHandler, runOnJS } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';

const { width } = Dimensions.get('window');

const TICK_WIDTH = 2;
const TICK_SPACING = 8;
const INTERVAL = TICK_WIDTH + TICK_SPACING;
const CENTER_OFFSET = width / 2;

interface RulerPickerProps {
  value: number;
  onValueChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
}

export function RulerPicker({ value, onValueChange, min, max, step = 1 }: RulerPickerProps) {
  const scrollRef = useRef<Animated.ScrollView>(null);
  const [localValue, setLocalValue] = useState(value);
  
  const tickCount = Math.round((max - min) / step) + 1;
  const paddingLength = CENTER_OFFSET;
  
  // Initialize scroll position
  useEffect(() => {
    const index = Math.round((value - min) / step);
    const initialOffset = index * INTERVAL;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: initialOffset, animated: false });
    }, 100);
  }, []);

  const handleValueChange = useCallback((newVal: number) => {
    // Round to 1 decimal place to avoid floating point issues
    const rounded = Math.round(newVal * 10) / 10;
    if (rounded !== localValue) {
      setLocalValue(rounded);
      onValueChange(rounded);
    }
  }, [localValue, onValueChange]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const offsetX = event.contentOffset.x;
      const index = Math.round(offsetX / INTERVAL);
      let newVal = min + index * step;
      if (newVal < min) newVal = min;
      if (newVal > max) newVal = max;
      
      runOnJS(handleValueChange)(newVal);
    },
  });

  const renderTicks = () => {
    const ticks = [];
    for (let i = 0; i < tickCount; i++) {
      const val = min + i * step;
      // We assume integer values are major ticks if step is < 1, or every 10 if step is 1
      const isInteger = Math.abs(Math.round(val) - val) < 0.001;
      const isMajor = step < 1 ? isInteger : val % 10 === 0;
      const isMedium = step < 1 ? (Math.abs(Math.round(val * 2) / 2 - val) < 0.001 && !isMajor) : (val % 5 === 0 && !isMajor);
      
      ticks.push(
        <View key={i} style={[styles.tickContainer, { width: INTERVAL }]}>
          <View 
            style={[
              styles.tick,
              isMajor ? styles.tickMajor : isMedium ? styles.tickMedium : styles.tickMinor
            ]} 
          />
          {isMajor && (
            <View style={styles.tickLabelContainer}>
              <Typography variant="caption" style={styles.tickLabel}>
                {Math.round(val)}
              </Typography>
            </View>
          )}
        </View>
      );
    }
    return ticks;
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        snapToInterval={INTERVAL}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: paddingLength - (INTERVAL / 2) }}
      >
        {renderTicks()}
      </Animated.ScrollView>

      {/* Center Indicator */}
      <View style={styles.centerIndicator} pointerEvents="none">
        <View style={styles.indicatorPill} />
      </View>
      <View style={styles.centerGlow} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    width: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  tickContainer: {
    height: 100,
    alignItems: 'center',
  },
  tick: {
    backgroundColor: Colors.dark.textSecondary,
    borderRadius: 1,
    opacity: 0.5,
  },
  tickMajor: {
    height: 40,
    width: 2,
    backgroundColor: Colors.dark.textSecondary,
    opacity: 0.8,
  },
  tickMedium: {
    height: 30,
    width: 2,
  },
  tickMinor: {
    height: 20,
    width: 2,
  },
  tickLabelContainer: {
    position: 'absolute',
    bottom: 10,
    width: 40,
    alignItems: 'center',
  },
  tickLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
  centerIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    marginLeft: -4, // half of width
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  indicatorPill: {
    width: 8,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 4,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  centerGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 80,
    marginLeft: -20,
    marginTop: -40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    zIndex: 1,
    filter: 'blur(10px)', // web
  },
});
