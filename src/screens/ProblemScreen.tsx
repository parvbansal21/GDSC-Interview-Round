import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import {
  getDateKey,
  getTodayQuestion,
  lockQuestionAfterView,
  submitAnswer,
  updateUserStreak,
} from '../services/dailyQuestionService';
import { Language, languageNames } from '../services/compilerService';
import { AppStackParamList } from '../navigation/AppStack';
import { colors, spacing } from '../constants/theme';
import { DailyQuestion, DailyAttempt } from '../types/models';

import ProblemHeader from '../components/ProblemHeader';
import ProblemDescription from '../components/ProblemDescription';
import CodeEditorPanel from '../components/CodeEditorPanel';
import EmptyState from '../components/EmptyState';
import { seedTodayQuestion } from '../utils/seed';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

const ProblemScreen: React.FC<Props> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isWideScreen = width >= 768;

  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<DailyQuestion | null>(null);
  const [attempt, setAttempt] = useState<DailyAttempt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayKey = useMemo(() => getDateKey(), []);

  const fetchDailyQuestion = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const dailyQuestion = await getTodayQuestion(todayKey);
      if (!dailyQuestion) {
        setQuestion(null);
        setAttempt(null);
        return;
      }
      setQuestion(dailyQuestion);

      const attemptDoc = await lockQuestionAfterView(todayKey);
      setAttempt(attemptDoc);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Unable to load question.');
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
      Alert.alert('Seed failed', error?.message || 'Unable to seed question.');
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
      Alert.alert('Logout failed', error?.message || 'Unable to logout.');
    }
  };

  const handleSubmit = async (code: string, language: Language) => {
    const user = auth.currentUser;
    if (!user || !question) return;

    setIsSubmitting(true);
    try {
      // Prevent duplicate submissions
      const attemptRef = doc(db, 'users', user.uid, 'dailyAttempts', todayKey);
      const attemptSnap = await getDoc(attemptRef);
      if (attemptSnap.exists() && attemptSnap.data()?.submitted) {
        Alert.alert('Already submitted', "You've already submitted today.");
        navigation.navigate('Solution', { todayKey, questionId: question.id });
        return;
      }

      const submission = `Language: ${languageNames[language]}\n\n${code}`;
      await submitAnswer(todayKey, question.id, submission);
      await updateUserStreak(todayKey);

      // Update local state
      setAttempt((prev) => ({ ...prev, submitted: true }));

      Alert.alert(
        '🎉 Submitted!',
        'Your solution has been saved. View the solution now?',
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'View Solution',
            onPress: () => navigation.navigate('Solution', { todayKey, questionId: question.id }),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Submission failed', error?.message || 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!question) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          title="No question today"
          description="Check back later or seed a question for testing."
          actionLabel="Seed Question"
          onAction={handleSeed}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <ProblemHeader
        title={question.title}
        difficulty={question.difficulty}
        topic={question.topic}
        onAnalytics={() => navigation.navigate('Analytics')}
        onLogout={handleLogout}
      />

      {/* Main Content - Split Screen */}
      <View style={[styles.mainContent, !isWideScreen && styles.mainContentStacked]}>
        {/* Left Panel - Problem Description */}
        <View style={[
          styles.leftPanel,
          !isWideScreen && styles.leftPanelStacked,
        ]}>
          <ProblemDescription question={question} />
        </View>

        {/* Resizer (visual only for now) */}
        {isWideScreen && <View style={styles.resizer} />}

        {/* Right Panel - Code Editor */}
        <View style={[
          styles.rightPanel,
          !isWideScreen && styles.rightPanelStacked,
        ]}>
          <CodeEditorPanel
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            hasSubmitted={attempt?.submitted}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgPrimary,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContentStacked: {
    flexDirection: 'column',
  },
  leftPanel: {
    flex: 1,
    minWidth: 300,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  leftPanelStacked: {
    flex: 0.4,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resizer: {
    width: 4,
    backgroundColor: colors.border,
  },
  rightPanel: {
    flex: 1,
    minWidth: 400,
  },
  rightPanelStacked: {
    flex: 0.6,
  },
});

export default ProblemScreen;
