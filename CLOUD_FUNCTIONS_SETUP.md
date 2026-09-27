# Cloud Functions Setup - Daily Rashifal Generation

Complete production-ready setup for scheduled Rashifal generation using Google Cloud Functions and Gemini AI.

---

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [Prerequisites](#prerequisites)
3. [Setup Instructions](#setup-instructions)
4. [Environment Configuration](#environment-configuration)
5. [Local Testing](#local-testing)
6. [Deployment](#deployment)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

---

## 📁 Project Structure

```
destino/
├── functions/                          # Cloud Functions directory
│   ├── src/
│   │   ├── index.ts                   # Main scheduled function
│   │   ├── types.ts                   # TypeScript type definitions
│   │   ├── gemini-service.ts          # Gemini AI integration
│   │   ├── firestore-service.ts       # Firestore operations
│   │   └── validators.ts              # JSON validation
│   ├── lib/                           # Compiled JavaScript (auto-generated)
│   ├── package.json                   # Dependencies
│   ├── tsconfig.json                  # TypeScript config
│   └── .env.example                   # Environment template
├── firebase.json                       # Firebase configuration
├── firestore.rules                    # Firestore security rules
└── CLOUD_FUNCTIONS_SETUP.md           # This file
```

---

## 🔧 Prerequisites

### Required Tools
- **Node.js 20.x** (Cloud Functions runtime requirement)
- **npm** or **yarn**
- **Firebase CLI**

### Required Credentials
1. **Google Generative AI API Key** (Gemini)
   - Get from: https://makersuite.google.com/app/apikey
   
2. **Firebase Project**
   - Project ID: `destinoai-90296`
   - Already created and configured

### Node.js Setup

If you have Node 25.x, downgrade or use NVM:

```bash
# Option 1: Using Homebrew
brew install node@20
brew unlink node
brew link node@20
node --version  # Should show v20.x.x

# Option 2: Using NVM
nvm install 20
nvm use 20
```

---

## 📦 Setup Instructions

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase --version  # Verify installation
```

### Step 2: Install Cloud Functions Dependencies

```bash
cd /Users/swatichaudhary/Projects/destino/functions
npm install
```

This installs:
- `firebase-functions@^5.0.0` - Cloud Functions SDK
- `firebase-admin@^12.0.0` - Firebase Admin SDK
- `@google-cloud/generative-ai@^0.4.0` - Gemini AI SDK
- TypeScript dev dependencies

### Step 3: Configure Environment Variables

```bash
cd /Users/swatichaudhary/Projects/destino/functions

# Copy example to actual .env file
cp .env.example .env

# Edit .env with your values
nano .env
```

Edit `functions/.env`:

```bash
# 1. Add your Gemini API Key (get from https://makersuite.google.com/app/apikey)
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key-here

# 2. Generate a random secret for manual triggers
# Run: openssl rand -hex 32
MANUAL_TRIGGER_KEY=your-random-secret-key-here

# Already filled
FIREBASE_PROJECT_ID=destinoai-90296
```

### Step 4: Build the Functions

```bash
cd functions
npm run build
```

This compiles TypeScript to JavaScript in the `lib/` directory.

---

## 🔐 Environment Configuration

### .env File (Keep Secret!)
Create `functions/.env` with:

```env
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...your-key-here...
MANUAL_TRIGGER_KEY=a1b2c3d4e5f6g7h8i9j0...
FIREBASE_PROJECT_ID=destinoai-90296
```

**IMPORTANT:**
- ⚠️ Never commit `.env` to Git
- ⚠️ Add `.env` to `.gitignore`
- ✅ Use `.env.example` for the template
- ✅ Deploy secrets via Firebase console (see Deployment section)

### Get Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Select your project (destino)
4. Copy the key
5. Paste into `functions/.env`

---

## 🧪 Local Testing

### Start Firebase Emulator

```bash
cd /Users/swatichaudhary/Projects/destino

firebase emulators:start
```

This starts:
- Firestore Emulator (port 8080)
- Functions Emulator (port 5001)
- Pub/Sub Emulator (port 8085)
- Emulator UI (port 4000)

Open: http://localhost:4000

### Test Scheduled Function

In a new terminal:

```bash
# Test with curl
curl -X POST \
  http://localhost:5001/destinoai-90296/asia-south1/generateRashifalManual \
  -H "Authorization: Bearer your-manual-trigger-key-here"
```

Or visit emulator UI → Firestore → Check `daily_rashifal` collection

### Expected Response

```json
{
  "success": true,
  "message": "Rashifal for 2026-09-15 generated and saved",
  "action": "generated",
  "duration": "12.45s"
}
```

### Check Generated Data

1. Open http://localhost:4000 (Emulator UI)
2. Click "Firestore" tab
3. Navigate to `daily_rashifal` collection
4. Click `2026-09-15` document
5. Verify all zodiac signs are present with correct structure

---

## 🚀 Deployment

### Step 1: Set Environment Variables in Firebase

```bash
firebase functions:config:set \
  generativeai.api_key="YOUR_GEMINI_API_KEY" \
  functions.manual_trigger_key="YOUR_RANDOM_SECRET_KEY"
```

Verify:
```bash
firebase functions:config:get
```

### Step 2: Deploy Security Rules

```bash
cd /Users/swatichaudhary/Projects/destino

firebase deploy --only firestore:rules
```

This deploys the security rules that:
- Allow authenticated users to READ daily_rashifal
- Prevent client-side WRITE/UPDATE/DELETE to daily_rashifal
- Only allow Cloud Functions (service account) to write

### Step 3: Deploy Cloud Functions

```bash
cd /Users/swatichaudhary/Projects/destino

# Build first
cd functions
npm run build
cd ..

# Deploy
firebase deploy --only functions
```

### Step 4: Verify Deployment

```bash
firebase functions:list
```

You should see:
- `generateDailyRashifal` - Scheduled function
- `generateRashifalManual` - HTTP trigger for testing
- `deleteRashifal` - HTTP trigger for cleanup

### View Function Status

```bash
firebase functions:describe generateDailyRashifal
```

---

## 📊 Monitoring

### View Logs

```bash
# All functions
firebase functions:log

# Specific function
firebase functions:log --only generateDailyRashifal

# Follow logs in real-time
firebase functions:log -f
```

### Firebase Console Monitoring

1. Go to https://console.firebase.google.com/project/destinoai-90296
2. Click **Functions** (left sidebar)
3. Click **generateDailyRashifal**
4. View:
   - Execution stats
   - Error rate
   - Duration
   - Recent executions

### Cloud Scheduler

1. Go to https://console.cloud.google.com/cloudscheduler
2. Select project **destinoai-90296**
3. Find job: `firebase-schedule-generateDailyRashifal-asia-south1`
4. View:
   - Schedule: `0 23 * * *` (5:00 AM IST)
   - Next execution time
   - Execution history

### Firestore Usage

1. Firebase Console → Firestore → Insights
2. Monitor:
   - Reads per day
   - Writes per day
   - Storage usage
   - Network bandwidth

---

## 🔄 Scheduling Details

### Current Schedule

```
Cron Pattern: 0 23 * * *
Timezone: UTC
Actual Time: 5:00 AM Asia/Kolkata (IST)
```

### How It Works

1. Cloud Scheduler triggers at 23:30 UTC
2. Function gets current date in IST timezone
3. Checks if Rashifal for that date exists
4. If not, generates and saves

### Change Schedule

Edit `functions/src/index.ts` line with `.pubsub.schedule()`:

```typescript
// Run at 6:00 AM IST instead (00:30 UTC)
.pubsub.schedule('30 0 * * *')  // 00:30 UTC = 6:00 AM IST
```

Then redeploy:
```bash
npm run build
firebase deploy --only functions
```

---

## 🧹 Manual Operations

### Generate Rashifal for Specific Date

```bash
curl -X POST \
  https://asia-south1-destinoai-90296.cloudfunctions.net/generateRashifalManual \
  -H "Authorization: Bearer YOUR_MANUAL_TRIGGER_KEY"
```

### Delete Rashifal for Testing

```bash
curl -X DELETE \
  "https://asia-south1-destinoai-90296.cloudfunctions.net/deleteRashifal?key=YOUR_MANUAL_TRIGGER_KEY&date=2026-09-15"
```

### View Stored Rashifal

From React Native app:
```typescript
import { db } from '@/services/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';

const q = query(collection(db, 'daily_rashifal'), where('date', '==', '2026-09-15'));
const docs = await getDocs(q);
```

---

## ❌ Troubleshooting

### Issue: "GOOGLE_GENERATIVE_AI_API_KEY is undefined"

**Solution:**
1. Check `.env` file exists in `functions/` directory
2. Run: `firebase functions:config:get`
3. Set config: `firebase functions:config:set generativeai.api_key="YOUR_KEY"`
4. Redeploy: `firebase deploy --only functions`

### Issue: "Firestore permission denied"

**Solution:**
1. Check security rules deployed: `firebase deploy --only firestore:rules`
2. Verify service account has permissions
3. Check if user is authenticated (anonymous auth enabled?)

### Issue: "Gemini API quota exceeded"

**Solution:**
1. Check API quota: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
2. Request increase if needed
3. Implement retry logic (already in code)

### Issue: "Function timeout after 60s"

**Solution:**
1. Increase timeout in `firebase.json`:
```json
{
  "functions": {
    "timeoutSeconds": 300
  }
}
```
2. Optimize Gemini prompt (reduce token usage)
3. Check network latency to Gemini API

### Issue: "Cloud Scheduler job not triggering"

**Solution:**
1. Check timezone: Must be "UTC"
2. Verify schedule pattern is valid
3. Check function has no errors in logs
4. Check if 5 AM IST is still in the future

### Enable Debug Logs

```bash
# Deploy with debug
firebase functions:shell
```

Then in shell:
```javascript
generateDailyRashifal()
```

---

## 📝 Firestore Document Example

After deployment, Firestore contains:

```
daily_rashifal/2026-09-15
├── date: "2026-09-15"
├── generatedAt: Timestamp(...)
└── zodiacSigns
    ├── aries
    │   ├── name: "Aries"
    │   ├── dateRange: "Mar 21 - Apr 19"
    │   ├── cosmicEnergy: {...}
    │   ├── love: {score: 78, description: "..."}
    │   ├── career: {score: 82, description: "..."}
    │   ├── wealth: {score: 71, description: "..."}
    │   ├── health: {score: 87, description: "..."}
    │   ├── life: {score: 79, description: "..."}
    │   ├── lucky: {color: "Red", number: 9, time: "...", direction: "East"}
    │   ├── advice: "..."
    │   └── affirmation: "..."
    ├── taurus: {...}
    ├── gemini: {...}
    ... (all 12 zodiac signs)
```

---

## 🔒 Security Checklist

- ✅ Gemini API key stored in Cloud Functions config (not in code)
- ✅ `.env` file in `.gitignore`
- ✅ Firestore rules prevent client writes to daily_rashifal
- ✅ Manual trigger requires secret key
- ✅ Service account handles all Firestore writes
- ✅ Anonymous auth enabled for users
- ✅ Function doesn't expose secrets in logs

---

## 📚 Useful Commands

```bash
# Build functions
cd functions && npm run build

# Test locally
firebase emulators:start

# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only rules
firebase deploy --only firestore:rules

# View logs
firebase functions:log -f

# Set environment variables
firebase functions:config:set key="value"

# Get environment variables
firebase functions:config:get

# Delete a function
firebase functions:delete generateDailyRashifal

# List all functions
firebase functions:list
```

---

## 🎯 What's Next?

1. ✅ Deploy Cloud Functions
2. ✅ Set Gemini API key in Firebase config
3. ✅ Deploy Firestore security rules
4. ✅ Test with manual trigger
5. ✅ Verify daily_rashifal collection has data
6. ✅ Update React Native app to read daily_rashifal
7. ✅ Create Rashifal display component
8. ✅ Add Rashifal to DashboardScreen

---

## 📞 Support

For issues:
1. Check Firebase Console → Functions → Logs
2. Run `firebase functions:log` for recent errors
3. Check Cloud Scheduler → Job details for execution history
4. Verify Gemini API key in functions:config:get output

---

## 📄 Summary

**Files Created:**
- `functions/src/index.ts` - Main scheduled function
- `functions/src/types.ts` - TypeScript definitions
- `functions/src/gemini-service.ts` - Gemini integration
- `functions/src/firestore-service.ts` - Firestore operations
- `functions/src/validators.ts` - JSON validation
- `functions/package.json` - Dependencies
- `functions/tsconfig.json` - TypeScript config
- `firebase.json` - Firebase configuration
- `firestore.rules` - Security rules

**Schedule:** Every day at 5:00 AM IST (Asia/Kolkata)
**Collection:** `daily_rashifal/{YYYY-MM-DD}`
**Security:** Client-side read-only, server-side write-only
