import React, { useState, useRef } from "react";
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
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { AuthStackParamList } from "../navigation/AuthStack";
import ParticleBackground from "../components/ParticleBackground";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const RegisterScreen = ({ navigation }: Props) => {
  const [step, setStep] = useState(1); // 1: form, 2: OTP verification
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  
  const otpInputRefs = useRef<Array<TextInput | null>>([]);

  // Generate 6-digit OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Send OTP to Email (simulated - shows in alert for demo)
  const handleSendOTP = async () => {
    setError("");
    
    if (!firstName || !email || !password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      // Generate OTP
      const newOtp = generateOTP();
      setGeneratedOtp(newOtp);
      
      // In production, you would send this via Email API (SendGrid, Nodemailer, etc.)
      // For demo, we'll show it in an alert
      setTimeout(() => {
        alert(`📧 Your Email OTP is: ${newOtp}\n\nSent to: ${email}\n\n(In production, this would be sent to your email inbox)`);
      }, 500);
      
      setStep(2);
      setSuccess(`OTP sent to ${email}`);
    } catch (error: any) {
      setError(error?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and complete registration
  const handleVerifyOTP = async () => {
    setError("");
    const enteredOtp = otp.join("");
    
    if (enteredOtp.length !== 6) {
      setError("Please enter complete 6-digit OTP");
      return;
    }

    if (enteredOtp !== generatedOtp) {
      setError("Invalid OTP. Please try again.");
      return;
    }

    setLoading(true);
    try {
      // Create user account
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Save user data to Firestore (with email verified)
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        firstName: firstName.trim(),
        email: email.trim(),
        emailVerified: true,
        currentStreak: 0,
        longestStreak: 0,
        lastAttemptDate: null,
        totalAttempts: 0,
        totalSubmissions: 0,
        missedDays: 0,
        createdAt: serverTimestamp(),
      });

      setSuccess("✅ Registration successful! Your email is verified.");
      
      // Clear form
      setFirstName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setOtp(["", "", "", "", "", ""]);
      
    } catch (error: any) {
      console.log("Registration error:", error);
      setError(error?.message || "Unable to sign up");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace in OTP
  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Resend OTP
  const handleResendOTP = () => {
    const newOtp = generateOTP();
    setGeneratedOtp(newOtp);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setTimeout(() => {
      alert(`📧 Your new OTP is: ${newOtp}\n\nSent to: ${email}`);
    }, 500);
    setSuccess(`New OTP sent to ${email}`);
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
              <Text style={styles.title}>{step === 1 ? "Register" : "Verify Email"}</Text>
              <Text style={styles.subtitle}>
                {step === 1 ? "Create Your Account" : `Enter OTP sent to ${email}`}
              </Text>

              {/* Success Message */}
              {success && step === 1 ? (
                <View style={styles.successBox}>
                  <Text style={styles.successText}>{success}</Text>
                </View>
              ) : null}

              {success && step === 2 && success.includes("successful") ? (
                <View style={styles.successBox}>
                  <Text style={styles.successText}>{success}</Text>
                  <TouchableOpacity 
                    style={styles.goToLoginBtn}
                    onPress={() => navigation.navigate("Login")}
                  >
                    <Text style={styles.goToLoginText}>Go to Login →</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* Error Message */}
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              {/* STEP 1: Registration Form */}
              {step === 1 && (
                <>
                  {/* First Name Input */}
                  <View style={styles.inputGroup}>
                    <TextInput
                      value={firstName}
                      onChangeText={setFirstName}
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                      style={styles.inputField}
                      autoCapitalize="words"
                    />
                    <Text style={[
                      styles.label,
                      (nameFocused || firstName) ? styles.labelActive : null
                    ]}>
                      First Name
                    </Text>
                    <View style={styles.inputBorderDefault} />
                    {nameFocused && <View style={styles.glowLine} />}
                  </View>

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
                      (emailFocused || email) ? styles.labelActive : null
                    ]}>
                      Email (will be verified)
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
                      style={[styles.inputField, { paddingRight: 45 }]}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                    <Text style={[
                      styles.label,
                      (passwordFocused || password) ? styles.labelActive : null
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
                      style={[styles.inputField, { paddingRight: 45 }]}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Text style={styles.eyeIconText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                    <Text style={[
                      styles.label,
                      (confirmFocused || confirmPassword) ? styles.labelActive : null
                    ]}>
                      Confirm Password
                    </Text>
                    <View style={styles.inputBorderDefault} />
                    {confirmFocused && <View style={styles.glowLine} />}
                  </View>

                  {/* Send OTP Button */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.registerBtn,
                      pressed && styles.registerBtnPressed,
                      loading && styles.registerBtnDisabled,
                    ]}
                    onPress={handleSendOTP}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#00d4ff" size="small" />
                    ) : (
                      <Text style={styles.registerBtnText}>SEND OTP</Text>
                    )}
                  </Pressable>
                </>
              )}

              {/* STEP 2: OTP Verification */}
              {step === 2 && !success.includes("successful") && (
                <>
                  {/* OTP Input Boxes */}
                  <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => (otpInputRefs.current[index] = ref)}
                        style={[
                          styles.otpInput,
                          digit ? styles.otpInputFilled : null,
                        ]}
                        value={digit}
                        onChangeText={(value) => handleOtpChange(value, index)}
                        onKeyPress={(e) => handleOtpKeyPress(e, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        selectTextOnFocus
                      />
                    ))}
                  </View>

                  {/* Verify OTP Button */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.registerBtn,
                      pressed && styles.registerBtnPressed,
                      loading && styles.registerBtnDisabled,
                    ]}
                    onPress={handleVerifyOTP}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#00d4ff" size="small" />
                    ) : (
                      <Text style={styles.registerBtnText}>VERIFY & REGISTER</Text>
                    )}
                  </Pressable>

                  {/* Resend OTP */}
                  <TouchableOpacity onPress={handleResendOTP} style={styles.resendBtn}>
                    <Text style={styles.resendText}>Didn't receive OTP? Resend</Text>
                  </TouchableOpacity>

                  {/* Back Button */}
                  <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
                    <Text style={styles.backText}>← Back to Form</Text>
                  </TouchableOpacity>
                </>
              )}

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
  errorText: {
    color: "#ff4757",
    fontSize: 13,
    marginBottom: 15,
    textAlign: "center",
  },
  successBox: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: "#10B981",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  successText: {
    color: "#10B981",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  goToLoginBtn: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: "#10B981",
    borderRadius: 8,
    alignItems: "center",
  },
  goToLoginText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  eyeIcon: {
    position: "absolute",
    right: 0,
    top: 8,
    padding: 8,
    zIndex: 5,
  },
  eyeIconText: {
    fontSize: 18,
  },
  // OTP styles
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.3)",
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "#00d4ff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  otpInputFilled: {
    borderColor: "#00d4ff",
    shadowColor: "#00d4ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  resendBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 10,
  },
  resendText: {
    color: "#00d4ff",
    fontSize: 13,
  },
  backBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  backText: {
    color: "rgba(0, 212, 255, 0.7)",
    fontSize: 13,
  },
});
