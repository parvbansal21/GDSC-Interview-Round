/**
 * StatCard Component
 * 
 * A reusable card component for displaying statistics on the dashboard.
 * Designed to be clean, minimal, and visually appealing.
 * 
 * FIREBASE CONNECTION (Future):
 * - Pass real values from Firestore queries
 * - Value prop will come from: users/{uid}/stats/{statName}
 * 
 * Props:
 * - emoji: Icon/emoji to display
 * - title: Stat label
 * - value: Numeric value to display
 * - accentColor: Color for the accent/highlight
 * - theme: Current theme object
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatCard = ({ emoji, title, value, accentColor, theme }) => {
  const colors = theme.colors;

  return (
    <View style={[styles.card, { 
      backgroundColor: colors.cardBackground,
      shadowColor: colors.shadow,
      borderColor: colors.border,
    }]}>
      {/* Accent bar on left side */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      
      {/* Card content */}
      <View style={styles.content}>
        {/* Emoji icon */}
        <Text style={styles.emoji}>{emoji}</Text>
        
        {/* Value - large and prominent */}
        <Text style={[styles.value, { color: colors.textPrimary }]}>
          {value}
        </Text>
        
        {/* Title - subtle below the value */}
        <Text style={[styles.title, { color: colors.textSecondary }]}>
          {title}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '47%',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    // Elevation for Android
    elevation: 4,
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
