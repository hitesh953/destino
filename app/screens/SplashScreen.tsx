import { FC, useEffect } from "react"
import { StyleSheet, View, Text } from "react-native"
import * as SplashScreenLib from "expo-splash-screen"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"

import type { AppStackScreenProps } from "@/navigators/navigationTypes"

// ─── Colors ──────────────────────────────────────────────────────────────────
const BG = "#1E1228"
const GOLD = "#C8B445"

type SplashScreenProps = AppStackScreenProps<"Splash">

export const SplashScreen: FC<SplashScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets()

  // Rotate the golden circle
  const rotation = useSharedValue(0)
  // Pulse the golden circle
  const scale = useSharedValue(1)
  // Fade in text
  const textOpacity = useSharedValue(0)

  useEffect(() => {
    // Hide native splash immediately
    SplashScreenLib.hideAsync().catch(() => {})

    // Continuous rotation
    rotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false,
    )

    // Pulse animation
    scale.value = withRepeat(
      withTiming(1.2, { duration: 1500, easing: Easing.ease }),
      -1,
      true, // reverse
    )

    // Fade in text
    textOpacity.value = withTiming(1, { duration: 1200, easing: Easing.ease })

    // Navigate after 3.2 seconds
    const timer = setTimeout(() => {
      navigation.replace("Welcome")
    }, 3200)

    return () => clearTimeout(timer)
  }, [])

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }))

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom + 32, paddingTop: insets.top }]}>
      {/* Center mandala orb */}
      <View style={styles.center}>
        {/* Outer ring (static) */}
        <View style={[styles.ring, styles.ring1]} />

        {/* Middle ring (rotating) */}
        <Animated.View style={[styles.ring, styles.ring2, rotationStyle]}>
          <View style={styles.ringMarker} />
        </Animated.View>

        {/* Inner ring (static) */}
        <View style={[styles.ring, styles.ring3]} />

        {/* Golden orb (pulsing) */}
        <Animated.View style={[styles.orb, scaleStyle]} />
      </View>

      {/* Text */}
      <Animated.View style={[styles.textBlock, textStyle]}>
        <Text style={styles.title}>DESTINO</Text>
        <Text style={styles.subtitle}>Decode Your Destiny</Text>
      </Animated.View>

      {/* Pagination dots */}
      <Animated.View style={[styles.dotsRow, textStyle]}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "space-between",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  ring: {
    position: "absolute",
    borderColor: "rgba(200,180,100,0.3)",
    borderWidth: 2,
    borderRadius: 9999,
  },

  ring1: {
    width: 200,
    height: 200,
  },

  ring2: {
    width: 140,
    height: 140,
  },

  ring3: {
    width: 90,
    height: 90,
  },

  ringMarker: {
    position: "absolute",
    width: 6,
    height: 6,
    backgroundColor: GOLD,
    borderRadius: 3,
    top: -8,
  },

  orb: {
    width: 80,
    height: 80,
    backgroundColor: GOLD,
    borderRadius: 40,
  },

  textBlock: {
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: 6,
    color: GOLD,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.75)",
  },

  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "rgba(200,180,100,0.35)",
  },

  dotActive: {
    backgroundColor: GOLD,
  },
})
