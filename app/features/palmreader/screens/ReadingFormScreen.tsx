/**
 * ReadingFormScreen - User Details Form
 * Collects user information (nickname, age, birthplace) before processing
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { palmColors } from "@/theme/palmreader/colors";
import type { RootStackParamList } from "@/navigation/RootNavigator";

type ReadingFormScreenProps = {
  route: RouteProp<RootStackParamList, "ReadingForm">;
};

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

export const ReadingFormScreen: React.FC<ReadingFormScreenProps> = ({ route }) => {
  const navigation = useNavigation<NavigationType>();
  const { palmImageUri, readingId } = route.params;

  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [birthplace, setBirthplace] = useState("");

  const handleContinue = () => {
    navigation.replace("Processing", {
      capturedImageUri: palmImageUri,
      readingId,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Text style={styles.title}>About You</Text>
        <Text style={styles.subtitle}>
          Help us personalize your reading
        </Text>

        {/* Nickname Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="rgba(0, 0, 0, 0.8)"
            value={nickname}
            onChangeText={setNickname}
          />
        </View>

        {/* Age Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            placeholderTextColor="rgba(0, 0, 0, 0.8)"
            keyboardType="number-pad"
            value={age}
            onChangeText={setAge}
          />
        </View>

        {/* Birthplace Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Birthplace</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your birthplace"
            placeholderTextColor="rgba(0, 0, 0, 0.8)"
            value={birthplace}
            onChangeText={setBirthplace}
          />
        </View>

        {/* Continue Button */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Get Full Reading →</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palmColors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: palmColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: palmColors.textDim,
    marginBottom: 28,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: palmColors.accent,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(107, 79, 160, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: palmColors.text,
  },
  button: {
    backgroundColor: palmColors.primary,
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    shadowColor: palmColors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
});
