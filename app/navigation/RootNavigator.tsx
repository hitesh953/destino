/**
 * Root Navigation Setup
 * Defines all routes and screen navigation flow
 * Navigation Stack: Welcome → Dashboard → Camera → Scanning → ReadingForm → Processing → ReadingResult → Home
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ParamListBase } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { navigationRef, flushPendingNavigation } from './navigationRef';

// Import all screens
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { DashboardScreen } from '@/features/palmreader/screens/DashboardScreen';
import { TodaysRashifalScreen } from '@/features/palmreader/screens/TodaysRashifalScreen';
import { CameraScreen } from '@/features/palmreader/screens/CameraScreen';
import { ScanningScreen } from '@/features/palmreader/screens/ScanningScreen';
import { ReadingFormScreen } from '@/features/palmreader/screens/ReadingFormScreen';
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
  Onboarding: undefined;
  Welcome: undefined;
  Login: undefined;
  Dashboard: { justLoggedIn?: boolean } | undefined;
  TodaysRashifal: undefined;
  Camera: undefined;
  Scanning: {
    palmImageUri: string;
    readingId: string;
  };
  ReadingForm: {
    palmImageUri: string;
    readingId: string;
  };
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
  const [initialRouteName, setInitialRouteName] = useState<keyof RootStackParamList | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAppStatus();
  }, []);

  const checkAppStatus = async () => {
    try {
      const [onboardingCompleted, userLoggedIn] = await Promise.all([
        AsyncStorage.getItem('onboardingCompleted'),
        AsyncStorage.getItem('userLoggedIn'),
      ]);

      if (userLoggedIn === 'true') {
        setInitialRouteName('Dashboard');
      } else if (onboardingCompleted === 'true') {
        setInitialRouteName('Login');
      } else {
        setInitialRouteName('Welcome');
      }
    } catch (error) {
      console.error('Error checking app status:', error);
      setInitialRouteName('Welcome');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !initialRouteName) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6B4FA0" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} onReady={flushPendingNavigation}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          // Hide default header (custom headers in each screen)
          headerShown: false,

          // Default background color
          contentStyle: {
            backgroundColor: '#F5F1E8', // palmColors.background
          },
        }}
      >
        {/* Navigation Flow:
            - First time: Welcome → Onboarding → Login → Dashboard
            - Onboarded but not logged in: Login directly
            - Logged in: Dashboard directly
        */}

        {/* ============================================
            Screen 1: Welcome (Splash Screen)
            Entry point of the app
            ============================================ */}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            gestureEnabled: false,
          }}
        />

        {/* ============================================
            Screen 2: Onboarding
            User information collection
            ============================================ */}
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            gestureEnabled: false,
          }}
        />

        {/* ============================================
            Screen 2.5: Login
            Email/password auth, shown right after onboarding
            ============================================ */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            gestureEnabled: false,
          }}
        />

        {/* ============================================
            Screen 3: Dashboard (Home/Reading Options)
            Shows palm reading card and scan CTA
            ============================================ */}
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            // Allow back gesture to return to Welcome
            gestureEnabled: true,
          }}
        />

        {/* ============================================
            Screen 3.5: Today's Rashifal
            Displays daily horoscope for user's zodiac sign
            ============================================ */}
        <Stack.Screen
          name="TodaysRashifal"
          component={TodaysRashifalScreen}
          options={{
            gestureEnabled: true,
          }}
        />

        {/* ============================================
            Screen 4: Camera (Photo Capture)
            User captures palm image
            ============================================ */}
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{
            // Allow back gesture to return to Welcome
            gestureEnabled: true,
          }}
        />

        {/* ============================================
            Screen 5: Scanning (Palm Analysis)
            Animated scan with results reveal
            ============================================ */}
        <Stack.Screen
          name="Scanning"
          component={ScanningScreen}
          options={{
            // Disable back gesture during scanning
            gestureEnabled: false,

            // Prevent back button from appearing
            headerLeft: () => null,
          }}
        />

        {/* ============================================
            Screen 6: ReadingForm (User Details)
            Collects user information for reading
            ============================================ */}
        <Stack.Screen
          name="ReadingForm"
          component={ReadingFormScreen}
          options={{
            // Allow back gesture
            gestureEnabled: true,
          }}
        />

        {/* ============================================
            Screen 7: Processing (AI Analysis)
            Shows 4-second processing animation
            ============================================ */}
        <Stack.Screen
          name="Processing"
          component={ProcessingScreen}
          options={{
            // IMPORTANT: Disable back gesture during processing
            // Prevents user from interrupting the 4-second processing
            gestureEnabled: false,

            // Prevent back button from appearing
            headerLeft: () => null,
          }}
        />

        {/* ============================================
            Screen 8: ReadingResult (Display Predictions)
            Shows AI predictions and allows sharing
            ============================================ */}
        <Stack.Screen
          name="ReadingResult"
          component={ReadingResultScreen}
          options={{
            // Disable back gesture (use buttons to navigate instead)
            gestureEnabled: false,

            // Prevent back button from appearing
            headerLeft: () => null,
          }}
        />

        {/* ============================================
            Screen 9: Home (Dashboard)
            Shows reading history and stats
            ============================================ */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
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
