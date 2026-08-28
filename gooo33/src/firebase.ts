import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, push, serverTimestamp as rtdbTimestamp } from 'firebase/database';
import { getFirestore, doc, setDoc, serverTimestamp as firestoreTimestamp } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyAlX1ASvDrf5BBtaB72AUYqSoW34YvP_y4",
  authDomain: "mrwan-dd795.firebaseapp.com",
  databaseURL: "https://mrwan-dd795-default-rtdb.firebaseio.com",
  projectId: "mrwan-dd795",
  storageBucket: "mrwan-dd795.firebasestorage.app",
  messagingSenderId: "12538399995",
  appId: "1:12538399995:web:4a7e6b40f611891fecb45e",
  measurementId: "G-KBTHXXDYBL"
};

// Initialize Firebase safely (avoid multiple initializations)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const rtdb = getDatabase(app);
export const firestore = getFirestore(app);

/**
 * Save user ID activation / registration request to Firebase
 */
export async function saveActivationRequest(userId: string, game: string, platform: string = 'greenbet') {
  try {
    const timestamp = Date.now();
    const payload = {
      userId,
      game,
      platform,
      promoCode: 'E1111',
      minDeposit: '300 EGP',
      status: 'active',
      createdAt: timestamp,
      deviceAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'web',
    };

    // Save to Realtime Database
    const userRef = ref(rtdb, `activations/${userId}`);
    await set(userRef, {
      ...payload,
      updatedAt: rtdbTimestamp(),
    });

    // Save to Firestore
    const firestoreRef = doc(firestore, 'activations', userId);
    await setDoc(firestoreRef, {
      ...payload,
      updatedAt: firestoreTimestamp(),
    }, { merge: true });

    // Also push to logs
    const logRef = push(ref(rtdb, 'logs'));
    await set(logRef, {
      action: 'activation_request',
      userId,
      game,
      timestamp,
    });

    return { success: true };
  } catch (error) {
    console.error('Firebase save activation error:', error);
    return { success: false, error };
  }
}

/**
 * Log login and key generation attempts
 */
export async function saveKeyGenerated(key: string, userId: string, game: string) {
  try {
    const timestamp = Date.now();
    const keyRef = ref(rtdb, `generated_keys/${key}`);
    await set(keyRef, {
      key,
      userId,
      game,
      platform: 'greenbet',
      promoCode: 'E1111',
      createdAt: timestamp,
      updatedAt: rtdbTimestamp(),
    });

    const firestoreKeyRef = doc(firestore, 'generated_keys', key);
    await setDoc(firestoreKeyRef, {
      key,
      userId,
      game,
      platform: 'greenbet',
      promoCode: 'E1111',
      createdAt: timestamp,
      updatedAt: firestoreTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Firebase save key error:', error);
  }
}
