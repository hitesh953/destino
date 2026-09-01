# Palm Reader App - Setup Guide
## Boilerplate Integration & Configuration

---

## 📦 What Was Added to Package.json

**New Dependencies (Only Required Packages):**
```json
{
  "react-native-skia": "^1.2.0",           // GPU canvas for mandala animations
  "nativewind": "^3.1.0",                  // Tailwind CSS for React Native
  "tailwindcss": "^3.4.0",                 // CSS utility framework
  "zustand": "^4.4.0",                     // Lightweight state management (2KB)
  "@tanstack/react-query": "^5.0.0",       // Server state & API caching
  "react-native-svg": "^15.0.0",           // SVG rendering for vector graphics
  "expo-linear-gradient": "^12.9.0",       // Gradient backgrounds
  "expo-image": "^1.12.0",                 // Smart image caching
  "@react-native-async-storage/async-storage": "^1.23.0"  // Persistent storage
}
```

**Why only these?** 
- The boilerplate already had: `react-native-reanimated`, `expo-splash-screen`, `react-native-gesture-handler`, `@react-navigation/*`
- We added only what's needed for Palm Reader specific features

---

## 📁 New Project Structure

```
app/
├── features/
│   └── palmreader/                       # Palm Reader specific features
│       ├── screens/                      # Screen components
│       │   ├── SplashScreen.tsx
│       │   ├── HomeScreen.tsx
│       │   ├── CameraScreen.tsx
│       │   ├── ProcessingScreen.tsx
│       │   ├── ReadingResultScreen.tsx
│       │   ├── HistoryScreen.tsx
│       │   └── SettingsScreen.tsx
│       └── components/
│           └── animations/               # Animation components
│               ├── MandalaRotation.tsx
│               ├── CardEntrance.tsx
│               ├── TextReveal.tsx
│               └── ButtonRipple.tsx
│
├── stores/                               # Zustand state management
│   ├── palmStore.ts                      # Main app state & readings
│   └── index.ts                          # Store exports
│
├── services/
│   └── palmReading/
│       └── palmAnalysisService.ts        # AI backend API calls
│
├── types/
│   └── palmreader/
│       └── index.ts                      # TypeScript type definitions
│
├── utils/
│   └── animations/
│       └── timings.ts                    # Animation timing constants
│
├── theme/
│   └── palmreader/
│       └── colors.ts                     # Palm Reader color system (light & dark)
│
└── assets/
    └── animations/                       # Lottie JSON animations
```

---

## 🎨 Theme System - Colors Setup

