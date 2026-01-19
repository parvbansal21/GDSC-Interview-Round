import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

const StatCard = ({ emoji, title, value, accentColor, theme, index = 0 }) => {
  const colors = theme.colors;
  const enter = useSharedValue(0);
  const glow = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    enter.value = withDelay(
      index * 90,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    glow.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );

    if (emoji === '🔥' || emoji === '⭐') {
      pulse.value = withRepeat(
        withTiming(1.08, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    }
  }, [enter, glow, pulse, index, emoji]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { translateY: (1 - enter.value) * 12 },
      { scale: 0.98 + enter.value * 0.02 },
    ],
    shadowOpacity: 0.12 + glow.value * 0.18,
    shadowRadius: 10 + glow.value * 8,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.08 + glow.value * 0.22,
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.card,
        cardStyle,
        {
          backgroundColor: colors.cardBackground,
          shadowColor: accentColor,
          borderColor: colors.border,
        },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.glowRing, { borderColor: accentColor }, glowStyle]}
      />

      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      <View style={styles.content}>
        <Animated.Text style={[styles.emoji, emojiStyle]}>{emoji}</Animated.Text>

        <Text style={[styles.value, { color: colors.textPrimary }]}> 
          {value}
        </Text>

        <Text style={[styles.title, { color: colors.textSecondary }]}> 
          {title}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '47%',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  glowRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 16,
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  value: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

export default StatCard;
