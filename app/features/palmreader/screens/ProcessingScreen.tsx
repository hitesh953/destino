/**
 * ProcessingScreen - Real Palm Analysis Processing
 * Drives its UI entirely off real async state — no fixed timers pretending
 * work has completed. Two real network calls: validate (is this photo
 * usable?) then analyze (the actual reading), both against the real
 * captured image, both server-side.
 */

import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Dimensions, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as FileSystem from "expo-file-system/legacy";
import { palmColors } from "@/theme/palmreader/colors";
import { ANIMATION_TIMINGS } from "@/utils/animations/timings";
import { usePalmStore } from "@/stores";
import { validatePalmScan, analyzePalmScan } from "@/services/aiLogic/generativeAiService";
import { compressPalmImage } from "@/services/imageProcessing/palmImageCompressor";
import { getPalmScanErrorMessage, type PalmScanErrorCode } from "@/utils/palmScanErrors";
import type { RootStackParamList } from "@/navigation/RootNavigator";

const { width } = Dimensions.get("window");
const MANDALA_SIZE = Math.min(width * 0.55, 220);
const PARTICLE_COUNT = 10;

type ProcessingStatus = "capturing" | "validating" | "processing" | "analyzed" | "failed";

interface ProcessingScreenProps {
  route: RouteProp<RootStackParamList, "Processing">;
}

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ route }) => {
  const navigation = useNavigation<NavigationType>();
  const { capturedImageUri } = route.params;
  const { addReading, saveToStorage } = usePalmStore();

  const [status, setStatus] = useState<ProcessingStatus>("capturing");
  const [errorCode, setErrorCode] = useState<PalmScanErrorCode | null>(null);
  const [imageCaptured, setImageCaptured] = useState(false);
  const [palmDetected, setPalmDetected] = useState(false);

  const mandalaRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    mandalaRotation.value = withRepeat(
      withTiming(360, { duration: ANIMATION_TIMINGS.processing.mandalaRotation, easing: Easing.linear }),
      -1,
      false
    );
    runPipeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fail = (code: PalmScanErrorCode) => {
    setErrorCode(code);
    setStatus("failed");
  };

  const runPipeline = async () => {
    if (!capturedImageUri) {
      fail("IMAGE_PROCESSING_FAILED");
      return;
    }

    // Stage 1: real image compression + encoding.
    let imageBase64: string;
    try {
      const compressed = await compressPalmImage(capturedImageUri, {
        maxDimension: 2048,
        quality: 0.85,
        format: "jpeg",
      });
      imageBase64 = await FileSystem.readAsStringAsync(compressed.uri, { encoding: "base64" });
      setImageCaptured(true);
    } catch (error) {
      console.error("❌ [PROCESSING] Image compression/encoding failed:", error);
      fail("IMAGE_PROCESSING_FAILED");
      return;
    }

    // Stage 2: real validation against the actual photo.
    setStatus("validating");
    glowOpacity.value = withTiming(0.6, { duration: 200 });
    try {
      const validation = await validatePalmScan(imageBase64, "image/jpeg");
      if (!validation.valid) {
        console.warn("⚠️ [PROCESSING] Palm validation failed:", validation.issue, validation.message);
        fail((validation.issue as PalmScanErrorCode) || "NO_HAND");
        return;
      }
      setPalmDetected(true);
    } catch (error) {
      console.error("❌ [PROCESSING] Validation request failed:", error);
      fail((error as { code?: PalmScanErrorCode })?.code || "AI_REQUEST_FAILED");
      return;
    }

    // Stage 3: real analysis of the actual photo.
    setStatus("processing");
    glowOpacity.value = withTiming(0.8, { duration: 200 });
    try {
      const { readingId, analysis } = await analyzePalmScan({
        imageBase64,
        mimeType: "image/jpeg",
      });

      addReading({
        id: readingId,
        timestamp: Date.now(),
        palmImageUri: capturedImageUri,
        analysis: {
          loveLife: analysis.love,
          career: analysis.career,
          health: analysis.generalGuidance,
          finance: analysis.wealth,
        },
        predictions: [
          { icon: "❤️", title: "Love", description: analysis.love },
          { icon: "💼", title: "Career", description: analysis.career },
          { icon: "💰", title: "Wealth", description: analysis.wealth },
          { icon: "🧭", title: "Guidance", description: analysis.generalGuidance },
        ],
        metadata: { processingTimeMs: 0, modelVersion: "gemini-3.8-flash", imageQuality: "high" },
        isFavorite: false,
      });
      await saveToStorage();

      setStatus("analyzed");
      navigation.replace("ReadingResult", { readingId });
    } catch (error) {
      console.error("❌ [PROCESSING] Analysis request failed:", error);
      fail((error as { code?: PalmScanErrorCode })?.code || "AI_REQUEST_FAILED");
    }
  };

  const handleRetry = () => {
    navigation.replace("Camera");
  };

  const mandalaStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${mandalaRotation.value}deg` }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  const stageLabel =
    status === "capturing"
      ? "Preparing your photo..."
      : status === "validating"
        ? "Checking your photo..."
        : status === "processing"
          ? "Analyzing your palm..."
          : status === "analyzed"
            ? "Done!"
            : "Something went wrong";

  if (status === "failed") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.failedContainer}>
          <Text style={styles.failedEmoji}>🖐️</Text>
          <Text style={styles.failedTitle}>We couldn't analyze your palm</Text>
          <Text style={styles.failedMessage}>{getPalmScanErrorMessage(errorCode || "AI_REQUEST_FAILED")}</Text>
          <Pressable style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={false}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.titleSection}>
          <Text style={styles.mainTitle}>AI Reading Your Palm...</Text>
          <Text style={styles.subtitle}>{stageLabel}</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(400).delay(200)} style={styles.mandalaContainer}>
          <Animated.View style={[styles.glowRing, glowStyle]} />
          <Animated.View style={[styles.mandalaCircle, mandalaStyle]}>
            {Array.from({ length: PARTICLE_COUNT }).map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.particle,
                  { transform: [{ rotate: `${(360 / PARTICLE_COUNT) * index}deg` }, { translateY: -(MANDALA_SIZE / 2 + 35) }] },
                  mandalaStyle,
                ]}
              >
                <View style={styles.particleDot} />
              </Animated.View>
            ))}
            <View style={styles.innerHalo} />
            <View style={styles.imageContainer}>
              {capturedImageUri ? (
                <Image source={{ uri: capturedImageUri }} style={styles.palmImage} resizeMode="cover" />
              ) : (
                <Text style={styles.palmPlaceholder}>🖐️</Text>
              )}
            </View>
          </Animated.View>
        </Animated.View>

        {/* Real progress checklist — each line only checks off once that step actually completed. */}
        <Animated.View style={styles.checklistSection}>
          <ChecklistItem label="Palm image captured" done={imageCaptured} />
          <ChecklistItem label="Palm detected" done={palmDetected} />
          <ChecklistItem
            label="Analyzing palm structure..."
            done={status === "analyzed"}
            active={status === "processing"}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ChecklistItem: React.FC<{ label: string; done: boolean; active?: boolean }> = ({ label, done, active }) => (
  <View style={styles.checklistItem}>
    <Text style={styles.checklistIcon}>{done ? "✓" : active ? "●" : "○"}</Text>
    <Text style={[styles.checklistLabel, done && styles.checklistLabelDone]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palmColors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  titleSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: palmColors.accent,
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
    backgroundColor: "rgba(107, 79, 160, 0.4)",
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
  innerHalo: {
    position: "absolute",
    width: MANDALA_SIZE - 40,
    height: MANDALA_SIZE - 40,
    borderRadius: (MANDALA_SIZE - 40) / 2,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
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

  checklistSection: {
    gap: 12,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 58, 127, 0.6)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  checklistIcon: {
    width: 28,
    fontSize: 16,
    fontWeight: "700",
    color: palmColors.accent,
  },
  checklistLabel: {
    fontSize: 14,
    color: palmColors.surface,
    opacity: 0.7,
  },
  checklistLabelDone: {
    opacity: 1,
    fontWeight: "600",
  },

  failedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  failedEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  failedTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: palmColors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  failedMessage: {
    fontSize: 15,
    color: palmColors.textDim,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },
  retryButton: {
    backgroundColor: palmColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
  },
  retryButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  retryButtonText: {
    color: palmColors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
});
