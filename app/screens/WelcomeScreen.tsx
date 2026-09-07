/**
 * WelcomeScreen - First Screen (Splash/Welcome)
 * App branding and entrance animation
 * Auto-navigates to Home after 2.5s
 */

import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  ZoomIn,
  SlideInUp,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { palmColors } from "@/theme/palmreader/colors";
import { ANIMATION_TIMINGS } from "@/utils/animations/timings";

const { width, height } = Dimensions.get("window");
const MANDALA_SIZE = Math.min(width * 0.5, 200);

interface RootStackParamList {
  Home: undefined;
  Welcome: undefined;
  Camera: undefined;
}

type NavigationType = NavigationProp<RootStackParamList>;

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationType>();
  const mandalaRotation = useSharedValue(0);

  useEffect(() => {
    // Start mandala rotation (8s full rotation from timings)
    mandalaRotation.value = withRepeat(
      withTiming(360, {
        duration: ANIMATION_TIMINGS.processing.mandalaRotation, // 8000ms
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [mandalaRotation]);

  const handleBeginReading = () => {
    // Navigate to camera screen to capture palm
    navigation.navigate("Camera" as never);
  };

  const mandalaStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${mandalaRotation.value}deg` }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar with Time */}
      <View style={styles.headerBar}>
        {/* <Text style={styles.timeText}>9:41</Text> */}
        <Text style={styles.settingsIcon}>⚙️</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* App Branding - Fades in over 500ms */}
        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.brandingSection}
        >
          <Text style={styles.tagline}>WELCOME TO</Text>
          <Text style={styles.appName}>✨ DESTINO ✨</Text>
          <Text style={styles.appSubtitle}>
            AI-Powered Palm Reading for Your Destiny
          </Text>
        </Animated.View>

        {/* Mandala Circle - Zoom in and rotate */}
        <Animated.View
          entering={ZoomIn.duration(
            ANIMATION_TIMINGS.splash.mandalaGrow
          ).delay(300)}
          style={[styles.mandalaContainer, mandalaStyle]}
        >
          {/* Outer Glow Ring */}
          <Animated.View
            entering={FadeIn.duration(
              ANIMATION_TIMINGS.splash.glowEffect
            ).delay(800)}
            style={styles.glowRing}
          />

          {/* Mandala Circle with Rotating Border */}
          <View style={styles.mandalaCircle}>
            {/* Rotating particles orbit */}
            {Array.from({ length: 8 }).map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.particle,
                  {
                    transform: [
                      { rotate: `${(360 / 8) * index}deg` },
                      { translateY: -(MANDALA_SIZE / 2 + 30) },
                    ],
                  },
                  mandalaStyle,
                ]}
              >
                <View style={styles.particleDot} />
              </Animated.View>
            ))}

            {/* Hand Icon in Center */}
            <Text style={styles.palmIcon}>🖐️</Text>
          </View>
        </Animated.View>

        {/* Call-to-Action Button - Slides up */}
        <Animated.View
          entering={SlideInUp.duration(500).delay(1200)}
          style={styles.ctaSection}
        >
          <Pressable
            onPress={handleBeginReading}
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed,
            ]}
          >
            <Text style={styles.ctaText}>Tap to Begin Your Reading</Text>
            <Text style={styles.ctaSubtext}>
              Discover what your palms reveal
            </Text>
          </Pressable>
        </Animated.View>

        {/* Footer Tagline - Fades in last */}
        <Animated.View
          entering={FadeIn.duration(400).delay(1600)}
          style={styles.footerSection}
        >
          <Text style={styles.footerText}>
            Ancient wisdom meets modern AI
          </Text>
        </Animated.View>
      </View>
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
    // backgroundColor: "#FF6B35", // Saffron/Orange from design
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
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  /* Branding Section */
  brandingSection: {
    alignItems: "center",
    marginTop: 20,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "600",
    color: palmColors.accent,
    letterSpacing: 2,
    marginBottom: 8,
  },
  appName: {
    fontSize: 48,
    fontWeight: "800",
    color: palmColors.accent,
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: "center",
  },
  appSubtitle: {
    fontSize: 16,
    color: palmColors.text,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.85,
  },

  /* Mandala Section */
  mandalaContainer: {
    width: MANDALA_SIZE,
    height: MANDALA_SIZE,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 30,
  },
  glowRing: {
    position: "absolute",
    width: MANDALA_SIZE + 40,
    height: MANDALA_SIZE + 40,
    borderRadius: (MANDALA_SIZE + 40) / 2,
    backgroundColor: palmColors.accent,
    opacity: 0.2,
  },
  mandalaCircle: {
    width: MANDALA_SIZE,
    height: MANDALA_SIZE,
    borderRadius: MANDALA_SIZE / 2,
    backgroundColor: "rgba(107, 79, 160, 0.3)", // Mystique Purple with transparency
    borderWidth: 2,
    borderColor: palmColors.accent,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: palmColors.accent,
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  particle: {
    position: "absolute",
  },
  particleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palmColors.accent,
    opacity: 0.8,
  },
  palmIcon: {
    fontSize: 80,
    textAlign: "center",
  },

  /* CTA Section */
  ctaSection: {
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  ctaButton: {
    backgroundColor: palmColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    shadowColor: palmColors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: "700",
    color: palmColors.surface,
    marginBottom: 4,
    textAlign: "center",
  },
  ctaSubtext: {
    fontSize: 13,
    color: palmColors.surface,
    opacity: 0.8,
    textAlign: "center",
  },

  /* Footer Section */
  footerSection: {
    marginBottom: 10,
  },
  footerText: {
    fontSize: 12,
    color: palmColors.text,
    opacity: 0.6,
    textAlign: "center",
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
});
