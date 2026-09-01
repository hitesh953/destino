/**
 * Root Navigation Setup
 * Defines all routes and screen navigation flow
 * Navigation Stack: Welcome → Camera → Processing → Results → Home
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ParamListBase } from '@react-navigation/native';

// Import all screens
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { CameraScreen } from '@/features/palmreader/screens/CameraScreen';
import { ProcessingScreen } from '@/features/palmreader/screens/ProcessingScreen';
import { ReadingResultScreen } from '@/features/palmreader/screens/ReadingResultScreen';
import { HomeScreen } from '@/features/palmreader/screens/HomeScreen';

// ============================================
// Type Definitions for Navigation
// ============================================

/**
 * UserData
 * Collected user information from the camera screen flow
 */
export interface UserData {
  palmImage: string | null;
  nickname: string | null;
  ageType: "approximate" | "exact" | null;
  age: number | null;
  dateOfBirth: Date | null;
  birthplace: string | null;
  includeEnhancedReading: boolean;
}

/**
 * RootStackParamList
 * Defines all available routes and their parameters
 * Type-safe navigation throughout the app
 */
export type RootStackParamList = {
  Welcome: undefined;
  Camera: undefined;
  Processing: {
    capturedImageUri: string;
    readingId?: string;
    userData?: UserData;
  };
  ReadingResult: {
    readingId: string;
  };
  Home: undefined;
} & Record<string, object | undefined>;

// Create the navigation stack
const Stack = createNativeStackNavigator<RootStackParamList>();

// ============================================
// Root Navigator Component
// ============================================

/**
 * RootNavigator
 * Main navigation component that wraps all screens
 * Manages screen transitions and animations
 */
export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          // Hide default header (custom headers in each screen)
          headerShown: false,

          // Enable animations between screens
          animationEnabled: true,

          // Default background color
          cardStyle: {
            backgroundColor: '#F5F1E8', // palmColors.background
          },

          // Animation settings
          animationTypeForReplace: 'pop',
        }}
      >
        {/* ============================================
            Screen 1: Welcome (Splash Screen)
            Entry point of the app
            ============================================ */}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            // No animation for first screen (clean entry)
            animationEnabled: false,

            // Prevent back navigation on Welcome screen
            gestureEnabled: false,
          }}
        />

        {/* ============================================
            Screen 2: Camera (Photo Capture)
            User captures palm image
            ============================================ */}
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{
            // Allow smooth animation from Welcome
            animationEnabled: true,

            // Allow back gesture to return to Welcome
            gestureEnabled: true,
          }}
        />

        {/* ============================================
            Screen 3: Processing (AI Analysis)
            Shows 4-second processing animation
            ============================================ */}
        <Stack.Screen
          name="Processing"
          component={ProcessingScreen}
          options={{
            // Smooth fade-in from Camera
            animationEnabled: true,

            // IMPORTANT: Disable back gesture during processing
            // Prevents user from interrupting the 4-second processing
            gestureEnabled: false,

            // Prevent back button from appearing
            headerLeft: () => null,
          }}
        />

        {/* ============================================
            Screen 4: ReadingResult (Display Predictions)
            Shows AI predictions and allows sharing
            ============================================ */}
        <Stack.Screen
          name="ReadingResult"
          component={ReadingResultScreen}
          options={{
            // Smooth transition from Processing
            animationEnabled: true,

            // Disable back gesture (use buttons to navigate instead)
            gestureEnabled: false,

            // Prevent back button from appearing
            headerLeft: () => null,
          }}
        />

        {/* ============================================
            Screen 5: Home (Dashboard)
            Shows reading history and stats
            ============================================ */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            // Smooth animation from ReadingResult
            animationEnabled: true,

            // Allow back gesture
            gestureEnabled: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// ============================================
// Navigation Patterns & Helper Functions
// ============================================

/**
 * Navigation Flow Examples:
 *
 * 1. Forward Navigation (Push):
 *    navigation.navigate('Camera')
 *
 * 2. Replace (No Back Option):
 *    navigation.replace('Processing', {
 *      capturedImageUri: photo.uri,
 *      readingId: 'reading_123'
 *    })
 *
 * 3. Go Back:
 *    navigation.goBack()
 *
 * 4. Reset Stack:
 *    navigation.reset({
 *      index: 0,
 *      routes: [{ name: 'Welcome' }],
 *    })
 */

export default RootNavigator;
