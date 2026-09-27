/**
 * OnboardingScreen - User Information Collection
 * Mystical Palm Reading Theme with Zodiac Elements
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  saveUserOnboardingData,
  signUpWithEmail,
  generateAstrologyProfile,
  getFriendlyAuthErrorMessage,
} from "@/services/firestore";
import { validateOnboardingData, ValidationError } from "@/utils/validation";

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationType>();

  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthTime, setBirthTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { title: "Your Name", description: "What's your full name?" },
    { title: "Date of Birth", description: "When were you born?" },
    { title: "Birth Time", description: "What time were you born?" },
    { title: "Place of Birth", description: "Where were you born?" },
    { title: "Create Account", description: "Set your email and password" },
  ];

  // Animation values
  const palmRotateAnim = useRef(new Animated.Value(0)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header fade in (only on mount)
    Animated.timing(headerFadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Palm gentle rotation animation (only on mount)
    Animated.loop(
      Animated.sequence([
        Animated.timing(palmRotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(palmRotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Animate form content when step changes
  useEffect(() => {
    formFadeAnim.setValue(0);
    Animated.timing(formFadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setBirthTime(selectedTime);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!name.trim()) {
          alert("Please enter your name");
          return false;
        }
        return true;
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        if (!placeOfBirth.trim()) {
          alert("Please enter your place of birth");
          return false;
        }
        return true;
      case 4: {
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
          alert("Please enter a valid email address");
          return false;
        }
        if (!password || password.length < 6) {
          alert("Password must be at least 6 characters");
          return false;
        }
        if (password !== confirmPassword) {
          alert("Passwords do not match");
          return false;
        }
        return true;
      }
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleCompleteOnboarding();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    try {
      // Validate data before saving
      const validationErrors = validateOnboardingData({
        name,
        dateOfBirth,
        birthTime,
        placeOfBirth,
      });

      if (validationErrors.length > 0) {
        const errorMessages = validationErrors
          .map((err: ValidationError) => err.message)
          .join("\n");
        alert("Validation Error:\n\n" + errorMessages);
        setIsLoading(false);
        return;
      }

      // Save to Firestore with validation
      await saveUserOnboardingData({
        name,
        dateOfBirth,
        birthTime,
        placeOfBirth,
      });

      // Create the user's email/password account
      await signUpWithEmail(email.trim(), password);

      // Generate the user's personalized astrology profile via Gemini AI.
      // Non-fatal: the account is already created, so don't block navigation
      // if this fails (Dashboard will show a fallback state and can retry).
      try {
        await generateAstrologyProfile({
          name,
          dateOfBirth,
          birthTime,
          placeOfBirth,
        });
      } catch (profileError) {
        console.error("Error generating astrology profile:", profileError);
      }

      // Save to AsyncStorage for offline access
      await AsyncStorage.setItem("onboardingCompleted", "true");

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error: any) {
      console.error("Error saving user data:", error);
      if (error?.code) {
        alert(getFriendlyAuthErrorMessage(error.code));
      } else {
        alert(
          "Failed to save your information. Please check your connection and try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const palmRotation = palmRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "5deg"],
  });

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={require("@assets/images/detail_backgroundImg.png")}
        style={styles.fullScreenBackground}
        imageStyle={styles.backgroundImageStyle}
      >
        <SafeAreaView style={styles.container}>
        {/* Animated Header with Palm - Fixed at top */}
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: headerFadeAnim,
            },
          ]}
        >
          <Text style={styles.headerLabel}>WELCOME TO</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Destino</Text>
            <Text style={styles.sparkle}>✨</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Let's get to know you better to provide personalized insights.
          </Text>
        </Animated.View>

        {/* Form Section - Scrollable with Keyboard Avoidance */}
        {Platform.OS === "ios" ? (
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={100}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            style={styles.formScrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {/* Form Container with white background */}
            <View style={styles.formContainer}>
              {/* Stepper Indicator */}
              <View style={styles.stepperContainer}>
                {steps.map((_, index) => (
                  <View key={index} style={styles.stepperItemWrapper}>
                    <View
                      style={[
                        styles.stepperCircle,
                        index <= currentStep && styles.stepperCircleActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepperNumber,
                          index <= currentStep && styles.stepperNumberActive,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    {index < steps.length - 1 && (
                      <View
                        style={[
                          styles.stepperLine,
                          index < currentStep && styles.stepperLineActive,
                        ]}
                      />
                    )}
                  </View>
                ))}
              </View>

              {/* Step Title and Description */}
              <Animated.View style={[styles.stepHeader, { opacity: formFadeAnim }]}>
                <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
                <Text style={styles.stepDescription}>{steps[currentStep].description}</Text>
              </Animated.View>

              {/* Step Content */}
              <Animated.View style={[styles.stepContent, { opacity: formFadeAnim }]}>
                {currentStep === 0 && (
                  <FormField
                    icon="person"
                    label="Your Name"
                    placeholder="Enter your full name"
                    value={name}
                    onChangeText={setName}
                  />
                )}

                {currentStep === 1 && (
                  <>
                    <DateFormField
                      icon="calendar-today"
                      label="Date of Birth"
                      value={dateOfBirth.toLocaleDateString()}
                      onPress={() => setShowDatePicker(true)}
                    />
                    {showDatePicker && (
                      <DateTimePicker
                        value={dateOfBirth}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                      />
                    )}
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <DateFormField
                      icon="schedule"
                      label="Birth Time (Optional)"
                      value={birthTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      onPress={() => setShowTimePicker(true)}
                    />
                    {showTimePicker && (
                      <DateTimePicker
                        value={birthTime}
                        mode="time"
                        display="spinner"
                        onChange={handleTimeChange}
                      />
                    )}
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <FormField
                      icon="location-on"
                      label="Place of Birth"
                      placeholder="City, Country"
                      value={placeOfBirth}
                      onChangeText={setPlaceOfBirth}
                    />
                    {/* Info Box */}
                    <View style={styles.infoBox}>
                      <MaterialIcons
                        name="shield"
                        size={20}
                        color="#6B4FA0"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.infoText}>
                        This information helps us provide accurate astrological and
                        palmistry insights tailored to you.
                      </Text>
                    </View>
                  </>
                )}

                {currentStep === 4 && (
                  <>
                    <FormField
                      icon="email"
                      label="Email"
                      placeholder="you@example.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <PasswordFormField
                      label="Password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChangeText={setPassword}
                      showPassword={showPassword}
                      onToggleShowPassword={() => setShowPassword(!showPassword)}
                    />
                    <PasswordFormField
                      label="Confirm Password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      showPassword={showConfirmPassword}
                      onToggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  </>
                )}
              </Animated.View>

              {/* Navigation Buttons */}
              <View style={styles.buttonGroup}>
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    currentStep === 0 && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <MaterialIcons
                    name="arrow-back"
                    size={20}
                    color={currentStep === 0 ? "#ccc" : "#7B68EE"}
                  />
                  <Text style={[styles.secondaryButtonText, currentStep === 0 && styles.buttonDisabledText]}>
                    Back
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    isLoading && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleNext}
                  disabled={isLoading}
                >
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? "Saving..." : currentStep === steps.length - 1 ? "Complete" : "Next"}
                  </Text>
                  <MaterialIcons
                    name={currentStep === steps.length - 1 ? "check" : "arrow-forward"}
                    size={20}
                    color="white"
                  />
                </Pressable>
              </View>

              {/* Link to Login for existing users */}
              <Pressable
                style={styles.loginLinkWrapper}
                onPress={() => navigation.navigate("Login" as never)}
              >
                <Text style={styles.loginLinkText}>
                  Already have an account? <Text style={styles.loginLinkTextBold}>Login</Text>
                </Text>
              </Pressable>
            </View>

              {/* Bottom text */}
              <View style={styles.bottomSection}>
                <Text style={styles.bottomText}>YOUR HAND ✦ YOUR STORY</Text>
              </View>

              {/* Wavy bottom decoration */}
              <View style={styles.waveBottom} />
            </ScrollView>
        </KeyboardAvoidingView>
        ) : (
        <View style={styles.keyboardAvoidingView}>
          <ScrollView
            style={styles.formScrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {/* Form Container with white background */}
            <View style={styles.formContainer}>
              {/* Stepper Indicator */}
              <View style={styles.stepperContainer}>
                {steps.map((_, index) => (
                  <View key={index} style={styles.stepperItemWrapper}>
                    <View
                      style={[
                        styles.stepperCircle,
                        index <= currentStep && styles.stepperCircleActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepperNumber,
                          index <= currentStep && styles.stepperNumberActive,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    {index < steps.length - 1 && (
                      <View
                        style={[
                          styles.stepperLine,
                          index < currentStep && styles.stepperLineActive,
                        ]}
                      />
                    )}
                  </View>
                ))}
              </View>

              {/* Step Title and Description */}
              <Animated.View style={[styles.stepHeader, { opacity: formFadeAnim }]}>
                <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
                <Text style={styles.stepDescription}>{steps[currentStep].description}</Text>
              </Animated.View>

              {/* Step Content */}
              <Animated.View style={[styles.stepContent, { opacity: formFadeAnim }]}>
                {currentStep === 0 && (
                  <FormField
                    icon="person"
                    label="Your Name"
                    placeholder="Enter your full name"
                    value={name}
                    onChangeText={setName}
                  />
                )}

                {currentStep === 1 && (
                  <>
                    <DateFormField
                      icon="calendar-today"
                      label="Date of Birth"
                      value={dateOfBirth.toLocaleDateString()}
                      onPress={() => setShowDatePicker(true)}
                    />
                    {showDatePicker && (
                      <DateTimePicker
                        value={dateOfBirth}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                      />
                    )}
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <DateFormField
                      icon="schedule"
                      label="Birth Time (Optional)"
                      value={birthTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      onPress={() => setShowTimePicker(true)}
                    />
                    {showTimePicker && (
                      <DateTimePicker
                        value={birthTime}
                        mode="time"
                        display="spinner"
                        onChange={handleTimeChange}
                      />
                    )}
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <FormField
                      icon="location-on"
                      label="Place of Birth"
                      placeholder="City, Country"
                      value={placeOfBirth}
                      onChangeText={setPlaceOfBirth}
                    />
                    {/* Info Box */}
                    <View style={styles.infoBox}>
                      <MaterialIcons
                        name="shield"
                        size={20}
                        color="#6B4FA0"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.infoText}>
                        This information helps us provide accurate astrological and
                        palmistry insights tailored to you.
                      </Text>
                    </View>
                  </>
                )}

                {currentStep === 4 && (
                  <>
                    <FormField
                      icon="email"
                      label="Email"
                      placeholder="you@example.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <PasswordFormField
                      label="Password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChangeText={setPassword}
                      showPassword={showPassword}
                      onToggleShowPassword={() => setShowPassword(!showPassword)}
                    />
                    <PasswordFormField
                      label="Confirm Password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      showPassword={showConfirmPassword}
                      onToggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  </>
                )}
              </Animated.View>

              {/* Navigation Buttons */}
              <View style={styles.buttonGroup}>
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    currentStep === 0 && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <MaterialIcons
                    name="arrow-back"
                    size={20}
                    color={currentStep === 0 ? "#ccc" : "#7B68EE"}
                  />
                  <Text style={[styles.secondaryButtonText, currentStep === 0 && styles.buttonDisabledText]}>
                    Back
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    isLoading && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleNext}
                  disabled={isLoading}
                >
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? "Saving..." : currentStep === steps.length - 1 ? "Complete" : "Next"}
                  </Text>
                  <MaterialIcons
                    name={currentStep === steps.length - 1 ? "check" : "arrow-forward"}
                    size={20}
                    color="white"
                  />
                </Pressable>
              </View>

              {/* Link to Login for existing users */}
              <Pressable
                style={styles.loginLinkWrapper}
                onPress={() => navigation.navigate("Login" as never)}
              >
                <Text style={styles.loginLinkText}>
                  Already have an account? <Text style={styles.loginLinkTextBold}>Login</Text>
                </Text>
              </Pressable>
            </View>

            {/* Bottom text */}
            <View style={styles.bottomSection}>
              <Text style={styles.bottomText}>YOUR HAND ✦ YOUR STORY</Text>
            </View>

            {/* Wavy bottom decoration */}
            <View style={styles.waveBottom} />
          </ScrollView>
        </View>
        )}
        </SafeAreaView>
      </ImageBackground>
    </>
  );
};

