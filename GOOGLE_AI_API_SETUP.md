# Google Generative AI API Setup Guide

## ❌ Current Issue

```
API_KEY_SERVICE_BLOCKED
Requests to generativelanguage.googleapis.com are blocked
```

**Cause**: The API key from `google-services.json` has restrictions that don't include the Google Generative AI API.

---

## ✅ Solution: Create a New Unrestricted API Key

### Step 1: Go to Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **destinoai-90296**

### Step 2: Create a New API Key

1. **Left sidebar** → Click **APIs & Services**
2. Click **Credentials**
3. Click **+ Create Credentials** → **API Key**
4. A new API key will be generated (copy it)

### Step 3: Enable Generative AI API

1. **Left sidebar** → Click **APIs & Services**
2. Click **Library**
3. Search for **"Generative AI API"** or **"Google AI for Developers"**
4. Click on it
5. Click **ENABLE**

### Step 4: Configure API Key (Optional - for security)

For production, restrict the key:

1. In **Credentials** page, click on your new API key
2. Under **API restrictions**, select:
   - ✅ **Generative Language API**
   - ✅ **Google AI for Developers**
3. Under **Application restrictions**, select:
   - ✅ **Android apps**
   - Add your app package: `com.destinoAI.palmreading`
4. Click **Save**

---

## 🔑 Update Your App

### Option 1: Use API Key Directly (Simple)

Update `app/config/firebase.ts`:

```typescript
// Use the new API key instead of the one from google-services.json
const GENERATIVE_AI_API_KEY = 'YOUR_NEW_API_KEY_HERE';

import { GoogleGenerativeAI } from '@google/generative-ai';

export const genAI = new GoogleGenerativeAI(GENERATIVE_AI_API_KEY);
```

### Option 2: Use Environment Variables (Recommended)

Create `.env` file in project root:

```
EXPO_PUBLIC_GOOGLE_AI_API_KEY=YOUR_NEW_API_KEY_HERE
```

Update `app/config/firebase.ts`:

```typescript
const GENERATIVE_AI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || 'fallback-key';
```

Update `app/services/aiLogic/generativeAiService.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const GENERATIVE_AI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || 'AIzaSyCBc-FW2eoytWMfaDCqPzQ2X1mCOdwf9ms';
const genAI = new GoogleGenerativeAI(GENERATIVE_AI_API_KEY);
```

---

## 🚀 Quick Fix (Copy-Paste)

### 1. Get Your New API Key

From Google Cloud Console → Credentials → Copy your new API key

### 2. Update generativeAiService.ts

Find this line (top of file):

```typescript
const GENERATIVE_AI_API_KEY = 'AIzaSyCBc-FW2eoytWMfaDCqPzQ2X1mCOdwf9ms';
```

Replace with your new key:

```typescript
const GENERATIVE_AI_API_KEY = 'YOUR_NEW_API_KEY_HERE';
```

### 3. Test Again

```bash
npm run android
```

---

## ✨ Complete Setup Checklist

- [ ] Created new API key in Google Cloud Console
- [ ] Enabled Generative Language API
- [ ] Updated API key in `generativeAiService.ts`
- [ ] Restarted the app
- [ ] Palm reading now works! ✅

---

## 🔍 Verify API Key Works

Test with this quick endpoint call:

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

Should return a response (not 403 error).

---

## 📚 Why Two API Keys?

- **google-services.json**: For Firebase services (Auth, Firestore, etc.)
- **New API Key**: For Google Generative AI (Gemini)

They serve different purposes and have different restrictions.

---

## 🆘 Still Getting Errors?

1. **Check API is enabled**: Go to APIs & Services → Library → Search "Generative"
2. **Check quotas**: APIs & Services → Quotas → Verify limits not exceeded
3. **Check billing**: Make sure billing is enabled on the project
4. **Wait 1-2 minutes**: API activation can take a moment
5. **Try new key**: Create another API key and test

---

## 🎯 Expected Result After Fix

```
✅ Image captured
✅ Base64 encoded  
✅ Sent to Gemini AI
✅ Palm analysis received
✅ Reading displayed
🎉 Success!
```

---

**Let me know once you've created the new API key and I can help update the code!** 🚀
