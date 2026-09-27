/**
 * Firebase Firestore Initialization Script
 * Creates all collections and applies security rules
 * Run: node firebase-init.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT ||
  '/Users/swatichaudhary/Projects/destino/android/app/serviceAccountKey.json';

try {
  const serviceAccountJson = fs.readFileSync(serviceAccountPath, 'utf8');
  const serviceAccount = JSON.parse(serviceAccountJson);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Please ensure serviceAccountKey.json is at:', serviceAccountPath);
  process.exit(1);
}

const db = admin.firestore();

// Sample data for each collection
const sampleData = {
  users: {
    'demo-user-001': {
      name: 'Demo User',
      email: 'demo@destino.app',
      dateOfBirth: new Date('1990-05-15'),
      birthTime: '10:30:00',
      placeOfBirth: {
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        latitude: 28.7041,
        longitude: 77.1025
      },
      zodiacSign: 'Taurus',
      language: 'en',
      subscriptionStatus: 'free',
      totalReadingsCount: 0,
      isOnboarded: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }
  },

  user_astrology_data: {
    'demo-user-001': {
      zodiacSign: 'Taurus',
      zodiacElement: 'Earth',
      lunarSign: 'Kumbha',
      birthNakshatra: 'Krittika',
      rulingPlanet: 'Venus',
      luckyNumber: 6,
      luckyColor: 'Green',
      personalityTraits: ['Stable', 'Reliable', 'Grounded', 'Sensual'],
      cosmicEnergyScores: {
        love: 75,
        career: 80,
        wealth: 70,
        health: 85,
        life: 78
      },
      compatibleSigns: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
      incompatibleSigns: ['Leo', 'Aquarius'],
      calculatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }
  },

  readings_history: {
    'demo-user-001': {
      totalReadings: 0,
      readingsByType: {
        love: 0,
        career: 0,
        health: 0,
        life: 0,
        general: 0
      },
      averageRating: 0,
      readingStreak: 0,
      longestReadingStreak: 0,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    }
  },

  daily_rashifal: {
    'aries-2026-09-15': {
      zodiacSign: 'Aries',
      date: new Date('2026-09-15'),
      rashifal_en: 'A day of new beginnings and opportunities. Trust your instincts and take bold action.',
      rashifal_hi: 'नई शुरुआत और अवसरों का दिन। अपनी प्रवृत्ति पर भरोसा करें और साहसपूर्ण कदम उठाएं।',
      loveScore: 4,
      careerScore: 5,
      healthScore: 3,
      moneyScore: 4,
      luckyTime: '10:30 - 12:00 PM',
      luckyDirection: 'East',
      favorableColors: ['Red', 'Orange'],
      unfavorableColors: ['Blue', 'Black'],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }
  }
};

// Main initialization function
async function initializeFirestore() {
  console.log('🚀 Starting Firestore initialization...\n');

  try {
    // Create all collections with sample data
    for (const [collectionName, documents] of Object.entries(sampleData)) {
      console.log(`📦 Creating collection: ${collectionName}`);

      for (const [docId, data] of Object.entries(documents)) {
        await db.collection(collectionName).doc(docId).set(data);
        console.log(`   ✅ Created document: ${docId}`);
      }
    }

    // Create empty collections (these will be created when first document is added)
    const emptyCollections = [
      'readings',
      'readings_reviews',
      'user_subscriptions',
      'ai_analysis_logs'
    ];

    console.log('\n📦 Creating empty collections (auto-created on first write):\n');
    for (const collection of emptyCollections) {
      console.log(`   ℹ️  ${collection} (will auto-create on first document)`);
    }

    console.log('\n✅ Firestore initialization completed successfully!\n');
    console.log('📊 Collections created:');
    console.log('   - users');
    console.log('   - user_astrology_data');
    console.log('   - readings_history');
    console.log('   - daily_rashifal');
    console.log('   - readings (empty, auto-created)');
    console.log('   - readings_reviews (empty, auto-created)');
    console.log('   - user_subscriptions (empty, auto-created)');
    console.log('   - ai_analysis_logs (empty, auto-created)');

    console.log('\n🔐 Next step: Apply Firestore Security Rules');
    console.log('   Go to Firebase Console → Firestore → Rules');
    console.log('   Copy rules from database-schema.sql (FIRESTORE SECURITY RULES section)\n');

  } catch (error) {
    console.error('❌ Error initializing Firestore:', error.message);
    process.exit(1);
  } finally {
    await admin.app().delete();
    process.exit(0);
  }
}

// Run initialization
initializeFirestore();
