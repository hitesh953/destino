import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Firebase configuration extracted from google-services.json
const firebaseConfig = {
  apiKey: 'AIzaSyCBc-FW2eoytWMfaDCqPzQ2X1mCOdwf9ms',
  authDomain: 'destinoai-90296.firebaseapp.com',
  projectId: 'destinoai-90296',
  storageBucket: 'destinoai-90296.firebasestorage.app',
  messagingSenderId: '286136811486',
  appId: '1:286136811486:android:9f868782cbe9a29552e74f',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence for React Native
const auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { app, auth, db, storage };
