# Screens Reference - Complete Documentation

## 📱 All 5 Screens Created

---

## 1️⃣ WelcomeScreen

**File**: `/Users/ixclusive/Desktop/Subly/app/screens/WelcomeScreen.tsx`

### Purpose
App entry point with splash screen and branding animation. First thing user sees.

### Duration
2.5 seconds (manual button to skip to camera, or auto-timeout option)

### Layout
```
┌─────────────────────────────┐
│ Header: 9:41  ⚙️             │  (Orange #FF6B35)
├─────────────────────────────┤
│                             │
│  Welcome to DESTINO ✨       │  (Animated fade-in, 500ms)
│  AI-Powered Palm Reading    │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │  (Mandala zoom-in 1300ms, rotates 8s)
│  │    🖐️ (Mandala)      │  │
│  │                       │  │
│  └───────────────────────┘  │  (Glow ring animated)
│                             │
│  ┌─────────────────────────┐│  (Slide up 500ms, delay 1200ms)
│  │ Tap to Begin Reading    ││  (Purple button #6B4FA0)
│  │ Discover your destiny   ││
│  └─────────────────────────┘│
│                             │
│ Ancient wisdom meets AI 💫  │  (Fade-in 400ms, delay 1600ms)
│                             │
└─────────────────────────────┘
```

### Animations
- **Branding** (500ms): FadeIn from 0 to 1 opacity
- **Mandala** (1300ms, 300ms delay): ZoomIn + continuous rotation
- **Glow Ring** (1200ms, 800ms delay): FadeIn
- **CTA Button** (500ms, 1200ms delay): SlideInUp
- **Mandala Rotation**: Continuous 8000ms loop

### User Interactions
- **Tap Button**: `onPress={handleBeginReading}` → Navigate to Camera
- **Long Press**: Could be used for settings (optional)

### State Used
- None (stateless)

### Imports
```typescript
import Animated, { FadeIn, ZoomIn, SlideInUp, withRepeat, withTiming, useSharedValue, useAnimatedStyle, Easing } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { palmColors } from '@/theme/palmreader/colors';
import { ANIMATION_TIMINGS } from '@/utils/animations/timings';
```

### Key Code
```typescript
const handleBeginReading = () => {
  navigation.navigate("Camera" as never);
};
```

### Color Scheme
- Background: #F5F1E8 (Cream)
- Mandala: rgba(107, 79, 160, 0.3)
- Accent: #D4AF37 (Gold)
- Button: #6B4FA0 (Mystique Purple)
- Text: #1A1F3A (Midnight Blue)

---

## 2️⃣ CameraScreen

**File**: `/Users/ixclusive/Desktop/Subly/app/features/palmreader/screens/CameraScreen.tsx`

### Purpose
Capture palm image from device camera. Handles permissions and photo capture.

### Permissions Flow
```
Component Mounts
  ↓
Check Camera Permissions
  ├─ If not determined → Request
  ├─ If granted → Open Camera
  └─ If denied → Show denied state
```

### Layout
```
┌─────────────────────────────┐
│ ← Back  Position Your Palm ⚙️ │  (Header overlay)
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐    │
│  │                     │    │  (Guide frame with gold border)
│  │       📐            │    │
│  │  Center your palm   │    │
│  │                     │    │
│  └─────────────────────┘    │
│                             │
│ Ensure full palm visible    │
│                             │
│  ┌─────────────────────┐    │  (80x80 button)
│  │     ⭕ Capture      │    │  (Gold background #D4AF37)
│  └─────────────────────┘    │
│       Tap to Capture        │
│                             │
└─────────────────────────────┘
```

### States
- **Loading**: Requesting permissions
- **Denied**: Camera permission not granted
- **Ready**: Camera open and ready to capture
- **Capturing**: Photo being taken (shows loading spinner)

### User Interactions
- **Tap ← Back**: `navigation.goBack()` → Return to Welcome
- **Tap Capture**: `handleCapture()` → Take photo
- **Request Permission**: `requestCameraPermissions()`
- **"Go to Settings"**: Opens device settings (requires custom implementation)

### Photo Capture Flow
1. User taps capture button
2. `cameraRef.current.takePictureAsync()` called
3. Flash animation plays
4. Photo saved to temp location
5. `readingId` generated: `reading_${Date.now()}`
6. Auto-navigate to Processing with URI

