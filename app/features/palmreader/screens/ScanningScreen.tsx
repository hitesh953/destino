/**
 * ScanningScreen - Palm Reading Scanning & Results
 * Phase 1: Animated scan line over uploaded palm image (waiting for API)
 * Phase 2: Results reveal with palm lines and labeled points
 * Phase 3: CTA button to continue to reading form
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import Svg, { Line, Circle, Text as SvgText, Path } from "react-native-svg";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { palmColors } from "@/theme/palmreader/colors";
import type { RootStackParamList } from "@/navigation/RootNavigator";

const { width, height } = Dimensions.get("window");
const FRAME_SIZE = Math.min(width - 40, 400);
const CORNER_BRACKET_SIZE = 30;
const SCAN_LINE_HEIGHT = 6;
const ANIMATION_DURATION = 1500;

type ScanningScreenProps = {
  route: RouteProp<RootStackParamList, "Scanning">;
};

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

// Corner bracket component
const CornerBracket = ({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) => {
  const positionStyles = {
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    br: { bottom: 0, right: 0 },
  };

  const rotations = {
    tl: "0deg",
    tr: "90deg",
    bl: "270deg",
    br: "180deg",
  };

  return (
    <View
      style={[
        styles.cornerBracket,
        positionStyles[corner],
        { transform: [{ rotate: rotations[corner] }] },
      ]}
    >
      <View style={styles.bracketHorizontal} />
      <View style={styles.bracketVertical} />
    </View>
  );
};

// Animated scan line component
const ScanLine = ({ isScanning }: { isScanning: boolean }) => {
  const scanPosition = useSharedValue(0);

  useEffect(() => {
    if (isScanning) {
      scanPosition.value = withRepeat(
        withTiming(1, {
          duration: ANIMATION_DURATION,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }
  }, [isScanning, scanPosition]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scanPosition.value,
      [0, 1],
      [0, FRAME_SIZE],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.scanLine,
        {
          width: FRAME_SIZE,
          height: SCAN_LINE_HEIGHT,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.scanLineGlow} />
    </Animated.View>
  );
};

// Palm lines and points overlay
const PalmLinesOverlay = () => (
  <Svg width={FRAME_SIZE} height={FRAME_SIZE} viewBox={`0 0 ${FRAME_SIZE} ${FRAME_SIZE}`}>
    {/* Heart Line */}
    <Path
      d={`M ${FRAME_SIZE * 0.1} ${FRAME_SIZE * 0.25} Q ${FRAME_SIZE * 0.5} ${FRAME_SIZE * 0.15}, ${FRAME_SIZE * 0.9} ${FRAME_SIZE * 0.28}`}
      stroke="black"
      strokeWidth="2"
      fill="none"
    />

    {/* Head Line */}
    <Path
      d={`M ${FRAME_SIZE * 0.1} ${FRAME_SIZE * 0.5} Q ${FRAME_SIZE * 0.5} ${FRAME_SIZE * 0.45}, ${FRAME_SIZE * 0.9} ${FRAME_SIZE * 0.52}`}
      stroke="black"
      strokeWidth="2"
      fill="none"
    />

    {/* Life Line */}
    <Path
      d={`M ${FRAME_SIZE * 0.2} ${FRAME_SIZE * 0.2} Q ${FRAME_SIZE * 0.25} ${FRAME_SIZE * 0.6}, ${FRAME_SIZE * 0.15} ${FRAME_SIZE * 0.9}`}
      stroke="black"
      strokeWidth="2"
      fill="none"
    />

    {/* Fate Line */}
    <Path
      d={`M ${FRAME_SIZE * 0.5} ${FRAME_SIZE * 0.9} L ${FRAME_SIZE * 0.5} ${FRAME_SIZE * 0.2}`}
      stroke="black"
      strokeWidth="2"
      fill="none"
    />

    {/* Key Points */}
    <Circle cx={FRAME_SIZE * 0.25} cy={FRAME_SIZE * 0.3} r="4" fill="black" />
    <SvgText
      x={FRAME_SIZE * 0.32}
      y={FRAME_SIZE * 0.32}
      fontSize="10"
      fill="black"
      fontWeight="bold"
    >
      A
    </SvgText>

    <Circle cx={FRAME_SIZE * 0.5} cy={FRAME_SIZE * 0.2} r="4" fill="black" />
    <SvgText
      x={FRAME_SIZE * 0.53}
      y={FRAME_SIZE * 0.22}
      fontSize="10"
      fill="black"
      fontWeight="bold"
    >
      B
    </SvgText>

    <Circle cx={FRAME_SIZE * 0.7} cy={FRAME_SIZE * 0.4} r="4" fill="black" />
    <SvgText
      x={FRAME_SIZE * 0.73}
      y={FRAME_SIZE * 0.42}
      fontSize="10"
      fill="black"
      fontWeight="bold"
    >
      C
    </SvgText>

    <Circle cx={FRAME_SIZE * 0.3} cy={FRAME_SIZE * 0.7} r="4" fill="black" />
    <SvgText
      x={FRAME_SIZE * 0.33}
      y={FRAME_SIZE * 0.72}
      fontSize="10"
      fill="black"
      fontWeight="bold"
    >
      D
    </SvgText>
  </Svg>
);

