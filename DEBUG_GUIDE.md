# Debug Guide - Processing Screen Stuck Issue

## 🔍 How to Debug

### Step 1: Run the App with Logs Visible

```bash
npm run android
```

Watch the **React Native debugger** or **Android Studio logcat** for messages.

### Step 2: Look for These Log Sequences

The logs should appear in this order. If it's stuck, see which log is missing.

---

## ✅ **Successful Flow (Look for these logs)**

### Stage 1: Image Capture & Validation
```
🎬 [PROCESSING] Starting initialization...
📸 [PROCESSING] Image URI: file:///data/user/0/com.subly/...
✅ [PROCESSING] Image URI validated
🎨 [PROCESSING] Starting animations...
```

### Stage 2: Image Conversion
```
🖼️  [PROCESSING] Converting image to base64...
✅ [PROCESSING] Image converted, size: XXXXX chars
```

### Stage 3: AI Analysis Call
```
🤖 [PROCESSING] Calling Gemini AI service...
📤 [PROCESSING] Sending request to generativelanguage.googleapis.com
🔌 [AI] Initializing Gemini model...
✅ [AI] Model initialized
📸 [AI] Preparing image data...
✅ [AI] Image data prepared, size: XXXXX
🚀 [AI] Sending request to Gemini API...
✅ [AI] Response received in XXXX ms
📝 [AI] Response length: XXXX chars
```

### Stage 4: Response Parsing
```
🔍 [AI] Parsing response sections...
✅ [AI] Extracted READING: ...
✅ [AI] Extracted INSIGHTS: ...
✅ [AI] Extracted CHARACTERISTICS: ...
✅ [AI] Parsed X insights and X characteristics
✅ [PROCESSING] AI analysis completed in XXXX ms
```

### Stage 5: Reading Creation & Storage
```
📍 [STAGE 1→2] Transitioning at 1333 ms
📍 [STAGE 2→3] Transitioning at 2666 ms
📝 [PROCESSING] Creating reading object with ID: reading_XXXXX
✅ [PROCESSING] Reading object created with 4 predictions
✅ [PROCESSING] Reading stored in app state
```

### Stage 6: Navigation
```
🎬 [TRANSITION] Starting screen transition at 3800 ms
🚀 [NAVIGATION] Navigating to ReadingResult at 4000 ms
📍 [NAVIGATION] Reading ID: reading_XXXXX
✅ [NAVIGATION] Navigation completed successfully
```

---

## ❌ **If Stuck, Look for These Issues**

### Issue 1: Stops at "Converting image to base64"
```
🖼️  [PROCESSING] Converting image to base64...
❌ [PROCESSING] Failed to read image as base64: ...
```
**Solution**: FileSystem issue. Check image permissions and file path.

### Issue 2: Hangs at "Sending request to Gemini API"
```
🚀 [AI] Sending request to Gemini API...
```
**Solution**: API key issue. Check:
- API key is correct in `generativeAiService.ts`
- Generative Language API is enabled
- API key has no restrictions

### Issue 3: API returns 403 error
```
❌ [AI] Error analyzing palm reading: [Error: ... 403 ...]
```
**Solution**: API key blocked. Create new API key with Generative Language API enabled.

### Issue 4: Stops at navigation
```
🚀 [NAVIGATION] Navigating to ReadingResult at 4000 ms
📍 [NAVIGATION] Reading ID: reading_XXXXX
```
**Solution**: Navigation stack issue. Check ReadingResult screen exists.

---

## 📋 **Copy-Paste Log Search**

Search for these specific strings to find where it's stuck:

| Search For | Meaning |
|-----------|---------|
| `🎬 [PROCESSING]` | Processing started |
| `🖼️  [PROCESSING]` | Image conversion started |
| `🤖 [PROCESSING]` | AI call started |
| `🚀 [AI]` | Gemini API called |
| `✅ [AI]` | AI response successful |
| `❌ [AI]` | AI error |
| `🎬 [TRANSITION]` | Screen transition started |
| `🚀 [NAVIGATION]` | Navigation to results started |
| `❌ [NAVIGATION]` | Navigation failed |

---

## 🎯 **Quick Checklist**

When stuck, run through:

- [ ] See `🎬 [PROCESSING] Starting initialization...`?
  - If NO → App didn't start processing, check CameraScreen navigation
  
- [ ] See `✅ [PROCESSING] Image converted`?
  - If NO → File system issue, check image path
  
- [ ] See `🚀 [AI] Sending request`?
  - If NO → Image conversion stuck
  
- [ ] See `✅ [AI] Response received`?
  - If NO → API key blocked or network issue
  
- [ ] See `✅ [NAVIGATION] Navigation completed`?
  - If NO → Navigation stack issue

---

## 🔧 **How to View Logs**

### Option 1: React Native Debugger
```bash
npm run android
# Logs appear in terminal
```

### Option 2: Android Logcat
```bash
adb logcat | grep "PROCESSING\|AI\|TRANSITION\|NAVIGATION"
```

### Option 3: Create Log File
In ProcessingScreen, add:
```typescript
import * as FileSystem from "expo-file-system/legacy";

const log = (message: string) => {
  console.log(message);
  // Also write to file if needed
};
```

---

## 📤 **If You Need Help**

Share these logs:
1. Copy all logs that start with `🎬`, `🖼️`, `🤖`, `🚀`, `✅`, `❌`
2. Find the last log before it stops
3. Share that with the exact error message

**Example for help:**
```
Last working log: ✅ [PROCESSING] Image converted, size: 45382 chars
Next attempted log: 🤖 [PROCESSING] Calling Gemini AI service...
Error seen: [None - just stops]
```

---

## 🚀 **Test It**

Run:
```bash
npm run android
```

Open camera → Position palm → Capture → Watch logs in terminal

Let me know which log stops appearing and I can pinpoint the issue! 🎯
