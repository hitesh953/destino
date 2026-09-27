/**
 * Today's Rashifal Screen
 * Displays daily horoscope/predictions for user's zodiac sign
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db, getUserData, waitForAuthReady } from "@/services/firestore";
import { useRashifalStore } from "@/stores/rashifalStore";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { fetchRashifalAudioUri } from "@/services/rashifalAudio";
import { ZodiacWheelBanner } from "@/features/palmreader/components/ZodiacWheelBanner";

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

interface BilingualText {
  en: string;
  hi: string;
}

interface RashifalData {
  name: string;
  dateRange: string;
  cosmicEnergy: {
    title: string;
    description: BilingualText;
  };
  love: { score: number; description: BilingualText };
  career: { score: number; description: BilingualText };
  wealth: { score: number; description: BilingualText };
  health: { score: number; description: BilingualText };
  life: { score: number; description: BilingualText };
  lucky: {
    color: string;
    number: number;
    time: string;
    direction: string;
  };
  advice: string;
  affirmation: string;
}

export const TodaysRashifalScreen: React.FC = () => {
  const navigation = useNavigation<NavigationType>();
  const [rashifal, setRashifal] = useState<RashifalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userZodiac, setUserZodiac] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const isEnglish = language === "en";

  // Reuse the Rashi the Dashboard already resolved (source of truth is the
  // user's Firestore profile), avoiding a duplicate profile fetch.
  const cachedRashi = useRashifalStore((state) => state.rashi);

  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);
  const [isFetchingAudio, setIsFetchingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  // Tracks which (zodiac, language) the player's current source was fetched
  // for, so switching the language re-fetches instead of replaying stale audio.
  const [loadedAudioKey, setLoadedAudioKey] = useState<string | null>(null);

  useEffect(() => {
    loadRashifal();
  }, []);

  // Stop playback if the user navigates away or switches language mid-listen.
  useEffect(() => {
    return () => {
      // expo-audio releases the underlying native player as part of its own
      // unmount teardown, which can happen before this cleanup runs — guard
      // against calling pause() on an already-released shared object.
      try {
        player.pause();
      } catch {
        // Already released; nothing to pause.
      }
    };
  }, [player]);

  const handleToggleListen = async () => {
    const audioKey = `${userZodiac}_${language}`;
    setAudioError(null);

    if (playerStatus.playing) {
      player.pause();
      return;
    }

    if (loadedAudioKey === audioKey && playerStatus.isLoaded) {
      player.play();
      return;
    }

    setIsFetchingAudio(true);
    try {
      const uri = await fetchRashifalAudioUri({ date, zodiacSign: userZodiac, language });
      player.replace(uri);
      setLoadedAudioKey(audioKey);
      player.play();
    } catch (error) {
      console.error("Error fetching Rashifal audio:", error);
      setAudioError("Couldn't load audio right now. Please try again.");
    } finally {
      setIsFetchingAudio(false);
    }
  };

  const loadRashifal = async () => {
    try {
      setLoading(true);
      setLoadError(null);

      const today = new Date().toISOString().split("T")[0];
      setDate(today);

      let zodiacSign = cachedRashi;
      if (!zodiacSign) {
        const user = await waitForAuthReady();
        if (!user) {
          setLoadError("You need to be logged in to see your Rashifal.");
          return;
        }
        const userData = await getUserData(user.uid);
        if (!userData?.zodiacSign) {
          setLoadError("Add your birth details to unlock your Rashifal.");
          return;
        }
        zodiacSign = String(userData.zodiacSign).toLowerCase();
      }

      // Fetch today's Rashifal from Firestore
      const docRef = doc(db, "daily_rashifal", today);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const zodiacData = data.zodiacSigns?.[zodiacSign];
        if (zodiacData) {
          setUserZodiac(zodiacSign);
          setRashifal(zodiacData);
        } else {
          setLoadError("Couldn't find today's Rashifal for your sign.");
        }
      } else {
        setLoadError("Today's Rashifal isn't ready yet.");
      }
    } catch (error) {
      console.error("Error loading Rashifal:", error);
      setLoadError("Failed to load your Rashifal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#7B68EE" />
          <Text style={styles.loadingText}>Loading your Rashifal...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!rashifal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <Text style={styles.errorText}>{loadError || "No Rashifal data available"}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={loadRashifal}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return "#4CAF50";
    if (score >= 70) return "#8BC34A";
    if (score >= 60) return "#FFC107";
    return "#FF9800";
  };

  return (
    <ImageBackground
      source={require("@assets/images/detail_backgroundImg.png")}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#7B68EE" />
          </Pressable>
          <Text style={styles.headerTitle}>Today's Rashifal</Text>
          <View style={styles.languageToggle}>
            <Pressable
              style={[styles.langButton, isEnglish && styles.langButtonActive]}
              onPress={() => setLanguage("en")}
            >
              <Text style={[styles.langButtonText, isEnglish && styles.langButtonTextActive]}>
                English
              </Text>
            </Pressable>
            <Pressable
              style={[styles.langButton, !isEnglish && styles.langButtonActive]}
              onPress={() => setLanguage("hi")}
            >
              <Text style={[styles.langButtonText, !isEnglish && styles.langButtonTextActive]}>
                हिंदी
              </Text>
            </Pressable>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          {/* Decorative Zodiac Wheel Banner */}
          <ZodiacWheelBanner
            title={isEnglish ? "Today's Rashifal" : "आज का राशिफल"}
            subtitle={rashifal.name}
          />

          {/* Zodiac Card */}
          <View style={styles.zodiacCard}>
            <Text style={styles.zodiacName}>{rashifal.name}</Text>
            <Text style={styles.zodiacDates}>{rashifal.dateRange}</Text>
            <Text style={styles.dateText}>{date}</Text>
          </View>

          {/* Listen to Rashifal */}
          <Pressable
            style={({ pressed }) => [styles.listenButton, pressed && styles.listenButtonPressed]}
            onPress={handleToggleListen}
            disabled={isFetchingAudio}
          >
            {isFetchingAudio ? (
              <ActivityIndicator size="small" color="#7B68EE" />
            ) : (
              <Ionicons
                name={playerStatus.playing ? "pause-circle" : "volume-high"}
                size={22}
                color="#7B68EE"
              />
            )}
            <Text style={styles.listenButtonText}>
              {isFetchingAudio
                ? "Preparing audio..."
                : playerStatus.playing
                  ? "Pause"
                  : "Listen to your Rashifal"}
            </Text>
          </Pressable>
          {audioError && <Text style={styles.audioErrorText}>{audioError}</Text>}

          {/* Cosmic Energy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Cosmic Energy</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.cosmicTitle}>{rashifal.cosmicEnergy.title}</Text>
              <Text style={styles.cosmicDescription}>
                {isEnglish ? rashifal.cosmicEnergy.description.en : rashifal.cosmicEnergy.description.hi}
              </Text>
            </View>
          </View>

          {/* Score Sections */}
          <View style={styles.scoresContainer}>
            {[
              { title: "Love", data: rashifal.love },
              { title: "Career", data: rashifal.career },
              { title: "Wealth", data: rashifal.wealth },
              { title: "Health", data: rashifal.health },
              { title: "Life", data: rashifal.life },
            ].map((item) => (
              <View key={item.title} style={styles.scoreCard}>
                <View style={styles.scoreHeader}>
                  <Text style={styles.scoreTitle}>{item.title}</Text>
                  <View style={[styles.scoreBadge, { backgroundColor: scoreColor(item.data.score) }]}>
                    <Text style={styles.scoreNumber}>{item.data.score}</Text>
                  </View>
                </View>
                <Text style={styles.scoreDescription}>
                  {isEnglish ? item.data.description.en : item.data.description.hi}
                </Text>
              </View>
            ))}
          </View>

          {/* Lucky Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍀 Lucky Details</Text>
            <View style={styles.luckyGrid}>
              <View style={styles.luckyItem}>
                <Text style={styles.luckyLabel}>Color</Text>
                <Text style={styles.luckyValue}>{rashifal.lucky.color}</Text>
              </View>
              <View style={styles.luckyItem}>
                <Text style={styles.luckyLabel}>Number</Text>
                <Text style={styles.luckyValue}>{rashifal.lucky.number}</Text>
              </View>
              <View style={styles.luckyItem}>
                <Text style={styles.luckyLabel}>Time</Text>
                <Text style={styles.luckyValue}>{rashifal.lucky.time}</Text>
              </View>
              <View style={styles.luckyItem}>
                <Text style={styles.luckyLabel}>Direction</Text>
                <Text style={styles.luckyValue}>{rashifal.lucky.direction}</Text>
              </View>
            </View>
          </View>

          {/* Advice & Affirmation */}
          <View style={styles.section}>
            <View style={styles.adviceBox}>
              <Text style={styles.adviceLabel}>💡 Today's Advice</Text>
              <Text style={styles.adviceText}>{rashifal.advice}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.affirmationBox}>
              <Text style={styles.affirmationLabel}>✨ Affirmation</Text>
              <Text style={styles.affirmationText}>{rashifal.affirmation}</Text>
            </View>
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    resizeMode: "cover",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  languageToggle: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: "rgba(26, 31, 58, 0.08)",
    borderRadius: 10,
    padding: 4,
  },
  langButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  langButtonActive: {
    backgroundColor: "#7B68EE",
  },
  langButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8B7B9E",
  },
  langButtonTextActive: {
    color: "white",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A237E",
    flexShrink: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B4FA0",
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#7B68EE",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  zodiacCard: {
    backgroundColor: "rgba(255, 253, 252, 0.96)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  zodiacName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A237E",
    marginBottom: 4,
  },
  zodiacDates: {
    fontSize: 14,
    color: "#6B4FA0",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: "#999",
  },
  listenButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255, 253, 252, 0.94)",
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: "rgba(0, 0, 0, 0.12)",
    shadowOpacity: 0.7,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  listenButtonPressed: {
    opacity: 0.8,
  },
  listenButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7B68EE",
  },
  audioErrorText: {
    fontSize: 12,
    color: "#E74C3C",
    textAlign: "center",
    marginBottom: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A237E",
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: "rgba(255, 253, 252, 0.94)",
    borderRadius: 12,
    padding: 16,
  },
  cosmicTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7B68EE",
    marginBottom: 8,
  },
  cosmicDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  scoresContainer: {
    marginBottom: 16,
  },
  scoreCard: {
    backgroundColor: "rgba(255, 253, 252, 0.94)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  scoreTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A237E",
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreNumber: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  scoreDescription: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
  luckyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  luckyItem: {
    width: "48%",
    backgroundColor: "rgba(255, 253, 252, 0.94)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  luckyLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 6,
  },
  luckyValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7B68EE",
  },
  adviceBox: {
    backgroundColor: "#FFF8E7",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FFC107",
  },
  adviceLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A237E",
    marginBottom: 8,
  },
  adviceText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
  affirmationBox: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  affirmationLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A237E",
    marginBottom: 8,
  },
  affirmationText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
    fontStyle: "italic",
  },
  spacer: {
    height: 20,
  },
});