// Form Field Component
interface FormFieldProps {
  icon: string;
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

const FormField: React.FC<FormFieldProps> = ({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "sentences",
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      <MaterialIcons
        name={icon as any}
        size={20}
        color="#9CA3AF"
        style={styles.fieldIcon}
      />
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor="#D1D5DB"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  </View>
);

// Password Form Field Component
interface PasswordFormFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
}

const PasswordFormField: React.FC<PasswordFormFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  showPassword,
  onToggleShowPassword,
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      <MaterialIcons name="lock" size={20} color="#9CA3AF" style={styles.fieldIcon} />
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor="#D1D5DB"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
      />
      <Pressable onPress={onToggleShowPassword}>
        <MaterialIcons
          name={showPassword ? "visibility-off" : "visibility"}
          size={20}
          color="#9CA3AF"
          style={styles.fieldIconRight}
        />
      </Pressable>
    </View>
  </View>
);

// Date Form Field Component
interface DateFormFieldProps {
  icon: string;
  label: string;
  value: string;
  onPress: () => void;
}

const DateFormField: React.FC<DateFormFieldProps> = ({
  icon,
  label,
  value,
  onPress,
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Pressable style={styles.inputWrapper} onPress={onPress}>
      <MaterialIcons
        name={icon as any}
        size={20}
        color="#9CA3AF"
        style={styles.fieldIcon}
      />
      <Text style={styles.dateText}>{value}</Text>
      <MaterialIcons
        name={icon as any}
        size={20}
        color="#9CA3AF"
        style={styles.fieldIconRight}
      />
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  fullScreenBackground: {
    flex: 1,
  },
  backgroundImage: {
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

  /* Header Section */
  headerSection: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    width: '50%'
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    color: "#E9D5FF",
    letterSpacing: 1.5,
    marginBottom: 2,
    marginTop: 50
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
    marginBottom: 0,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontFamily: "CormorantGaramond_700Bold",
    marginTop: 0,
  },
  sparkle: {
    fontSize: 28,
    marginLeft: 6,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#E9D5FF",
    lineHeight: 16,
    marginBottom: 12,
  },
  /* Scroll Content */
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 20,
  },

  /* Form Container */
  formContainer: {
    backgroundColor: "rgba(255, 253, 252, 0.94)",
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginBottom: 0,
    marginTop: 80,
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  /* Field Group */
  fieldGroup: {
    marginBottom: 10,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A237E",
    marginLeft: 2,
  },

  /* Input Wrapper */
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E8EBF5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 5,
  },
  fieldIcon: {
    marginRight: 12,
    color: "#8B7DB8",
  },
  fieldIconRight: {
    marginLeft: "auto",
    color: "#8B7DB8",
  },

  /* Text Input */
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A237E",
    paddingVertical: 12,
  },

  /* Date Text */
  dateText: {
    flex: 1,
    fontSize: 16,
    color: "#1A237E",
  },

  /* Info Box */
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#EDE7F6",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    marginTop: 8,
    gap: 10,
    alignItems: "flex-start",
  },
  infoIcon: {
    marginTop: 3,
    color: "#7B5BA0",
  },
  infoText: {
    fontSize: 12,
    color: "#6B4FA0",
    lineHeight: 16,
    flex: 1,
    fontWeight: "500",
  },

  /* Submit Button */
  submitButton: {
    backgroundColor: "#7B68EE",
    borderRadius: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7B68EE",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    marginTop: 8,
  },
  submitButtonPressed: {
    backgroundColor: "#6A5ADB",
    transform: [{ scale: 0.98 }],
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
    marginRight: 6,
  },
  buttonIcon: {
    marginLeft: 4,
  },

  /* Bottom Section */
  bottomSection: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 20
  },
  bottomText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6F42C1",
    letterSpacing: 2.5,
  },
  waveBottom: {
    height: 30,
    backgroundColor: "transparent",
    marginTop: 16,
  },

  /* Stepper Styles */
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  stepperItemWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepperCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8E8E8",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperCircleActive: {
    backgroundColor: "#7B68EE",
  },
  stepperNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#999",
  },
  stepperNumberActive: {
    color: "#FFFFFF",
  },
  stepperLine: {
    width: 30,
    height: 2,
    backgroundColor: "#E8E8E8",
    marginHorizontal: 8,
  },
  stepperLineActive: {
    backgroundColor: "#7B68EE",
  },

  stepHeader: {
    marginBottom: 24,
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 22,
    color: "#1A237E",
    marginBottom: 8,
    fontWeight: "700",
    textAlign: "center",
  },
  stepDescription: {
    fontSize: 14,
    color: "#6B4FA0",
    fontWeight: "500",
    textAlign: "center",
  },

  stepContent: {
    marginBottom: 24,
  },

  buttonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#7B68EE",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 3,
    shadowColor: "#7B68EE",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7B68EE",
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonDisabledText: {
    color: "#999",
  },
  loginLinkWrapper: {
    alignItems: "center",
    marginTop: 16,
  },
  loginLinkText: {
    fontSize: 13,
    color: "#6B4FA0",
  },
  loginLinkTextBold: {
    fontWeight: "700",
    color: "#7B68EE",
  },
});
