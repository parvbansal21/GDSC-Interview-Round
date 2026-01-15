import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { DailyQuestion } from '../types/models';

interface ProblemDescriptionProps {
  question: DailyQuestion;
}

const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ question }) => {
  // Parse description to extract sections
  const sections = useMemo(() => {
    const text = question.description || '';
    const parts: Array<{ type: 'text' | 'code'; content: string }> = [];
    
    const split = text.split('```');
    split.forEach((chunk, index) => {
      if (chunk.trim()) {
        parts.push({
          type: index % 2 === 0 ? 'text' : 'code',
          content: chunk.trim(),
        });
      }
    });
    
    return parts;
  }, [question.description]);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
    >
      {/* Problem Title */}
      <Text style={styles.problemTitle}>{question.title}</Text>
      
      {/* Description Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        {sections.map((section, index) => (
          section.type === 'text' ? (
            <Text key={index} style={styles.description}>{section.content}</Text>
          ) : (
            <View key={index} style={styles.codeBlock}>
              <Text style={styles.codeText}>{section.content}</Text>
            </View>
          )
        ))}
      </View>

      {/* Constraints Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Constraints</Text>
        <View style={styles.constraintsList}>
          <Text style={styles.constraint}>• 1 ≤ array length ≤ 10⁴</Text>
          <Text style={styles.constraint}>• -10⁹ ≤ array elements ≤ 10⁹</Text>
          <Text style={styles.constraint}>• Time limit: 1 second</Text>
          <Text style={styles.constraint}>• Memory limit: 256 MB</Text>
        </View>
      </View>

      {/* Hints Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hints</Text>
        <View style={styles.hintCard}>
          <Text style={styles.hintNumber}>Hint 1</Text>
          <Text style={styles.hintText}>
            Think about what data structure allows O(1) lookups.
          </Text>
        </View>
      </View>

      {/* Tags */}
      <View style={styles.tagsSection}>
        <Text style={styles.tagsTitle}>Related Topics</Text>
        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{question.topic}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Hash Table</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  problemTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  description: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  codeBlock: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginVertical: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  codeText: {
    ...typography.code,
    color: colors.textPrimary,
  },
  constraintsList: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  constraint: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  hintCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  hintNumber: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  hintText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  tagsSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  tagsTitle: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  tagText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default ProblemDescription;
