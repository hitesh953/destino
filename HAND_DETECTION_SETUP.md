# Hand Detection Implementation Guide

The CameraScreen now has real-time palm detection UI with live border feedback (red/yellow/green). To enable actual hand detection, follow one of these approaches:

## Option 1: TensorFlow Lite Hand Detection (Recommended for React Native)

### Installation

```bash
npm install @react-native-firebase/ml-vision
# or
npm install tensorflow-lite-react-native
```

### Implementation

Update `app/services/palmReading/handDetectionService.ts`:

```typescript
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/hand-pose-detection';

let model: any;

export async function initializeHandDetection() {
  model = await handpose.createDetector(
    handpose.SupportedPackages.mediapipeSelfieSegmentation
  );
}

export async function detectHandInFrame(frameData: any) {
  if (!model) await initializeHandDetection();

  const predictions = await model.estimateHands(frameData);
  
  const isDetected = predictions.length > 0;
  const confidence = isDetected ? (predictions[0].score * 100) : 0;
  
  // Check if palm is visible (validate hand keypoints)
  const isPalmValid = isDetected && validatePalmOrientation(predictions[0]);
  
  return {
    isDetected,
    isPalmValid,
    confidence,
    feedback: getPalmFeedback(isDetected, isPalmValid),
  };
}

function validatePalmOrientation(hand: any): boolean {
  // Check if palm is facing camera
  // Validate key landmarks visibility
  // Check hand is not too small or too large
  return true;
}
```

---

## Option 2: Firebase ML Kit (Best for Android/iOS)

### Setup

```bash
npx expo install @react-native-firebase/ml-vision
```

### Implementation

```typescript
import vision from '@react-native-firebase/ml-vision';

export async function detectHandInFrame(frameData: any) {
  try {
    const hands = await vision().handDetection().processImage(frameData);
    
    const isDetected = hands.length > 0;
    const confidence = isDetected ? hands[0].confidence * 100 : 0;
    const isPalmValid = isDetected && hands[0].confidence > 0.7;
    
    return {
      isDetected,
      isPalmValid,
      confidence,
      feedback: getPalmFeedback(isDetected, isPalmValid),
    };
  } catch (error) {
    console.error('Hand detection error:', error);
    return defaultErrorResponse;
  }
}
```

---

## Option 3: MediaPipe Hands (Most Accurate)

### Installation

```bash
npm install @mediapipe/hands @mediapipe/camera_utils @mediapipe/drawing_utils
```

### Implementation

```typescript
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

let hands: Hands;

export async function initializeMediaPipeHands() {
  hands = new Hands({
    locateFile: (file) => 
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  hands.onResults(handleHandResults);
}

function handleHandResults(results: any) {
  if (results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    const isPalmValid = validatePalmPoints(landmarks);
    updateDetectionUI(true, isPalmValid, results.multiHandedness[0].score * 100);
  }
}

function validatePalmPoints(landmarks: any[]): boolean {
  // Validate palm landmarks are visible and oriented correctly
  const palmCenter = landmarks.slice(0, 5); // Palm area landmarks
  return palmCenter.every(p => p.z < 0 && p.visibility > 0.8);
}
```

---

## Option 4: Use Existing Libraries

### react-native-hand-gesture-detection

```bash
npm install react-native-hand-gesture-detection
```

```typescript
import { HandDetector } from 'react-native-hand-gesture-detection';

const detector = new HandDetector();

export async function detectHandInFrame(frameData: any) {
  const result = await detector.detectHands(frameData);
  
  return {
    isDetected: result.hands.length > 0,
    isPalmValid: result.hands.length > 0 && result.hands[0].palmUp,
    confidence: result.hands[0]?.confidence || 0,
    feedback: result.message,
  };
}
```

---

## Integrating with CameraScreen

### 1. Capture Camera Frames

Modify `CameraScreen.tsx` to capture frames:

```typescript
const handleCameraFrame = async (frame: any) => {
  try {
    const detectionResult = await detectHandInFrame(frame);
    setIsPalmDetected(detectionResult.isDetected);
    setIsPalmValid(detectionResult.isPalmValid);
    setDetectionFeedback(detectionResult.feedback);
    setDetectionConfidence(detectionResult.confidence);
  } catch (error) {
    console.error('Frame detection error:', error);
  }
};
```

### 2. Use with expo-camera

```typescript
import { CameraView } from 'expo-camera';

<CameraView
  ref={cameraRef}
  onFrame={({ image }) => handleCameraFrame(image)}
  // ... other props
/>
```

---

## Quality Validation

Add image quality checks:

```typescript
export async function validatePalmQuality(imageUri: string) {
  const issues: string[] = [];

  // Check image sharpness (blur detection)
  const sharpness = await analyzeSharpness(imageUri);
  if (sharpness < 50) issues.push("Image too blurry");

  // Check lighting
  const brightness = await analyzeBrightness(imageUri);
  if (brightness < 30 || brightness > 200) issues.push("Poor lighting");

  // Check hand size
  const palmSize = await analyzePalmSize(imageUri);
  if (palmSize < 100 || palmSize > 500) issues.push("Hand too far or close");

  let quality: 'low' | 'medium' | 'high' = 'high';
  if (issues.length > 1) quality = 'low';
  else if (issues.length === 1) quality = 'medium';

  return {
    isValid: issues.length === 0,
    quality,
    issues,
  };
}
```

---

## Border Color States

- 🟢 **Green**: Valid palm detected (high confidence, proper orientation)
- 🟡 **Yellow**: Hand detected but not ideal (low confidence, wrong angle)
- 🔴 **Red**: No palm/hand detected or invalid (no detection, wrong object)

---

## Performance Optimization

```typescript
// Run detection every 500ms instead of every frame
const detectionInterval = setInterval(async () => {
  if (cameraReady && currentStep === 'camera') {
    await detectHandInFrame();
  }
}, 500);

// Clean up on unmount
return () => clearInterval(detectionInterval);
```

---

## Testing

Test the detection with:

1. **Valid palms**: Different hand sizes, orientations, lighting
2. **Invalid inputs**: Other objects (phone, book, face)
3. **Edge cases**: Partially visible hands, wrong orientation

---

## Production Checklist

- [ ] Choose and integrate hand detection model
- [ ] Test with real camera frames
- [ ] Optimize for performance (battery/latency)
- [ ] Add error handling and fallbacks
- [ ] Test on both Android and iOS
- [ ] Gather user feedback and refine detection

---

## References

- [TensorFlow Hand Pose Detection](https://github.com/tensorflow/tfjs-models/tree/master/hand-pose-detection)
- [Firebase ML Vision](https://rnfirebase.io/ml-vision/guide)
- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html)
- [React Native Vision Camera](https://react-native-vision-camera.com/)
