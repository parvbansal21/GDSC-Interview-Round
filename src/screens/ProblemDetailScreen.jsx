/**
 * ProblemDetailScreen - LeetCode/HackerRank style problem detail + editor
 *
 * UI-only for now. Real data + backend execution wiring will be added next.
 */

import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { useRoute } from "@react-navigation/native";
import CodeEditorPanel from "../components/CodeEditorPanel";
import Animated, { FadeInUp } from "react-native-reanimated";
import AnimatedGridBackground from "../components/AnimatedGridBackground";

const PROBLEMS = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
    ],
    sampleTestcases: [
      { input: "2 7 11 15\n9", output: "0 1" },
    ],
    hiddenTestcases: [
      { input: "3 2 4\n6", output: "1 2" },
      { input: "2 5 5 11\n10", output: "1 2" },
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10^4",
      "-10^9 ≤ nums[i] ≤ 10^9",
      "-10^9 ≤ target ≤ 10^9",
    ],
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    examples: [
      {
        input: "s = '()'",
        output: "true",
      },
      {
        input: "s = '(]'",
        output: "false",
      },
    ],
    sampleTestcases: [
      { input: "()", output: "true" },
    ],
    hiddenTestcases: [
      { input: "()[]{}", output: "true" },
      { input: "([)]", output: "false" },
    ],
    constraints: ["1 ≤ s.length ≤ 10^4"],
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description:
      "Given a string s, find the length of the longest substring without repeating characters.",
    examples: [
      {
        input: "s = 'abcabcbb'",
        output: "3",
      },
      {
        input: "s = 'bbbbb'",
        output: "1",
      },
    ],
    sampleTestcases: [
      { input: "abcabcbb", output: "3" },
    ],
    hiddenTestcases: [
      { input: "pwwkew", output: "3" },
      { input: "", output: "0" },
    ],
    constraints: ["0 ≤ s.length ≤ 5 * 10^4"],
  },
];

const ProblemDetailScreen = () => {
  const route = useRoute();
  const navigation = require('@react-navigation/native').useNavigation();
  const problemId = route?.params?.problemId || "two-sum";

  const problem = useMemo(() => {
    return PROBLEMS.find((item) => item.id === problemId) || PROBLEMS[0];
  }, [problemId]);

  const handleSubmit = () => {
    // Submission handled inside CodeEditorPanel using testcases
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedGridBackground color="#1F2937" />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('DashboardScreen');
            }
          }}
          style={{marginRight: 12, padding: 6, borderRadius: 6, backgroundColor: '#1F2937'}}
        >
          <Text style={{color: '#93C5FD', fontSize: 18}}>← Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInUp.duration(420)} style={styles.header}>
          <Text style={styles.title}>{problem.title}</Text>
          <View style={styles.difficultyBadge(problem.difficulty)}>
            <Text style={styles.difficultyText(problem.difficulty)}>
              {problem.difficulty}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(80).duration(420)} style={styles.section}>
          <Text style={styles.sectionTitle}>Problem</Text>
          <Text style={styles.description}>{problem.description}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(140).duration(420)} style={styles.section}>
          <Text style={styles.sectionTitle}>Examples</Text>
          {problem.examples.map((example, index) => (
            <View key={`${problem.id}-ex-${index}`} style={styles.exampleCard}>
              <Text style={styles.exampleLabel}>Example {index + 1}</Text>
              <Text style={styles.exampleText}>Input: {example.input}</Text>
              <Text style={styles.exampleText}>Output: {example.output}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(420)} style={styles.section}>
          <Text style={styles.sectionTitle}>Constraints</Text>
          {problem.constraints.map((constraint, index) => (
            <Text key={`${problem.id}-c-${index}`} style={styles.constraintText}>
              • {constraint}
            </Text>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(260).duration(420)} style={styles.editorSection}>
          <Text style={styles.sectionTitle}>Code</Text>
          <CodeEditorPanel
            onSubmit={handleSubmit}
            isSubmitting={false}
            sampleTestcases={problem.sampleTestcases}
            submitTestcases={problem.hiddenTestcases}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProblemDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F17",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    color: "#F9FAFB",
    fontSize: 22,
    fontWeight: "700",
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: "#93C5FD",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  description: {
    color: "#E5E7EB",
    fontSize: 14,
    lineHeight: 22,
  },
  exampleCard: {
    borderWidth: 1,
    borderColor: "#1F2937",
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  exampleLabel: {
    color: "#E0F2FE",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  exampleText: {
    color: "#D1D5DB",
    fontSize: 13,
    lineHeight: 20,
  },
  constraintText: {
    color: "#CBD5F5",
    fontSize: 13,
    marginBottom: 6,
  },
  editorSection: {
    marginTop: 28,
  },
  difficultyBadge: (level) => ({
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor:
      level === "Easy" ? "#10B981" : level === "Medium" ? "#F59E0B" : "#EF4444",
    backgroundColor:
      level === "Easy"
        ? "rgba(16, 185, 129, 0.12)"
        : level === "Medium"
        ? "rgba(245, 158, 11, 0.12)"
        : "rgba(239, 68, 68, 0.12)",
  }),
  difficultyText: (level) => ({
    color:
      level === "Easy" ? "#34D399" : level === "Medium" ? "#FBBF24" : "#F87171",
    fontSize: 12,
    fontWeight: "700",
  }),
});
