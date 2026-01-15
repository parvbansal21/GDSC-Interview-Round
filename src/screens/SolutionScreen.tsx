import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import {
  getTodayQuestion,
  getTodaySolution,
} from "../services/dailyQuestionService";
import { AppStackParamList } from "../navigation/AppStack";
import EmptyState from "../components/EmptyState";
import { colors, spacing, borderRadius, typography } from "../constants/theme";

type TextPart = { type: "text" | "code"; value: string };

const FormattedText = ({ text }: { text: string }) => {
  const parts = useMemo<TextPart[]>(() => {
    const split = text.split("```");
    return split.map((chunk, index) => ({
      type: index % 2 === 0 ? "text" : "code",
      value: chunk,
    }));
  }, [text]);

  return (
    <View>
      {parts.map((part, index) => (
        <Text
          key={`${part.type}-${index}`}
          style={part.type === "code" ? styles.codeBlock : styles.description}
        >
          {part.value.trim()}
        </Text>
      ))}
    </View>
  );
};

type Props = NativeStackScreenProps<AppStackParamList, "Solution">;

const SolutionScreen = ({ route }: Props) => {
  const { todayKey } = route.params;
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<any>(null);
  const [solution, setSolution] = useState<string | null>(null);

  const fetchSolution = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const attemptRef = doc(db, "users", user.uid, "dailyAttempts", todayKey);
      const attemptSnap = await getDoc(attemptRef);

      if (!attemptSnap.exists() || !attemptSnap.data()?.submitted) {
        Alert.alert("Locked", "Submit your answer to view the solution.");
        return;
      }

      const [dailyQuestion, dailySolution] = await Promise.all([
        getTodayQuestion(todayKey),
        getTodaySolution(todayKey),
      ]);

      if (!dailyQuestion) {
        setQuestion(null);
        setSolution(null);
        return;
      }

      setQuestion(dailyQuestion);
      setSolution(dailySolution?.solution ?? null);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Unable to load solution.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolution();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!question) {
    return (
      <View style={styles.container}>
        <EmptyState title="No solution available" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Success Banner */}
      <View style={styles.successBanner}>
        <Text style={styles.successIcon}>✅</Text>
        <View style={styles.successContent}>
          <Text style={styles.successTitle}>Solution Unlocked!</Text>
          <Text style={styles.successText}>You've completed today's challenge</Text>
        </View>
      </View>

      {/* Problem Title */}
      <Text style={styles.title}>{question.title}</Text>
      
      {/* Meta Tags */}
      <View style={styles.metaRow}>
        <View style={[styles.tag, styles.difficultyTag]}>
          <Text style={styles.tagText}>{question.difficulty}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{question.topic}</Text>
        </View>
      </View>

      {/* Solution Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Editorial Solution</Text>
        <View style={styles.solutionCard}>
          <FormattedText text={solution || "No solution provided."} />
        </View>
      </View>

      {/* Complexity Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏱️ Complexity Analysis</Text>
        <View style={styles.complexityCard}>
          <View style={styles.complexityRow}>
            <Text style={styles.complexityLabel}>Time Complexity:</Text>
            <Text style={styles.complexityValue}>O(n)</Text>
          </View>
          <View style={styles.complexityRow}>
            <Text style={styles.complexityLabel}>Space Complexity:</Text>
            <Text style={styles.complexityValue}>O(n)</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default SolutionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgPrimary,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.successBg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  successIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    ...typography.h3,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  successText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.bgSecondary,
  },
  difficultyTag: {
    backgroundColor: colors.easyBg,
  },
  tagText: {
    ...typography.caption,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  solutionCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  description: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  codeBlock: {
    ...typography.code,
    backgroundColor: colors.editorBg,
    color: colors.editorText,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
    overflow: "hidden",
  },
  complexityCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  complexityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  complexityLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  complexityValue: {
    ...typography.code,
    color: colors.primary,
    fontWeight: "600",
  },
});
