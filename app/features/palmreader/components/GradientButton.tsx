import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Poppins_700Bold } from "@expo-google-fonts/poppins";

interface ReadingButtonProps {
  onPress?: () => void;
}

export default function ReadingButton({
  onPress,
}: ReadingButtonProps) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0.9],
  });

  return (
    <View style={styles.wrapper}>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.touchable}
      >
        {/* Main button with gradient */}
        <LinearGradient
          colors={[
            "#9148F5",
            "#7040E5",
            "#5B35D5",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >

            {/* Star */}
            <View style={styles.starContainer}>
              <Image
                source={require("@assets/images/sparkles.png")}
                style={styles.sparklesIcon}
              />
            </View>

            {/* Text */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>
                Tap to Begin Your Reading
              </Text>

              <Text style={styles.subtitle}>
                Discover what your palms reveal
              </Text>
            </View>

            {/* Chevron */}
            <View style={styles.arrowContainer}>
              <Ionicons
                name="chevron-forward"
                size={30}
                color="#FFFFFF"
              />
            </View>

        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  touchable: {
    width: "100%",
  },

  button: {
    height: 80,
    borderRadius: 78,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    overflow: "hidden",

    shadowColor: "#FF6BFF",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.85,
    shadowRadius: 20,
    elevation: 18,
  },

  topHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 65,
    borderTopLeftRadius: 76,
    borderTopRightRadius: 76,
  },

  starContainer: {
    width: 55,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sparklesIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },

  textContainer: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
    lineHeight: 24,
    fontFamily: Poppins_700Bold,
  },

  subtitle: {
    marginTop: 3,
    color: "#DCCBFF",
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.2,
  },

  arrowContainer: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: 5,
  },
});