/**
 * Personality Screen
 * In-depth personality reading based on the user's astrology profile —
 * bilingual (EN/HI), with an audio "listen" toggle and expandable detail
 * sections.
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
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { waitForAuthReady } from "@/services/firestore";
import { getOrCreatePersonality, fetchPersonalityAudioUri, type PersonalityProfile } from "@/services/personality";

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DetailSection {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  titleHi: string;
  text: string;
}

export const PersonalityScreen: React.FC = () => {
  const navigation = useNavigation<NavigationType>();
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const isEnglish = language === "en";
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);
  const [isFetchingAudio, setIsFetchingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [loadedAudioLanguage, setLoadedAudioLanguage] = useState<"en" | "hi" | null>(null);

  useEffect(() => {
    loadPersonality();
  }, []);

  useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch {
        // Already released by expo-audio's own unmount teardown.
      }
    };
  }, [player]);

  const loadPersonality = async () => {
    try {
      setLoading(true);
      setLoadError(null);

      const user = await waitForAuthReady();
      if (!user) {
        setLoadError("You need to be logged in to see your Personality reading.");
        return;
      }

      const data = await getOrCreatePersonality(user.uid);
      setProfile(data);
    } catch (error) {
      console.error("Error loading Personality:", error);
      setLoadError("Failed to load your Personality reading. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleListen = async () => {
    setAudioError(null);

    if (playerStatus.playing) {
      player.pause();
      return;
    }

    if (loadedAudioLanguage === language && playerStatus.isLoaded) {
      player.play();
      return;
    }

    setIsFetchingAudio(true);
    try {
      const uri = await fetchPersonalityAudioUri(language);
      player.replace(uri);
      setLoadedAudioLanguage(language);
      player.play();
    } catch (error) {
      console.error("Error fetching Personality audio:", error);
      setAudioError("Couldn't load audio right now. Please try again.");
    } finally {
      setIsFetchingAudio(false);
    }
  };

  const toggleSection = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection((current) => (current === key ? null : key));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#7B68EE" />
          <Text style={styles.loadingText}>Reading your personality...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <Text style={styles.errorText}>{loadError || "No Personality data available"}</Text>
          <Pressable style={styles.retryButton} onPress={loadPersonality}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const section = isEnglish ? profile.english : profile.hindi;

  const detailSections: DetailSection[] = [
    {
      key: "emotional",
      icon: "heart-outline",
      title: "Emotional Nature",
      titleHi: "भावनात्मक स्वभाव",
      text: section.emotionalNature,
    },
    {
      key: "social",
      icon: "people-outline",
      title: "Social & Communication",
      titleHi: "सामाजिक व संवाद",
      text: section.socialNature,
    },
    {
      key: "decisions",
      icon: "git-branch-outline",
      title: "Decision-Making",
      titleHi: "निर्णय लेने की शैली",
      text: section.decisionMaking,
    },
    {
      key: "career",
      icon: "briefcase-outline",
      title: "Career & Work Style",
      titleHi: "करियर व कार्यशैली",
      text: section.careerPersonality,
    },
  ];

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
          <Text style={styles.headerTitle}>My Personality</Text>
          <View style={styles.languageToggle}>
            <Pressable
              style={[styles.langButton, isEnglish && styles.langButtonActive]}
              onPress={() => setLanguage("en")}
            >
              <Text style={[styles.langButtonText, isEnglish && styles.langButtonTextActive]}>English</Text>
            </Pressable>
            <Pressable
              style={[styles.langButton, !isEnglish && styles.langButtonActive]}
              onPress={() => setLanguage("hi")}
            >
              <Text style={[styles.langButtonText, !isEnglish && styles.langButtonTextActive]}>हिंदी</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          {/* Summary Hero */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryEmoji}>🧬</Text>
            <Text style={styles.summaryText}>{section.summary}</Text>
          </View>

          {/* Listen */}
          <Pressable
            style={({ pressed }) => [styles.listenButton, pressed && styles.listenButtonPressed]}
            onPress={handleToggleListen}
            disabled={isFetchingAudio}
          >
            {isFetchingAudio ? (
              <ActivityIndicator size="small" color="#7B68EE" />
            ) : (
              <Ionicons name={playerStatus.playing ? "pause-circle" : "volume-high"} size={22} color="#7B68EE" />
            )}
            <Text style={styles.listenButtonText}>
              {isFetchingAudio
                ? "Preparing audio..."
                : playerStatus.playing
                  ? "Pause"
                  : "Listen to your Personality"}
            </Text>
          </Pressable>
          {audioError && <Text style={styles.audioErrorText}>{audioError}</Text>}

          {/* Traits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isEnglish ? "✨ Key Traits" : "✨ मुख्य विशेषताएं"}</Text>
            <View style={styles.chipsRow}>
              {section.traits.map((trait) => (
                <View key={trait} style={styles.chip}>
                  <Text style={styles.chipText}>{trait}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Strengths */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isEnglish ? "💪 Strengths" : "💪 शक्तियां"}</Text>
            <View style={styles.sectionContent}>
              {section.strengths.map((strength) => (
                <View key={strength} style={styles.listRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                  <Text style={styles.listRowText}>{strength}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Improvement Areas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isEnglish ? "🌱 Growth Areas" : "🌱 विकास क्षेत्र"}</Text>
            <View style={styles.sectionContent}>
              {section.improvementAreas.map((area) => (
                <View key={area} style={styles.listRow}>
                  <Ionicons name="trending-up-outline" size={18} color="#FF9800" />
                  <Text style={styles.listRowText}>{area}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Expandable detail sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isEnglish ? "🔍 Explore Further" : "🔍 और जानें"}</Text>
            {detailSections.map((detail) => {
              const isExpanded = expandedSection === detail.key;
              return (
                <View key={detail.key} style={styles.expandableCard}>
                  <Pressable style={styles.expandableHeader} onPress={() => toggleSection(detail.key)}>
                    <View style={styles.expandableHeaderLeft}>
                      <Ionicons name={detail.icon} size={20} color="#7B68EE" />
                      <Text style={styles.expandableTitle}>{isEnglish ? detail.title : detail.titleHi}</Text>
                    </View>
                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#8B7B9E" />
                  </Pressable>
                  {isExpanded && <Text style={styles.expandableBody}>{detail.text}</Text>}
                </View>
              );
            })}
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
    textAlign: "center",
    paddingHorizontal: 24,
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
  summaryCard: {
    backgroundColor: "rgba(255, 253, 252, 0.96)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  summaryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    textAlign: "center",
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
    gap: 10,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "rgba(123, 104, 238, 0.12)",
    borderWidth: 1,
    borderColor: "#7B68EE",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5B35D5",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  listRowText: {
    flex: 1,
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
  expandableCard: {
    backgroundColor: "rgba(255, 253, 252, 0.94)",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  expandableHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  expandableHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  expandableTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A237E",
  },
  expandableBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    fontSize: 13,
    color: "#555",
    lineHeight: 19,
  },
  spacer: {
    height: 20,
  },
});