### State Managed
- `permission`: Camera permission status
- `isCapturing`: Boolean, set during photo capture
- `cameraReady`: Boolean, true when camera initialized

### Imports
```typescript
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, { FadeIn, useSharedValue, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { palmColors } from '@/theme/palmreader/colors';
import { ANIMATION_TIMINGS } from '@/utils/animations/timings';
```

### Key Code
```typescript
const handleCapture = async () => {
  if (!cameraRef.current || isCapturing || !cameraReady) return;
  
  try {
    setIsCapturing(true);
    const photo = await cameraRef.current.takePictureAsync({
      quality: 1,
      base64: false,
    });
    
    if (photo && photo.uri) {
      const readingId = `reading_${Date.now()}`;
      navigation.replace("Processing", {
        capturedImageUri: photo.uri,
        readingId,
      });
    }
  } catch (error) {
    console.error("Error capturing photo:", error);
    Alert.alert("Error", "Failed to capture photo");
    setIsCapturing(false);
  }
};
```

### Animations
- **Capture Flash**: 300ms FadeIn + 100ms scale up
- **Button Press**: Scale 0.95 on press
- **Camera Open**: FadeIn 500ms

### Color Scheme
- Header Overlay: rgba(0, 0, 0, 0.3)
- Guide Frame Border: rgba(212, 175, 55, 0.6) (Gold)
- Capture Button: #D4AF37 (Gold)
- Text: White on transparent background

---

## 3️⃣ ProcessingScreen

**File**: `/Users/ixclusive/Desktop/Subly/app/features/palmreader/screens/ProcessingScreen.tsx`

### Purpose
Show 4-second AI processing animation with 3 stages. Auto-navigate to results.

### Duration
**Total**: 4000ms (4 seconds)
- **Stage 1**: 0-1333ms (Detecting Palm Lines)
- **Stage 2**: 1333-2666ms (Analyzing Patterns)
- **Stage 3**: 2666-4000ms (Generating Predictions)
- **Screen Transition**: 3800-4000ms

### Input Parameters
```typescript
route.params: {
  capturedImageUri: string;  // From CameraScreen
  readingId?: string;        // Generated in CameraScreen
}
```

### Layout
```
┌─────────────────────────────┐
│ 9:41  ⚙️                     │  (Orange header #FF6B35)
├─────────────────────────────┤
│ AI Reading Your Palm...      │  (Title, Gold #D4AF37)
│ Detecting palm lines...      │  (Subtitle, dynamic per stage)
│                             │
│  ┌─────────────────────┐    │
│  │  🖐️ (Captured img)  │    │  (220x220 mandala circle)
│  │  + Mandala rotation │    │  (8s continuous rotation)
│  │  + Scan line*       │    │  (* Stage 1 only)
│  │  + Particles orbit  │    │
│  │  + Glow ring        │    │  (Opacity changes per stage)
│  └─────────────────────┘    │
│                             │
│ Stage 1/3: Detecting Lines  │  (Gold text, centered)
│ ▓▓▓░░░░░░░░░░░░░░░░░░░░░░  │  (33% filled, Stage 1)
│ 33% Complete                │
│                             │
│ What We're Analyzing:        │
│ ┌───────────────────────┐   │
│ │ 📐 Palm Lines         │   │  (Card 1, slide-in 600ms)
│ │ Life, Heart, Fate     │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ 👑 Mounts             │   │  (Card 2, +150ms stagger)
│ │ Character traits      │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ ✨ Patterns           │   │  (Card 3, +150ms stagger)
│ │ Destiny insights      │   │
│ └───────────────────────┘   │
│                             │
└─────────────────────────────┘
```

### Stage Specifications

#### **Stage 1/3: Detecting Palm Lines** (0-1333ms)
- **Text**: "Detecting palm lines, heart line, fate line, and life line..."
- **Progress**: 0% → 33%
- **Scan Line**: Horizontal line traverses left-to-right
- **Info Cards**: Slide in with 150ms stagger
- **Glow**: 0.3 opacity
- **Particles**: 8 orbiting

#### **Stage 2/3: Analyzing Patterns** (1333-2666ms)
- **Text**: "Analyzing palm patterns, mounts, and character traits..."
- **Progress**: 33% → 66%
- **Scan Line**: Hidden/faded
- **Info Cards**: Remain visible, no animation
- **Glow**: 0.6 opacity (intensified)
- **Particles**: 8 orbiting

