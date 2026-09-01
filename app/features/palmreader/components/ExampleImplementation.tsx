/**
 * Example Implementation of Palm Reader App Components
 * Shows how to use theme, animations, and state management
 */

import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  FadeIn,
  SlideInLeft,
  withRepeat,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { palmColors } from "@/theme/palmreader/colors";
import { ANIMATION_TIMINGS, EASING } from "@/utils/animations/timings";
import { usePalmStore } from "@/stores";

/**
 * EXAMPLE 1: Simple Component with Theme Colors
 */
export const ExampleCard = () => {
  return (
    <View
      style={{
        backgroundColor: palmColors.surface,
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: palmColors.accent,
      }}
    >
      <Text style={{ color: palmColors.text, fontSize: 18, fontWeight: "bold" }}>
        Your Last Reading
      </Text>
      <Text style={{ color: palmColors.textDim, fontSize: 14, marginTop: 8 }}>
        Love awaits in your future
      </Text>
    </View>
  );
};

/**
 * EXAMPLE 2: Animated Component with Fade-In
 */
export const ExampleAnimatedCard = () => {
  return (
    <Animated.View
      entering={FadeIn.duration(ANIMATION_TIMINGS.home.cardEntrance)}
      style={{
        backgroundColor: palmColors.primary,
        padding: 16,
        borderRadius: 16,
        marginVertical: 8,
      }}
    >
      <Text style={{ color: palmColors.surface, fontSize: 16, fontWeight: "bold" }}>
        ✨ Take New Reading
      </Text>
    </Animated.View>
  );
};

/**
 * EXAMPLE 3: Staggered Card Entrance (Multiple Cards)
 */
interface StaggeredCardsProps {
  items: string[];
}

export const ExampleStaggeredCards = ({ items }: StaggeredCardsProps) => {
  return (
    <View>
      {items.map((item, index) => (
        <Animated.View
          key={index}
          entering={SlideInLeft
            .duration(ANIMATION_TIMINGS.reading.cardSlideIn)
            .delay(index * ANIMATION_TIMINGS.reading.cardStagger)}
          style={{
            backgroundColor: palmColors.surfaceAlt,
            padding: 12,
            borderRadius: 12,
            marginVertical: 8,
            borderLeftWidth: 4,
            borderLeftColor: palmColors.accent,
          }}
        >
          <Text style={{ color: palmColors.surface }}>{item}</Text>
        </Animated.View>
      ))}
    </View>
  );
};

/**
 * EXAMPLE 4: Breathing Button Animation
 */
export const ExampleBreathingButton = () => {
  const borderWidth = useSharedValue(1);

  useEffect(() => {
    // Continuous breathing effect
    borderWidth.value = withRepeat(
      withTiming(3, { duration: ANIMATION_TIMINGS.home.ctaBreathing }),
      -1,
      true // Reverse animation for breathing effect
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: borderWidth.value,
  }));

  return (
    <Animated.View
      style={[
        {
          backgroundColor: palmColors.accent,
          padding: 16,
          borderRadius: 28,
          borderColor: palmColors.accent,
        },
        animatedStyle,
      ]}
    >
      <Pressable>
        <Text
          style={{
            color: palmColors.text,
            fontSize: 16,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Tap for New Reading
        </Text>
      </Pressable>
    </Animated.View>
  );
};

/**
 * EXAMPLE 5: Using Zustand Store
 */
export const ExampleStoreUsage = () => {
  // Get state from Zustand store
  const { user, readings, addReading, setTheme, preferences } = usePalmStore();

  const handleAddMockReading = () => {
    addReading({
      id: `reading_${Date.now()}`,
      userId: user.userId || "demo",
      timestamp: Date.now(),
      palmImageUri: "file://mock-image.jpg",
      analysis: {
        loveLife: "Love awaits",
        career: "Success ahead",
        health: "Strong vitality",
        finance: "Prosperity coming",
      },
      predictions: [],
      metadata: {
        processingTimeMs: 2000,
        modelVersion: "1.0",
        imageQuality: "high",
      },
      isFavorite: false,
    });
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color: palmColors.text, fontSize: 18, fontWeight: "bold" }}>
        Store Example
      </Text>

      <Text style={{ color: palmColors.textDim, marginTop: 8 }}>
        Total Readings: {readings.length}
      </Text>

      <Text style={{ color: palmColors.textDim }}>
        Theme: {preferences.theme}
      </Text>

      <Pressable
        onPress={handleAddMockReading}
        style={{
          backgroundColor: palmColors.primary,
          padding: 12,
          borderRadius: 8,
          marginTop: 16,
        }}
      >
        <Text style={{ color: palmColors.surface, fontWeight: "bold" }}>
          Add Mock Reading
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setTheme("dark")}
        style={{
          backgroundColor: palmColors.secondary,
          padding: 12,
          borderRadius: 8,
          marginTop: 8,
        }}
      >
        <Text style={{ color: palmColors.surface, fontWeight: "bold" }}>
          Switch to Dark Mode
        </Text>
      </Pressable>
    </View>
  );
};

