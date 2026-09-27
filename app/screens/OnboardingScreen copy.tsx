/**
 * OnboardingScreen - User Information Collection
 * Mystical Palm Reading Theme with Zodiac Elements
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  SafeAreaView,
  Platform,
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationType>();

  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthTime, setBirthTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const palmRotateAnim = new Animated.Value(0);
  const headerFadeAnim = new Animated.Value(0);
  const formFadeAnims = [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ];

  useEffect(() => {
    // Header fade in
    Animated.timing(headerFadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Palm gentle rotation animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(palmRotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(palmRotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Staggered form fields animation
    const staggerDelay = 120;
    formFadeAnims.forEach((anim, index) => {
      setTimeout(() => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, staggerDelay * (index + 1) + 400);
    });
  }, []);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setBirthTime(selectedTime);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!name.trim() || !placeOfBirth.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const userData = {
        name,
        dateOfBirth: dateOfBirth.toISOString(),
        birthTime: birthTime.toISOString(),
        placeOfBirth,
        completedOnboarding: true,
      };

      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      await AsyncStorage.setItem("onboardingCompleted", "true");

      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      });
    } catch (error) {
      console.error("Error saving user data:", error);
      alert("Failed to save your information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const palmRotation = palmRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "5deg"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("@assets/images/detail_backgroundImg.png")}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        {/* Animated Header with Palm - Fixed at top */}
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: headerFadeAnim,
            },
          ]}
        >
          <Text style={styles.headerLabel}>WELCOME TO</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Destino</Text>
            <Text style={styles.sparkle}>✨</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Let's get to know you better to provide personalized insights.
          </Text>
        </Animated.View>

        {/* Form Section - Scrollable with Keyboard Avoidance */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            style={styles.formScrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Form Container with white background */}
            <View style={styles.formContainer}>
              {/* Name Input - Animated */}
              <Animated.View style={[{ opacity: formFadeAnims[0] }]}>
                <FormField
                  icon="person"
                  label="Your Name"
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                />
              </Animated.View>

              {/* Date of Birth - Animated */}
              <Animated.View style={[{ opacity: formFadeAnims[1] }]}>
                <DateFormField
                  icon="calendar-today"
                  label="Date of Birth"
                  value={dateOfBirth.toLocaleDateString()}
                  onPress={() => setShowDatePicker(true)}
                />
                {showDatePicker && (
                  <DateTimePicker
                    value={dateOfBirth}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </Animated.View>

              {/* Birth Time - Animated */}
              <Animated.View style={[{ opacity: formFadeAnims[2] }]}>
                <DateFormField
                  icon="schedule"
                  label="Birth Time (Optional)"
                  value={birthTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  onPress={() => setShowTimePicker(true)}
                />
                {showTimePicker && (
                  <DateTimePicker
                    value={birthTime}
                    mode="time"
                    display="spinner"
                    onChange={handleTimeChange}
                  />
                )}
              </Animated.View>

              {/* Place of Birth - Animated */}
              <Animated.View style={[{ opacity: formFadeAnims[3] }]}>
                <FormField
                  icon="location-on"
                  label="Place of Birth"
                  placeholder="City, Country"
                  value={placeOfBirth}
                  onChangeText={setPlaceOfBirth}
                />
              </Animated.View>

              {/* Info Box */}
              <View style={styles.infoBox}>
                <MaterialIcons
                  name="shield"
                  size={20}
                  color="#6B4FA0"
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>
                  This information helps us provide accurate astrological and
                  palmistry insights tailored to you.
                </Text>
              </View>

              {/* Submit Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.submitButtonPressed,
                  isLoading && styles.submitButtonDisabled,
                ]}
                onPress={handleCompleteOnboarding}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? "Saving..." : "Continue to Dashboard"}
                </Text>
                <MaterialIcons
                  name="arrow-forward"
                  size={20}
                  color="white"
                  style={styles.buttonIcon}
                />
              </Pressable>
            </View>

              {/* Bottom text */}
              <View style={styles.bottomSection}>
                <Text style={styles.bottomText}>YOUR HAND ✦ YOUR STORY</Text>
              </View>

              {/* Wavy bottom decoration */}
              <View style={styles.waveBottom} />
            </ScrollView>
          </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

// Form Field Component
interface FormFieldProps {
  icon: string;
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}

const FormField: React.FC<FormFieldProps> = ({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      <MaterialIcons
        name={icon as any}
        size={20}
        color="#9CA3AF"
        style={styles.fieldIcon}
      />
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor="#D1D5DB"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  </View>
);

// Date Form Field Component
interface DateFormFieldProps {
  icon: string;
  label: string;
  value: string;
  onPress: () => void;
}

const DateFormField: React.FC<DateFormFieldProps> = ({
  icon,
  label,
  value,
  onPress,
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Pressable style={styles.inputWrapper} onPress={onPress}>
      <MaterialIcons
        name={icon as any}
        size={20}
        color="#9CA3AF"
        style={styles.fieldIcon}
      />
      <Text style={styles.dateText}>{value}</Text>
      <MaterialIcons
        name={icon as any}
        size={20}
        color="#9CA3AF"
        style={styles.fieldIconRight}
      />
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3E8FF",
  },
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    resizeMode: "cover",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  formScrollView: {
    flex: 1,
  },

  /* Header Section */
  headerSection: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    width: '50%'
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#E9D5FF",
    letterSpacing: 1.5,
    marginBottom: 2,
    marginTop: 80
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 12,
  },
  mainTitle: {
    fontSize: 40,
    fontWeight: "800",
    color: "#F5C86A",
    marginBottom: 0,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  sparkle: {
    fontSize: 28,
    marginLeft: 6,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#E9D5FF",
    lineHeight: 16,
    marginBottom: 12,
  },
  /* Scroll Content */
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 30,
  },

  /* Form Container */
  formContainer: {
    backgroundColor: "rgba(255, 253, 252, 0.94)",
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginBottom: 0,
    marginTop: 40,
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  /* Field Group */
  fieldGroup: {
    marginBottom: 12,
    gap: 10,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A237E",
    marginLeft: 2,
  },

  /* Input Wrapper */
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E8EBF5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 5,
  },
  fieldIcon: {
    marginRight: 12,
    color: "#8B7DB8",
  },
  fieldIconRight: {
    marginLeft: "auto",
    color: "#8B7DB8",
  },

  /* Text Input */
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A237E",
    paddingVertical: 12,
  },

  /* Date Text */
  dateText: {
    flex: 1,
    fontSize: 16,
    color: "#1A237E",
  },

  /* Info Box */
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#EDE7F6",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    marginTop: 8,
    gap: 10,
    alignItems: "flex-start",
  },
  infoIcon: {
    marginTop: 3,
    color: "#7B5BA0",
  },
  infoText: {
    fontSize: 12,
    color: "#6B4FA0",
    lineHeight: 16,
    flex: 1,
    fontWeight: "500",
  },

  /* Submit Button */
  submitButton: {
    backgroundColor: "#7B68EE",
    borderRadius: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7B68EE",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    marginTop: 8,
  },
  submitButtonPressed: {
    backgroundColor: "#6A5ADB",
    transform: [{ scale: 0.98 }],
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
    marginRight: 6,
  },
  buttonIcon: {
    marginLeft: 4,
  },

  /* Bottom Section */
  bottomSection: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 20
  },
  bottomText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6F42C1",
    letterSpacing: 2.5,
  },
  waveBottom: {
    height: 30,
    backgroundColor: "transparent",
    marginTop: 16,
  },
});
