import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, getDifficultyColor } from '../constants/theme';

interface ProblemHeaderProps {
  title: string;
  difficulty: string;
  topic: string;
  onBack?: () => void;
  onAnalytics?: () => void;
  onLogout?: () => void;
}

const ProblemHeader: React.FC<ProblemHeaderProps> = ({
  title,
  difficulty,
  topic,
  onBack,
  onAnalytics,
  onLogout,
}) => {
  const difficultyStyle = getDifficultyColor(difficulty);

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: difficultyStyle.bg }]}>
              <Text style={[styles.badgeText, { color: difficultyStyle.color }]}>
                {difficulty}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{topic}</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        {onAnalytics && (
          <TouchableOpacity onPress={onAnalytics} style={styles.navButton}>
            <Text style={styles.navButtonText}>📊 Analytics</Text>
          </TouchableOpacity>
        )}
        {onLogout && (
          <TouchableOpacity onPress={onLogout} style={styles.navButton}>
            <Text style={styles.navButtonText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 56,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.bgSecondary,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  navButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  navButtonText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});

export default ProblemHeader;
