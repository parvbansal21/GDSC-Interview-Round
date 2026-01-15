import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import {
  getDateKey,
  getTodayQuestion,
  lockQuestionAfterView,
} from "../services/dailyQuestionService";
import { AppStackParamList } from "../navigation/AppStack";
import EmptyState from "../components/EmptyState";
import { seedTodayQuestion } from "../utils/seed";

type TextPart = { type: "text" | "code"; value: string };

// Simple text formatter: supports triple backtick code blocks
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

type Props = NativeStackScreenProps<AppStackParamList, "Home">;

const HomeScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);

  const todayKey = useMemo(() => getDateKey(), []);

  const fetchDailyQuestion = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      // 1) Fetch daily question by date-based document
      const dailyQuestion = await getTodayQuestion(todayKey);
      if (!dailyQuestion) {
        setQuestion(null);
        setAttempt(null);
        return;
      }
      setQuestion(dailyQuestion);

      // 2) Lock question after first view by creating attempt doc
      const attemptDoc = await lockQuestionAfterView(todayKey);
      setAttempt(attemptDoc);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Unable to load question.");
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    try {
      await seedTodayQuestion();
      await fetchDailyQuestion();
    } catch (error: any) {
      Alert.alert("Seed failed", error?.message || "Unable to seed question.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyQuestion();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      Alert.alert("Logout failed", error?.message || "Unable to logout.");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!question) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="No question today"
          description="Check back later or seed a question for testing."
          actionLabel="Seed Question"
          onAction={handleSeed}
        />
        <TouchableOpacity style={styles.linkButton} onPress={handleLogout}>
          <Text style={styles.linkText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canViewSolution = Boolean(attempt?.submitted);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Daily Question</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate("Analytics")}>
            <Text style={styles.linkText}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.linkText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.questionTitle}>{question.title}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaTag}>{question.difficulty}</Text>
        <Text style={styles.metaTag}>{question.topic}</Text>
      </View>

      <FormattedText text={question.description || ""} />

      {attempt?.submitted ? (
        <Text style={styles.submittedNote}>Submitted for today ✅</Text>
      ) : null}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("SubmitAnswer", { todayKey, questionId: question.id })}
      >
        <Text style={styles.buttonText}>Submit Answer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !canViewSolution && styles.buttonDisabled]}
        onPress={() =>
          canViewSolution
            ? navigation.navigate("Solution", { todayKey, questionId: question.id })
            : Alert.alert("Locked", "Submit your answer to unlock the solution.")
        }
      >
        <Text style={styles.buttonText}>View Solution</Text>
      </TouchableOpacity>

      {__DEV__ ? (
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSeed}>
          <Text style={styles.secondaryButtonText}>Seed Today’s Question (Dev)</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 24,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 8,
    color: "#666",
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  metaTag: {
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    fontSize: 12,
  },
  description: {
    fontSize: 15,
    color: "#333",
    marginBottom: 12,
  },
  submittedNote: {
    color: "#1a7f37",
    fontWeight: "600",
    marginBottom: 8,
  },
  codeBlock: {
    fontFamily: "Menlo",
    backgroundColor: "#111",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 13,
  },
  button: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  secondaryButtonText: {
    color: "#111",
    fontSize: 14,
    fontWeight: "600",
  },
  linkButton: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    color: "#111",
    fontSize: 14,
  },
});
