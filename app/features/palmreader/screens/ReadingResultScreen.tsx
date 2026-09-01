/**
 * ReadingResultScreen - Display AI Palm Reading Results
 * Shows predictions for Love, Career, Health, Finance
 * Allows user to share or save reading
 */

import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Share,
  Dimensions,
} from "react-native";
import Animated, {
  FadeIn,
  SlideInLeft,
  FadeOut,
} from "react-native-reanimated";
import { useNavigation, RouteProp, NavigationProp } from "@react-navigation/native";
import { palmColors } from "@/theme/palmreader/colors";
import { ANIMATION_TIMINGS } from "@/utils/animations/timings";
import { usePalmStore } from "@/stores";

const { width } = Dimensions.get("window");

interface RootStackParamList {
  ReadingResult: {
    readingId: string;
  };
  Welcome: undefined;
}

interface ReadingResultScreenProps {
  route: RouteProp<RootStackParamList, "ReadingResult">;
}

type NavigationType = NavigationProp<RootStackParamList>;

export const ReadingResultScreen: React.FC<ReadingResultScreenProps> = ({
  route,
}) => {
  const navigation = useNavigation<NavigationType>();
  const { readingId } = route.params;
  const { readings, toggleFavorite } = usePalmStore();

  // Find the current reading
  const currentReading = readings.find((r) => r.id === readingId);

  // Use actual predictions from reading or fallback to empty array
  const predictions = currentReading?.predictions || [];

  useEffect(() => {
    // Optional: Auto-save reading to store if not already there
    if (!currentReading && readingId) {
      // Reading was likely just created during processing
      // Could add API call here to fetch full reading data
    }
  }, [readingId, currentReading]);

  const handleShare = async () => {
    try {
      const shareMessage = predictions.length > 0
        ? `✨ I just got my palm reading from DESTINO AI! Here's what I discovered:\n\n${predictions.map((p) => `${p.title}: ${p.description}`).join("\n\n")}\n\nDiscover your destiny too! 🖐️`
        : "✨ I just got my palm reading from DESTINO AI! Discover your destiny too! 🖐️";

      await Share.share({
        message: shareMessage,
        title: "My Palm Reading",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleSave = () => {
    if (currentReading && !currentReading.isFavorite) {
      toggleFavorite(readingId);
    }
  };

  const handleNewReading = () => {
    navigation.replace("Welcome" as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.timeText}>9:41</Text>
        <Text style={styles.settingsIcon}>⚙️</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.titleSection}
        >
          <Text style={styles.emoji}>✨</Text>
          <Text style={styles.mainTitle}>Your Destiny Revealed</Text>
          <Text style={styles.subtitle}>
            Your palm holds the secrets of your future
          </Text>
        </Animated.View>

        {/* Main Reading Text */}
        <Animated.View
          entering={FadeIn.duration(600).delay(200)}
          style={styles.readingTextSection}
        >
          <Text style={styles.readingText}>
            {currentReading?.analysis &&
              Object.values(currentReading.analysis).join(" ")
            }
          </Text>
        </Animated.View>

        {/* Predictions Cards */}
        <View style={styles.predictionsSection}>
          <Text style={styles.predictionsTitle}>Four Pillars of Your Destiny</Text>

          {predictions.length > 0 ? (
            predictions.map((prediction, index) => (
              <Animated.View
                key={index}
                entering={SlideInLeft.duration(600)
                  .delay(400 + index * 150)
                  .withInitialValues({
                    originX: -width,
                  })}
                style={styles.predictionCard}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardIcon}>{prediction.icon}</Text>
                  <Text style={styles.cardTitle}>{prediction.title}</Text>
                </View>
                <Text style={styles.cardDescription}>
                  {prediction.description}
                </Text>
              </Animated.View>
            ))
          ) : (
            <Text style={styles.loadingText}>Loading your reading...</Text>
          )}
        </View>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeIn.duration(500).delay(1000)}
          style={styles.buttonsSection}
        >
          {/* Share Button */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleShare}
          >
            <Text style={styles.primaryButtonText}>📤 Share Your Reading</Text>
          </Pressable>

          {/* Save to Favorites Button */}
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleSave}
          >
            <Text style={styles.secondaryButtonText}>💾 Save to Collection</Text>
          </Pressable>

          {/* New Reading Button */}
          <Pressable
            style={({ pressed }) => [
              styles.tertiaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleNewReading}
          >
            <Text style={styles.tertiaryButtonText}>🖐️ Take Another Reading</Text>
          </Pressable>
        </Animated.View>

        {/* Footer */}
        <Animated.View
          entering={FadeIn.duration(400).delay(1200)}
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            Remember: The future is not fixed. Your choices shape your destiny.
          </Text>
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
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FF6B35", // Saffron
  },
  timeText: {
    fontSize: 16,
    fontWeight: "600",
    color: palmColors.background,
  },
  settingsIcon: {
    fontSize: 18,
  },

  /* Scroll Content */
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  /* Title Section */
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

  /* Reading Text */
  readingTextSection: {
    marginBottom: 28,
    backgroundColor: "rgba(107, 79, 160, 0.2)", // Mystique Purple
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

  /* Predictions Section */
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
    backgroundColor: "rgba(74, 58, 127, 0.6)", // Twilight Purple
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)", // Gold border
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

  /* Buttons Section */
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
    backgroundColor: palmColors.secondary || "#FF6B35",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: palmColors.secondary || "#FF6B35",
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

  /* Footer */
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

  /* Loading State */
  loadingText: {
    fontSize: 14,
    color: palmColors.textDim,
    textAlign: "center",
    padding: 20,
    fontStyle: "italic",
  },
});
