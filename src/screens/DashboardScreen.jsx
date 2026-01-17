/**
 * Dashboard Screen - Daily Coding Question App
 * 
 * Main dashboard showing user's coding progress and stats.
 * Fetches REAL data from Firestore.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, onSnapshot, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { lightTheme, darkTheme } from '../theme/theme';
import StatCard from '../components/StatCard';

// Helper to get last N days date keys
const getLastNDaysKeys = (n) => {
  const keys = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(d.toISOString().split('T')[0]);
  }
  return keys;
};

const DashboardScreen = () => {
  const navigation = useNavigation();
  
  // ============================================
  // THEME STATE
  // ============================================
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const colors = theme.colors;

  // ============================================
  // REAL STATS FROM FIRESTORE
  // ============================================
  const [stats, setStats] = useState({
    questionsAttempted: 0,
    totalSubmissions: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Coder');
  const [weeklyAttempts, setWeeklyAttempts] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    email: '',
    createdAt: null,
    provider: 'email',
  });

  // ============================================
  // FETCH REAL DATA FROM FIRESTORE
  // ============================================
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // Real-time listener for user profile
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats({
          questionsAttempted: data.totalAttempts || 0,
          totalSubmissions: data.totalSubmissions || 0,
          currentStreak: data.currentStreak || 0,
          longestStreak: data.longestStreak || 0,
        });
        setUserName(data.firstName || data.displayName || 'Coder');
        setUserProfile({
          firstName: data.firstName || data.displayName || 'User',
          email: user.email || '',
          createdAt: data.createdAt || null,
          provider: user.providerData?.[0]?.providerId || 'email',
        });
      } else {
        // User document doesn't exist yet - show zeros
        setStats({
          questionsAttempted: 0,
          totalSubmissions: 0,
          currentStreak: 0,
          longestStreak: 0,
        });
        setUserProfile({
          firstName: 'User',
          email: user.email || '',
          createdAt: null,
          provider: 'email',
        });
      }
      setLoading(false);
    }, (error) => {
      console.log('Error fetching user data:', error);
      setLoading(false);
    });

    // Fetch weekly attempts
    const fetchWeeklyAttempts = async () => {
      try {
        const attemptsRef = collection(db, 'users', user.uid, 'dailyAttempts');
        const q = query(attemptsRef, orderBy('viewedAt', 'desc'));
        const snapshot = await getDocs(q);
        const attempts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setWeeklyAttempts(attempts);
      } catch (error) {
        console.log('Error fetching attempts:', error);
      }
    };
    fetchWeeklyAttempts();

    return () => unsubscribe();
  }, []);

  // ============================================
  // GREETING MESSAGE (IST Based)
  // ============================================
  const getGreeting = () => {
    // Convert to IST (UTC+5:30)
    const now = new Date();
    const istOffset = 5.5 * 60; // IST is UTC+5:30 in minutes
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utc + (istOffset * 60000));
    const hour = istTime.getHours();
    const minute = istTime.getMinutes();
    
    // IST-based greetings
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && (hour < 17 || (hour === 17 && minute < 30))) return 'Good Afternoon';
    if ((hour === 17 && minute >= 30) || (hour >= 18 && hour < 22)) return 'Good Evening';
    return 'Good Night';
  };

  // ============================================
  // MOTIVATIONAL MESSAGES
  // ============================================
  const motivationalMessages = [
    "Keep pushing! You're doing great! 💪",
    "Every line of code makes you stronger! 🚀",
    "Consistency is the key to mastery! 🔑",
    "You're building something amazing! ✨",
    "One question at a time! 🎯",
  ];

  const [motivationalMessage, setMotivationalMessage] = useState('');

  useEffect(() => {
    // Pick a random motivational message
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    setMotivationalMessage(motivationalMessages[randomIndex]);
  }, []);

  // ============================================
  // TOGGLE THEME HANDLER
  // ============================================
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // ============================================
  // SIGN OUT HANDLER
  // ============================================
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setShowProfile(false);
    } catch (error) {
      console.log('Sign out error:', error);
    }
  };

  // ============================================
  // FORMAT DATE
  // ============================================
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // ============================================
  // GET PROVIDER NAME
  // ============================================
  const getProviderName = (provider) => {
    const providers = {
      'password': 'Email/Password',
      'google.com': 'Google',
      'facebook.com': 'Facebook',
      'github.com': 'GitHub',
      'email': 'Email/Password',
    };
    return providers[provider] || 'Email';
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentBlue} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading your stats...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================ */}
        {/* HEADER SECTION */}
        {/* ============================================ */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {getGreeting()} 👋
            </Text>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>
              {userName}
            </Text>
          </View>

          <View style={styles.headerRight}>
            {/* Theme Toggle Button */}
            <TouchableOpacity
              style={[styles.themeToggle, { backgroundColor: colors.toggleBackground }]}
              onPress={toggleTheme}
              activeOpacity={0.8}
            >
              <Text style={styles.themeIcon}>
                {isDarkMode ? '🌙' : '☀️'}
              </Text>
            </TouchableOpacity>

            {/* Profile Button */}
            <TouchableOpacity
              style={[styles.profileBtn, { backgroundColor: colors.accentBlue }]}
              onPress={() => setShowProfile(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================ */}
        {/* PROFILE MODAL */}
        {/* ============================================ */}
        <Modal
          visible={showProfile}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowProfile(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Profile</Text>
                <TouchableOpacity onPress={() => setShowProfile(false)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Profile Avatar */}
              <View style={[styles.avatarContainer, { backgroundColor: colors.accentBlue }]}>
                <Text style={styles.avatarText}>
                  {userProfile.firstName.charAt(0).toUpperCase()}
                </Text>
              </View>

              {/* Profile Info */}
              <View style={styles.profileInfo}>
                <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Name</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                    {userProfile.firstName}
                  </Text>
                </View>

                <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                    {userProfile.email}
                  </Text>
                </View>

                <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Joined</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                    {formatDate(userProfile.createdAt)}
                  </Text>
                </View>

                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Linked Account</Text>
                  <View style={styles.providerBadge}>
                    <Text style={styles.providerIcon}>
                      {userProfile.provider === 'google.com' ? '🔵' : '📧'}
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                      {getProviderName(userProfile.provider)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Stats Summary */}
              <View style={[styles.statsSummary, { backgroundColor: colors.background }]}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.accentBlue }]}>
                    {stats.questionsAttempted}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Solved</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.accentOrange }]}>
                    {stats.currentStreak}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Streak</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.accentPurple }]}>
                    {stats.longestStreak}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Best</Text>
                </View>
              </View>

              {/* Sign Out Button */}
              <TouchableOpacity
                style={styles.signOutBtn}
                onPress={handleSignOut}
                activeOpacity={0.8}
              >
                <Text style={styles.signOutText}>🚪 Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ============================================ */}
        {/* MOTIVATIONAL BANNER */}
        {/* ============================================ */}
        <View style={[styles.banner, { 
          backgroundColor: colors.accentBlue,
        }]}>
          <Text style={styles.bannerEmoji}>🎯</Text>
          <Text style={styles.bannerText}>{motivationalMessage}</Text>
        </View>

        {/* ============================================ */}
        {/* STATS SECTION TITLE */}
        {/* ============================================ */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Your Progress
        </Text>

        {/* ============================================ */}
        {/* STATS CARDS GRID */}
        {/* ============================================ */}
        <View style={styles.statsGrid}>
          {/* Questions Attempted */}
          <StatCard
            emoji="✅"
            title="Questions Attempted"
            value={stats.questionsAttempted}
            accentColor={colors.accentGreen}
            theme={theme}
          />

          {/* Total Submissions */}
          <StatCard
            emoji="📝"
            title="Total Submissions"
            value={stats.totalSubmissions}
            accentColor={colors.accentBlue}
            theme={theme}
          />

          {/* Current Streak */}
          <StatCard
            emoji="🔥"
            title="Current Streak"
            value={stats.currentStreak}
            accentColor={colors.accentOrange}
            theme={theme}
          />

          {/* Longest Streak */}
          <StatCard
            emoji="⭐"
            title="Longest Streak"
            value={stats.longestStreak}
            accentColor={colors.accentPurple}
            theme={theme}
          />
        </View>

        {/* ============================================ */}
        {/* WEEKLY ACTIVITY */}
        {/* ============================================ */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          This Week
        </Text>
        
        <View style={[styles.weekCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.weekGrid}>
            {getLastNDaysKeys(7).map((dateKey) => {
              const attempt = weeklyAttempts.find((a) => a.id === dateKey);
              const status = attempt?.submitted
                ? 'submitted'
                : attempt
                ? 'viewed'
                : 'none';
              const dayName = new Date(dateKey).toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <View key={dateKey} style={styles.dayColumn}>
                  <View
                    style={[
                      styles.dayDot,
                      { backgroundColor: colors.border },
                      status === 'submitted' && styles.dotSubmitted,
                      status === 'viewed' && styles.dotViewed,
                    ]}
                  >
                    {status === 'submitted' && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>{dayName}</Text>
                </View>
              );
            })}
          </View>
          
          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.dotSubmitted]} />
              <Text style={[styles.legendText, { color: colors.textMuted }]}>Completed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.dotViewed]} />
              <Text style={[styles.legendText, { color: colors.textMuted }]}>Viewed</Text>
            </View>
          </View>
        </View>

        {/* ============================================ */}
        {/* QUICK ACTIONS SECTION */}
        {/* ============================================ */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Quick Actions
        </Text>

        <TouchableOpacity 
          style={[styles.actionButton, { 
            backgroundColor: colors.accentBlue,
          }]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.actionButtonText}>📚 Start Today's Question</Text>
        </TouchableOpacity>

        {/* ============================================ */}
        {/* FOOTER MESSAGE */}
        {/* ============================================ */}
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Keep coding, keep growing! 🌱
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeIcon: {
    fontSize: 20,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },

  // Motivational banner
  banner: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  bannerText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },

  // Section title
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  // Action buttons
  actionButton: {
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonSecondary: {
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
  },
  actionButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Footer
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },

  // Weekly Activity
  weekCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  dotSubmitted: {
    backgroundColor: '#10B981',
  },
  dotViewed: {
    backgroundColor: '#F59E0B',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  closeBtn: {
    fontSize: 24,
    color: '#9CA3AF',
    padding: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  statsSummary: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: '100%',
  },
  signOutBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen;
