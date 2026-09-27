# Firestore Setup Guide - Destino App

## ✅ What Was Created

### 1. **Validation Utility** (`app/utils/validation.ts`)
- Validates user name (2-100 characters, letters/spaces/hyphens/apostrophes only)
- Validates date of birth (past date, age >= 13, <= 150 years)
- Validates birth time (optional, but validates if provided)
- Validates place of birth (2-150 characters, letters/spaces/hyphens/commas)
- Calculates zodiac sign from date of birth
- Returns detailed validation errors

### 2. **Firestore Service** (`app/services/firestore.ts`)
- Initializes Firebase with your project credentials
- Saves user onboarding data to Firestore
- Creates user_astrology_data collection with:
  - Zodiac sign and element
  - Ruling planet
  - Lucky number and color
  - Personality traits
  - Cosmic energy scores
  - Compatible/incompatible signs
- Initializes readings_history collection for analytics
- Fetches user data from Firestore

### 3. **Updated OnboardingScreen** (`app/screens/OnboardingScreen.tsx`)
- Added validation before saving
- Saves data to Firestore instead of just AsyncStorage
- Uses Firebase Authentication to get current user
- Better error handling and user feedback
- Offline fallback using AsyncStorage

---

## 🔧 Setup Steps

### Step 1: Update Firebase Configuration
Edit `app/services/firestore.ts` and replace the `firebaseConfig` with your actual Firebase project configon onboarding:

```javascript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

**Get this from:** Firebase Console → Project Settings → Your Apps → Web → Copy config

### Step 2: Create Firestore Collections
Go to Firebase Console → Firestore Database → Create Collection:

Create these collections (they'll auto-populate as users sign up):
1. `users` - User profiles
2. `user_astrology_data` - Astrology profiles
3. `readings` - Palm reading sessions
4. `readings_history` - Reading statistics
5. `daily_rashifal` - Daily horoscopes
6. `readings_reviews` - User reviews
7. `user_subscriptions` - Subscription data
8. `ai_analysis_logs` - AI analysis logs

### Step 3: Apply Security Rules
Go to Firebase Console → Firestore → Rules and apply:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users - only user can access own document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // User Astrology Data - only user can access
    match /user_astrology_data/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Readings - user can read/write own, public ones are readable
    match /readings/{readingId} {
      allow read: if request.auth.uid == resource.data.userId
                  || resource.data.isPublic == true;
      allow create: if request.auth.uid != null;
      allow write: if request.auth.uid == resource.data.userId;
      allow delete: if request.auth.uid == resource.data.userId;
    }

    // Readings History - only user can access
    match /readings_history/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Daily Rashifal - all authenticated users can read
    match /daily_rashifal/{document=**} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.token.admin == true;
    }

    // Reviews - authenticated users can read, write own
    match /readings_reviews/{reviewId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid != null;
      allow write: if request.auth.uid == resource.data.userId;
    }

    // Subscriptions - only user can access own
    match /user_subscriptions/{subscriptionId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }

    // AI Logs - admin only
    match /ai_analysis_logs/{logId} {
      allow read, write: if request.auth.token.admin == true;
    }
  }
}
```

### Step 4: Test the Flow
1. Run the app: `yarn expo start`
2. Go through onboarding
3. Fill in your information
4. Tap "Next" to complete
5. Check Firebase Console → Firestore to see data saved

---

## 📊 Data Structure

### Users Collection
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "dateOfBirth": "1990-05-15T00:00:00Z",
  "birthTime": "10:30:00",
  "placeOfBirth": "New Delhi, India",
  "zodiacSign": "Taurus",
  "subscriptionStatus": "free",
  "totalReadingsCount": 0,
  "isOnboarded": true,
  "language": "en",
  "createdAt": "2026-09-15T10:00:00Z",
  "updatedAt": "2026-09-15T10:00:00Z"
}
```

### User Astrology Data Collection
```json
{
  "zodiacSign": "Taurus",
  "zodiacElement": "Earth",
  "rulingPlanet": "Venus",
  "luckyNumber": 6,
  "luckyColor": "Green",
  "personalityTraits": ["Stable", "Reliable", "Grounded"],
  "cosmicEnergyScores": {
    "love": 75,
    "career": 80,
    "wealth": 70,
    "health": 85,
    "life": 78
  },
  "compatibleSigns": ["Virgo", "Capricorn"],
  "incompatibleSigns": ["Leo", "Aquarius"],
  "calculatedAt": "2026-09-15T10:00:00Z"
}
```

### Readings History Collection
```json
{
  "totalReadings": 0,
  "readingsByType": {
    "love": 0,
    "career": 0,
    "health": 0,
    "life": 0,
    "general": 0
  },
  "averageRating": 0,
  "readingStreak": 0,
  "longestReadingStreak": 0,
  "lastUpdated": "2026-09-15T10:00:00Z"
}
```

---

## 🔐 Validation Rules

### Name Validation
- ✅ Required
- ✅ 2-100 characters
- ✅ Only letters, spaces, hyphens, apostrophes

### Date of Birth
- ✅ Required
- ✅ Must be past date
- ✅ Age must be 13-150 years

### Birth Time
- ✅ Optional
- ✅ Valid time format if provided

### Place of Birth
- ✅ Required
- ✅ 2-150 characters
- ✅ Only letters, spaces, hyphens, commas

---

## 🚀 Next Steps

1. **Install Firebase CLI** (for deployment):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

2. **Deploy Security Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Enable Authentication** in Firebase Console:
   - Go to Authentication → Sign-in method
   - Enable Email/Password, Google, Phone

4. **Create Demo Data**:
   - Add sample daily_rashifal entries for zodiac signs
   - Upload zodiac sign images to Storage

5. **Monitor Usage**:
   - Firebase Console → Firestore → Insights
   - Monitor reads, writes, and storage usage

---

## 📝 Testing Checklist

- [ ] Update Firebase config in `firestore.ts`
- [ ] Create Firestore collections
- [ ] Apply security rules
- [ ] Run onboarding flow
- [ ] Verify data in Firebase Console
- [ ] Test validation errors
- [ ] Test offline functionality
- [ ] Check zodiac calculation
- [ ] Verify readings_history creation

---

## ❓ Troubleshooting

### "Project not found" Error
→ Update Firebase config with correct project ID

### "Permission denied" Error
→ Check Firestore security rules and ensure user is authenticated

### Validation Failing
→ Check console logs for validation error messages
→ Ensure data matches validation rules

### Data Not Saving
→ Verify internet connection
→ Check Firebase Console for errors
→ Ensure user is authenticated

---

## 📚 Useful Links
- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Console](https://console.firebase.google.com/)