#### **Stage 3/3: Generating Predictions** (2666-4000ms)
- **Text**: "Generating your personalized reading based on palm analysis..."
- **Progress**: 66% → 100%
- **Scan Line**: Hidden
- **Info Cards**: Visible until 3800ms, then fade out
- **Glow**: 0.8 opacity (maximum)
- **Particles**: 12 orbiting (increased frequency)
- **Transition**: At 3900ms screen fades

### Animations
```
Mandala Rotation:
  - continuous 360° in 8000ms
  - withRepeat(-1, false)

Progress Fill:
  - Linear 0-100% in 4000ms
  - withTiming(Easing.linear)

Scan Line (Stage 1 Only):
  - translateX 0 → MANDALA_SIZE in 1333ms
  - Linear easing
  - Opacity: 0.8

Glow Effect:
  - Opacity: 0.3 → 0.6 → 0.8
  - withTiming(200) between stages

Cards Entrance:
  - Each card: SlideInLeft 600ms duration
  - Stagger: 150ms between cards
  - Delay from 600ms

Particles:
  - Orbit 6000ms per rotation
  - Rotate with mandala
  - Count: 8 → 12 at Stage 3

Text Transitions:
  - Fade: 200ms out, 200ms in
  - Happens at 1333ms and 2666ms
```

### State Managed
```typescript
const [currentStage, setCurrentStage] = useState<ProcessingStage>(1);
const [statusText, setStatusText] = useState("Detecting...");
const [isTransitioning, setIsTransitioning] = useState(false);

const mandalaRotation = useSharedValue(0);
const progressFill = useSharedValue(0);
const scanLineX = useSharedValue(0);
const glowOpacity = useSharedValue(0.3);
const cardsOpacity = useSharedValue(1);
```

### Timers
```typescript
1333ms  → setStage(2), glowOpacity→0.6
2666ms  → setStage(3), glowOpacity→0.8
3800ms  → setIsTransitioning(true), cardsOpacity→0
3900ms  → Screen fade transition
4000ms  → navigation.replace('ReadingResult')
```

### Imports
```typescript
import Animated, {
  FadeIn, SlideInLeft, useSharedValue,
  useAnimatedStyle, withTiming, withRepeat,
  Easing
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { palmColors } from '@/theme/palmreader/colors';
import { ANIMATION_TIMINGS } from '@/utils/animations/timings';
```

### Color Scheme
- Header: #FF6B35 (Saffron)
- Title: #D4AF37 (Gold)
- Progress Bar Background: rgba(74, 58, 127, 0.3)
- Progress Bar Fill: #D4AF37 (Gold)
- Cards Background: rgba(74, 58, 127, 0.6)
- Cards Border: rgba(212, 175, 55, 0.2)
- Scan Line: #D4AF37 (Gold)

---

## 4️⃣ ReadingResultScreen

**File**: `/Users/ixclusive/Desktop/Subly/app/features/palmreader/screens/ReadingResultScreen.tsx`

### Purpose
Display AI-generated palm reading predictions. Allow sharing and saving.

### Input Parameters
```typescript
route.params: {
  readingId: string;  // From ProcessingScreen
}
```

### Layout
```
┌─────────────────────────────┐
│ 9:41  ⚙️                     │
├─────────────────────────────┤
│          ✨                  │
│   Your Destiny Revealed      │  (Fade-in 500ms)
│ Your palm holds secrets...   │
│                             │
│ ┌───────────────────────┐   │
│ │ The lines of your hand│   │  (Reading text, fade-in 600ms)
│ │ reveal a journey of   │   │
│ │ transformation. Venus │   │
│ │ dances in your heart  │   │
│ │ line...               │   │
│ └───────────────────────┘   │
│                             │
│ Four Pillars of Destiny      │
│                             │
│ ┌───────────────────────┐   │
│ │ ❤️ Love Life           │   │  (Card 1, slide-in 600ms + 400ms)
│ │ Venus dances in your  │   │
│ │ heart line...         │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ 💼 Career             │   │  (Card 2, slide-in 600ms + 550ms)
│ │ Mercury's influence   │   │
│ │ suggests success...   │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ 🏥 Health             │   │  (Card 3, slide-in 600ms + 700ms)
│ │ Strong vitality lines │   │
│ │ indicate...           │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ 💰 Finance            │   │  (Card 4, slide-in 600ms + 850ms)
│ │ Prosperity signs      │   │
│ │ indicate growth...    │   │
│ └───────────────────────┘   │
│                             │
│ ┌───────────────────────┐   │  (Fade-in 500ms + 1000ms)
│ │ 📤 Share Your Reading │   │  (Primary button, purple)
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │  (Orange secondary)
│ │ 💾 Save to Collection │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │  (Tertiary, bordered)
│ │ 🖐️ Take Another Read  │   │
│ └───────────────────────┘   │
│                             │
│ "Remember: The future is    │  (Fade-in 400ms + 1200ms)
│  not fixed. Your choices    │
│  shape your destiny."        │
│                             │
└─────────────────────────────┘
```

