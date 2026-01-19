import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";

const GRID_SIZE = 44;

const AnimatedGridBackground = ({ color = "#1F2937" }) => {
  const { width, height } = useWindowDimensions();
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: 16000, easing: Easing.linear }),
      -1,
      false
    );
  }, [drift]);

  const gridStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: drift.value * GRID_SIZE },
      { translateX: drift.value * 8 },
    ],
    opacity: 0.35,
  }));

  const scanStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: drift.value * (height + 120) - 120 }],
    opacity: 0.12,
  }));

  const verticalLines = useMemo(() => {
    const count = Math.ceil(width / GRID_SIZE) + 1;
    return Array.from({ length: count }, (_, i) => i);
  }, [width]);

  const horizontalLines = useMemo(() => {
    const count = Math.ceil(height / GRID_SIZE) + 2;
    return Array.from({ length: count }, (_, i) => i);
  }, [height]);

  return (
    <View pointerEvents="none" style={styles.container}>
      <Animated.View style={[styles.gridLayer, gridStyle]}>
        {verticalLines.map((i) => (
          <View
            key={`v-${i}`}
            style={[
              styles.verticalLine,
              { left: i * GRID_SIZE, backgroundColor: color },
            ]}
          />
        ))}
        {horizontalLines.map((i) => (
          <View
            key={`h-${i}`}
            style={[
              styles.horizontalLine,
              { top: i * GRID_SIZE, backgroundColor: color },
            ]}
          />
        ))}
      </Animated.View>
      <Animated.View style={[styles.scanLine, scanStyle, { backgroundColor: color }]} />
    </View>
  );
};

export default AnimatedGridBackground;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  gridLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  verticalLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
  },
  horizontalLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1.5,
  },
});
