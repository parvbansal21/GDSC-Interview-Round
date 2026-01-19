/**
 * ProblemsListScreen - LeetCode/HackerRank style problem browser
 *
 * NOTE: UI-only for now. Real data + filtering will be wired later.
 */

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import AnimatedGridBackground from "../components/AnimatedGridBackground";
import AnimatedPressable from "../components/AnimatedPressable";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];
const TOPICS = [
  "Arrays",
  "Strings",
  "Math",
  "Hash Map",
  "DP",
  "Graphs",
  "Stacks",
  "Queues",
];

const PROBLEMS = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    topics: ["Arrays", "Hash Map"],
    status: "Solved",
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    topics: ["Stacks", "Strings"],
    status: "Attempted",
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topics: ["Strings", "Hash Map"],
    status: "Not Attempted",
  },
  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    topics: ["DP", "Math"],
    status: "Solved",
  },
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    topics: ["Arrays"],
    status: "Attempted",
  },
  {
    id: "word-ladder",
    title: "Word Ladder",
    difficulty: "Hard",
    topics: ["Graphs", "Strings"],
    status: "Not Attempted",
  },
  {
    id: "trapping-rain-water",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    topics: ["Arrays", "Stacks"],
    status: "Not Attempted",
  },
];

const getStatusBadge = (status) => {
  switch (status) {
    case "Solved":
      return { label: "Solved", icon: "✓", color: "#22C55E" };
    case "Attempted":
      return { label: "Attempted", icon: "◐", color: "#F59E0B" };
    default:
      return { label: "Not Attempted", icon: "○", color: "#9CA3AF" };
  }
};

const ProblemsListScreen = () => {
  const navigation = useNavigation();
  const [difficulty, setDifficulty] = useState("All");
  const [selectedTopics, setSelectedTopics] = useState([]);

  const filteredProblems = useMemo(() => {
    return PROBLEMS.filter((problem) => {
      const matchesDifficulty =
        difficulty === "All" || problem.difficulty === difficulty;
      const matchesTopics =
        selectedTopics.length === 0 ||
        selectedTopics.some((topic) => problem.topics.includes(topic));
      return matchesDifficulty && matchesTopics;
    });
  }, [difficulty, selectedTopics]);

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((item) => item !== topic)
        : [...prev, topic]
    );
  };

  const renderProblem = ({ item }) => {
    const status = getStatusBadge(item.status);

    return (
      <Animated.View
        entering={FadeInDown.delay(60).duration(420)}
        layout={Layout.springify()}
      >
        <AnimatedPressable
          style={styles.problemCard}
          onPress={() => navigation.navigate("ProblemDetail", { problemId: item.id })}
        >
          <View style={styles.problemRowTop}>
            <Text style={styles.problemTitle}>{item.title}</Text>
            <View style={[styles.statusBadge, { borderColor: status.color }]}>
              <Text style={[styles.statusIcon, { color: status.color }]}>
                {status.icon}
              </Text>
              <Text style={[styles.statusText, { color: status.color }]}> 
                {status.label}
              </Text>
            </View>
          </View>

          <View style={styles.problemMetaRow}>
            <View style={styles.difficultyBadge(item.difficulty)}>
              <Text style={styles.difficultyText(item.difficulty)}>
                {item.difficulty}
              </Text>
            </View>
            <View style={styles.tagsRow}>
              {item.topics.map((topic) => (
                <View key={`${item.id}-${topic}`} style={styles.tagChip}>
                  <Text style={styles.tagText}>{topic}</Text>
                </View>
              ))}
            </View>
          </View>
        </AnimatedPressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedGridBackground color="#1F2937" />
      <View style={styles.header}> 
        <Text style={styles.heading}>Problem Solving</Text>
        <Text style={styles.subheading}>Practice like a pro — build your streak</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Difficulty</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {DIFFICULTIES.map((level) => (
            <AnimatedPressable
              key={level}
              style={[
                styles.filterChip,
                difficulty === level && styles.filterChipActive,
              ]}
              onPress={() => setDifficulty(level)}
            >
              <Text
                style={[
                  styles.filterText,
                  difficulty === level && styles.filterTextActive,
                ]}
              >
                {level}
              </Text>
            </AnimatedPressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Topics</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {TOPICS.map((topic) => {
            const isActive = selectedTopics.includes(topic);
            return (
              <AnimatedPressable
                key={topic}
                style={[
                  styles.filterChip,
                  isActive && styles.filterChipActive,
                ]}
                onPress={() => toggleTopic(topic)}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}
                >
                  {topic}
                </Text>
              </AnimatedPressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProblems}
        keyExtractor={(item) => item.id}
        renderItem={renderProblem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default ProblemsListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F17",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  heading: {
    color: "#F9FAFB",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  subheading: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 6,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    color: "#9CA3AF",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  filterRow: {
    gap: 10,
    paddingRight: 10,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: "#1F2937",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#0F172A",
  },
  filterChipActive: {
    borderColor: "#38BDF8",
    backgroundColor: "rgba(56, 189, 248, 0.12)",
  },
  filterText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#E0F2FE",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 32,
    gap: 14,
  },
  problemCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1F2937",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  problemRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  problemTitle: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    paddingRight: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusIcon: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  problemMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    flexWrap: "wrap",
    gap: 10,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
  },
  tagChip: {
    borderWidth: 1,
    borderColor: "#1F2937",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
  },
  tagText: {
    color: "#93C5FD",
    fontSize: 11,
    fontWeight: "500",
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
