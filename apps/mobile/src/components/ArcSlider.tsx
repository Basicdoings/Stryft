import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS, 
  useAnimatedProps
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';
import { Ionicons } from '@expo/vector-icons';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const { width } = Dimensions.get('window');
const HEIGHT = 400;

// The center of the circle is off-screen to the right.
// This places the arc on the left side of the screen.
const CENTER_X = width + 60;
const CENTER_Y = HEIGHT / 2;
const RADIUS = width * 1.1;

const LEVELS = 5;

// We use normalized angles (0 to 2PI) to avoid the atan2 discontinuity at 180 degrees (-PI to PI).
const START_ANGLE = (205 * Math.PI) / 180; // Bottom left (Level 1)
const END_ANGLE = (155 * Math.PI) / 180;   // Top left (Level 5)
const ANGLE_STEP = (END_ANGLE - START_ANGLE) / (LEVELS - 1); // Negative step

const LEVEL_LABELS = {
  1: 'Beginner',
  2: 'Lightly Active',
  3: 'Somewhat Athletic',
  4: 'Athletic',
  5: 'Very Athletic'
};

const polarToCartesian = (cx: number, cy: number, radius: number, angle: number) => {
  'worklet';
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
};

const clamp = (val: number, min: number, max: number) => {
  'worklet';
  return Math.min(Math.max(val, min), max);
};

interface ArcSliderProps {
  value: number;
  onValueChange: (val: number) => void;
}

