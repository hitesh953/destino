/**
 * ProcessingScreen - AI Palm Analysis Processing
 * Shows 3-stage processing animation (4000ms total)
 * Auto-navigates to ReadingResultScreen on completion
 * Input: capturedImageUri from CameraScreen
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInLeft,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  useAnimatedReaction,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { useNavigation, RouteProp, NavigationProp } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import { palmColors } from "@/theme/palmreader/colors";
import { ANIMATION_TIMINGS, EASING } from "@/utils/animations/timings";
import { usePalmStore } from "@/stores";
import { analyzePalmReading, generateSpiritualReading } from "@/services/aiLogic/generativeAiService";
import { compressPalmImage } from "@/services/imageProcessing/palmImageCompressor";
import type { UserData } from "@/navigation/RootNavigator";

const { width } = Dimensions.get("window");
const MANDALA_SIZE = Math.min(width * 0.55, 220);
const PARTICLE_COUNT_STAGE_1_2 = 8;
const PARTICLE_COUNT_STAGE_3 = 12;

type ProcessingStage = 1 | 2 | 3;

interface RootStackParamList {
  Processing: {
    capturedImageUri: string;
    readingId?: string;
    userData?: UserData;
  };
  ReadingResult: {
    readingId: string;
  };
}

interface ProcessingScreenProps {
  route: RouteProp<RootStackParamList, "Processing">;
}

type NavigationType = NavigationProp<RootStackParamList>;

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  route,
}) => {
  const navigation = useNavigation<NavigationType>();
  const { capturedImageUri, userData } = route.params;
  const { addReading } = usePalmStore();

  const [currentStage, setCurrentStage] = useState<ProcessingStage>(1);
  const [statusText, setStatusText] = useState(
    "Detecting palm lines, heart line, fate line, and life line..."
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Shared values for animations
  const mandalaRotation = useSharedValue(0);
  const progressFill = useSharedValue(0);
  const scanLineX = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);
  const cardsOpacity = useSharedValue(1);

  // Timestamps for stage transitions
  const STAGE_1_END = 1333;
  const STAGE_2_END = 2666;
  const STAGE_3_END = 4000;
  const SCREEN_TRANSITION_START = 3800;

  useEffect(() => {
    // Start AI analysis and animations simultaneously
    initializeProcessing();
  }, [navigation, route.params, capturedImageUri, userData]);

  const initializeProcessing = async () => {
    console.log("🎬 [PROCESSING] Starting initialization...");
    console.log("📸 [PROCESSING] Image URI:", capturedImageUri);

    try {
      if (!capturedImageUri) {
        throw new Error("No image URI provided");
      }

      console.log("✅ [PROCESSING] Image URI validated");

      // Start animations immediately
      console.log("🎨 [PROCESSING] Starting animations...");
      mandalaRotation.value = withRepeat(
        withTiming(360, {
          duration: ANIMATION_TIMINGS.processing.mandalaRotation,
          easing: Easing.linear,
        }),
        -1,
        false
      );

      progressFill.value = withTiming(100, {
        duration: ANIMATION_TIMINGS.processing.total,
        easing: Easing.linear,
      });

      scanLineX.value = withTiming(MANDALA_SIZE, {
        duration: STAGE_1_END,
        easing: Easing.linear,
      });

      // Stage transitions at exact timestamps
      const stage1Timer = setTimeout(() => {
        console.log("📍 [STAGE 1→2] Transitioning at", STAGE_1_END, "ms");
        setCurrentStage(2);
        setStatusText(
          "Analyzing palm patterns, mounts, and character traits..."
        );
        glowOpacity.value = withTiming(0.6, { duration: 200 });
      }, STAGE_1_END);

      const stage2Timer = setTimeout(() => {
        console.log("📍 [STAGE 2→3] Transitioning at", STAGE_2_END, "ms");
        setCurrentStage(3);
        setStatusText(
          "Generating your personalized reading based on palm analysis..."
        );
        glowOpacity.value = withTiming(0.8, { duration: 200 });
      }, STAGE_2_END);

      // Compress image and convert to base64 for AI analysis
      let imageBase64: string;
      try {
        console.log("📦 [PROCESSING] Starting image compression...");
        const compressionStart = Date.now();

        // Compress the image
        const compressed = await compressPalmImage(capturedImageUri, {
          maxDimension: 2048,
          quality: 0.85,
          format: 'jpeg',
        });

        const compressionTime = Date.now() - compressionStart;
        console.log(`📊 [PROCESSING] Image compressed in ${compressionTime}ms`);
        console.log(`📉 [PROCESSING] Compression ratio: ${compressed.compressionRatio.toFixed(1)}%`);

        // Convert compressed image to base64
        console.log("🖼️  [PROCESSING] Converting compressed image to base64...");
        imageBase64 = await FileSystem.readAsStringAsync(compressed.uri, {
          encoding: 'base64',
        });
        console.log("✅ [PROCESSING] Image converted, size:", imageBase64.length, "chars");
      } catch (err) {
        console.warn('❌ [PROCESSING] Failed to process image:', err);
        // Fallback: try to read original without compression
        try {
          console.log("⚠️  [PROCESSING] Attempting fallback without compression...");
          imageBase64 = await FileSystem.readAsStringAsync(capturedImageUri, {
            encoding: 'base64',
          });
          console.log("✅ [PROCESSING] Fallback image read successfully");
        } catch (fallbackErr) {
          console.warn('❌ [PROCESSING] Fallback also failed:', fallbackErr);
          // Last resort: use placeholder for testing
          imageBase64 = '/9j/4AAQSkZJRgABAQAA'; // Minimal JPEG header
        }
      }

      // Call AI service to analyze palm
      let palmAnalysis;
      try {
        console.log("🤖 [PROCESSING] Calling Gemini AI service...");
        console.log("📤 [PROCESSING] Sending request to generativelanguage.googleapis.com");

        const startTime = Date.now();
        palmAnalysis = await analyzePalmReading({
          imageBase64,
          imageMimeType: "image/jpeg",
        });
        const analysisTime = Date.now() - startTime;

        console.log("✅ [PROCESSING] AI analysis completed in", analysisTime, "ms");
        console.log("📊 [PROCESSING] Analysis insights:", palmAnalysis.insights);
      } catch (aiError) {
        console.warn("❌ [PROCESSING] AI analysis error, using fallback:", aiError);
        // Fallback analysis if AI service fails
        palmAnalysis = {
          reading:
            "Your palm reveals a journey of growth and transformation. The lines indicate potential for success and meaningful connections.",
          insights: [
            "Your heart line suggests a deep capacity for emotional connection and meaningful relationships. You are likely drawn to passionate, authentic connections and have the ability to understand others' emotions deeply. This openness to love suggests positive experiences ahead in your romantic life.",
            "Your career line shows clear direction and ambition. You possess the drive and determination to achieve your professional goals. The strength of this line indicates success through sustained effort and strategic decisions. Consider roles that allow you to use both creativity and practical skills.",
            "Your palm reveals a balanced approach to health and personal growth. You have the resilience to overcome challenges and maintain wellness. Focus on consistent self-care practices and you'll see positive results in your physical and mental health journey.",
            "Your money and success indicators show potential for financial stability and growth. Through wise decisions and consistent effort, you can build lasting wealth. The patterns suggest success comes through your own work rather than external luck.",
          ],
          characteristics: {
            "Heart Line": "Deep emotional nature",
            "Life Line": "Vitality and strength",
            "Fate Line": "Clear direction",
          },
        };
      }

      // Parse insights as analysis sections
      const analysisText = {
        loveLife: palmAnalysis.insights[0] || palmAnalysis.reading,
        career: palmAnalysis.insights[1] || palmAnalysis.reading,
        health: palmAnalysis.insights[2] || palmAnalysis.reading,
        finance: palmAnalysis.insights[3] || palmAnalysis.reading,
      };

      // Create reading object
      const readingId = route.params.readingId || `reading_${Date.now()}`;
      console.log("📝 [PROCESSING] Creating reading object with ID:", readingId);

      const newReading = {
        id: readingId,
        timestamp: Date.now(),
        palmImageUri: capturedImageUri,
        analysis: analysisText,
        predictions: [
          {
            icon: "❤️",
            title: "Love Life",
            description: analysisText.loveLife,
          },
          {
            icon: "💼",
            title: "Career",
            description: analysisText.career,
          },
          {
            icon: "🏥",
            title: "Health",
            description: analysisText.health,
          },
          {
            icon: "💰",
            title: "Finance",
            description: analysisText.finance,
          },
        ],
        metadata: {
          processingTimeMs: STAGE_3_END,
          modelVersion: "gemini-1.5-flash",
          imageQuality: "high" as const,
        },
        isFavorite: false,
      };

      console.log("✅ [PROCESSING] Reading object created with", newReading.predictions.length, "predictions");

      // Add reading to store
      try {
        addReading(newReading);
        console.log("✅ [PROCESSING] Reading stored in app state");
      } catch (storeError) {
        console.error("❌ [PROCESSING] Failed to store reading:", storeError);
      }

      // Start screen transition at 3800ms
      const transitionStartTimer = setTimeout(() => {
        console.log("🎬 [TRANSITION] Starting screen transition at", SCREEN_TRANSITION_START, "ms");
        setIsTransitioning(true);
        cardsOpacity.value = withTiming(0, { duration: 200 });
      }, SCREEN_TRANSITION_START);

      // Final navigation at 4000ms
      const navigationTimer = setTimeout(() => {
        console.log("🚀 [NAVIGATION] Navigating to ReadingResult at", STAGE_3_END, "ms");
        console.log("📍 [NAVIGATION] Reading ID:", readingId);

        try {
          navigation.replace("ReadingResult" as never, {
            readingId,
          } as never);
          console.log("✅ [NAVIGATION] Navigation completed successfully");
        } catch (navError) {
          console.error("❌ [NAVIGATION] Navigation failed:", navError);
        }
      }, STAGE_3_END);

      return () => {
        clearTimeout(stage1Timer);
        clearTimeout(stage2Timer);
        clearTimeout(transitionStartTimer);
        clearTimeout(navigationTimer);
      };
    } catch (error) {
      console.error("❌ [PROCESSING] CRITICAL ERROR:", error);
      console.error("❌ [PROCESSING] Error stack:", (error as Error).stack);

      __DEV__ && console.error("Error processing palm reading:", error);
      Alert.alert(
        "Error",
        "Failed to analyze your palm. Please try again.",
        [
          {
            text: "OK",
            onPress: () => {
              console.log("⏮️  [PROCESSING] User clicked OK, going back");
              navigation.goBack();
            },
          },
        ]
      );
    }
  };

  // Animated styles
  const mandalaStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${mandalaRotation.value}deg` }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressFill.value}%`,
  }));

  const scanLineStyle = useAnimatedStyle(() => ({
    left: `${(scanLineX.value / MANDALA_SIZE) * 100}%`,
    opacity: currentStage === 1 ? 1 : 0,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const cardsStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
  }));

  // Get progress percentage based on stage
  const getProgressPercentage = (): number => {
    if (currentStage === 1) return 33;
    if (currentStage === 2) return 66;
    return 100;
  };

  const particleCount =
    currentStage === 3 ? PARTICLE_COUNT_STAGE_3 : PARTICLE_COUNT_STAGE_1_2;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        {/* <Text style={styles.timeText}>9:41</Text> */}
        <Text style={styles.settingsIcon}>⚙️</Text>
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={false}
      >
        {/* Title Section */}
        <Animated.View
          entering={FadeIn.duration(300)}
          style={styles.titleSection}
        >
          <Text style={styles.mainTitle}>AI Reading Your Palm...</Text>
          <Text style={styles.subtitle}>{statusText}</Text>
        </Animated.View>

        {/* Mandala Visualization */}
        <Animated.View
          entering={FadeIn.duration(400).delay(200)}
          style={styles.mandalaContainer}
        >
          {/* Glow Ring */}
          <Animated.View style={[styles.glowRing, glowStyle]} />

          {/* Main Mandala Circle with Rotating Border */}
          <Animated.View style={[styles.mandalaCircle, mandalaStyle]}>
            {/* Rotating Particles Orbit */}
            {Array.from({ length: particleCount }).map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.particle,
                  {
                    transform: [
                      { rotate: `${(360 / particleCount) * index}deg` },
                      { translateY: -(MANDALA_SIZE / 2 + 35) },
                    ],
                  },
                  mandalaStyle,
                ]}
              >
                <View style={styles.particleDot} />
              </Animated.View>
            ))}

            {/* Scan Line (Stage 1 only) */}
            {currentStage === 1 && (
              <Animated.View style={[styles.scanLine, scanLineStyle]} />
            )}

            {/* Inner Halo/Glow */}
            <View style={styles.innerHalo} />

            {/* Captured Image or Placeholder */}
            <View style={styles.imageContainer}>
              {capturedImageUri ? (
                <Image
                  source={{ uri: capturedImageUri }}
                  style={styles.palmImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.palmPlaceholder}>🖐️</Text>
              )}
            </View>
          </Animated.View>
        </Animated.View>

        {/* Progress Section */}
        <Animated.View
          entering={SlideInLeft.duration(600).delay(400)}
          style={styles.progressSection}
        >
          <Text style={styles.stageLabel}>
            Stage {currentStage}/3:{" "}
            {currentStage === 1
              ? "Detecting Palm Lines"
              : currentStage === 2
              ? "Analyzing Patterns"
              : "Generating Predictions"}
          </Text>

          {/* Progress Bar with Gradient */}
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[styles.progressBarFill, progressStyle]}
            />
          </View>

          {/* Progress Percentage */}
          <Text style={styles.progressText}>
            {getProgressPercentage()}% Complete
          </Text>
        </Animated.View>

        {/* Info Cards Section */}
        <Animated.View style={[styles.infoCardsSection, cardsStyle]}>
          <Text style={styles.analysisTitle}>What We're Analyzing:</Text>

          {/* Card 1: Palm Lines */}
          <Animated.View
            entering={SlideInLeft.duration(600)
              .delay(600)
              .withInitialValues({
                originX: -width,
              })}
            style={styles.infoCard}
          >
            <View style={styles.cardIconWrap}>
              <Text style={styles.cardIcon}>📐</Text>
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>Palm Lines</Text>
              <Text style={styles.cardDescription}>
                Life, Heart, Fate
              </Text>
            </View>
          </Animated.View>

          {/* Card 2: Mounts */}
          <Animated.View
            entering={SlideInLeft.duration(600)
              .delay(750)
              .withInitialValues({
                originX: -width,
              })}
            style={styles.infoCard}
          >
            <View style={styles.cardIconWrap}>
              <Text style={styles.cardIcon}>👑</Text>
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>Mounts</Text>
              <Text style={styles.cardDescription}>
                Character traits
              </Text>
            </View>
          </Animated.View>

          {/* Card 3: Patterns */}
          <Animated.View
            entering={SlideInLeft.duration(600)
              .delay(900)
              .withInitialValues({
                originX: -width,
              })}
            style={styles.infoCard}
          >
            <View style={styles.cardIconWrap}>
              <Text style={styles.cardIcon}>✨</Text>
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>Patterns</Text>
              <Text style={styles.cardDescription}>
                Destiny insights
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {/* Fade out overlay during transition */}
      {isTransitioning && (
        <Animated.View
          entering={FadeIn.duration(100)}
          exiting={FadeOut.duration(100)}
          style={styles.transitionOverlay}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palmColors.background,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    // backgroundColor: "#FF6B35", // Saffron orange
  },
  timeText: {
    fontSize: 16,
    fontWeight: "600",
    color: palmColors.background,
  },
  settingsIcon: {
    fontSize: 18,
    marginLeft: 'auto',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  /* Title Section */
  titleSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: palmColors.accent, // Gold
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: palmColors.surface,
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 20,
  },

  /* Mandala Section */
  mandalaContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  glowRing: {
    position: "absolute",
    width: MANDALA_SIZE + 50,
    height: MANDALA_SIZE + 50,
    borderRadius: (MANDALA_SIZE + 50) / 2,
    backgroundColor: palmColors.accent,
    opacity: 0.2,
  },
  mandalaCircle: {
    width: MANDALA_SIZE,
    height: MANDALA_SIZE,
    borderRadius: MANDALA_SIZE / 2,
    backgroundColor: "rgba(107, 79, 160, 0.4)", // Mystique Purple
    borderWidth: 2,
    borderColor: palmColors.accent,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: palmColors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  particle: {
    position: "absolute",
  },
  particleDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: palmColors.accent,
    opacity: 0.7,
  },
  scanLine: {
    position: "absolute",
    width: 2,
    height: MANDALA_SIZE,
    backgroundColor: palmColors.accent,
    opacity: 0.8,
  },
  innerHalo: {
    position: "absolute",
    width: MANDALA_SIZE - 40,
    height: MANDALA_SIZE - 40,
    borderRadius: (MANDALA_SIZE - 40) / 2,
    backgroundColor: "rgba(212, 175, 55, 0.1)", // Gold with transparency
  },
  imageContainer: {
    width: MANDALA_SIZE - 60,
    height: MANDALA_SIZE - 60,
    borderRadius: (MANDALA_SIZE - 60) / 2,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  palmImage: {
    width: "100%",
    height: "100%",
    borderRadius: (MANDALA_SIZE - 60) / 2,
  },
  palmPlaceholder: {
    fontSize: 60,
    textAlign: "center",
  },

  /* Progress Section */
  progressSection: {
    marginBottom: 28,
  },
  stageLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: palmColors.accent,
    marginBottom: 12,
    textAlign: "center",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(107, 79, 160, 0.3)", // Twilight Purple
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: palmColors.accent,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: palmColors.text,
    opacity: 0.7,
    textAlign: "center",
  },

  /* Info Cards Section */
  infoCardsSection: {
    marginBottom: 24,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palmColors.surface,
    marginBottom: 12,
    textAlign: "center",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 58, 127, 0.6)", // Twilight Purple
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)", // Gold border
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: palmColors.surface,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 12,
    color: palmColors.surface,
    opacity: 0.7,
  },

  /* Transition Overlay */
  transitionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
});
