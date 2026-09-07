/**
 * HomeScreen - Dashboard with Reading History
 * Shows past readings and option to start new reading
 */

import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  SlideInUp,
} from "react-native-reanimated";
import { useNavigation, NavigationProp, useFocusEffect } from "@react-navigation/native";
import { palmColors } from "@/theme/palmreader/colors";
import { usePalmStore } from "@/stores";

const { width } = Dimensions.get("window");

interface RootStackParamList {
  Home: undefined;
  Welcome: undefined;
  ReadingResult: {
    readingId: string;
  };
}

type NavigationType = NavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationType>();
  const { user, readings } = usePalmStore();

  const handleStartReading = () => {
    navigation.navigate("Welcome" as never);
  };

  const handleViewReading = (readingId: string) => {
    navigation.navigate("ReadingResult" as never, {
      readingId,
    } as never);
  };

  // Format date for display
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const renderReadingCard = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={SlideInUp.duration(400).delay(200 + index * 100)}
    >
      <Pressable
        onPress={() => handleViewReading(item.id)}
        style={({ pressed }) => [
          styles.readingCard,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
          <Text style={styles.cardTime}>
            {new Date(item.timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardPreview} numberOfLines={2}>
            {item.analysis?.loveLife || "Love Life reading..."}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.cardIcon}>
            {item.isFavorite ? "❤️" : "🖐️"}
          </Text>
          <Text style={styles.viewMoreText}>View Reading →</Text>
        </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.timeText}>9:41</Text>
        <Pressable style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </Pressable>
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.welcomeSection}
        >
          <Text style={styles.greeting}>
            Welcome Back, {user.name || "Seeker"}! ✨
          </Text>
          <Text style={styles.subtitle}>
            {readings.length === 0
              ? "Take your first palm reading"
              : `You have ${readings.length} reading${readings.length !== 1 ? "s" : ""} so far`}
          </Text>
        </Animated.View>

        {/* CTA Button */}
        <Animated.View
          entering={SlideInUp.duration(500).delay(100)}
          style={styles.ctaContainer}
        >
          <Pressable
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed,
            ]}
            onPress={handleStartReading}
          >
            <Text style={styles.ctaIcon}>✨</Text>
            <View style={styles.ctaContent}>
              <Text style={styles.ctaTitle}>Start New Reading</Text>
              <Text style={styles.ctaSubtitle}>
                Discover more about your destiny
              </Text>
            </View>
            <Text style={styles.ctaArrow}>→</Text>
          </Pressable>
        </Animated.View>

        {/* Readings History */}
        {readings.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>
              📖 Your Reading History
            </Text>

            <FlatList
              data={readings}
              renderItem={renderReadingCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        )}

        {/* Empty State */}
        {readings.length === 0 && (
          <Animated.View
            entering={FadeIn.duration(600).delay(400)}
            style={styles.emptyState}
          >
            <Text style={styles.emptyIcon}>🖐️</Text>
            <Text style={styles.emptyTitle}>No Readings Yet</Text>
            <Text style={styles.emptyText}>
              Discover the secrets your palm holds by taking your first reading
            </Text>
          </Animated.View>
        )}

        {/* Stats Section */}
        {readings.length > 0 && (
          <Animated.View
            entering={FadeIn.duration(500).delay(600)}
            style={styles.statsSection}
          >
            <Text style={styles.statsTitle}>📊 Your Journey</Text>

            <View style={styles.statsGrid}>
              {/* Total Readings */}
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{readings.length}</Text>
                <Text style={styles.statLabel}>Total Readings</Text>
              </View>

              {/* Favorite Readings */}
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {readings.filter((r) => r.isFavorite).length}
                </Text>
                <Text style={styles.statLabel}>Favorites</Text>
              </View>

              {/* Last Reading */}
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {readings.length > 0
                    ? Math.floor(
                        (Date.now() - readings[0].timestamp) / (1000 * 60 * 60)
                      ) < 1
                      ? "Now"
                      : `${Math.floor(
                          (Date.now() - readings[0].timestamp) / (1000 * 60 * 60)
                        )}h ago`
                    : "—"}
                </Text>
                <Text style={styles.statLabel}>Last Reading</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Footer Wisdom */}
        <Animated.View
          entering={FadeIn.duration(500).delay(800)}
          style={styles.wisdomSection}
        >
          <Text style={styles.wisdomIcon}>💫</Text>
          <Text style={styles.wisdomText}>
            "The palm is a map of life. Every line tells a story. Every reading brings you closer to understanding your true potential."
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
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 18,
  },

  /* Scroll Content */
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  /* Welcome Section */
  welcomeSection: {
    marginTop: 24,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: palmColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: palmColors.textDim,
    lineHeight: 20,
  },

  /* CTA Container */
  ctaContainer: {
    marginBottom: 28,
  },
  ctaButton: {
    backgroundColor: palmColors.primary,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: palmColors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  ctaIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: palmColors.surface,
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: palmColors.surface,
    opacity: 0.8,
  },
  ctaArrow: {
    fontSize: 20,
    color: palmColors.surface,
  },

  /* History Section */
  historySection: {
    marginBottom: 28,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: palmColors.text,
    marginBottom: 16,
  },
  readingCard: {
    backgroundColor: "rgba(107, 79, 160, 0.2)",
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: palmColors.accent,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: "rgba(107, 79, 160, 0.3)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardDate: {
    fontSize: 13,
    fontWeight: "600",
    color: palmColors.accent,
  },
  cardTime: {
    fontSize: 12,
    color: palmColors.textDim,
  },
  cardContent: {
    marginBottom: 12,
  },
  cardPreview: {
    fontSize: 14,
    lineHeight: 20,
    color: palmColors.text,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardIcon: {
    fontSize: 16,
  },
  viewMoreText: {
    fontSize: 13,
    color: palmColors.primary,
    fontWeight: "600",
  },
  separator: {
    height: 12,
  },

  /* Empty State */
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: palmColors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: palmColors.textDim,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },

  /* Stats Section */
  statsSection: {
    marginBottom: 28,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palmColors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(74, 58, 127, 0.4)",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: palmColors.accent,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    color: palmColors.text,
    textAlign: "center",
    opacity: 0.8,
  },

  /* Wisdom Section */
  wisdomSection: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: 14,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: palmColors.accent,
    alignItems: "center",
  },
  wisdomIcon: {
    fontSize: 28,
    marginBottom: 12,
  },
  wisdomText: {
    fontSize: 14,
    lineHeight: 22,
    color: palmColors.text,
    textAlign: "center",
    fontStyle: "italic",
  },
});
