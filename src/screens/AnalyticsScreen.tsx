import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { formatDateKey } from "../utils/date";
import EmptyState from "../components/EmptyState";
import { DailyAttempt, UserProfile } from "../types/models";
import { getLastNDaysKeys } from "../utils/streak";
import { colors, spacing, borderRadius, typography, shadows } from "../constants/theme";

import { AppStackParamList } from "../navigation/AppStack";

type Props = NativeStackScreenProps<AppStackParamList, "Analytics">;

const AnalyticsScreen = (_props: Props) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [attempts, setAttempts] = useState<Array<DailyAttempt & { id: string }>>(
    []
  );

  const fetchAnalytics = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      setProfile(userSnap.exists() ? (userSnap.data() as UserProfile) : null);

      const attemptsRef = collection(db, "users", user.uid, "dailyAttempts");
      const q = query(attemptsRef, orderBy("viewedAt", "desc"));
      const attemptsSnap = await getDocs(q);

      const list: Array<DailyAttempt & { id: string }> = attemptsSnap.docs.map(
        (d) => ({ id: d.id, ...(d.data() as DailyAttempt) })
      );
      setAttempts(list);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={[styles.statValue, styles.statValuePrimary]}>
            {profile?.currentStreak ?? 0}
          </Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🏆</Text>
          <Text style={styles.statValue}>{profile?.longestStreak ?? 0}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>✅</Text>
          <Text style={styles.statValue}>{profile?.totalAttempts ?? 0}</Text>
          <Text style={styles.statLabel}>Total Solved</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📅</Text>
          <Text style={styles.statValue}>{profile?.missedDays ?? 0}</Text>
          <Text style={styles.statLabel}>Missed Days</Text>
        </View>
      </View>

      {/* Weekly Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.weekGrid}>
          {getLastNDaysKeys(7).map((dateKey) => {
            const attempt = attempts.find((a) => a.id === dateKey);
            const status = attempt?.submitted
              ? "submitted"
              : attempt
              ? "viewed"
              : "missed";
            const dayName = new Date(dateKey).toLocaleDateString('en-US', { weekday: 'short' });
            
            return (
              <View key={dateKey} style={styles.dayColumn}>
                <View
                  style={[
                    styles.dayDot,
                    status === "submitted" && styles.dotSubmitted,
                    status === "viewed" && styles.dotViewed,
                    status === "missed" && styles.dotMissed,
                  ]}
                >
                  {status === "submitted" && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.dayLabel}>{dayName}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.dotSubmitted]} />
          <Text style={styles.legendText}>Submitted</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.dotViewed]} />
          <Text style={styles.legendText}>Viewed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.dotMissed]} />
          <Text style={styles.legendText}>Missed</Text>
        </View>
      </View>

      {/* History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity History</Text>
        {attempts.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyText}>No activity yet. Start solving!</Text>
          </View>
        ) : (
          attempts.slice(0, 10).map((item) => (
            <View key={item.id} style={styles.historyRow}>
              <View style={styles.historyLeft}>
                <View style={[
                  styles.historyDot,
                  item.submitted ? styles.dotSubmitted : styles.dotViewed
                ]} />
                <Text style={styles.historyDate}>{formatDateKey(item.id)}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                item.submitted ? styles.statusBadgeSuccess : styles.statusBadgeWarning
              ]}>
                <Text style={[
                  styles.statusText,
                  item.submitted ? styles.statusTextSuccess : styles.statusTextWarning
                ]}>
                  {item.submitted ? "Completed" : "Viewed"}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default AnalyticsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSecondary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.bgPrimary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
    ...shadows.sm,
  },
  statCardPrimary: {
    backgroundColor: colors.warning,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statValuePrimary: {
    color: colors.textWhite,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  weekGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.bgPrimary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  dayColumn: {
    alignItems: "center",
    gap: spacing.sm,
  },
  dayDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  dotSubmitted: {
    backgroundColor: colors.success,
  },
  dotViewed: {
    backgroundColor: colors.warning,
  },
  dotMissed: {
    backgroundColor: colors.bgTertiary,
  },
  checkmark: {
    color: colors.textWhite,
    fontWeight: "700",
    fontSize: 16,
  },
  dayLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyHistory: {
    backgroundColor: colors.bgPrimary,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    alignItems: "center",
    ...shadows.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.bgPrimary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  historyDate: {
    ...typography.body,
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusBadgeSuccess: {
    backgroundColor: colors.successBg,
  },
  statusBadgeWarning: {
    backgroundColor: colors.warningBg,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "600",
  },
  statusTextSuccess: {
    color: colors.success,
  },
  statusTextWarning: {
    color: colors.warning,
  },
});
