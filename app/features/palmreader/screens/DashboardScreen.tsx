/**
 * DashboardScreen - Premium AI Palm Reading + Astrology Dashboard
 * Personalized zodiac insights with cosmic aesthetic and circular progress indicators
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { CormorantGaramond_700Bold } from "@expo-google-fonts/cormorant-garamond";
import { Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout, waitForAuthReady } from "@/services/firestore";
import { useRashifalStore } from "@/stores/rashifalStore";
import { useNotificationStore } from "@/stores/notificationStore";
import {
  registerDeviceToken,
  requestNotificationPermission,
  getNotificationPermissionStatus,
} from "@/services/notifications";
import { NotificationPermissionModal } from "@/components/NotificationPermissionModal";

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

// Zodiac sign mapping with details
const ZODIAC_SIGNS = {
  aries: {
    name: "Aries",
    symbol: "♈",
    dates: "Mar 21 - Apr 19",
    image: require("@assets/images/zodiac/Aries.png"),
  },
  taurus: {
    name: "Taurus",
    symbol: "♉",
    dates: "Apr 20 - May 20",
    image: require("@assets/images/zodiac/Taurus.png"),
  },
  gemini: {
    name: "Gemini",
    symbol: "♊",
    dates: "May 21 - Jun 20",
    image: require("@assets/images/zodiac/Gemini.png"),
  },
  cancer: {
    name: "Cancer",
    symbol: "♋",
    dates: "Jun 21 - Jul 22",
    image: require("@assets/images/zodiac/Cancer.png"),
  },
  leo: {
    name: "Leo",
    symbol: "♌",
    dates: "Jul 23 - Aug 22",
    image: require("@assets/images/zodiac/Leo.png"),
  },
  virgo: {
    name: "Virgo",
    symbol: "♍",
    dates: "Aug 23 - Sep 22",
    image: require("@assets/images/zodiac/Virgo.png"),
  },
  libra: {
    name: "Libra",
    symbol: "♎",
    dates: "Sep 23 - Oct 22",
    image: require("@assets/images/zodiac/Libra.png"),
  },
  scorpio: {
    name: "Scorpio",
    symbol: "♏",
    dates: "Oct 23 - Nov 21",
    image: require("@assets/images/zodiac/Scorpio.png"),
  },
  sagittarius: {
    name: "Sagittarius",
    symbol: "♐",
    dates: "Nov 22 - Dec 21",
    image: require("@assets/images/zodiac/Sagittarius.png"),
  },
  capricorn: {
    name: "Capricorn",
    symbol: "♑",
    dates: "Dec 22 - Jan 19",
    image: require("@assets/images/zodiac/Capricorn.png"),
  },
  aquarius: {
    name: "Aquarius",
    symbol: "♒",
    dates: "Jan 20 - Feb 18",
    image: require("@assets/images/zodiac/Aquarius.png"),
  },
  pisces: {
    name: "Pisces",
    symbol: "♓",
    dates: "Feb 19 - Mar 20",
    image: require("@assets/images/zodiac/Pisces.png"),
  },
} as const;

type ZodiacSignKey = keyof typeof ZODIAC_SIGNS;

// Cosmic hand illustration with zodiac wheel
const CosmicHandIllustration = () => (
  <Svg width={180} height={180} viewBox="0 0 200 240">
    <Defs>
      <LinearGradient id="cosmicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FFB366" stopOpacity="0.95" />
        <Stop offset="50%" stopColor="#FF9966" stopOpacity="0.9" />
        <Stop offset="100%" stopColor="#FF7744" stopOpacity="0.85" />
      </LinearGradient>
    </Defs>

    {/* Zodiac wheel circles */}
    <Circle cx="100" cy="120" r="110" fill="none" stroke="#D4AF37" strokeWidth="1.5" opacity="0.2" />
    <Circle cx="100" cy="120" r="95" fill="none" stroke="#FFB366" strokeWidth="1" opacity="0.3" />
    <Circle cx="100" cy="120" r="80" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.2" />

    {/* Hand outline with gradient */}
    <Path
      d="M 100 30 Q 85 50 80 80 L 75 160 Q 75 190 100 210 Q 125 190 125 160 L 120 80 Q 115 50 100 30 M 70 90 Q 60 100 55 130 M 130 90 Q 140 100 145 130"
      stroke="url(#cosmicGradient)"
      strokeWidth="3.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Palm lines */}
    <Path
      d="M 75 105 Q 100 90 125 105"
      stroke="#FFB366"
      strokeWidth="2"
      fill="none"
      opacity="0.8"
    />
    <Path
      d="M 85 90 Q 80 140 95 190"
      stroke="#FFD99B"
      strokeWidth="2"
      fill="none"
      opacity="0.7"
    />

    {/* Glow effect */}
    <Circle cx="100" cy="120" r="105" fill="url(#cosmicGradient)" opacity="0.15" />

    {/* Stars */}
    <Circle cx="50" cy="60" r="1.5" fill="#D4AF37" opacity="0.7" />
    <Circle cx="150" cy="70" r="1.5" fill="#D4AF37" opacity="0.7" />
    <Circle cx="140" cy="180" r="1.5" fill="#D4AF37" opacity="0.6" />
    <Circle cx="60" cy="190" r="1.5" fill="#D4AF37" opacity="0.6" />
  </Svg>
);


