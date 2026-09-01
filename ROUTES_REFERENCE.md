# Routes & Navigation Reference

**File**: `/Users/ixclusive/Desktop/Subly/app/navigation/RootNavigator.tsx`

---

## 🗺️ Complete Route Map

### Route Stack Order
```
1. Welcome       (Initial Route - Entry Point)
2. Camera        (Photo Capture)
3. Processing    (AI Analysis - Auto-navigate)
4. ReadingResult (Display Predictions)
5. Home          (Dashboard)
```

### Navigation Flow Diagram
```
┌─────────────┐
│  Welcome    │ (Entry Point)
│ 2.5s splash │
└──────┬──────┘
       │ navigate('Camera')
       ↓
┌─────────────┐
│   Camera    │ (Capture Photo)
│ Permission  │
│    Flow     │
└──────┬──────┘
       │ replace('Processing', {uri, id})
       ↓
┌─────────────┐
│ Processing  │ (4s Analysis)
│  Auto-nav   │
└──────┬──────┘
       │ replace('ReadingResult', {id})
       ↓
┌─────────────┐
│   Results   │ (Display Predictions)
│  4 Cards    │
└──────┬──────┘
       │
       ├─→ navigate('Home')
       ├─→ replace('Welcome')
       └─→ Share/Save actions
```

---

## 📋 Route Type Definitions

### RootStackParamList

```typescript
export type RootStackParamList = {
  // Screen 1: Welcome (Splash)
  Welcome: undefined;

  // Screen 2: Camera (Photo Capture)
  Camera: undefined;

  // Screen 3: Processing (AI Analysis)
  Processing: {
    capturedImageUri: string;    // Photo URI from camera
    readingId?: string;          // Generated ID (optional)
  };

  // Screen 4: ReadingResult (Display Results)
  ReadingResult: {
    readingId: string;           // ID for fetching reading data
  };

  // Screen 5: Home (Dashboard)
  Home: undefined;
};
```

---

## 🚀 Navigation Methods & Usage

### 1. Navigate (Add to Stack)
```typescript
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/RootNavigator';

type NavigationType = NavigationProp<RootStackParamList>;

const navigation = useNavigation<NavigationType>();

// Navigate to Camera
navigation.navigate('Camera');

// Navigate to Home
navigation.navigate('Home');
```

**Used For**: Normal screen transitions where user can go back

---

### 2. Replace (Don't Add to Stack)
```typescript
// Replace current screen with Camera (goes back to Welcome if user presses back)
navigation.replace('Camera');

// Replace with Processing (no back button during processing)
navigation.replace('Processing', {
  capturedImageUri: 'file:///path/to/photo.jpg',
  readingId: 'reading_1693392000000'
});

// Replace with Results (no back button during results)
navigation.replace('ReadingResult', {
  readingId: 'reading_1693392000000'
});
```

