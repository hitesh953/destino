/**
 * ReadingResultScreen - Display Real Palm Reading Results
 * Reads the analysis from Firestore by readingId (the real source of
 * truth, written server-side once analysis succeeds) rather than a local
 * store lookup.
 */

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Share, Dimensions, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, SlideInLeft } from "react-native-reanimated";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/services/firestore";
import { palmColors } from "@/theme/palmreader/colors";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import type { PalmAnalysisResult } from "@/services/aiLogic/generativeAiService";

const { width } = Dimensions.get("window");

interface ReadingResultScreenProps {
  route: RouteProp<RootStackParamList, "ReadingResult">;
}

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

interface ReadingData {
  analysis: PalmAnalysisResult;
  isFavorite: boolean;
}

const PALM_LINE_LABELS: Array<{ key: keyof PalmAnalysisResult["palmStructure"]; label: string }> = [
  { key: "heartLine", label: "Heart Line" },
  { key: "headLine", label: "Head Line" },
  { key: "lifeLine", label: "Life Line" },
  { key: "fateLine", label: "Fate Line" },
  { key: "sunLine", label: "Sun Line" },
];

export const ReadingResultScreen: React.FC<ReadingResultScreenProps> = ({ route }) => {
  const navigation = useNavigation<NavigationType>();
  const { readingId } = route.params;

  const [reading, setReading] = useState<ReadingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    loadReading();
  }, [readingId]);

  const loadReading = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const snap = await getDoc(doc(db, "readings", readingId));
      if (!snap.exists()) {
        setLoadError(true);
        return;
      }
      const data = snap.data();
      setReading({ analysis: data.analysis, isFavorite: !!data.isFavorite });
    } catch (error) {
      console.error("Error loading reading:", error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!reading) return;
    try {
      const { analysis } = reading;
      const shareMessage = `✨ I just got my palm reading from DESTINO AI!\n\n${analysis.summary}\n\nDiscover your destiny too! 🖐️`;
      await Share.share({ message: shareMessage, title: "My Palm Reading" });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleSave = async () => {
    if (!reading || reading.isFavorite) return;
    try {
      await updateDoc(doc(db, "readings", readingId), { isFavorite: true });
      setReading({ ...reading, isFavorite: true });
    } catch (error) {
      console.error("Error saving reading:", error);
    }
  };

  const handleNewReading = () => {
    navigation.replace("Welcome");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={palmColors.accent} />
          <Text style={styles.loadingText}>Loading your reading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadError || !reading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.failedTitle}>We couldn't load this reading</Text>
          <Pressable style={styles.retryButton} onPress={loadReading}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
          <Pressable style={styles.tertiaryButton} onPress={handleNewReading}>
            <Text style={styles.tertiaryButtonText}>🖐️ Take Another Reading</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const { analysis } = reading;
  const predictions = [
    { icon: "❤️", title: "Love", description: analysis.love },
    { icon: "💼", title: "Career", description: analysis.career },
    { icon: "💰", title: "Wealth", description: analysis.wealth },
    { icon: "🧭", title: "Guidance", description: analysis.generalGuidance },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(500)} style={styles.titleSection}>
          <Text style={styles.emoji}>✨</Text>
          <Text style={styles.mainTitle}>Your Destiny Revealed</Text>
          <Text style={styles.subtitle}>Your palm holds the secrets of your future</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(600).delay(200)} style={styles.readingTextSection}>
          <Text style={styles.readingText}>{analysis.summary}</Text>
        </Animated.View>

        {/* Palm Lines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📐 Your Palm Lines</Text>
          {PALM_LINE_LABELS.map(({ key, label }) => {
            const value = analysis.palmStructure[key];
            const notDetected = !value || value === "not_detected";
            return (
              <View key={key} style={styles.lineRow}>
                <Text style={styles.lineLabel}>{label}</Text>
                <Text style={[styles.lineText, notDetected && styles.lineTextMuted]}>
                  {notDetected ? "Not clearly visible in this photo" : value}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Personality */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧬 Personality</Text>
          <Text style={styles.personalitySummary}>{analysis.personality.summary}</Text>
          <View style={styles.chipsRow}>
            {analysis.personality.traits.map((trait) => (
              <View key={trait} style={styles.chip}>
                <Text style={styles.chipText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Predictions Cards */}
        <View style={styles.predictionsSection}>
          <Text style={styles.predictionsTitle}>Four Pillars of Your Destiny</Text>
          {predictions.map((prediction, index) => (
            <Animated.View
              key={prediction.title}
              entering={SlideInLeft.duration(600).delay(400 + index * 150).withInitialValues({ originX: -width })}
              style={styles.predictionCard}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardIcon}>{prediction.icon}</Text>
                <Text style={styles.cardTitle}>{prediction.title}</Text>
              </View>
              <Text style={styles.cardDescription}>{prediction.description}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Action Buttons */}
        <Animated.View entering={FadeIn.duration(500).delay(1000)} style={styles.buttonsSection}>
          <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]} onPress={handleShare}>
            <Text style={styles.primaryButtonText}>📤 Share Your Reading</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]} onPress={handleSave}>
            <Text style={styles.secondaryButtonText}>{reading.isFavorite ? "💾 Saved" : "💾 Save to Collection"}</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.tertiaryButton, pressed && styles.buttonPressed]} onPress={handleNewReading}>
            <Text style={styles.tertiaryButtonText}>🖐️ Take Another Reading</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(400).delay(1200)} style={styles.footer}>
          <Text style={styles.footerText}>Remember: The future is not fixed. Your choices shape your destiny.</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palmColors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: palmColors.textDim,
  },
  failedTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palmColors.text,
    marginBottom: 20,
    textAlign: "center",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  titleSection: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: palmColors.accent,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: palmColors.text,
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 22,
  },

  readingTextSection: {
    marginBottom: 24,
    backgroundColor: "rgba(107, 79, 160, 0.2)",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: palmColors.accent,
  },
  readingText: {
    fontSize: 15,
    lineHeight: 24,
    color: palmColors.text,
    textAlign: "justify",
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palmColors.accent,
    marginBottom: 12,
  },
  lineRow: {
    backgroundColor: "rgba(74, 58, 127, 0.4)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  lineLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: palmColors.text,
    marginBottom: 4,
  },
  lineText: {
    fontSize: 13,
    lineHeight: 18,
    color: palmColors.text,
    opacity: 0.85,
  },
  lineTextMuted: {
    fontStyle: "italic",
    opacity: 0.5,
  },

  personalitySummary: {
    fontSize: 14,
    lineHeight: 20,
    color: palmColors.text,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "rgba(107, 79, 160, 0.2)",
    borderWidth: 1,
    borderColor: palmColors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: palmColors.primary,
  },

  predictionsSection: {
    marginBottom: 28,
  },
  predictionsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: palmColors.accent,
    marginBottom: 16,
    textAlign: "center",
  },
  predictionCard: {
    backgroundColor: "rgba(74, 58, 127, 0.6)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palmColors.accent,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: palmColors.surface,
    opacity: 0.9,
  },

  buttonsSection: {
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: palmColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: palmColors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  secondaryButton: {
    backgroundColor: palmColors.accentSecondary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: palmColors.accentSecondary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tertiaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: palmColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
  },
  retryButton: {
    backgroundColor: palmColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    marginBottom: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: palmColors.surface,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: palmColors.surface,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: palmColors.surface,
  },
  tertiaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: palmColors.primary,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.85,
  },

  footer: {
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 175, 55, 0.2)",
  },
  footerText: {
    fontSize: 13,
    color: palmColors.text,
    opacity: 0.7,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 18,
  },
});