// Circular progress indicator with Ionicons
const CircularProgress = ({
  percentage,
  label,
  iconName,
  color,
}: {
  percentage: number;
  label: string;
  iconName: string;
  color: string;
}) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Convert hex to rgba with lighter opacity for background
  const getBackgroundColor = (hexColor: string): string => {
    return hexColor + "30"; // Add 30 for ~19% opacity
  };

  return (
    <View style={styles.circularProgressContainer}>
      <View style={styles.circularProgressWrapper}>
        <Svg width={56} height={56} style={styles.circularSvg}>
          {/* Background circle - light version of main color */}
          <Circle
            cx="28"
            cy="28"
            r={radius}
            stroke={getBackgroundColor(color)}
            strokeWidth="3"
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx="28"
            cy="28"
            r={radius}
            stroke={color}
            strokeWidth="3"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 28 28)"
          />
        </Svg>
        <View style={styles.circularProgressCenter}>
          <Ionicons name={iconName as any} size={28} color={color} />
        </View>
      </View>
      <Text style={styles.circlePercentage}>{percentage}%</Text>
      <Text style={styles.circleLabel}>{label}</Text>
    </View>
  );
};

// Language selector
const LanguageSelector = ({
  selectedLanguage,
  onLanguageChange,
}: {
  selectedLanguage: "en" | "hi";
  onLanguageChange: (lang: "en" | "hi") => void;
}) => (
  <View style={styles.languageContainer}>
    <Pressable
      style={[
        styles.langButton,
        selectedLanguage === "en" && styles.langButtonActive,
      ]}
      onPress={() => onLanguageChange("en")}
    >
      <Text
        style={[
          styles.langButtonText,
          selectedLanguage === "en" && styles.langButtonTextActive,
        ]}
      >
        English
      </Text>
    </Pressable>
    <Pressable
      style={[
        styles.langButton,
        selectedLanguage === "hi" && styles.langButtonActive,
      ]}
      onPress={() => onLanguageChange("hi")}
    >
      <Text
        style={[
          styles.langButtonText,
          selectedLanguage === "hi" && styles.langButtonTextActive,
        ]}
      >
        हिंदी
      </Text>
    </Pressable>
  </View>
);

const truncateName = (name: string, maxLength: number = 8): string => {
  return name.length > maxLength ? name.substring(0, maxLength) + "..." : name;
};

