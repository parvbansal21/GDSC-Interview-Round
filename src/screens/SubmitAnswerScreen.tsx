import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { submitAnswer, updateUserStreak } from "../services/dailyQuestionService";
import { AppStackParamList } from "../navigation/AppStack";
import {
  executeCode,
  getStarterCode,
  Language,
  languageNames,
} from "../services/compilerService";

// Submit answer screen with code compiler
type Props = NativeStackScreenProps<AppStackParamList, "SubmitAnswer">;

const languages: Language[] = ["python", "javascript", "cpp", "java", "c"];

const SubmitAnswerScreen = ({ route, navigation }: Props) => {
  const { todayKey, questionId } = route.params;
  const [code, setCode] = useState(getStarterCode("python"));
  const [language, setLanguage] = useState<Language>("python");
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setCode(getStarterCode(newLang));
    setOutput("");
  };

  const handleRun = async () => {
    if (!code.trim()) {
      Alert.alert("Empty code", "Please write some code first.");
      return;
    }

    setIsRunning(true);
    setOutput("Running...");

    try {
      const result = await executeCode(code, language, stdin);
      
      if (result.success) {
        setOutput(`✅ Output (${result.executionTime}):\n\n${result.output || "(no output)"}`);
      } else {
        setOutput(`❌ Error:\n\n${result.error || "Unknown error"}\n\n${result.output || ""}`);
      }
    } catch (error: any) {
      setOutput(`❌ Error: ${error?.message || "Failed to run code"}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!code.trim()) {
      Alert.alert("Empty code", "Please write your code first.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Prevent duplicate submissions for the same day
      const attemptRef = doc(db, "users", user.uid, "dailyAttempts", todayKey);
      const attemptSnap = await getDoc(attemptRef);
      if (attemptSnap.exists() && attemptSnap.data()?.submitted) {
        Alert.alert("Already submitted", "You've already submitted today.");
        navigation.navigate("Solution", { todayKey, questionId });
        return;
      }

      // Submit with language info
      const submission = `Language: ${languageNames[language]}\n\n${code}`;
      await submitAnswer(todayKey, questionId, submission);
      await updateUserStreak(todayKey);

      Alert.alert("Submitted", "Your code has been saved.");
      navigation.navigate("Solution", { todayKey, questionId });
    } catch (error: any) {
      Alert.alert("Submission failed", error?.message || "Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Code Editor</Text>
      <Text style={styles.subtitle}>Write and run your code, then submit</Text>

      {/* Language Selector */}
      <View style={styles.languageRow}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[
              styles.langButton,
              language === lang && styles.langButtonActive,
            ]}
            onPress={() => handleLanguageChange(lang)}
          >
            <Text
              style={[
                styles.langButtonText,
                language === lang && styles.langButtonTextActive,
              ]}
            >
              {languageNames[lang]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Code Editor */}
      <View style={styles.editorContainer}>
        <Text style={styles.editorLabel}>Code:</Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Write your code here..."
          style={styles.codeEditor}
          multiline
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
        />
      </View>

      {/* Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.editorLabel}>Input (stdin):</Text>
        <TextInput
          value={stdin}
          onChangeText={setStdin}
          placeholder="Enter input values (optional)"
          style={styles.stdinInput}
          multiline
          textAlignVertical="top"
        />
      </View>

      {/* Run Button */}
      <TouchableOpacity
        style={[styles.runButton, isRunning && styles.buttonDisabled]}
        onPress={handleRun}
        disabled={isRunning}
      >
        {isRunning ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>▶ Run Code</Text>
        )}
      </TouchableOpacity>

      {/* Output */}
      {output ? (
        <View style={styles.outputContainer}>
          <Text style={styles.editorLabel}>Output:</Text>
          <View style={styles.outputBox}>
            <Text style={styles.outputText}>{output}</Text>
          </View>
        </View>
      ) : null}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Submit Answer</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SubmitAnswerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#666",
    marginBottom: 16,
  },
  languageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  langButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },
  langButtonActive: {
    backgroundColor: "#111",
  },
  langButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
  langButtonTextActive: {
    color: "#fff",
  },
  editorContainer: {
    marginBottom: 12,
  },
  editorLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  codeEditor: {
    fontFamily: "Menlo, Monaco, monospace",
    fontSize: 14,
    backgroundColor: "#1e1e1e",
    color: "#d4d4d4",
    borderRadius: 10,
    padding: 12,
    height: 220,
    borderWidth: 1,
    borderColor: "#333",
  },
  inputContainer: {
    marginBottom: 12,
  },
  stdinInput: {
    fontFamily: "Menlo, Monaco, monospace",
    fontSize: 14,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 10,
    height: 60,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  runButton: {
    backgroundColor: "#0066cc",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  outputContainer: {
    marginBottom: 12,
  },
  outputBox: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
  },
  outputText: {
    fontFamily: "Menlo, Monaco, monospace",
    fontSize: 13,
    color: "#d4d4d4",
  },
});
