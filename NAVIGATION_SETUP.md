# Navigation Setup Guide - Palm Reader App

## 🗺️ Screen Navigation Flow

```
WelcomeScreen (App Entry Point)
    ↓ (User taps "Tap to Begin Reading")
CameraScreen (Capture Palm Image)
    ↓ (Camera permissions check)
    ├─ If Denied → Show permission dialog
    └─ If Granted → Open camera
    
    ↓ (User captures photo)
ProcessingScreen (4s Analysis with 3 Stages)
    ├─ Stage 1: Detecting Palm Lines (0-1333ms)
    ├─ Stage 2: Analyzing Patterns (1333-2666ms)
    ├─ Stage 3: Generating Predictions (2666-4000ms)
    ↓ (Auto-navigate at 4000ms)
ReadingResultScreen (Display AI Predictions)
    ↓ (User actions)
    ├─ Share Reading → Share via social/messaging
    ├─ Save Reading → Save to favorites
    └─ Take Another Reading → Back to WelcomeScreen
```

---

## 📝 Navigation Configuration

### RootStackParamList Type Definition

Add this to your main navigation file (e.g., `app/navigation/RootNavigator.tsx`):

```typescript
export type RootStackParamList = {
  Welcome: undefined;
  Camera: undefined;
  Processing: {
    capturedImageUri: string;
    readingId?: string;
  };
  ReadingResult: {
    readingId: string;
  };
  Home: undefined;
};
```

---

## 🔧 Setting Up React Navigation

### 1. Install Dependencies (if not already installed)

```bash
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
```

### 2. Create Navigation Stack