type DashboardRouteProp = RouteProp<RootStackParamList, "Dashboard">;

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationType>();
  const route = useRoute<DashboardRouteProp>();
  const justLoggedIn = route.params?.justLoggedIn === true;
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const {
    userName,
    rashi,
    rashifal,
    isLoading: isLoadingRashifal,
    error: rashifalError,
    initializeDailyRashifal,
    clearRashifal,
  } = useRashifalStore();

  const {
    notificationsEnabled,
    permissionStatus,
    initialize: initializeNotificationStore,
    toggleDailyRashifal,
  } = useNotificationStore();

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const currentZodiac: ZodiacSignKey = rashi && rashi in ZODIAC_SIGNS ? (rashi as ZodiacSignKey) : "aries";

  useEffect(() => {
    let cancelled = false;
    waitForAuthReady().then((user) => {
      if (!cancelled && user) {
        initializeDailyRashifal(user.uid);
        setCurrentUserId(user.uid);
        initializeNotificationStore(user.uid);
        // Silently refresh the token if permission was already granted in a
        // previous session — never prompts.
        registerDeviceToken(user.uid);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [initializeDailyRashifal, initializeNotificationStore]);

  // Prime the user for notifications right after they log in — not
  // immediately on cold app start, and never more than once, ever. Returning
  // sessions that skip Login (already signed in) don't carry justLoggedIn,
  // so they won't be re-prompted here; the bell icon lets them opt in later.
  useEffect(() => {
    if (!currentUserId || !justLoggedIn) return;
    let cancelled = false;

    const timer = setTimeout(async () => {
      const alreadyPrompted = await AsyncStorage.getItem("notificationPromptShown");
      const status = await getNotificationPermissionStatus();
      if (!cancelled && !alreadyPrompted && status === "undetermined") {
        setShowNotificationModal(true);
      }
    }, 1000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [currentUserId, justLoggedIn]);

  const dismissNotificationModal = async () => {
    setShowNotificationModal(false);
    await AsyncStorage.setItem("notificationPromptShown", "true");
  };

  const handleEnableNotifications = async () => {
    await dismissNotificationModal();
    if (!currentUserId) return;

    const status = await requestNotificationPermission();
    if (status === "granted") {
      await registerDeviceToken(currentUserId);
      await toggleDailyRashifal(currentUserId, true);
    }
  };

  const handleToggleNotificationBell = () => {
    if (!currentUserId) return;

    if (permissionStatus !== "granted") {
      setShowNotificationModal(true);
      return;
    }

    Alert.alert(
      "Daily Rashifal Notifications",
      notificationsEnabled
        ? "You're currently receiving your daily Rashifal notification. Turn it off?"
        : "Turn on your daily Rashifal notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: notificationsEnabled ? "Turn Off" : "Turn On",
          onPress: () => toggleDailyRashifal(currentUserId, !notificationsEnabled),
        },
      ]
    );
  };

  const handleScanPalm = () => {
    navigation.navigate("Camera" as never);
  };

  const handleTodaysRashifal = () => {
    navigation.navigate("TodaysRashifal" as never);
  };

  const handleMyPersonality = () => {
    // Navigate to personality details
  };

  const handleExploreAstrology = () => {
    // Navigate to astrology details
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            clearRashifal();
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          } catch (error) {
            console.error("Error logging out:", error);
            Alert.alert("Error", "Could not log out. Please try again.");
          }
        },
      },
    ]);
  };

  const isEnglish = language === "en";

  return (
    <>
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileSection}>
            {/* Avatar placeholder */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>👩</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.greetingText}>
                Good Morning,
              </Text>
              <Text style={styles.nameText}>
                 {truncateName(userName || "Friend")} ✨
              </Text>
              <Text style={styles.quoteText}>
                {isEnglish
                  ? "The universe has beautiful plans for you. ♥"
                  : "ब्रह्मांड आपके लिए सुंदर योजनाएं बनाता है। ♥"}
              </Text>
            </View>
          </View>
          <View style={styles.headerControls}>
            <LanguageSelector selectedLanguage={language} onLanguageChange={setLanguage} />
            <Pressable style={styles.notificationButton} onPress={handleToggleNotificationBell}>
              <Text style={styles.notificationDot}>
                {permissionStatus === "granted" && notificationsEnabled ? "🔔" : "🔕"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Main Zodiac Card with Background Image */}
        <View
          style={styles.zodiacCard}
        >
          <ImageBackground
            source={ZODIAC_SIGNS[currentZodiac].image}
            style={styles.zodiacCardBackground}
            imageStyle={styles.zodiacBackgroundImage}
            resizeMode="cover"
          >
            <View style={styles.zodiacCardContent}>
              {/* Left side - Info */}
              <View style={styles.zodiacInfo}>
                
                <View style={styles.zodiacSignDisplay}>
                  <View style={styles.zodiacSymbolCircle}>
                    <Text style={styles.zodiacSymbol}>
                      {ZODIAC_SIGNS[currentZodiac].symbol}
                    </Text>
                  </View>
                  <View style={styles.zodiacDetails}>
                    <Text style={styles.zodiacLabel}>
                      {isEnglish ? "YOUR ZODIAC SIGN" : "आपकी राशि"}
                    </Text>
                    <Text style={styles.zodiacName}>
                      {ZODIAC_SIGNS[currentZodiac].name}
                    </Text>
                    <Text style={styles.zodiacDates}>
                      ({ZODIAC_SIGNS[currentZodiac].dates})
                    </Text>
                  </View>
                </View>

                <Text style={styles.cosmicEnergyTitle}>
                  {isEnglish ? "Today's Rashifal" : "आज की राशिफल"}
                </Text>
                {isLoadingRashifal ? (
                  <ActivityIndicator size="small" color="#7B68EE" style={styles.energyLoader} />
                ) : (
                  <Text style={styles.energyDescription}>
                    {(isEnglish ? rashifal?.shortDescription?.en : rashifal?.shortDescription?.hi) ||
                      rashifalError ||
                      (isEnglish
                        ? "Your daily Rashifal is on its way."
                        : "आपकी दैनिक राशिफल जल्द ही आएगी।")}
                  </Text>
                )}

                {/* Circular Progress Indicators */}
                <View style={styles.statsBackdrop}>
                  <View style={styles.progressCirclesRow}>
                    <CircularProgress percentage={rashifal?.love ?? 0} label="Love" iconName="heart" color="#FF6B9D" />
                    <CircularProgress percentage={rashifal?.career ?? 0} label="Career" iconName="briefcase" color="#5B7FFF" />
                    <CircularProgress percentage={rashifal?.wealth ?? 0} label="Wealth" iconName="layers" color="#FFB84D" />
                    <CircularProgress percentage={rashifal?.health ?? 0} label="Health" iconName="pulse" color="#4ECDC4" />
                    <CircularProgress percentage={rashifal?.life ?? 0} label="Life" iconName="leaf" color="#9B7FFF" />
                  </View>

                  {/* Dual CTA Buttons */}
                  <View style={styles.dualButtonsContainer}>
                    <ExpoLinearGradient
                      colors={["#4B168F", "#29165A", "#141333"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0.3 }}
                      style={styles.rashifalGradient}
                    >
                      <Pressable
                        style={({ pressed }) => [styles.rashifalButton, pressed && styles.rashifalButtonPressed]}
                        onPress={handleTodaysRashifal}
                      >
                        <Text style={styles.rashifalButtonIcon}>☀️</Text>
                        <View style={styles.rashifalButtonContent}>
                          <Text style={styles.rashifalButtonText}>
                            {isEnglish ? "Today's Rashifal" : "आज की राशिफल"}
                          </Text>
                          <Ionicons name="arrow-forward" size={18} color="#fff" />
                        </View>
                      </Pressable>
                    </ExpoLinearGradient>

                    <Pressable
                      style={({ pressed }) => [styles.personalityButton, pressed && styles.personalityButtonPressed]}
                      onPress={handleMyPersonality}
                    >
                      <Text style={styles.personalityButtonIcon}>👤</Text>
                      <View style={styles.personalityTextContainer}>
                        <Text style={styles.personalityButtonText}>
                          {isEnglish ? "My Personality" : "मेरा व्यक्तित्व"}
                        </Text>
                        <Ionicons name="arrow-forward" size={18} color="#1A1F3A" />
                      </View>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Palm Reading Card */}
        <View
          style={styles.palmCard}
        >
          <ImageBackground
            source={require("@assets/images/hand_bg.png")}
            style={styles.palmCardBackground}
            imageStyle={styles.palmCardImage}
          >

            <View style={styles.palmCardContent}>
              <View style={styles.palmTextSection}>
                <Text style={styles.palmLabel}>
                  ✋ {isEnglish ? "PALM READING" : "हथेली पढ़ना"}
                </Text>
                <Text style={styles.palmTitle}>
                  {isEnglish ? "Discover What\nYour Palm Reveals" : "अपनी हथेली\nका रहस्य जानें"}
                </Text>
                <Text style={styles.palmDescription}>
                  {isEnglish
                    ? "Your hands hold unique patterns that can reveal insights about your personality, relationships, career and life journey."
                    : "आपकी हथेली अद्वितीय पैटर्न रखती है जो आपके व्यक्तित्व, संबंधों, करियर और जीवन यात्रा के बारे में जानकारी प्रदान करती है।"}
                </Text>

                <ExpoLinearGradient
                  colors={["#F8B44C", "#F8C46C", "#FCD888"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.palmCTAGradient}
                >
                  <Pressable
                    style={({ pressed }) => [styles.palmCTA, pressed && styles.palmCTAPressed]}
                    onPress={handleScanPalm}
                  >
                    <View style={styles.palmCTAContent}>
                      <Text style={styles.palmCTAText}>
                        {isEnglish ? "Read My Palm" : "मेरी हथेली पढ़ें"}
                      </Text>
                      <Ionicons name="arrow-forward" size={16} color="#0F0C29" />
                    </View>
                  </Pressable>
                </ExpoLinearGradient>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Astrology Snapshot */}
        <View
          style={styles.astrologyCard}
        >
          <ImageBackground
            source={require("@assets/images/background_image.png")}
            style={styles.astrologyCardBg}
            imageStyle={styles.astrologyCardBgImage}
          >
            <View style={styles.astrologyCardBgOverlay} />
            <View style={styles.astrologyCardContent}>
            <View style={styles.astrologyHeader}>
              <Text style={styles.astrologyTitle}>
                ⭐ {isEnglish ? "Astrology Snapshot" : "ज्योतिष स्नैपशॉट"}
              </Text>
              <Text style={styles.astrologySubtitle}>
                {isEnglish ? "Your cosmic profile at a glance" : "आपकी ब्रह्मांडीय प्रोफाइल एक नजर में"}
              </Text>
            </View>

            <View style={styles.snapshotItemsRow}>
              <View style={styles.snapshotItem}>
                <View style={[styles.snapshotBadge, { backgroundColor: "#F5E6D3" }]}>
                  <Text style={styles.snapshotIcon}>♈</Text>
                </View>
                <Text style={styles.snapshotLabel}>
                  {isEnglish ? "Zodiac Sign" : "राशि"}
                </Text>
                <Text style={styles.snapshotValue}>Aries</Text>
              </View>

              <View style={styles.snapshotItem}>
                <View style={[styles.snapshotBadge, { backgroundColor: "#FFE5E5" }]}>
                  <Text style={styles.snapshotIcon}>🔥</Text>
                </View>
                <Text style={styles.snapshotLabel}>
                  {isEnglish ? "Element" : "तत्व"}
                </Text>
                <Text style={styles.snapshotValue}>Fire</Text>
              </View>

              <View style={styles.snapshotItem}>
                <View style={[styles.snapshotBadge, { backgroundColor: "#E8DEFF" }]}>
                  <Text style={styles.snapshotIcon}>✨</Text>
                </View>
                <Text style={styles.snapshotLabel}>
                  {isEnglish ? "Personality" : "व्यक्तित्व"}
                </Text>
                <Text style={styles.snapshotValue}>Confident</Text>
              </View>

              <View style={styles.snapshotItem}>
                <View style={[styles.snapshotBadge, { backgroundColor: "#E8DEFF" }]}>
                  <Text style={styles.snapshotIcon}>🔢</Text>
                </View>
                <Text style={styles.snapshotLabel}>
                  {isEnglish ? "Lucky Number" : "भाग्य संख्या"}
                </Text>
                <Text style={styles.snapshotValue}>7</Text>
              </View>

              <View style={styles.snapshotItem}>
                <View style={[styles.snapshotBadge, { backgroundColor: "#FFE5CC" }]}>
                  <Text style={styles.snapshotIcon}>🎨</Text>
                </View>
                <Text style={styles.snapshotLabel}>
                  {isEnglish ? "Lucky Color" : "भाग्य रंग"}
                </Text>
                <Text style={styles.snapshotValue}>Gold</Text>
              </View>

              <View style={styles.snapshotItem}>
                <View style={[styles.snapshotBadge, { backgroundColor: "#FFD4A3" }]}>
                  <Text style={styles.snapshotIcon}>♃</Text>
                </View>
                <Text style={styles.snapshotLabel}>
                  {isEnglish ? "Ruling Planet" : "शासक ग्रह"}
                </Text>
                <Text style={styles.snapshotValue}>Mars</Text>
              </View>

              <View style={styles.snapshotItem}>
                <View style={[styles.snapshotBadge, { backgroundColor: "#E5F5FF" }]}>
                  <Text style={styles.snapshotIcon}>🌙</Text>
                </View>
                <Text style={styles.snapshotLabel}>
                  {isEnglish ? "Birth Nakshatra" : "जन्म नक्षत्र"}
                </Text>
                <Text style={styles.snapshotValue}>Ashwini</Text>
              </View>

              <View style={styles.snapshotItem}>
                <View style={[styles.snapshotBadge, { backgroundColor: "#F0E5FF" }]}>
                  <Text style={styles.snapshotIcon}>☾</Text>
                </View>
                <Text style={styles.snapshotLabel}>
                  {isEnglish ? "Moon Sign (Rashi)" : "चंद्र राशि"}
                </Text>
                <Text style={styles.snapshotValue}>Aries</Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.exploreCTA, pressed && styles.exploreCTAPressed]}
              onPress={handleExploreAstrology}
            >
              <Text style={styles.exploreCTAText}>
                {isEnglish ? "Explore Astrology" : "ज्योतिष जानें"}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#5B4FA0" />
            </Pressable>
          </View>
          </ImageBackground>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable style={[styles.navItem, styles.navItemActive]}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </Pressable>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIcon}>✋</Text>
          <Text style={styles.navLabel}>Palm Reading</Text>
        </Pressable>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIcon}>📖</Text>
          <Text style={styles.navLabel}>My Readings</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={handleTodaysRashifal}>
          <Text style={styles.navIcon}>⭐</Text>
          <Text style={styles.navLabel}>Daily Rashifal</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={handleLogout}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
    <NotificationPermissionModal
      visible={showNotificationModal}
      onEnable={handleEnableNotifications}
      onDismiss={dismissNotificationModal}
    />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7ED",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },

  /* Profile Header */
  profileHeader: {
    marginBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'row',
    width: '100%'
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
    flexShrink: 1,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 28,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  avatarEmoji: {
    fontSize: 26,
  },
  profileText: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A1F3A",
    marginBottom: 2,
  },
  nameText:{
    fontSize: 24,
    fontWeight: "800",
    color: "#1A1F3A",
    marginBottom: 2,
  },
  quoteText: {
    fontSize: 12,
    color: "#8B7B9E",
    fontWeight: "500",
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  languageContainer: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: "rgba(26, 31, 58, 0.08)",
    borderRadius: 10,
    padding: 4,
  },
  langButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  langButtonActive: {
    backgroundColor: "#1A1F3A",
  },
  langButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8B7B9E",
  },
  langButtonTextActive: {
    color: "white",
  },
  notificationButton: {
    paddingLeft: 8,
  },
  notificationDot: {
    fontSize: 18,
  },

  /* Zodiac Card */
  zodiacCard: {
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    overflow: "hidden",
    borderColor: "#fcd286",
  },
  zodiacCardBackground: {
    flex: 1,
    padding: 18,
  },
  zodiacBackgroundImage: {
    borderRadius: 24,
  },
  zodiacCardContent: {
    flexDirection: "row",
    gap: 14,
    position: "relative",
    zIndex: 1,
  },
  zodiacInfo: {
    flex: 1,
  },
  zodiacImageArea: {
    flex: 0.5,
  },
  zodiacLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fff",
    letterSpacing: 1,
    marginBottom: 8,
  },
  zodiacSignDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 25,
  },
  zodiacSymbolCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#D4AF37",
  },
  zodiacSymbol: {
    fontSize: 28,
    color: "#D4AF37",
  },
  zodiacDetails: {
    gap: 2,
  },
  zodiacName: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "Poppins_600SemiBold"
  },
  zodiacDates: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "700"
  },
  cosmicEnergyTitle: {
    fontSize: 18,
    // fontWeight: "700",
    color: "#1A1F3A",
    marginBottom: 6,
    fontFamily: "Poppins_700Bold"
  },
  energyDescription: {
    fontSize: 13,
    color: "#2C2C2C",
    lineHeight: 18,
    marginBottom: 14,
    width: "60%",
    fontFamily: "Poppins_500Medium"
  },
  energyLoader: {
    marginBottom: 14,
    alignSelf: "flex-start",
  },

  /* Backdrop behind progress circles + CTA buttons for readability
     over the busy zodiac photo background */
  statsBackdrop: {
    backgroundColor: "rgba(15, 12, 35, 0.55)",
    borderRadius: 20,
    padding: 14,
    marginTop: 6,
  },

  /* Progress Circles */
  progressCirclesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  circularProgressContainer: {
    alignItems: "center",
    gap: 4,
  },
  circleBackground: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  circlePercentage: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  circleIcon: {
    fontSize: 14,
  },
  circleLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D9CFF0",
  },
  circularProgressWrapper: {
    position: "relative" as const,
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
  },
  circularSvg: {
    position: "absolute" as const,
  },
  circularProgressCenter: {
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
  },

  /* Dual Buttons */
  dualButtonsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  rashifalGradient: {
    flex: 1,
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#6B4FA0",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,

  },
  rashifalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  rashifalButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  rashifalButtonIcon: {
    fontSize: 15,
  },
  rashifalButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  rashifalButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.3,
  },
  personalityButton: {
    // flex: 1,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "rgba(212, 175, 55, 0.4)",
    shadowColor: "rgba(212, 175, 55, 0.2)",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4
  },
  personalityButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  personalityButtonIcon: {
    fontSize: 18,
  },
  personalityButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1F3A",
    letterSpacing: 0.3,
  },
  personalityTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  /* Palm Card */
  palmCard: {
    borderRadius: 24,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    overflow: "hidden",
  },
  palmCardBackground: {
    borderRadius: 24,
    overflow: "hidden",
    minHeight: 220,
  },
  palmCardImage: {
    borderRadius: 24,
    resizeMode: "cover",
  },
  palmCardOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  palmCardContent: {
    flexDirection: "column",
    padding: 20,
    justifyContent: "space-between",
    flex: 1,
  },
  palmTextSection: {
    flex: 1,
    justifyContent: "space-between",
    width: "50%"
  },
  palmLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFD700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  palmTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "white",
    lineHeight: 28,
    marginBottom: 10,
  },
  palmDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 18,
    marginBottom: 16,
  },
  palmIllustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  palmCTAGradient: {
    borderRadius: 20,
    alignSelf: "flex-start",
    shadowColor: "#F8B44C",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  palmCTA: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  palmCTAContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  palmCTAPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  palmCTAText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F0C29",
  },

  /* Astrology Card */
  astrologyCard: {
    borderRadius: 24,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    overflow: "hidden",
    borderColor: "#fcd286",
    borderWidth: 2,
  },
  astrologyCardBg: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  astrologyCardBgImage: {
    borderRadius: 24,
    resizeMode: "cover",
  },
  astrologyCardBgOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(245, 239, 232, 0.15)",
  },
  astrologyCardContent: {
    gap: 16,
    padding: 20,
  },
  astrologyHeader: {
    marginBottom: 4,
  },
  astrologyTitle: {
    fontSize: 18,
    color: "#1A1F3A",
    marginBottom: 4,
    fontFamily: "Poppins_700Bold"
  },
  astrologySubtitle: {
    fontSize: 13,
    color: "#8B7B9E",
    fontWeight: "700",
  },

  /* Snapshot Items Row */
  snapshotItemsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
    gap: 8,
  },
  snapshotItem: {
    width: "23%",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  snapshotBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  snapshotIcon: {
    fontSize: 24,
  },
  snapshotLabel: {
    fontSize: 11,
    color: "#8B7B9E",
    fontWeight: "600",
    textAlign: "center",
  },
  snapshotValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1A1F3A",
    textAlign: "center",
  },

  /* Explore CTA */
  exploreCTA: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: "#5B4FA0",
    backgroundColor: "transparent",
  },
  exploreCTAPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },
  exploreCTAText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5B4FA0",
  },

  /* Button States */
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },

  /* Bottom Navigation */
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 175, 55, 0.15)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  navItem: {
    alignItems: "center",
    gap: 5,
    flex: 1,
    paddingVertical: 4,
  },
  navItemActive: {
    borderTopWidth: 2,
    borderTopColor: "#1A1F3A",
  },
  navIcon: {
    fontSize: 22,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8B7B9E",
  },

  /* Spacing */
  bottomSpacing: {
    height: 10,
  },
});