export function ArcSlider({ value, onValueChange }: ArcSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const activeLevel = useSharedValue(value);
  const currentAngle = useSharedValue(START_ANGLE + (value - 1) * ANGLE_STEP);
  const isDragging = useSharedValue(false);

  useEffect(() => {
    activeLevel.value = value;
    currentAngle.value = START_ANGLE + (value - 1) * ANGLE_STEP;
    setLocalValue(value);
  }, [value]);

  const handleLevelChange = (lvl: number) => {
    if (lvl !== localValue) {
      setLocalValue(lvl);
      onValueChange(lvl);
    }
  };

  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      isDragging.value = true;
      // Also update position on initial tap
      let angle = Math.atan2(event.y - CENTER_Y, event.x - CENTER_X);
      if (angle < 0) angle += 2 * Math.PI;
      if (angle > START_ANGLE) angle = START_ANGLE;
      if (angle < END_ANGLE) angle = END_ANGLE;
      currentAngle.value = angle;
    })
    .onChange((event) => {
      // Calculate angle from center to current touch
      let angle = Math.atan2(event.y - CENTER_Y, event.x - CENTER_X);
      
      // Normalize negative angles (e.g. -150 degrees becomes 210 degrees)
      if (angle < 0) {
        angle += 2 * Math.PI;
      }
      
      // Clamp angle between START_ANGLE (205 deg) and END_ANGLE (155 deg)
      if (angle > START_ANGLE) angle = START_ANGLE;
      if (angle < END_ANGLE) angle = END_ANGLE;
      
      currentAngle.value = angle;

      // Calculate level based on angle
      // Ratio: 0 at START_ANGLE, 1 at END_ANGLE
      const ratio = (angle - START_ANGLE) / (END_ANGLE - START_ANGLE);
      const rawLevel = 1 + ratio * (LEVELS - 1);
      const roundedLevel = Math.round(clamp(rawLevel, 1, LEVELS));
      
      if (activeLevel.value !== roundedLevel) {
        activeLevel.value = roundedLevel;
        runOnJS(handleLevelChange)(roundedLevel);
      }
    })
    .onFinalize(() => {
      isDragging.value = false;
      // Snap to nearest level angle
      const snappedAngle = START_ANGLE + (activeLevel.value - 1) * ANGLE_STEP;
      currentAngle.value = withSpring(snappedAngle, {
        mass: 0.5,
        stiffness: 150,
        damping: 15
      });
    });

  const knobStyle = useAnimatedStyle(() => {
    const pt = polarToCartesian(CENTER_X, CENTER_Y, RADIUS, currentAngle.value);
    const scale = isDragging.value ? withSpring(1.1) : withSpring(1);
    
    // Rotate the thumb so its inner arrows point along the arc
    // Angle + 90 degrees to align tangent
    const rotation = currentAngle.value + Math.PI / 2;

    return {
      transform: [
        { translateX: pt.x - 30 },
        { translateY: pt.y - 30 },
        { scale },
        { rotate: `${rotation}rad` }
      ],
    };
  });

  const activePathProps = useAnimatedProps(() => {
    const start = polarToCartesian(CENTER_X, CENTER_Y, RADIUS, START_ANGLE);
    const current = polarToCartesian(CENTER_X, CENTER_Y, RADIUS, currentAngle.value);
    
    // Draw arc from START to CURRENT
    // sweep-flag = 0 because we are drawing from a larger angle to a smaller angle (counter-clockwise)
    const d = `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 0 0 ${current.x} ${current.y}`;
    return { d };
  });

  // Static background path
  const bgStart = polarToCartesian(CENTER_X, CENTER_Y, RADIUS, START_ANGLE);
  const bgEnd = polarToCartesian(CENTER_X, CENTER_Y, RADIUS, END_ANGLE);
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${RADIUS} ${RADIUS} 0 0 0 ${bgEnd.x} ${bgEnd.y}`;

  // Generate ticks
  const generateTicks = () => {
    const ticks = [];
    for (let i = 1; i <= LEVELS; i++) {
      const angle = START_ANGLE + (i - 1) * ANGLE_STEP;
      const ptInner = polarToCartesian(CENTER_X, CENTER_Y, RADIUS - 14, angle);
      const ptOuter = polarToCartesian(CENTER_X, CENTER_Y, RADIUS + 14, angle);
      ticks.push({ x1: ptInner.x, y1: ptInner.y, x2: ptOuter.x, y2: ptOuter.y });
    }
    return ticks;
  };

  const ticks = generateTicks();

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        {/* We wrap the entire height in the detector so users can drag anywhere on the left side */}
        <Animated.View style={StyleSheet.absoluteFill}>
          
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width="100%" height={HEIGHT}>
              {/* Background Track */}
              <Path 
                d={bgPath} 
                stroke={Colors.dark.textSecondary} 
                strokeWidth="6" 
                fill="none" 
                opacity={0.3}
              />
              
              {/* Active Orange Track */}
              <AnimatedPath 
                animatedProps={activePathProps}
                stroke={Colors.dark.primary} 
                strokeWidth="6" 
                fill="none" 
              />
              
              {/* Ticks */}
              {ticks.map((tick, i) => (
                <Line 
                  key={i} 
                  x1={tick.x1} 
                  y1={tick.y1} 
                  x2={tick.x2} 
                  y2={tick.y2} 
                  stroke={Colors.dark.textSecondary} 
                  strokeWidth="2" 
                  opacity={0.5}
                />
              ))}
            </Svg>
          </View>

          <View style={styles.infoContainer} pointerEvents="none">
            <Typography style={styles.numberText}>{localValue}</Typography>
            <Typography variant="h3" color={Colors.dark.textSecondary}>
              {LEVEL_LABELS[localValue as keyof typeof LEVEL_LABELS]}
            </Typography>
          </View>

          <Animated.View style={[styles.knob, knobStyle]} pointerEvents="none">
            <Ionicons name="swap-vertical" size={24} color="#FFF" style={{ transform: [{ rotate: '90deg' }] }} />
          </Animated.View>
          
          <View style={styles.helperContainer} pointerEvents="none">
            <Ionicons name="help-circle" size={16} color={Colors.dark.textSecondary} />
            <Typography variant="caption" style={styles.helperText}>Drag to adjust</Typography>
          </View>

        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HEIGHT,
    width: '100%',
    position: 'relative',
    marginTop: 20,
  },
  knob: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10,
  },
  infoContainer: {
    position: 'absolute',
    right: 0,
    top: '30%',
    alignItems: 'flex-end',
  },
  numberText: {
    fontSize: 140,
    fontFamily: 'WorkSans-Black',
    lineHeight: 140,
    color: '#FFF',
  },
  helperContainer: {
    position: 'absolute',
    left: 10,
    top: -20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  helperText: {
    color: Colors.dark.textSecondary,
    marginLeft: 6,
  },
});
