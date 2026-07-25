import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let adminDb = null;
let adminAuth = null;

if (!getApps().length) {
  try {
    if (process.env.FIREBASE_PROJECT_ID) {
      const app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      adminDb = getFirestore(app);
      adminAuth = getAuth(app);
    } else {
       console.warn('FIREBASE_PROJECT_ID not set. Firebase Admin not initialized.');
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error.stack);
  }
} else {
  const app = getApps()[0];
  adminDb = getFirestore(app);
  adminAuth = getAuth(app);
}

// Export dummy proxies if initialization failed (e.g. during next build without env vars)
if (!adminDb) {
  adminDb = new Proxy({}, { get: () => () => ({}) });
}
if (!adminAuth) {
  adminAuth = new Proxy({}, { get: () => () => ({}) });
}

export { adminDb, adminAuth };