// Point callouts text
const PointCallouts = () => (
  <View style={styles.calloutsContainer}>
    <View style={styles.calloutBox}>
      <Text style={styles.calloutLabel}>A – Heart Line</Text>
      <Text style={styles.calloutText}>Emotional depth & relationships</Text>
    </View>
    <View style={styles.calloutBox}>
      <Text style={styles.calloutLabel}>B – Head Line</Text>
      <Text style={styles.calloutText}>Intellect & decision making</Text>
    </View>
    <View style={styles.calloutBox}>
      <Text style={styles.calloutLabel}>C – Life Line</Text>
      <Text style={styles.calloutText}>Vitality & life journey</Text>
    </View>
    <View style={styles.calloutBox}>
      <Text style={styles.calloutLabel}>D – Fate Line</Text>
      <Text style={styles.calloutText}>Destiny & major life events</Text>
    </View>
  </View>
);

export const ScanningScreen: React.FC<ScanningScreenProps> = ({ route }) => {
  const navigation = useNavigation<NavigationType>();
  const { palmImageUri, readingId } = route.params;

  const [phase, setPhase] = useState<"scanning" | "result">("scanning");
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useSharedValue(0);

  // Simulate API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Transition to result phase after 3 seconds of scanning
      setTimeout(() => {
        setPhase("result");
        fadeAnim.value = withTiming(1, { duration: 500 });
      }, 3000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const handleContinue = () => {
    navigation.navigate("ReadingForm", {
      palmImageUri,
      readingId,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background */}
      <View style={styles.background} />

      {/* Scanning Phase */}
      {phase === "scanning" && (
        <View style={styles.contentContainer}>
          <View style={styles.frameContainer}>
            <Image
              source={{ uri: palmImageUri }}
              style={styles.palmImage}
              resizeMode="cover"
            />
            <ScanLine isScanning={true} />

            {/* Corner Brackets */}
            <CornerBracket corner="tl" />
            <CornerBracket corner="tr" />
            <CornerBracket corner="bl" />
            <CornerBracket corner="br" />
          </View>

          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color={palmColors.accent} />
            <Text style={styles.statusText}>Analyzing your palm...</Text>
            <Text style={styles.statusSubtext}>
              Reading cosmic patterns
            </Text>
          </View>
        </View>
      )}

      {/* Result Phase */}
      {phase === "result" && (
        <Animated.View style={[styles.contentContainer, fadeStyle]}>
          <View style={styles.frameContainer}>
            <Image
              source={{ uri: palmImageUri }}
              style={styles.palmImage}
              resizeMode="cover"
            />
            <View style={styles.linesOverlay}>
              <PalmLinesOverlay />
            </View>

            {/* Corner Brackets */}
            <CornerBracket corner="tl" />
            <CornerBracket corner="tr" />
            <CornerBracket corner="bl" />
            <CornerBracket corner="br" />
          </View>

          <Text style={styles.resultTitle}>Your Palm Reading</Text>
          <PointCallouts />
        </Animated.View>
      )}

      {/* CTA Button - Shows when result is ready */}
      {phase === "result" && (
        <Animated.View style={[styles.ctaContainer, fadeStyle]}>
          <Pressable
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed,
            ]}
            onPress={handleContinue}
          >
            <Text style={styles.ctaText}>Reveal My Full Reading →</Text>
          </Pressable>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palmColors.background,
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(15, 12, 41, 0.95)",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  frameContainer: {
    position: "relative",
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "black",
    marginBottom: 40,
  },
  palmImage: {
    width: "100%",
    height: "100%",
  },
  scanLine: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(138, 43, 226, 0.4)",
    borderTopWidth: SCAN_LINE_HEIGHT,
    borderTopColor: "rgba(186, 85, 211, 0.8)",
  },
  scanLineGlow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(186, 85, 211, 0.6)",
    shadowColor: "#BA55D3",
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
  },
  cornerBracket: {
    position: "absolute",
    width: CORNER_BRACKET_SIZE,
    height: CORNER_BRACKET_SIZE,
  },
  bracketHorizontal: {
    position: "absolute",
    width: CORNER_BRACKET_SIZE,
    height: 3,
    backgroundColor: "white",
    top: 0,
    left: 0,
  },
  bracketVertical: {
    position: "absolute",
    width: 3,
    height: CORNER_BRACKET_SIZE,
    backgroundColor: "white",
    top: 0,
    left: 0,
  },
  statusContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginTop: 16,
  },
  statusSubtext: {
    fontSize: 14,
    color: palmColors.accent,
    marginTop: 8,
    opacity: 0.8,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: palmColors.accent,
    marginBottom: 20,
    textAlign: "center",
  },
  linesOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  calloutsContainer: {
    width: "100%",
    gap: 12,
  },
  calloutBox: {
    backgroundColor: "rgba(138, 43, 226, 0.2)",
    borderLeftWidth: 3,
    borderLeftColor: palmColors.accent,
    padding: 12,
    borderRadius: 8,
  },
  calloutLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: palmColors.accent,
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
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
