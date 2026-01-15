import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { AuthStackParamList } from "../navigation/AuthStack";
import ParticleBackground from "../components/ParticleBackground";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const RegisterScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const handleRegister = async () => {
    console.log("Register button pressed");
    
    if (!email || !password || !confirmPassword) {
      Alert.alert("Missing fields", "Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        currentStreak: 0,
        longestStreak: 0,
        lastAttemptDate: null,
        totalAttempts: 0,
        missedDays: 0,
        createdAt: serverTimestamp(),
      });
      console.log("Registration successful");
    } catch (error: any) {
      console.log("Registration error:", error);
      Alert.alert("Signup failed", error?.message || "Unable to sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Particle Animation Background */}
      <ParticleBackground />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Form Box */}
            <View style={styles.formBox}>
              {/* Title */}
              <Text style={styles.title}>Register</Text>
              <Text style={styles.subtitle}>Create Your Account</Text>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  style={styles.inputField}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <Text style={[
                  styles.label,
                  (emailFocused || email) && styles.labelActive
                ]}>
                  Email
                </Text>
                <View style={styles.inputBorderDefault} />
                {emailFocused && <View style={styles.glowLine} />}
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  style={styles.inputField}
                  secureTextEntry
                />
                <Text style={[
                  styles.label,
                  (passwordFocused || password) && styles.labelActive
                ]}>
                  Password
                </Text>
                <View style={styles.inputBorderDefault} />
                {passwordFocused && <View style={styles.glowLine} />}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                  style={styles.inputField}
                  secureTextEntry
                />
                <Text style={[
                  styles.label,
                  (confirmFocused || confirmPassword) && styles.labelActive
                ]}>
                  Confirm Password
                </Text>
                <View style={styles.inputBorderDefault} />
                {confirmFocused && <View style={styles.glowLine} />}
              </View>

              {/* Register Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.registerBtn,
                  pressed && styles.registerBtnPressed,
                  loading && styles.registerBtnDisabled,
                ]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#00d4ff" size="small" />
                ) : (
                  <Text style={styles.registerBtnText}>CREATE ACCOUNT</Text>
                )}
              </Pressable>

              {/* Login Link */}
              <View style={styles.loginLink}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <Pressable onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.loginLinkText}>Sign In</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#000000",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  formBox: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 24,
    padding: 40,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.3)",
    shadowColor: "#00d4ff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
  },
  title: {
    color: "#00d4ff",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "700",
    letterSpacing: 3,
    fontSize: 24,
    textShadowColor: "rgba(0, 212, 255, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: "rgba(0, 212, 255, 0.7)",
    textAlign: "center",
    marginBottom: 25,
    fontSize: 14,
    letterSpacing: 1,
  },
  inputGroup: {
    position: "relative",
    marginBottom: 25,
    height: 45,
  },
  inputField: {
    width: "100%",
    height: "100%",
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontSize: 15,
    color: "#00d4ff",
    backgroundColor: "transparent",
    borderWidth: 0,
    zIndex: 2,
  },
  label: {
    position: "absolute",
    top: 12,
    left: 0,
    color: "rgba(0, 212, 255, 0.7)",
    fontSize: 15,
    zIndex: 1,
  },
  labelActive: {
    top: -12,
    fontSize: 12,
    color: "#00d4ff",
    textShadowColor: "rgba(0, 212, 255, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
    letterSpacing: 1,
  },
  inputBorderDefault: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(0, 212, 255, 0.3)",
  },
  glowLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#00d4ff",
    shadowColor: "#00d4ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  registerBtn: {
    width: "100%",
    height: 48,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#00d4ff",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 10,
    cursor: "pointer",
  },
  registerBtnPressed: {
    backgroundColor: "rgba(0, 212, 255, 0.2)",
    transform: [{ scale: 0.98 }],
  },
  registerBtnDisabled: {
    opacity: 0.6,
  },
  registerBtnText: {
    color: "#00d4ff",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 2,
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loginText: {
    color: "rgba(0, 212, 255, 0.7)",
    fontSize: 13,
  },
  loginLinkText: {
    color: "#00d4ff",
    fontSize: 13,
    fontWeight: "500",
  },
});