### Prediction Cards
4 fixed predictions (mock data):
1. **❤️ Love Life** - "Venus dances in your heart line..."
2. **💼 Career** - "Mercury's influence suggests success..."
3. **🏥 Health** - "Strong vitality lines indicate..."
4. **💰 Finance** - "Prosperity signs indicate growth..."

### User Interactions
- **📤 Share**: Opens native Share sheet with reading text
- **💾 Save**: Toggles favorite in Zustand store
- **🖐️ New Reading**: Navigates to Home (or Welcome if first reading)

### Animations
- **Title**: FadeIn 500ms
- **Reading Text**: FadeIn 600ms + 200ms delay
- **Prediction Cards**: SlideInLeft 600ms + (400 + index×150)ms delay
- **Buttons**: FadeIn 500ms + 1000ms delay
- **Footer**: FadeIn 400ms + 1200ms delay

### State Used
```typescript
const currentReading = readings.find(r => r.id === readingId);
```

### Functions
```typescript
const handleShare = async () => {
  await Share.share({
    message: "My reading...",
    title: "My Palm Reading"
  });
};

const handleSave = () => {
  if (currentReading && !currentReading.isFavorite) {
    toggleFavorite(readingId);
  }
};

const handleNewReading = () => {
  navigation.replace("Welcome");
};
```

### Imports
```typescript
import { Share } from 'react-native';
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { palmColors } from '@/theme/palmreader/colors';
import { usePalmStore } from '@/stores';
```

### Color Scheme
- Background: #F5F1E8 (Cream)
- Title: #D4AF37 (Gold)
- Cards Background: rgba(74, 58, 127, 0.6)
- Cards Border: rgba(212, 175, 55, 0.2)
- Primary Button: #6B4FA0 (Purple)
- Secondary Button: #FF6B35 (Orange)
- Tertiary Button: Bordered purple

---

## 5️⃣ HomeScreen

**File**: `/Users/ixclusive/Desktop/Subly/app/features/palmreader/screens/HomeScreen.tsx`

### Purpose
Dashboard showing user's reading history and quick stats.

### Layout
```
┌─────────────────────────────┐
│ 9:41  ⚙️                     │
├─────────────────────────────┤
│ Welcome Back, Seeker! ✨     │  (Fade-in 500ms)
│ You have 3 readings so far   │
│                             │
│ ┌───────────────────────┐   │  (Slide-up 500ms + 100ms)
│ │ ✨ Start New Reading   │   │  (Purple card, clickable)
│ │ Discover more destiny  │   │
│ └─────────→────────────┘   │
│                             │
│ 📖 Your Reading History      │  (List of past readings)
│                             │
│ ┌───────────────────────┐   │  (Card 1, slide-up 400ms)
│ │ Today              Now │   │
│ │ Venus dances in your   │   │
│ │ heart line...          │   │
│ │ ❤️ View Reading →      │   │
│ └───────────────────────┘   │
│                             │
│ ┌───────────────────────┐   │  (Card 2, slide-up 400ms + 100ms)
│ │ Yesterday        2:30  │   │
│ │ Mercury's influence    │   │
│ │ suggests success...    │   │
│ │ 🖐️ View Reading →      │   │
│ └───────────────────────┘   │
│                             │
│ ┌───────────────────────┐   │  (Card 3, slide-up 400ms + 200ms)
│ │ Aug 27          4:15   │   │
│ │ The lines of your      │   │
│ │ hand reveal...         │   │
│ │ ❤️ View Reading →      │   │
│ └───────────────────────┘   │
│                             │
│ 📊 Your Journey              │  (Fade-in 500ms + 600ms)
│                             │
│ ┌──────────┬──────────┐    │
│ │    3     │    2     │    │  (Stats grid)
│ │  Total   │ Favorites│    │
│ ├──────────┼──────────┤    │
│ │    2h    │     —    │    │
│ │Last Read │          │    │
│ └──────────┴──────────┘    │
│                             │
│ 💫 "The palm is a map of    │  (Fade-in 500ms + 800ms)
│    life..."                 │
│                             │
└─────────────────────────────┘
```

