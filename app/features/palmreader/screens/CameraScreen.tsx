/**
 * CameraScreen - Capture Palm Image
 *
 * Captures a real photo and hands it straight to ScanningScreen. There is
 * no on-device hand/palm detection here — no model is bundled in this app,
 * so the capture button is simply enabled once the camera is ready. Real
 * validation (is a palm actually visible, is the photo usable) happens
 * server-side against the real photo, right after capture.
 */

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { palmColors } from "@/theme/palmreader/colors";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { SafeAreaView } from "react-native-safe-area-context";

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

// Static framing guide — a visual aid only, not a claim of detection.
const HandMarker = ({ opacity = 1 }) => (
  <Image
    source={require("../../../../assets/svg/hand-marker.png")}
    style={{
      width: 480,
      height: 480,
      opacity,
      resizeMode: "contain",
    }}
  />
);

export const CameraScreen: React.FC = () => {
  const navigation = useNavigation<NavigationType>();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const captureOpacity = useSharedValue(0);
  const captureScale = useSharedValue(1);

  const requestCameraPermissions = async () => {
    const { granted } = await requestPermission();
    if (!granted) {
      Alert.alert(
        "Camera Permission Required",
        "To capture your palm image, we need access to your camera. Please enable camera permissions in settings.",
        [
          { text: "Go to Settings", onPress: () => navigation.goBack() },
          { text: "Cancel", onPress: () => navigation.goBack(), style: "cancel" },
        ]
      );
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing || !cameraReady) {
      return;
    }

    try {
      setIsCapturing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        skipProcessing: false,
      });

      if (!photo?.uri) {
        Alert.alert("Error", "Failed to capture photo. Please try again.");
        setIsCapturing(false);
        return;
      }

      captureOpacity.value = withTiming(1, { duration: 300 });
      captureScale.value = withTiming(1.1, { duration: 300 });

      setTimeout(() => {
        const readingId = `reading_${Date.now()}`;
        navigation.navigate("Scanning", {
          palmImageUri: photo.uri,
          readingId,
        });
        setIsCapturing(false);
      }, 500);
    } catch (error) {
      console.error("Error capturing photo:", error);
      Alert.alert("Error", "Failed to capture photo. Please try again.");
      setIsCapturing(false);
    }
  };

  const captureAnimatedStyle = useAnimatedStyle(() => ({
    opacity: captureOpacity.value,
    transform: [{ scale: captureScale.value }],
  }));

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palmColors.accent} />
          <Text style={styles.loadingText}>Requesting camera access...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.deniedContainer}>
          <Text style={styles.deniedTitle}>Camera Access Required</Text>
          <Text style={styles.deniedText}>
            We need access to your camera to capture your palm for analysis.
          </Text>
          <Pressable style={styles.retryButton} onPress={requestCameraPermissions}>
            <Text style={styles.retryButtonText}>Request Permission</Text>
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onCameraReady={() => setCameraReady(true)}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Position Your Palm</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Framing guide */}
        <View style={styles.guideContainer}>
          <HandMarker opacity={0.7} />
        </View>

        {/* Capture Button Area */}
        <View style={styles.bottomContainer}>
          <Text style={styles.instructionText}>📍 Position your palm in the frame</Text>

          {isCapturing && <Animated.View style={[styles.captureFlash, captureAnimatedStyle]} />}

          <Pressable
            style={({ pressed }: { pressed: boolean }) => [
              styles.captureButton,
              pressed && !isCapturing && styles.captureButtonPressed,
              (isCapturing || !cameraReady) && styles.captureButtonDisabled,
            ]}
            onPress={handleCapture}
            disabled={isCapturing || !cameraReady}
          >
            {isCapturing ? (
              <ActivityIndicator color={palmColors.accent} size="large" />
            ) : (
              <View style={styles.captureButtonInner}>
                <View style={styles.captureButtonDot} />
              </View>
            )}
          </Pressable>

          <Text style={styles.captureButtonLabel}>
            {isCapturing ? "Capturing..." : cameraReady ? "Tap to Capture" : "Getting camera ready..."}
          </Text>
        </View>
      </CameraView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palmColors.background,
  },
  camera: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: palmColors.text,
  },

  deniedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: palmColors.background,
  },
  deniedTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: palmColors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  deniedText: {
    fontSize: 16,
    color: palmColors.textDim,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: palmColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  retryButtonText: {
    color: palmColors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    borderWidth: 2,
    borderColor: palmColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 28,
    width: "100%",
    alignItems: "center",
  },
  cancelButtonText: {
    color: palmColors.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: "#FFC107",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },

  guideContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  bottomContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 24,
    alignItems: "center",
  },
  instructionText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 18,
  },

  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palmColors.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: palmColors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  captureButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonDot: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: palmColors.accent,
  },
  captureButtonLabel: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  captureFlash: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: palmColors.accent,
    opacity: 0.8,
  },
});
