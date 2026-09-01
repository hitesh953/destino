/**
 * CameraScreen - Capture Palm Image & Collect User Data
 *
 * Flow:
 * 1. Camera - Capture palm image
 * 2. Nickname - Optional user name (skip allowed)
 * 3. Age Choice - Choose between approximate age or exact DOB
 * 4. Age Input - Enter age or date of birth
 * 5. Enhanced Reading - Optional birthplace for astrology
 * 6. Preview - Review collected data before submitting
 */

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Alert,
  ActivityIndicator,
  Dimensions,
  TextInput,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import DateTimePicker from "@react-native-community/datetimepicker";
import Animated, {
  SlideInRight,
  SlideOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { palmColors } from "@/theme/palmreader/colors";
import { ANIMATION_TIMINGS } from "@/utils/animations/timings";
import { usePalmStore } from "@/stores";
import {
  initializeHandDetector,
  detectHandInFrame,
  cleanupHandDetector,
} from "@/services/palmReading/mediaPipeHandDetection";
import type { RootStackParamList, UserData } from "@/navigation/RootNavigator";

const { height } = Dimensions.get("window");

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

type FlowStep = "camera" | "nickname" | "ageChoice" | "ageInput" | "enhancedReading" | "preview";

export const CameraScreen: React.FC = () => {
  const navigation = useNavigation<NavigationType>();
  const cameraRef = useRef<CameraView>(null);

  // Camera state
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // Hand detection state
  const [isPalmDetected, setIsPalmDetected] = useState(false);
  const [isPalmValid, setIsPalmValid] = useState(false);
  const [detectionFeedback, setDetectionFeedback] = useState(
    "Positioning palm..."
  );
  const [detectionConfidence, setDetectionConfidence] = useState(0);

  // Flow state
  const [currentStep, setCurrentStep] = useState<FlowStep>("camera");
  const [userData, setUserData] = useState<UserData>({
    palmImage: null,
    nickname: null,
    ageType: null,
    age: null,
    dateOfBirth: null,
    birthplace: null,
    includeEnhancedReading: false,
  });

  // Form state
  const [nicknameInput, setNicknameInput] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [birthplaceInput, setBirthplaceInput] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Animation values
  const captureOpacity = useSharedValue(0);
  const captureScale = useSharedValue(1);

  // Initialize hand detector and request permissions
  useEffect(() => {
    const setupCamera = async () => {
      await requestCameraPermissions();
      const initialized = await initializeHandDetector();
      if (!initialized) {
        Alert.alert(
          "Hand Detection",
          "Failed to initialize hand detection. Using basic detection."
        );
      }
    };
    setupCamera();

    // Cleanup on unmount
    return () => {
      cleanupHandDetector();
    };
  }, []);

  const requestCameraPermissions = async () => {
    const { granted } = await requestPermission();
    if (!granted) {
      Alert.alert(
        "Camera Permission Required",
        "To capture your palm image, we need access to your camera. Please enable camera permissions in settings.",
        [
          {
            text: "Go to Settings",
            onPress: () => {
              // In a real app, this would open device settings
              // For now, we'll just go back
              navigation.goBack();
            },
          },
          {
            text: "Cancel",
            onPress: () => navigation.goBack(),
            style: "cancel",
          },
        ]
      );
    }
  };

  // Handle continuous hand detection analysis (simulated)
  useEffect(() => {
    if (currentStep !== "camera" || !cameraReady) {
      return;
    }

    // Simulate hand detection without capturing actual frames
    // This avoids unwanted captures while providing realistic feedback
    const analyzeInterval = setInterval(() => {
      try {
        // Simulate detection using timestamp and random variations
        // This mimics MediaPipe detection without actual frame capture
        const result = detectHandInFrame("simulated", Date.now());

        // Update detection state
        setIsPalmDetected(result.isDetected);
        setIsPalmValid(result.isPalmValid);
        setDetectionFeedback(result.feedback);
        setDetectionConfidence(result.confidence);
      } catch (error) {
        console.debug("Detection analysis error:", error);
      }
    }, 500); // Analyze every 500ms (non-blocking)

    return () => clearInterval(analyzeInterval);
  }, [currentStep, cameraReady]);

  const handleCapture = async () => {
    // Strict validation - only capture when all conditions are met
    if (!cameraRef.current) {
      console.warn("Camera ref not available");
      return;
    }
    if (isCapturing) {
      console.warn("Already capturing");
      return;
    }
    if (!cameraReady) {
      console.warn("Camera not ready");
      return;
    }
    if (!isPalmValid) {
      console.warn("Palm not valid - capture disabled");
      Alert.alert("Palm Not Detected", "Please position your palm correctly before capturing.");
      return;
    }

    try {
      setIsCapturing(true);
      console.log("🎥 Starting capture...");

      // Capture high-quality photo for palm reading
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        skipProcessing: false,
      });

      if (photo && photo.uri) {
        console.log("✅ Photo captured:", photo.uri);

        // Trigger capture animation
        captureOpacity.value = withTiming(1, {
          duration: 300,
        });
        captureScale.value = withTiming(1.1, {
          duration: 300,
        });

        // Wait for animation to complete, then move to next step
        setTimeout(() => {
          setUserData((prev) => ({
            ...prev,
            palmImage: photo.uri,
          }));
          setCurrentStep("nickname");
          setIsCapturing(false);
        }, 500);
      } else {
        console.error("Photo URI not available");
        Alert.alert("Error", "Failed to capture photo. Please try again.");
        setIsCapturing(false);
      }
    } catch (error) {
      console.error("Error capturing photo:", error);
      Alert.alert("Error", "Failed to capture photo. Please try again.");
      setIsCapturing(false);
    }
  };

  // =======================================
  // Multi-Step Flow Handlers
  // =======================================

  const handleNicknameNext = () => {
    setUserData((prev: UserData) => ({
      ...prev,
      nickname: nicknameInput.trim() || null,
    }));
    setCurrentStep("ageChoice");
  };

  const handleAgeChoiceSelect = (type: "approximate" | "exact") => {
    setUserData((prev: UserData) => ({
      ...prev,
      ageType: type,
    }));
    setCurrentStep("ageInput");
  };

  const handleAgeInputNext = () => {
    if (userData.ageType === "approximate") {
      const age = parseInt(ageInput, 10);
      if (isNaN(age) || age < 1 || age > 149) {
        Alert.alert("Invalid Age", "Please enter an age between 1 and 149.");
        return;
      }
      setUserData((prev: UserData) => ({
        ...prev,
        age,
      }));
    }
    setCurrentStep("enhancedReading");
  };

  const handleDateSelect = (_event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setUserData((prev: UserData) => ({
        ...prev,
        dateOfBirth: date,
      }));
      setCurrentStep("enhancedReading");
    }
  };

  const handleEnhancedReadingContinue = () => {
    if (birthplaceInput.trim()) {
      setUserData((prev: UserData) => ({
        ...prev,
        birthplace: birthplaceInput.trim(),
        includeEnhancedReading: true,
      }));
    }
    setCurrentStep("preview");
  };

  const handleSubmitData = async () => {
    try {
      setIsCapturing(true);
      const readingId = `reading_${Date.now()}`;

      // Navigate to processing screen with user data
      navigation.replace("Processing", {
        capturedImageUri: userData.palmImage || "",
        readingId,
        userData: userData,
      } as never);
    } catch (error) {
      console.error("Error submitting data:", error);
      Alert.alert("Error", "Failed to submit data. Please try again.");
      setIsCapturing(false);
    }
  };

  const goBackStep = () => {
    const stepOrder: FlowStep[] = [
      "camera",
      "nickname",
      "ageChoice",
      "ageInput",
      "enhancedReading",
      "preview",
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const captureAnimatedStyle = useAnimatedStyle(() => ({
    opacity: captureOpacity.value,
    transform: [{ scale: captureScale.value }],
  }));

  // If permission not determined yet
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palmColors.accent} />
          <Text style={styles.loadingText}>Requesting camera access...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If permission denied
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.deniedContainer}>
          <Text style={styles.deniedTitle}>Camera Access Required</Text>
          <Text style={styles.deniedText}>
            We need access to your camera to capture your palm for analysis.
          </Text>
          <Pressable
            style={styles.retryButton}
            onPress={requestCameraPermissions}
          >
            <Text style={styles.retryButtonText}>Request Permission</Text>
          </Pressable>
          <Pressable
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Camera step
  if (currentStep === "camera") {
    return (
      <SafeAreaView style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          onCameraReady={() => setCameraReady(true)}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Position Your Palm</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Guide Frame with Live Detection */}
          <View style={styles.guideContainer}>
            <Animated.View
              style={[
                styles.guideFrame,
                {
                  borderColor: isPalmValid
                    ? "#4CAF50" // Green for valid palm
                    : isPalmDetected
                    ? "#FFC107" // Yellow for detected but not ideal
                    : "#EF5350", // Red for no palm or invalid
                },
              ]}
            >
              <Text style={styles.guideText}>📐</Text>
              <Text style={styles.guideSubtext}>Center your palm here</Text>

              {/* Real-time Feedback */}
              <View
                style={[
                  styles.feedbackBadge,
                  {
                    backgroundColor: isPalmValid
                      ? "rgba(76, 175, 80, 0.2)"
                      : isPalmDetected
                      ? "rgba(255, 193, 7, 0.2)"
                      : "rgba(239, 83, 80, 0.2)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.feedbackText,
                    {
                      color: isPalmValid
                        ? "#4CAF50"
                        : isPalmDetected
                        ? "#FFC107"
                        : "#EF5350",
                    },
                  ]}
                >
                  {isPalmValid ? "✓" : isPalmDetected ? "⚠" : "✕"}{" "}
                  {detectionFeedback}
                </Text>
              </View>

              {/* Confidence Indicator */}
              {isPalmDetected && (
                <View style={styles.confidenceContainer}>
                  <View style={styles.confidenceBar}>
                    <View
                      style={[
                        styles.confidenceFill,
                        {
                          width: `${Math.min(detectionConfidence, 100)}%`,
                          backgroundColor: isPalmValid
                            ? "#4CAF50"
                            : "#FFC107",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.confidenceText}>
                    {Math.round(detectionConfidence)}% confidence
                  </Text>
                </View>
              )}
            </Animated.View>
          </View>

          {/* Capture Button Area */}
          <View style={styles.bottomContainer}>
            <Text
              style={[
                styles.instructionText,
                !isPalmValid && styles.instructionTextWarning,
              ]}
            >
              {isPalmValid
                ? "✓ Perfect! Ready to capture"
                : isPalmDetected
                ? "⚠ Adjust position for better detection"
                : "📍 Position your palm in the frame"}
            </Text>

            {/* Capture Flash Effect */}
            {isCapturing && (
              <Animated.View
                style={[styles.captureFlash, captureAnimatedStyle]}
              />
            )}

            {/* Capture Button - Only enabled when palm is valid */}
            <Pressable
              style={({ pressed }: { pressed: boolean }) => [
                styles.captureButton,
                pressed && !isCapturing && isPalmValid && styles.captureButtonPressed,
                (isCapturing || !cameraReady || !isPalmValid) &&
                  styles.captureButtonDisabled,
              ]}
              onPress={handleCapture}
              disabled={isCapturing || !cameraReady || !isPalmValid}
            >
              {isCapturing ? (
                <ActivityIndicator color={palmColors.accent} size="large" />
              ) : (
                <View style={styles.captureButtonInner}>
                  <View style={styles.captureButtonDot} />
                </View>
              )}
            </Pressable>

            <Text
              style={[
                styles.captureButtonLabel,
                !isPalmValid && styles.captureButtonLabelDisabled,
              ]}
            >
              {isCapturing
                ? "Capturing..."
                : isPalmValid
                ? "Tap to Capture"
                : "Waiting for palm..."}
            </Text>
          </View>
        </CameraView>
      </SafeAreaView>
    );
  }

  // Multi-step form screens (nickname, age choice, age input, enhanced reading, preview)
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.container}>
        <Animated.View
          entering={SlideInRight}
          exiting={SlideOutLeft}
          style={styles.formContainer}
        >
          {/* Header with back button */}
          <View style={styles.formHeader}>
            <Pressable
              onPress={currentStep === "nickname" ? () => setCurrentStep("camera") : goBackStep}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
            <View style={styles.progressIndicator}>
              <Text style={styles.progressText}>
                {currentStep === "nickname" && "1 of 5"}
                {currentStep === "ageChoice" && "2 of 5"}
                {currentStep === "ageInput" && "3 of 5"}
                {currentStep === "enhancedReading" && "4 of 5"}
                {currentStep === "preview" && "5 of 5"}
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.formContent}
            contentContainerStyle={styles.formContentContainer}
          >
            {/* Step 1: Nickname */}
            {currentStep === "nickname" && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>What's Your Name?</Text>
                <Text style={styles.stepSubtitle}>
                  Personalize your reading (optional)
                </Text>

                <TextInput
                  style={styles.textInput}
                  placeholder="Enter nickname or first name"
                  placeholderTextColor={palmColors.textDim}
                  value={nicknameInput}
                  onChangeText={setNicknameInput}
                  maxLength={50}
                />

                <Text style={styles.helperText}>
                  💡 You can skip this if you prefer not to share your name
                </Text>

                <Pressable
                  style={styles.primaryButton}
                  onPress={handleNicknameNext}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </Pressable>
              </View>
            )}

            {/* Step 2: Age Choice */}
            {currentStep === "ageChoice" && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Tell Us Your Age</Text>
                <Text style={styles.stepSubtitle}>Choose what works best for you</Text>

                <Pressable
                  style={styles.choiceCard}
                  onPress={() => handleAgeChoiceSelect("approximate")}
                >
                  <Text style={styles.choiceCardEmoji}>📅</Text>
                  <Text style={styles.choiceCardTitle}>Approximate Age</Text>
                  <Text style={styles.choiceCardDesc}>Just your age in years</Text>
                </Pressable>

                <Pressable
                  style={styles.choiceCard}
                  onPress={() => handleAgeChoiceSelect("exact")}
                >
                  <Text style={styles.choiceCardEmoji}>🎂</Text>
                  <Text style={styles.choiceCardTitle}>Exact Date of Birth</Text>
                  <Text style={styles.choiceCardDesc}>
                    For more accurate astrological insights
                  </Text>
                  <Text style={styles.badgeEnhanced}>✨ Enhanced Reading</Text>
                </Pressable>
              </View>
            )}

            {/* Step 3: Age Input */}
            {currentStep === "ageInput" && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>
                  {userData.ageType === "approximate" ? "How Old Are You?" : "When Were You Born?"}
                </Text>

                {userData.ageType === "approximate" ? (
                  <>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your age"
                      placeholderTextColor={palmColors.textDim}
                      value={ageInput}
                      onChangeText={setAgeInput}
                      keyboardType="number-pad"
                      maxLength={3}
                    />
                    <Text style={styles.helperText}>Age range: 1-149 years</Text>
                  </>
                ) : (
                  <>
                    <Pressable
                      style={styles.datePickerButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={styles.datePickerButtonText}>
                        {userData.dateOfBirth
                          ? userData.dateOfBirth.toLocaleDateString()
                          : "Select your date of birth"}
                      </Text>
                    </Pressable>
                    {showDatePicker && (
                      <DateTimePicker
                        value={userData.dateOfBirth || new Date(2000, 0, 1)}
                        mode="date"
                        display="spinner"
                        onChange={handleDateSelect}
                        maximumDate={new Date()}
                        minimumDate={new Date(1900, 0, 1)}
                      />
                    )}
                  </>
                )}

                <Pressable
                  style={styles.primaryButton}
                  onPress={handleAgeInputNext}
                  disabled={
                    userData.ageType === "approximate"
                      ? !ageInput.trim()
                      : !userData.dateOfBirth
                  }
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </Pressable>
              </View>
            )}

            {/* Step 4: Enhanced Reading */}
            {currentStep === "enhancedReading" && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Enhanced Reading</Text>
                <Text style={styles.stepSubtitle}>
                  Add birthplace for astrological insights (optional)
                </Text>

                <View style={styles.benefitsBox}>
                  <Text style={styles.benefitsTitle}>✨ Benefits of Enhanced Reading:</Text>
                  <Text style={styles.benefitItem}>• Astrological insights based on your location</Text>
                  <Text style={styles.benefitItem}>• Planetary influences at birth</Text>
                  <Text style={styles.benefitItem}>• More personalized interpretation</Text>
                </View>

                <TextInput
                  style={styles.textInput}
                  placeholder="City, Country (e.g., New York, USA)"
                  placeholderTextColor={palmColors.textDim}
                  value={birthplaceInput}
                  onChangeText={setBirthplaceInput}
                  maxLength={100}
                />

                <Text style={styles.helperText}>
                  💡 You can skip this and still get a great reading
                </Text>

                <Pressable
                  style={styles.primaryButton}
                  onPress={handleEnhancedReadingContinue}
                >
                  <Text style={styles.primaryButtonText}>
                    {birthplaceInput.trim() ? "Continue with Birthplace" : "Skip"}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Step 5: Preview */}
            {currentStep === "preview" && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Review Your Information</Text>
                <Text style={styles.stepSubtitle}>Everything looks good?</Text>

                {/* Palm Image Preview */}
                {userData.palmImage && (
                  <View style={styles.previewImageContainer}>
                    <Image
                      source={{ uri: userData.palmImage }}
                      style={styles.previewImage}
                    />
                  </View>
                )}

                {/* Data Summary */}
                <View style={styles.previewCard}>
                  {userData.nickname && (
                    <View style={styles.previewRow}>
                      <Text style={styles.previewLabel}>Name:</Text>
                      <Text style={styles.previewValue}>{userData.nickname}</Text>
                    </View>
                  )}

                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Age:</Text>
                    <Text style={styles.previewValue}>
                      {userData.ageType === "approximate"
                        ? `${userData.age} years old`
                        : userData.dateOfBirth?.toLocaleDateString()}
                    </Text>
                  </View>

                  {userData.birthplace && (
                    <View style={styles.previewRow}>
                      <Text style={styles.previewLabel}>Birthplace:</Text>
                      <Text style={styles.previewValue}>{userData.birthplace}</Text>
                    </View>
                  )}

                  {userData.includeEnhancedReading && (
                    <View style={styles.previewRow}>
                      <Text style={styles.enhancedBadge}>✨ Enhanced Analysis</Text>
                    </View>
                  )}
                </View>

                <View style={styles.buttonGroup}>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => setCurrentStep("nickname")}
                  >
                    <Text style={styles.secondaryButtonText}>Edit Information</Text>
                  </Pressable>

                  <Pressable
                    style={styles.primaryButton}
                    onPress={handleSubmitData}
                    disabled={isCapturing}
                  >
                    {isCapturing ? (
                      <ActivityIndicator color={palmColors.surface} />
                    ) : (
                      <Text style={styles.primaryButtonText}>Begin Reading</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palmColors.background,
  },
  camera: {
    flex: 1,
  },

  /* Loading State */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: palmColors.text,
  },

  /* Permission Denied State */
  deniedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: palmColors.background,
  },
  deniedTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: palmColors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  deniedText: {
    fontSize: 16,
    color: palmColors.textDim,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: palmColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  retryButtonText: {
    color: palmColors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    borderWidth: 2,
    borderColor: palmColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 28,
    width: "100%",
    alignItems: "center",
  },
  cancelButtonText: {
    color: palmColors.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: palmColors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },

  /* Guide Frame */
  guideContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  guideFrame: {
    width: "100%",
    height: 300,
    borderWidth: 3,
    borderColor: "rgba(212, 175, 55, 0.6)",
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Detection Feedback */
  feedbackBadge: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },

  /* Confidence Indicator */
  confidenceContainer: {
    marginTop: 12,
    width: "80%",
    alignItems: "center",
  },
  confidenceBar: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
    marginBottom: 6,
  },
  confidenceFill: {
    height: "100%",
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  guideText: {
    fontSize: 60,
    marginBottom: 12,
  },
  guideSubtext: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },

  /* Bottom Container */
  bottomContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 24,
    alignItems: "center",
  },
  instructionText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 18,
  },
  instructionTextWarning: {
    color: "#FFC107",
    fontWeight: "600",
  },

  /* Capture Button */
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palmColors.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: palmColors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  captureButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonDot: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: palmColors.accent,
  },
  captureButtonLabel: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  captureButtonLabelDisabled: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 13,
  },

  /* Capture Flash Effect */
  captureFlash: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: palmColors.accent,
    opacity: 0.8,
  },

  /* ========================================
     MULTI-STEP FORM STYLES
     ======================================== */

  formContainer: {
    flex: 1,
    backgroundColor: palmColors.background,
  },

  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palmColors.primary + "20",
  },

  progressIndicator: {
    backgroundColor: palmColors.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: palmColors.primary,
  },

  formContent: {
    flex: 1,
  },

  formContentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  stepContainer: {
    minHeight: height * 0.7,
    justifyContent: "center",
  },

  stepTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: palmColors.text,
    marginBottom: 8,
  },

  stepSubtitle: {
    fontSize: 16,
    color: palmColors.textDim,
    marginBottom: 32,
  },

  /* Text Inputs */
  textInput: {
    borderWidth: 2,
    borderColor: palmColors.primary + "40",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: palmColors.text,
    marginBottom: 16,
    backgroundColor: palmColors.surface,
  },

  helperText: {
    fontSize: 13,
    color: palmColors.textDim,
    marginBottom: 24,
    fontStyle: "italic",
  },

  /* Choice Cards */
  choiceCard: {
    borderWidth: 2,
    borderColor: palmColors.primary + "40",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backgroundColor: palmColors.surface,
    alignItems: "center",
  },

  choiceCardEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },

  choiceCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palmColors.text,
    marginBottom: 4,
  },

  choiceCardDesc: {
    fontSize: 14,
    color: palmColors.textDim,
    textAlign: "center",
  },

  badgeEnhanced: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: palmColors.accent + "20",
    color: palmColors.accent,
    fontSize: 12,
    fontWeight: "700",
    borderRadius: 20,
    overflow: "hidden",
  },

  /* Date Picker Button */
  datePickerButton: {
    borderWidth: 2,
    borderColor: palmColors.primary + "40",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    backgroundColor: palmColors.surface,
    alignItems: "center",
  },

  datePickerButtonText: {
    fontSize: 16,
    color: palmColors.text,
    fontWeight: "500",
  },

  /* Benefits Box */
  benefitsBox: {
    backgroundColor: palmColors.primary + "10",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: palmColors.primary,
  },

  benefitsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: palmColors.text,
    marginBottom: 8,
  },

  benefitItem: {
    fontSize: 13,
    color: palmColors.text,
    marginBottom: 4,
    lineHeight: 18,
  },

  /* Preview Card */
  previewCard: {
    backgroundColor: palmColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: palmColors.primary + "20",
  },

  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palmColors.primary + "15",
  },

  previewLabel: {
    fontSize: 14,
    color: palmColors.textDim,
    fontWeight: "600",
  },

  previewValue: {
    fontSize: 14,
    color: palmColors.text,
    fontWeight: "500",
  },

  enhancedBadge: {
    fontSize: 13,
    color: palmColors.accent,
    fontWeight: "700",
  },

  /* Preview Image */
  previewImageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
    backgroundColor: palmColors.primary + "10",
  },

  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  /* Buttons */
  primaryButton: {
    backgroundColor: palmColors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: palmColors.surface,
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    backgroundColor: palmColors.surface,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: palmColors.primary,
  },

  secondaryButtonText: {
    color: palmColors.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  buttonGroup: {
    gap: 12,
  },
});