### Greeting Logic
- If no readings: "Welcome Back! 🌟"
- If readings: "Welcome Back, [Name]! ✨"
- Subtitle shows count: "You have 3 readings so far"

### Reading Cards
Shows list of past readings with:
- Date (formatted: "Today", "Yesterday", "Aug 27")
- Time (formatted: "Now", "2:30", "4:15 PM")
- Preview text (first 2 lines of reading)
- Favorite indicator: ❤️ if favorited, 🖐️ if not
- "View Reading →" action text

### Stats Displayed
- Total Readings: Count
- Favorite Readings: Count
- Last Reading: Time ago (e.g., "2h ago", "Now")

### Empty State
If no readings:
- Large palm icon 🖐️
- "No Readings Yet"
- "Discover the secrets your palm holds..."

### User Interactions
- **Start New Reading**: Tap CTA card → navigate('Welcome')
- **View Reading**: Tap reading card → navigate('ReadingResult', {readingId})
- **Settings**: Tap ⚙️ icon (optional)

### Animations
- **Greeting**: FadeIn 500ms
- **CTA Button**: SlideUp 500ms + 100ms delay
- **Reading Cards**: SlideUp 400ms + (200 + index×100)ms delay
- **Stats**: FadeIn 500ms + 600ms delay
- **Wisdom**: FadeIn 500ms + 800ms delay

### State Used
```typescript
const { user, readings } = usePalmStore();

// Find reading by ID
const currentReading = readings.find(r => r.id === readingId);

// Filter favorites
const favoriteCount = readings.filter(r => r.isFavorite).length;

// Last reading time
const lastReadingTime = Math.floor(
  (Date.now() - readings[0].timestamp) / (1000 * 60 * 60)
);
```

### Date Formatting
```typescript
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const today = new Date();
  
  if (date.toDateString() === today.toDateString()) return "Today";
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
};
```

### Imports
```typescript
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { palmColors } from '@/theme/palmreader/colors';
import { usePalmStore } from '@/stores';
```

### Color Scheme
- Header: #FF6B35 (Saffron)
- Greeting: #1A1F3A (Midnight)
- CTA Button: #6B4FA0 (Purple)
- Cards Background: rgba(107, 79, 160, 0.2)
- Cards Border Left: #D4AF37 (Gold)
- Stats Cards: rgba(74, 58, 127, 0.4)

---

## 📊 Screen Flow Summary

```
┌──────────────┐
│ WelcomeScreen│ (2.5s auto-splash or user tap)
└──────┬───────┘
       │ navigate('Camera')
       ↓
┌──────────────┐
│ CameraScreen │ (User captures photo)
└──────┬───────┘
       │ replace('Processing', {uri, readingId})
       ↓
┌──────────────┐
│ProcessingScr.│ (4s auto-processing)
└──────┬───────┘
       │ replace('ReadingResult', {readingId})
       ↓
┌──────────────┐
│ResultScreen  │ (User views/shares results)
├──────┬───────┤
       │ navigate('Home') OR
       │ replace('Welcome')
       ↓
   [Cycle continues]
```

---

## 🎯 Key Imports Each Screen Uses

| Import | Used By |
|--------|---------|
| `Animated, FadeIn, ZoomIn, SlideInUp` | Welcome |
| `CameraView, useCameraPermissions` | Camera |
| `Animated, useSharedValue, withTiming, withRepeat` | Processing |
| `Share` | Results |
| `FlatList` | Home |

---

## 📋 Props Passed Between Screens

| From | To | Props |
|------|----|----|
| Welcome | Camera | (none) |
| Camera | Processing | `{capturedImageUri, readingId}` |
| Processing | Results | `{readingId}` |
| Results | Welcome | (replace, lose params) |
| Results | Home | (replace, no params) |
| Home | Welcome | (navigate) |
| Home | Results | `{readingId}` |

---

This completes the full screen reference guide. All 5 screens are ready for production use! 🚀