**Used For**: 
- Preventing back navigation during critical flows
- Processing screen (can't go back during 4s processing)
- Results screen (can't go back, must use action buttons)

---

### 3. Go Back
```typescript
// Return to previous screen
navigation.goBack();

// Return to specific screen
navigation.navigate('Welcome');

// Return multiple screens
navigation.popToTop(); // Go to first screen in stack
```

**Used For**:
- Back button on Camera screen
- Back navigation when user wants to start over

---

### 4. Reset Stack
```typescript
// Reset to Welcome screen only
navigation.reset({
  index: 0,
  routes: [{ name: 'Welcome' }],
});

// Reset to Home screen
navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
});
```

**Used For**: Complete flow restart, logging out

---

## 📱 Screen-by-Screen Routes

### Screen 1: Welcome
```typescript
// Route Name: 'Welcome'
// Parameters: undefined (no params needed)

// Navigation FROM this screen:
navigation.navigate('Camera');
```

**Features**:
- Entry point of app
- Animation disabled for first load
- Back gesture disabled (can't go back)
- Duration: 2.5s

---

### Screen 2: Camera
```typescript
// Route Name: 'Camera'
// Parameters: undefined

// Navigation FROM this screen:

// Option 1: Go back to Welcome
navigation.goBack();

// Option 2: Go to Processing with captured image
navigation.replace('Processing', {
  capturedImageUri: photo.uri,
  readingId: `reading_${Date.now()}`
});
```

**Features**:
- Camera permission flow
- Live camera feed
- Guide frame
- Back gesture enabled
- Back button available

**Key Code**:
```typescript
const handleCapture = async () => {
  const photo = await cameraRef.current.takePictureAsync();
  
  if (photo && photo.uri) {
    const readingId = `reading_${Date.now()}`;
    
    // Replace to Processing (no back option)
    navigation.replace("Processing", {
      capturedImageUri: photo.uri,
      readingId,
    });
  }
};
```

---

### Screen 3: Processing
```typescript
// Route Name: 'Processing'
// Parameters: REQUIRED
// {
//   capturedImageUri: string;  // From camera
//   readingId?: string;        // Generated ID
// }

// Receive parameters:
const route = useRoute();
const { capturedImageUri, readingId } = route.params;

// Navigation FROM this screen (AUTO):
// At 4000ms, automatically navigates to:
navigation.replace('ReadingResult', {
  readingId: route.params.readingId || `reading_${Date.now()}`
});
```

**Features**:
- 4-second processing timer
- Back gesture DISABLED
- Back button hidden
- Auto-navigation at end
- Fade-in animation

**Key Code**:
```typescript
useEffect(() => {
  // At 4000ms, auto-navigate
  const timer = setTimeout(() => {
    navigation.replace('ReadingResult', {
      readingId: route.params.readingId || `reading_${Date.now()}`
    });
  }, 4000);
  
  return () => clearTimeout(timer);
}, [navigation, route.params]);
```

---

### Screen 4: ReadingResultScreen
```typescript
// Route Name: 'ReadingResult'
// Parameters: REQUIRED
// {
//   readingId: string;  // For fetching reading data
// }

// Receive parameters:
const route = useRoute();
const { readingId } = route.params;

// Navigation FROM this screen (User Actions):

// Option 1: Go to Home (view history)
navigation.navigate('Home');

// Option 2: New Reading (back to Welcome)
navigation.replace('Welcome');

// Option 3: Share (native Share sheet - no navigation)
await Share.share({ message: '...' });

// Option 4: Save (toggles favorite, no navigation)
toggleFavorite(readingId);
```

**Features**:
- Display 4 prediction cards
- Back gesture DISABLED
- Back button hidden
- Share functionality
- Save to favorites
- Reading history integration

**Key Code**:
```typescript
// Fetching reading from store
const currentReading = readings.find(r => r.id === readingId);

// Action handlers
const handleShare = async () => {
  await Share.share({
    message: 'My reading...',
    title: 'My Palm Reading'
  });
};

const handleNewReading = () => {
  navigation.replace('Welcome');
};
```

---

### Screen 5: Home
```typescript
// Route Name: 'Home'
// Parameters: undefined

// Navigation FROM this screen:

// Option 1: Start New Reading
navigation.navigate('Welcome');

// Option 2: View Specific Reading
navigation.navigate('ReadingResult', {
  readingId: 'reading_123'
});

// Option 3: Go Back (or anywhere)
navigation.goBack();
```

**Features**:
- Welcome greeting
- Reading history list
- Statistics display
- Back gesture enabled
- Tap cards to view
- "Start New Reading" button

**Key Code**:
```typescript
const handleStartReading = () => {
  navigation.navigate('Welcome');
};

const handleViewReading = (readingId: string) => {
  navigation.navigate('ReadingResult', {
    readingId,
  });
};
```

---

## 🔄 Route Transitions & Animations

### Animation Settings by Screen

| Screen | Animation | Duration | Gesture |
|--------|-----------|----------|---------|
| Welcome | None | - | Disabled |
| Camera | Fade-in | 300ms | Enabled |
| Processing | Fade-in | 300ms | **Disabled** |
| Results | Slide-up | 400ms | **Disabled** |
| Home | Fade-in | 300ms | Enabled |

### Screen Options

```typescript
// Welcome Screen
{
  animationEnabled: false,        // No animation on first load
  gestureEnabled: false,          // Can't swipe back
  cardStyleInterpolator: opacity  // Custom animation
}

// Camera Screen
{
  animationEnabled: true,         // Fade animation
  gestureEnabled: true,           // Can swipe back
  cardStyleInterpolator: opacity
}

// Processing Screen
{
  animationEnabled: true,         // Fade animation
  gestureEnabled: false,          // NO SWIPE BACK
  headerLeft: () => null,         // Hide back button
  cardStyleInterpolator: opacity
}

// Results Screen
{
  animationEnabled: true,         // Slide-up animation
  gestureEnabled: false,          // NO SWIPE BACK
  headerLeft: () => null,         // Hide back button
  cardStyleInterpolator: slideUp
}

// Home Screen
{
  animationEnabled: true,         // Fade animation
  gestureEnabled: true,           // Can swipe back
  cardStyleInterpolator: opacity
}
```

---

## 📊 Parameter Flow

### WelcomeScreen → CameraScreen
```
No parameters passed
```

### CameraScreen → ProcessingScreen
```
Params: {
  capturedImageUri: "file:///cache/photo123.jpg"
  readingId: "reading_1693392000000"
}
```

### ProcessingScreen → ReadingResultScreen
```
Params: {
  readingId: "reading_1693392000000"
}
```

### ReadingResultScreen → Various
```
To Home:       No params
To Welcome:    No params
Share:         No params (native Share)
Save:          No navigation
```

### HomeScreen → Various
```
To Welcome:           No params
To ReadingResult:     { readingId: "reading_123" }
Back:                 No params
```

---

## ✅ Type Safety Checklist

✅ **RootStackParamList** defined with all routes  
✅ **NavigationProp<RootStackParamList>** used in all screens  
✅ **RouteProp<RootStackParamList, 'ScreenName'>** for route params  
✅ Route names match exactly (case-sensitive)  
✅ Parameters passed match types  
✅ No loose `navigate()` calls without type checking  

---

## 🐛 Common Navigation Issues & Fixes

### Issue: "Unknown screen" error
```
Error: The action 'NAVIGATE' with payload {"name":"Camera"} was not handled by the navigation state. Make sure that you have a screen named 'Camera'
```
**Fix**: Check spelling of screen name in `RootStackParamList` and match exactly in `navigation.navigate()` call

---

### Issue: Missing required params
```
Error: Params of type 'undefined' are not assignable to type 'object'
```
**Fix**: Check if screen requires params in `RootStackParamList`:
```typescript
// Wrong - doesn't accept params
Camera: undefined;

// Right - accepts optional params
Camera: { optional?: string };

// Right - requires params
Processing: { capturedImageUri: string };
```

---

### Issue: Can go back when shouldn't
**Fix**: Set `gestureEnabled: false` in screen options:
```typescript
<Stack.Screen
  name="Processing"
  component={ProcessingScreen}
  options={{ gestureEnabled: false }}
/>
```

---

### Issue: Back button still appears
**Fix**: Set `headerLeft: () => null`:
```typescript
<Stack.Screen
  name="Processing"
  component={ProcessingScreen}
  options={{ headerLeft: () => null }}
/>
```

---

## 📚 Complete Route Configuration

```typescript
// From: app/navigation/RootNavigator.tsx

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
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Processing" component={ProcessingScreen} />
        <Stack.Screen name="ReadingResult" component={ReadingResultScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

---

## 🎯 Quick Reference

### Import Navigation in Component
```typescript
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

// For navigation
type NavigationType = NavigationProp<RootStackParamList>;
const navigation = useNavigation<NavigationType>();

// For route params
type RoutePropType = RouteProp<RootStackParamList, 'Processing'>;
const route = useRoute<RoutePropType>();
```

### Navigate to Screens
```typescript
navigation.navigate('Camera');                    // Go to Camera
navigation.replace('Processing', { ... });       // Replace with Processing
navigation.goBack();                              // Go back
navigation.popToTop();                            // Go to first screen
```

### Get Route Params
```typescript
const route = useRoute();
const { capturedImageUri, readingId } = route.params;
```

---

## 📞 Support

For detailed screen information, see:
- **SCREENS_REFERENCE.md** - Individual screen specs
- **QUICK_START_FLOW.md** - Setup and testing
- **NAVIGATION_SETUP.md** - Navigation configuration

---

**Navigation Setup**: ✅ COMPLETE  
**Routes Defined**: ✅ 5 Routes  
**Type Safety**: ✅ Fully Typed  
**Ready to Use**: ✅ YES