**File**: `app/navigation/RootNavigator.tsx`

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { CameraScreen } from '@/features/palmreader/screens/CameraScreen';
import { ProcessingScreen } from '@/features/palmreader/screens/ProcessingScreen';
import { ReadingResultScreen } from '@/features/palmreader/screens/ReadingResultScreen';
import { HomeScreen } from '@/features/palmreader/screens/HomeScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Camera: undefined;
  Processing: {
    capturedImageUri: string;
    readingId?: string;
  };
  ReadingResult: {
    readingId: string;
  };
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
          cardStyle: { backgroundColor: '#F5F1E8' }, // palmColors.background
        }}
      >
        {/* Initial Screen - Welcome/Splash */}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            animationEnabled: false, // No animation for first screen
          }}
        />

        {/* Camera Screen - Capture Palm */}
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{
            animationEnabled: true,
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: {
                opacity: current.progress,
              },
            }),
          }}
        />

        {/* Processing Screen - Analyze Palm */}
        <Stack.Screen
          name="Processing"
          component={ProcessingScreen}
          options={{
            animationEnabled: true,
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: {
                opacity: current.progress,
              },
            }),
            gestureEnabled: false, // Prevent back swipe during processing
          }}
        />

        {/* Results Screen - Display Predictions */}
        <Stack.Screen
          name="ReadingResult"
          component={ReadingResultScreen}
          options={{
            animationEnabled: true,
            gestureEnabled: false, // Prevent back swipe
          }}
        />

        {/* Home Screen - Dashboard */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            animationEnabled: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### 3. Wire into App Entry Point

**File**: `app/app.tsx` (or your main app file)

```typescript
import React from 'react';
import { RootNavigator } from '@/navigation/RootNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
    </GestureHandlerRootView>
  );
}
```

---

## 🎬 Screen Details

### **WelcomeScreen**
- **File**: `app/screens/WelcomeScreen.tsx`
- **Duration**: 2.5 seconds (splash animation)
- **Actions**:
  - Auto-rotation of mandala
  - "Tap to Begin Reading" button → navigates to Camera
- **Animations**:
  - Branding fades in (500ms)
  - Mandala zooms in (1300ms)
  - CTA slides up (500ms at 1200ms delay)

### **CameraScreen**
- **File**: `app/features/palmreader/screens/CameraScreen.tsx`
- **Permissions**: Requests camera access
- **Actions**:
  - Capture photo → navigate to Processing with `capturedImageUri`
- **Error Handling**:
  - If permission denied → show permission request dialog
  - If capture fails → show error alert

### **ProcessingScreen**
- **File**: `app/features/palmreader/screens/ProcessingScreen.tsx`
- **Duration**: 4 seconds (auto-navigate on completion)
- **Input**:
  - `capturedImageUri` - from CameraScreen
  - `readingId` - generated on camera capture
- **Output**: Auto-navigate to ReadingResult with `readingId`
- **Stages**:
  - Stage 1 (1333ms): Scan line animation
  - Stage 2 (1333ms): Glow intensifies
  - Stage 3 (1334ms): Particle increase, cards fade

### **ReadingResultScreen**
- **File**: `app/features/palmreader/screens/ReadingResultScreen.tsx`
- **Input**: `readingId` for fetching reading data
- **Actions**:
  - Share reading via Share sheet
  - Save to favorites
  - Take another reading → navigate to Welcome

### **HomeScreen**
- **File**: `app/features/palmreader/screens/HomeScreen.tsx`
- **Purpose**: Dashboard showing past readings
- **Actions**:
  - View reading history
  - Start new reading → navigate to Welcome
  - View reading details

---

## 🎯 Navigation Patterns

### Pattern 1: Forward Navigation (Push)
```typescript
navigation.navigate('Camera');
```

### Pattern 2: Replace (No Back Option)
```typescript
navigation.replace('Processing', { 
  capturedImageUri: photo.uri,
  readingId: 'reading_123'
});
```

### Pattern 3: Go Back
```typescript
navigation.goBack();
```

### Pattern 4: Reset Stack
```typescript
navigation.reset({
  index: 0,
  routes: [{ name: 'Welcome' }],
});
```

---

## 📊 State Management Integration

### Zustand Store Usage in Navigation

**CameraScreen** - Save captured image:
```typescript
const { addReading } = usePalmStore();
// On capture:
const readingId = `reading_${Date.now()}`;
// Pass to ProcessingScreen via navigation params
```

**ReadingResultScreen** - Save to favorites:
```typescript
const { readings, toggleFavorite } = usePalmStore();
// On favorite toggle:
toggleFavorite(readingId);
```

---

## 🔐 Camera Permissions

### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.CAMERA" />
```

### iOS (Info.plist)
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to capture your palm for analysis</string>
```

---

## 🚀 Testing the Flow

1. **Start app** → See WelcomeScreen
2. **Tap button** → Navigate to CameraScreen
3. **Request permissions** → Check permission dialog
4. **Capture photo** → See capture animation, navigate to ProcessingScreen
5. **Wait 4 seconds** → Watch 3 stages, auto-navigate to ReadingResultScreen
6. **Tap actions** → Share or save reading
7. **Tap new reading** → Navigate back to WelcomeScreen

---

## ⚙️ Advanced Navigation Options

### Prevent Back Navigation
```typescript
<Stack.Screen
  name="Processing"
  component={ProcessingScreen}
  options={{
    gestureEnabled: false,  // Disable swipe back on iOS
  }}
/>
```

### Custom Navigation Animations
```typescript
options={{
  cardStyleInterpolator: ({ current, next, layouts }) => ({
    cardStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.width, 0],
          }),
        },
      ],
    },
  }),
}}
```

### Modal Presentation
```typescript
<Stack.Screen
  name="Camera"
  component={CameraScreen}
  options={{
    presentation: 'modal', // iOS only
  }}
/>
```

---

## 📁 File Structure

```
app/
├── navigation/
│   └── RootNavigator.tsx          ← Navigation setup
│
├── screens/
│   └── WelcomeScreen.tsx          ← Entry point
│
└── features/
    └── palmreader/
        └── screens/
            ├── CameraScreen.tsx        ← Capture
            ├── ProcessingScreen.tsx    ← Analyze
            ├── ReadingResultScreen.tsx ← Results
            └── HomeScreen.tsx          ← Dashboard
```

---

## 🐛 Debugging

### Log Navigation State
```typescript
const navigationRef = useNavigationContainerRef();

<NavigationContainer
  ref={navigationRef}
  onStateChange={(state) => {
    console.log('Navigation state:', state);
  }}
>
```

### Check Route Params
```typescript
const route = useRoute();
console.log('Route params:', route.params);
```

---

## ✅ Checklist

- [ ] Install React Navigation packages
- [ ] Create RootNavigator.tsx with all screens
- [ ] Add RootNavigator to app entry point
- [ ] Test Welcome → Camera → Processing → Results flow
- [ ] Test camera permissions on both iOS and Android
- [ ] Test back navigation blocking on Processing screen
- [ ] Test animations between screens
- [ ] Test reading data persistence via Zustand
- [ ] Test Share functionality on results screen
- [ ] Test "Take Another Reading" flow

---

## 🚨 Common Issues & Solutions

### Issue: Navigation not working
**Solution**: Ensure NavigationContainer wraps all screens and RootNavigator is imported correctly.

### Issue: Camera permission not requesting
**Solution**: Check AndroidManifest.xml and Info.plist have proper permissions declared.

### Issue: Back button appears during processing
**Solution**: Set `gestureEnabled: false` and `animationEnabled: false` on ProcessingScreen.

### Issue: No animation between screens
**Solution**: Remove `headerShown: false` or use proper `cardStyleInterpolator`.

---

For more details on specific screens, see:
- `GETTING_STARTED.md` - Quick start guide
- `PALMREADER_SETUP.md` - Detailed setup
- `PALMREADER_SUMMARY.md` - Feature overview
