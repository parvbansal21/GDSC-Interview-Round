import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { AuthStackParamList } from "../navigation/AuthStack";
import ParticleBackground from "../components/ParticleBackground";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = () => {
    alert("Button clicked! Email: " + email);
    console.log("Login button pressed - email:", email);
    
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);
    signInWithEmailAndPassword(auth, email.trim(), password)
      .then(() => {
        alert("Login successful!");
        console.log("Login successful");
      })
      .catch((error: any) => {
        alert("Login failed: " + (error?.message || "Unknown error"));
        console.log("Login error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <View style={styles.wrapper}>
      {/* Particle Animation Background */}
      <ParticleBackground />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          {/* Form Box */}
          <View style={styles.formBox}>
            {/* Title */}
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Welcome Back</Text>

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

            {/* Remember & Forgot */}
            <View style={styles.rememberForgot}>
              <View style={styles.remember}>
                <View style={styles.checkbox} />
                <Text style={styles.rememberLabel}>Remember me</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.forgot}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginBtn,
                loading && styles.loginBtnDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#00d4ff" size="small" />
              ) : (
                <Text style={styles.loginBtnText}>SIGN IN</Text>
              )}
            </TouchableOpacity>

            {/* Signup Link */}
            <View style={styles.signupLink}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.signupLinkText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#000000",
  },
  keyboardView: {
    flex: 1,
    zIndex: 10,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 10,
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
    zIndex: 10,
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
  rememberForgot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  remember: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#00d4ff",
    borderRadius: 2,
    marginRight: 8,
  },
  rememberLabel: {
    color: "rgba(0, 212, 255, 0.8)",
    fontSize: 13,
  },
  forgot: {
    color: "rgba(0, 212, 255, 0.8)",
    fontSize: 13,
  },
  loginBtn: {
    width: "100%",
    height: 48,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#00d4ff",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    zIndex: 100,
  },
  loginBtnPressed: {
    backgroundColor: "rgba(0, 212, 255, 0.2)",
    transform: [{ scale: 0.98 }],
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: "#00d4ff",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 2,
  },
  signupLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  signupText: {
    color: "rgba(0, 212, 255, 0.7)",
    fontSize: 13,
  },
  signupLinkText: {
    color: "#00d4ff",
    fontSize: 13,
    fontWeight: "500",
  },
});
