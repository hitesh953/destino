/**
 * LoginScreen - Email/Password Login
 * Shown when a returning user needs to log back into their Destino account.
 * New accounts are created during Onboarding, not here.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  ImageBackground,
  KeyboardAvoidingView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  signInWithEmail,
  resetPassword,
  getFriendlyAuthErrorMessage,
} from "@/services/firestore";

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationType>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    let isValid = true;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    } else {
      setEmailError(null);
    }

    if (!password || password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError(null);
    }

    return isValid;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) setPasswordError(null);
  };

  const handleSubmit = async () => {
    setFormError(null);
    setResetMessage(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmail(email.trim(), password);

      await AsyncStorage.setItem("userLoggedIn", "true");

      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard", params: { justLoggedIn: true } }],
      });
    } catch (error: any) {
      console.error("Error authenticating user:", error);
      setFormError(getFriendlyAuthErrorMessage(error?.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setFormError(null);
    setResetMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError("Enter your email above first, then tap Forgot password");
      return;
    }

    setIsResettingPassword(true);
    try {
      await resetPassword(trimmedEmail);
      setResetMessage(`Password reset link sent to ${trimmedEmail}`);
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      setFormError(getFriendlyAuthErrorMessage(error?.code));
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleGoToSignUp = () => {
    navigation.navigate("Onboarding" as never);
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={require("@assets/images/detail_backgroundImg.png")}
        style={styles.fullScreenBackground}
        imageStyle={styles.backgroundImageStyle}
      >
        <SafeAreaView style={styles.container}>
          {Platform.OS === "ios" ? (
            <KeyboardAvoidingView
              behavior="padding"
              keyboardVerticalOffset={100}
              style={styles.keyboardAvoidingView}
            >
              <LoginContent
                email={email}
                onEmailChange={handleEmailChange}
                password={password}
                onPasswordChange={handlePasswordChange}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                isLoading={isLoading}
                isResettingPassword={isResettingPassword}
                emailError={emailError}
                passwordError={passwordError}
                formError={formError}
                resetMessage={resetMessage}
                onSubmit={handleSubmit}
                onForgotPassword={handleForgotPassword}
                onGoToSignUp={handleGoToSignUp}
              />
            </KeyboardAvoidingView>
          ) : (
            <View style={styles.keyboardAvoidingView}>
              <LoginContent
                email={email}
                onEmailChange={handleEmailChange}
                password={password}
                onPasswordChange={handlePasswordChange}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                isLoading={isLoading}
                isResettingPassword={isResettingPassword}
                emailError={emailError}
                passwordError={passwordError}
                formError={formError}
                resetMessage={resetMessage}
                onSubmit={handleSubmit}
                onForgotPassword={handleForgotPassword}
                onGoToSignUp={handleGoToSignUp}
              />
            </View>
          )}
        </SafeAreaView>
      </ImageBackground>
    </>
  );
};

interface LoginContentProps {
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  isLoading: boolean;
  isResettingPassword: boolean;
  emailError: string | null;
  passwordError: string | null;
  formError: string | null;
  resetMessage: string | null;
  onSubmit: () => void;
  onForgotPassword: () => void;
  onGoToSignUp: () => void;
}

const LoginContent: React.FC<LoginContentProps> = ({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  showPassword,
  setShowPassword,
  isLoading,
  isResettingPassword,
  emailError,
  passwordError,
  formError,
  resetMessage,
  onSubmit,
  onForgotPassword,
  onGoToSignUp,
}) => (
  <ScrollView
    style={styles.formScrollView}
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
  >
    {/* Header */}
    <View style={styles.headerSection}>
      <Text style={styles.headerLabel}>WELCOME TO</Text>
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>Destino</Text>
        <Text style={styles.sparkle}>✨</Text>
      </View>
      <Text style={styles.headerSubtitle}>Log back in to continue your journey.</Text>
    </View>

    {/* Form Card */}
    <View style={styles.formContainer}>
      {/* Server / general error banner */}
      {formError && (
        <View style={styles.errorBanner}>
          <MaterialIcons name="error-outline" size={16} color="#C0392B" />
          <Text style={styles.errorBannerText}>{formError}</Text>
        </View>
      )}

      {/* Password reset confirmation banner */}
      {resetMessage && (
        <View style={styles.successBanner}>
          <MaterialIcons name="check-circle-outline" size={16} color="#2E7D32" />
          <Text style={styles.successBannerText}>{resetMessage}</Text>
        </View>
      )}

      {/* Email Field */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Email</Text>
        <View style={[styles.inputWrapper, emailError && styles.inputWrapperError]}>
          <MaterialIcons name="email" size={20} color="#9CA3AF" style={styles.fieldIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="you@example.com"
            placeholderTextColor="#D1D5DB"
            value={email}
            onChangeText={onEmailChange}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>
        {emailError && <Text style={styles.fieldErrorText}>{emailError}</Text>}
      </View>

      {/* Password Field */}
      <View style={styles.fieldGroup}>
        <View style={styles.passwordLabelRow}>
          <Text style={styles.fieldLabel}>Password</Text>
          <Pressable onPress={onForgotPassword} disabled={isResettingPassword} hitSlop={8}>
            {isResettingPassword ? (
              <ActivityIndicator size="small" color="#7B68EE" />
            ) : (
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            )}
          </Pressable>
        </View>
        <View style={[styles.inputWrapper, passwordError && styles.inputWrapperError]}>
          <MaterialIcons name="lock" size={20} color="#9CA3AF" style={styles.fieldIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="At least 6 characters"
            placeholderTextColor="#D1D5DB"
            value={password}
            onChangeText={onPasswordChange}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
            <MaterialIcons
              name={showPassword ? "visibility-off" : "visibility"}
              size={20}
              color="#9CA3AF"
              style={styles.fieldIconRight}
            />
          </Pressable>
        </View>
        {passwordError && <Text style={styles.fieldErrorText}>{passwordError}</Text>}
      </View>

      {/* Submit Button */}
      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          isLoading && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={onSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.primaryButtonText}>Login</Text>
            <MaterialIcons name="arrow-forward" size={20} color="white" />
          </>
        )}
      </Pressable>

      {/* Link to Sign Up for new users */}
      <Pressable style={styles.signUpLinkWrapper} onPress={onGoToSignUp}>
        <Text style={styles.signUpLinkText}>
          Don't have an account? <Text style={styles.signUpLinkTextBold}>Sign Up</Text>
        </Text>
      </Pressable>
    </View>

    {/* Bottom text */}
    <View style={styles.bottomSection}>
      <Text style={styles.bottomText}>YOUR HAND ✦ YOUR STORY</Text>
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  fullScreenBackground: {
    flex: 1,
  },
  backgroundImageStyle: {
    resizeMode: "cover",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  formScrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 20,
  },

  /* Header Section */
  headerSection: {
    paddingTop: 80,
    paddingBottom: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#E9D5FF",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 50,
    color: "#F5C86A",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  sparkle: {
    fontSize: 28,
    marginLeft: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#E9D5FF",
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 20,
  },

  /* Form Container */
  formContainer: {
    backgroundColor: "rgba(255, 253, 252, 0.94)",
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginTop: 24,
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  /* Error / Success Banners */
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FDECEA",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: "#C0392B",
    fontWeight: "600",
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  successBannerText: {
    flex: 1,
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "600",
  },

  /* Field Group */
  fieldGroup: {
    marginBottom: 14,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A237E",
    marginLeft: 2,
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7B68EE",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E8EBF5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  inputWrapperError: {
    borderColor: "#E57373",
  },
  fieldIcon: {
    marginRight: 12,
    color: "#8B7DB8",
  },
  fieldIconRight: {
    marginLeft: 8,
    color: "#8B7DB8",
  },
  fieldErrorText: {
    fontSize: 12,
    color: "#C0392B",
    marginLeft: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A237E",
    paddingVertical: 12,
  },

  /* Submit Button */
  primaryButton: {
    marginTop: 8,
    backgroundColor: "#7B68EE",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 3,
    shadowColor: "#7B68EE",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    minHeight: 48,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  /* Sign Up Link */
  signUpLinkWrapper: {
    alignItems: "center",
    marginTop: 18,
  },
  signUpLinkText: {
    fontSize: 13,
    color: "#6B4FA0",
  },
  signUpLinkTextBold: {
    fontWeight: "700",
    color: "#7B68EE",
  },

  /* Bottom Section */
  bottomSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  bottomText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6F42C1",
    letterSpacing: 2.5,
  },
});
