"use strict";
/**
 * Firestore Service
 * Handles Firestore database operations for Rashifal
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.rashifalExists = rashifalExists;
exports.saveRashifalToFirestore = saveRashifalToFirestore;
exports.getRashifalFromFirestore = getRashifalFromFirestore;
exports.deleteRashifalFromFirestore = deleteRashifalFromFirestore;
const admin = __importStar(require("firebase-admin"));
// Lazy-load Firestore to ensure Firebase Admin is initialized first
function getDb() {
    return admin.firestore();
}
/**
 * Check if Rashifal for today already exists
 */
async function rashifalExists(date) {
    try {
        console.log(`🔍 Checking if Rashifal for ${date} exists...`);
        const docRef = getDb().collection('daily_rashifal').doc(date);
        const docSnapshot = await docRef.get();
        const exists = docSnapshot.exists;
        if (exists) {
            console.log(`✅ Rashifal for ${date} already exists`);
        }
        else {
            console.log(`✅ Rashifal for ${date} does not exist, will generate`);
        }
        return exists;
    }
    catch (error) {
        console.error('❌ Error checking Firestore:', error);
        throw new Error('Failed to check Firestore for existing Rashifal');
    }
}
/**
 * Save Rashifal to Firestore
 */
async function saveRashifalToFirestore(date, rashifalData) {
    try {
        console.log(`💾 Saving Rashifal for ${date} to Firestore...`);
        const firestoreData = {
            ...rashifalData,
            generatedAt: admin.firestore.Timestamp.now(),
        };
        const docRef = getDb().collection('daily_rashifal').doc(date);
        await docRef.set(firestoreData);
        console.log(`✅ Rashifal successfully saved to Firestore`);
    }
    catch (error) {
        console.error('❌ Error saving to Firestore:', error);
        throw new Error('Failed to save Rashifal to Firestore');
    }
}
/**
 * Get Rashifal from Firestore
 */
async function getRashifalFromFirestore(date) {
    try {
        console.log(`📖 Fetching Rashifal for ${date} from Firestore...`);
        const docRef = getDb().collection('daily_rashifal').doc(date);
        const docSnapshot = await docRef.get();
        if (!docSnapshot.exists) {
            console.log(`⚠️  No Rashifal found for ${date}`);
            return null;
        }
        const data = docSnapshot.data();
        console.log(`✅ Rashifal retrieved successfully`);
        return data;
    }
    catch (error) {
        console.error('❌ Error retrieving from Firestore:', error);
        throw new Error('Failed to retrieve Rashifal from Firestore');
    }
}
/**
 * Delete Rashifal from Firestore (for testing/cleanup)
 */
async function deleteRashifalFromFirestore(date) {
    try {
        console.log(`🗑️  Deleting Rashifal for ${date} from Firestore...`);
        const docRef = getDb().collection('daily_rashifal').doc(date);
        await docRef.delete();
        console.log(`✅ Rashifal deleted successfully`);
    }
    catch (error) {
        console.error('❌ Error deleting from Firestore:', error);
        throw new Error('Failed to delete Rashifal from Firestore');
    }
}
//# sourceMappingURL=firestore-service.js.map