/**
 * EXAMPLE 6: Prediction Cards with Animations
 */
interface PredictionCardProps {
  icon: string;
  title: string;
  description: string;
  index: number;
}

export const ExamplePredictionCard = ({
  icon,
  title,
  description,
  index,
}: PredictionCardProps) => {
  return (
    <Animated.View
      entering={SlideInLeft
        .duration(ANIMATION_TIMINGS.reading.cardSlideIn)
        .delay(index * ANIMATION_TIMINGS.reading.cardStagger)}
      style={{
        backgroundColor: palmColors.surfaceAlt,
        padding: 16,
        borderRadius: 12,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: palmColors.accent,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontSize: 24, marginRight: 12 }}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: palmColors.accent, fontWeight: "bold" }}>
            {title}
          </Text>
          <Text style={{ color: palmColors.surface, fontSize: 12, marginTop: 4 }}>
            {description}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

/**
 * EXAMPLE 7: Complete Feature Component
 */
export const ExampleCompleteFeature = () => {
  const { user, readings, addReading } = usePalmStore();

  const predictions = [
    { icon: "❤️", title: "Love Life", description: "A soulmate awaits" },
    { icon: "💼", title: "Career", description: "Success through innovation" },
    { icon: "🏥", title: "Health", description: "Strong vitality ahead" },
    { icon: "💰", title: "Finance", description: "Prosperity coming" },
  ];

  return (
    <Animated.ScrollView
      entering={FadeIn.duration(ANIMATION_TIMINGS.reading.headerFade)}
      style={{
        backgroundColor: palmColors.background,
        paddingHorizontal: 16,
        paddingVertical: 24,
      }}
    >
      {/* Header */}
      <Animated.View
        entering={SlideInLeft.duration(ANIMATION_TIMINGS.reading.titleEntry)}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: palmColors.accent,
            marginBottom: 8,
          }}
        >
          ✨ Your Destiny ✨
        </Text>
      </Animated.View>

      {/* Main Reading Text */}
      <Animated.View
        entering={FadeIn.duration(ANIMATION_TIMINGS.reading.textRevealTotal).delay(200)}
      >
        <Text style={{ color: palmColors.text, fontSize: 14, lineHeight: 22 }}>
          The lines of your hand reveal a journey of transformation. Venus
          dances in your heart line, promising deep connections.
        </Text>
      </Animated.View>

      {/* Prediction Cards */}
      <View style={{ marginTop: 24 }}>
        {predictions.map((pred, index) => (
          <ExamplePredictionCard key={index} {...pred} index={index} />
        ))}
      </View>

      {/* Action Buttons */}
      <Pressable
        style={{
          backgroundColor: palmColors.secondary,
          padding: 14,
          borderRadius: 28,
          marginTop: 24,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            color: palmColors.surface,
            fontSize: 16,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          📤 Share Your Reading
        </Text>
      </Pressable>

      <Pressable
        style={{
          backgroundColor: palmColors.surface,
          padding: 14,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: palmColors.primary,
        }}
      >
        <Text
          style={{
            color: palmColors.primary,
            fontSize: 16,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          💾 Save to Collection
        </Text>
      </Pressable>
    </Animated.ScrollView>
  );
};