### **Light Mode** (`app/theme/palmreader/colors.ts`)
- **Primary**: Mystique Purple (#6B4FA0)
- **Accent**: Sacred Gold (#D4AF37)
- **Background**: Cream White (#F5F1E8)
- **Text**: Midnight Blue (#1A1F3A)

### **Dark Mode**
- **Primary**: Midnight Blue (#1A1F3A)
- **Accent**: Bright Gold (#FFD700)
- **Background**: Cosmic Black (#0F0F0F)
- **Text**: Cream White (#F5F1E8)

### **Using Colors in Components**
```typescript
import { palmColors, palmColorsDark } from '@/theme/palmreader/colors';

// Light mode
const backgroundColor = palmColors.background;  // #F5F1E8

// Dark mode
const darkBg = palmColorsDark.background;  // #0F0F0F
```

### **Using with NativeWind/Tailwind**
```tsx
// In component
<View className="bg-cream text-midnight">
  <Text className="text-mystique font-bold">Hello</Text>
</View>

// Tailwind classes available:
// bg-mystique, bg-gold, bg-saffron, bg-midnight, bg-cream
// text-mystique, text-gold, text-saffron, etc.
// shadow-sm, shadow-md, shadow-lg, shadow-purple, shadow-gold
```

---

## ⏱️ Animation Timings - All Synchronized with Figma

**File**: `app/utils/animations/timings.ts`

### **Key Timings**
```typescript
import { ANIMATION_TIMINGS } from '@/utils/animations/timings';

// Splash screen (2.5s total)
ANIMATION_TIMINGS.splash.total;           // 2500ms

// Processing screen (4s total)
ANIMATION_TIMINGS.processing.mandalaRotation;  // 8000ms
ANIMATION_TIMINGS.processing.total;            // 4000ms

// Cards entrance
ANIMATION_TIMINGS.reading.cardSlideIn;         // 600ms
ANIMATION_TIMINGS.reading.cardStagger;         // 150ms
```

### **Easing Functions**
```typescript
// From Figma design spec: cubic-bezier(0.34, 1.56, 0.64, 1)
EASING.bounce;    // [0.34, 1.56, 0.64, 1]
EASING.smooth;    // [0.25, 0.46, 0.45, 0.94]
EASING.linear;    // [1, 1, 1, 1]
```

---

## 📊 State Management - Zustand Store

**File**: `app/stores/palmStore.ts`

### **Using the Store**
```typescript
import { usePalmStore } from '@/stores';

// In your component
const MyComponent = () => {
  const { readings, addReading, user } = usePalmStore();
  
  return (
    <View>
      <Text>Total readings: {user.totalReadings}</Text>
      <Text>Readings: {readings.length}</Text>
    </View>
  );
};
```

### **Store Features**
- **User data**: ID, name, total readings, first reading date
- **Readings**: Array of all palm readings with analyses
- **Preferences**: Theme, animation speed, notifications, language
- **UI state**: Loading state, current reading ID
- **Persistence**: Auto-save/load from AsyncStorage

### **Adding a Reading**
```typescript
const { addReading } = usePalmStore();

addReading({
  id: 'reading_123',
  timestamp: Date.now(),
  palmImageUri: 'file://path/to/image.jpg',
  analyses: {
    loveLife: '...',
    career: '...',
    health: '...',
    finance: '...'
  },
  predictions: [...],
  isFavorite: false
});
```

---

## 🔗 API Integration

**File**: `app/services/palmReading/palmAnalysisService.ts`

### **Analyze Palm Image**
```typescript
import { analyzePalmImageWithRetry, getMockPalmAnalysis } from '@/services/palmReading/palmAnalysisService';

// Real API call
const result = await analyzePalmImageWithRetry(base64Image, imageUri, 3);

if (result.success) {
  const reading = result.data;
  // Use reading data
}

// Mock for development/testing
const mockResult = getMockPalmAnalysis(imageUri);
```

### **API Response Structure**
```typescript
{
  success: boolean,
  data: {
    id: string,
    userId: string,
    timestamp: number,
    analysis: {
      loveLife: string,
      career: string,
      health: string,
      finance: string
    },
    predictions: Prediction[],
    metadata: {
      processingTimeMs: number,
      modelVersion: string,
      imageQuality: 'low' | 'medium' | 'high'
    }
  }
}
```

---

## 📝 Type Definitions

**File**: `app/types/palmreader/index.ts`

### **Key Types**
```typescript
import {
  PalmReading,
  Prediction,
  ProcessingState,
  PalmReadingResponse,
  NavigationParams,
  ThemeColors,
  AppConfig
} from '@/types/palmreader';
```

---

## 🎬 Animation Setup

### **Creating Animated Components**

**Splash Screen Animation** (2.5s sequence)
```typescript
import { ANIMATION_TIMINGS } from '@/utils/animations/timings';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

export const SplashScreen = () => {
  return (
    <Animated.View
      entering={ZoomIn.duration(ANIMATION_TIMINGS.splash.palmFadeIn)}
    >
      {/* Content */}
    </Animated.View>
  );
};
```

**Card Entrance Animation** (600ms + 150ms stagger)
```typescript
import { ANIMATION_TIMINGS } from '@/utils/animations/timings';
import Animated, { SlideInLeft } from 'react-native-reanimated';

export const CardAnimation = ({ index }) => {
  const delay = index * ANIMATION_TIMINGS.reading.cardStagger;
  
  return (
    <Animated.View
      entering={SlideInLeft.duration(ANIMATION_TIMINGS.reading.cardSlideIn).delay(delay)}
    >
      {/* Card content */}
    </Animated.View>
  );
};
```

---

## 🛠️ Configuration Files

### **babel.config.js** - Update Required
Add NativeWind to your existing babel config:

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      'nativewind/babel'  // ADD THIS LINE
    ]
  };
};
```

### **tailwind.config.js** - Already Created
- Configured with all Palm Reader colors
- Custom spacing (xs, sm, md, lg, xl, 2xl, 3xl)
- Custom border radius values
- Custom shadows (sm, md, lg, xl, purple, gold)

---

## 📦 Export All Stores

**File**: `app/stores/index.ts`
```typescript
export { usePalmStore, type PalmReading } from './palmStore';
```

---

## 🚀 Next Steps to Build Screens

### **1. Create Splash Screen** (`app/features/palmreader/screens/SplashScreen.tsx`)
- Use ANIMATION_TIMINGS.splash for 2.5s sequence
- Animate mandala rotation (8s loop)
- Fade transitions

### **2. Create Home Dashboard** (`app/features/palmreader/screens/HomeScreen.tsx`)
- Use `usePalmStore()` to display user data
- Show last reading card
- Display quick insights badges
- Bottom tab navigation

### **3. Create Camera Screen** (`app/features/palmreader/screens/CameraScreen.tsx`)
- Capture palm image
- Store in AsyncStorage
- Pass to Processing screen

### **4. Create Processing Screen** (`app/features/palmreader/screens/ProcessingScreen.tsx`)
- Show mandala rotation (8s)
- Display progress stages
- Call `analyzePalmImageWithRetry()` API
- Auto-navigate to results after 4s

### **5. Create Reading Result Screen** (`app/features/palmreader/screens/ReadingResultScreen.tsx`)
- Display AI analysis
- Show 4 prediction cards (Love, Career, Health, Finance)
- Share & Save buttons
- Use `usePalmStore()` to save reading

---

## ✅ Checklist Before Development

- [ ] `npm install` completed successfully
- [ ] `tailwind.config.js` created
- [ ] `babel.config.js` updated with NativeWind plugin
- [ ] `app/theme/palmreader/colors.ts` created
- [ ] `app/utils/animations/timings.ts` created
- [ ] `app/stores/palmStore.ts` created
- [ ] `app/services/palmReading/palmAnalysisService.ts` created
- [ ] `app/types/palmreader/index.ts` created
- [ ] Theme colors available in Tailwind classes
- [ ] Store can be imported: `import { usePalmStore } from '@/stores'`

---

## 🎯 Quick Start Command

```bash
# Install dependencies (already done)
npm install

# Update babel config
# (Add 'nativewind/babel' to plugins)

# Start development
npm start
```

---

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `app/theme/palmreader/colors.ts` | Color system (light & dark mode) |
| `app/utils/animations/timings.ts` | Animation timing constants from Figma |
| `app/stores/palmStore.ts` | Global state management (Zustand) |
| `app/services/palmReading/palmAnalysisService.ts` | API integration for AI analysis |
| `app/types/palmreader/index.ts` | TypeScript type definitions |
| `tailwind.config.js` | Tailwind/NativeWind configuration |
| `babel.config.js` | Babel configuration (needs NativeWind plugin) |

---

## 🎨 Color System Quick Reference

### Tailwind Class Names Available
```
// Backgrounds
bg-mystique, bg-gold, bg-saffron, bg-midnight, bg-cream, bg-twilight, bg-chakra, bg-cosmic, bg-silver

// Text
text-mystique, text-gold, text-saffron, text-midnight, text-cream, etc.

// Shadows
shadow-sm, shadow-md, shadow-lg, shadow-xl, shadow-purple, shadow-gold

// Rounded
rounded-xs, rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-full
```

---

**Status**: ✅ Ready to build Palm Reader screens
**Last Updated**: 2026-08-28
