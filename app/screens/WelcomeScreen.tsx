/**
 * WelcomeScreen - First Screen (Welcome)
 * App branding and entry point
 */

import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts, CormorantGaramond_700Bold, CormorantGaramond_400Regular, CormorantGaramond_500Medium } from "@expo-google-fonts/cormorant-garamond";
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { Cinzel_400Regular, Cinzel_700Bold } from "@expo-google-fonts/cinzel";
import * as SplashScreen from "expo-splash-screen";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { palmColors } from "@/theme/palmreader/colors";
//import DestinoLogo from "@/features/palmreader/components/DestinoLogo";
import ReadingButton from "@/features/palmreader/components/GradientButton";

SplashScreen.preventAutoHideAsync();

interface RootStackParamList {
  Home: undefined;
  Welcome: undefined;
  Dashboard: undefined;
}

type NavigationType = NavigationProp<RootStackParamList>;

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationType>();

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    CormorantGaramond_700Bold,
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Cinzel_400Regular,
    Cinzel_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const handleBeginReading = () => {
    navigation.navigate("Onboarding" as never);
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={require("@assets/images/welcome_bg.png")}
        style={styles.fullScreenBackground}
        imageStyle={styles.backgroundImageStyle}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.storyWrapper}>
          <Text style={styles.storyText}>Your Story in Your Hands</Text>
        </View>
        {/* Main Content */}
        <View style={styles.content}>
        {/* App Branding - Fades in */}
        <View
          style={styles.brandingSection}
        >
          <View style={styles.taglineWrapper}>
            <View style={styles.taglineLine} />
            <Text style={styles.tagline}>WELCOME TO</Text>
            <View style={styles.taglineLine} />
          </View>
          <View>
            {/* <DestinoLogo /> */}
          </View>
          <Text style={styles.appSubtitle}>
            AI-Powered Palm Reading for Your Destiny
          </Text>

          {/* Feature Cards */}
          <View style={styles.cardsContainer}>
            <View style={styles.card}>
              <Image
                source={require("@assets/images/gradient_icons/love.png")}
                style={styles.cardIcon}
              />
              <Text style={styles.cardLabel}>Love &{"\n"}Relationships</Text>
            </View>
            <View style={styles.card}>
              <Image
                source={require("@assets/images/gradient_icons/career.png")}
                style={styles.cardIcon}
              />
              <Text style={styles.cardLabel}>Career &{"\n"}Success</Text>
            </View>
            <View style={styles.card}>
              <Image
                source={require("@assets/images/gradient_icons/health.png")}
                style={styles.cardIcon}
              />
              <Text style={styles.cardLabel}>Health &{"\n"}Wellness</Text>
            </View>
            <View style={styles.card}>
              <Image
                source={require("@assets/images/gradient_icons/guidance.png")}
                style={styles.cardIcon}
              />
              <Text style={styles.cardLabel}>Life Guidance{"\n"}& More</Text>
            </View>
          </View>
        </View>

        {/* Call-to-Action Button - Slides up */}
        <View
          style={styles.ctaSection}
        >
          <ReadingButton onPress={handleBeginReading} />
        </View>
        </View>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
  headerBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settingsIcon: {
    fontSize: 18,
  },
  storyWrapper: {
    width: 60,
    position: 'absolute',
    right: 5,
    top: 100,
  },
  storyText:{
    fontSize: 18,
    fontFamily: "CormorantGaramond_500Medium",
    color: '#f4f4f4',
    lineHeight: 18,
    letterSpacing: 0.8,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  /* Branding Section */
  brandingSection: {
    alignItems: "center",
    marginTop: 'auto',
  },
  taglineWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 12,
  },
  taglineLine: {
    height: 1.5,
    width: 60,
    backgroundColor: palmColors.accent,
    opacity: 0.7,
  },
  tagline: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    color: palmColors.accent,
    letterSpacing: 2.5,
  },
  appName: {
    fontSize: 58,
    fontWeight: "700",
    fontFamily: "Cinzel_700Bold",
    color: "#E8B83E",
    letterSpacing: 2,
    marginBottom: 14,
    textAlign: "center",
  },
  appSubtitle: {
    fontSize: 18,
    fontFamily: "Poppins_400Regular",
    color: "#F4F2FF",
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.85,
    paddingHorizontal: 50
  },

  /* CTA Section */
  ctaSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
    width: "100%",
  },

  /* Footer Section */
  footerSection: {
    marginBottom: 10,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Cinzel_400Regular",
    color: "#fff",
    opacity: 0.7,
    textAlign: "center",
    fontStyle: "italic",
    letterSpacing: 1,
  },

  /* Feature Cards */
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    marginTop: 24,
    marginBottom: 10,
    gap: 12,
    paddingHorizontal: 0,
  },
  card: {
    alignItems: "center",
    width: 70,
  },
  cardIcon: {
    width: 60,
    height: 60,
    marginBottom: 8,
    objectFit: 'contain'
  },
  cardLabel: {
    fontSize: 10,
    fontFamily: "Poppins_500Medium",
    color: "#fff",
    textAlign: "center",
    lineHeight: 14,
  },
});
