/**
 * ScanningScreen - Post-Capture Transition
 * Shows the real captured photo (no fake overlay/palm lines — those were
 * hardcoded and unrelated to the actual image) before handing off to
 * ProcessingScreen, where the real (server-side) analysis happens.
 * Name/age/birthplace come from the user's own profile (collected at
 * onboarding) server-side — no need to ask again here.
 */

import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { palmColors } from "@/theme/palmreader/colors";
import type { RootStackParamList } from "@/navigation/RootNavigator";

const FRAME_SIZE = 300;

type ScanningScreenProps = {
  route: RouteProp<RootStackParamList, "Scanning">;
};

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

export const ScanningScreen: React.FC<ScanningScreenProps> = ({ route }) => {
  const navigation = useNavigation<NavigationType>();
  const { palmImageUri, readingId } = route.params;

  const handleContinue = () => {
    navigation.replace("Processing", {
      capturedImageUri: palmImageUri,
      readingId,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.frameContainer}>
          <Image source={{ uri: palmImageUri }} style={styles.palmImage} resizeMode="cover" />
        </View>

        <Text style={styles.capturedLabel}>✓ Photo captured</Text>
        <Text style={styles.title}>Ready for your reading</Text>
        <Text style={styles.subtitle}>We'll use the details from your profile to personalize it.</Text>
      </View>

      <View style={styles.ctaContainer}>
        <Pressable style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]} onPress={handleContinue}>
          <Text style={styles.ctaText}>Get My Reading →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palmColors.background,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  frameContainer: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "black",
    marginBottom: 20,
  },
  palmImage: {
    width: "100%",
    height: "100%",
  },
  capturedLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: palmColors.success,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: palmColors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: palmColors.textDim,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  ctaContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  ctaButton: {
    backgroundColor: palmColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: palmColors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
});
