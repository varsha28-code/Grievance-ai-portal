// This script is meant to be run once manually to seed your Firebase with Admin/Officer accounts and dummy complaints.
// It bypasses the public registration page which only provisions 'citizen' roles.

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';

// 1. Manually paste your Firebase Config here just for this standalone script to run once:
const firebaseConfig = {
  apiKey: "AIzaSyAm8JSwCcSfLhlCxrw4dzoM1za83nai2R8",
  authDomain: "grievance-portal-2229a.firebaseapp.com",
  projectId: "grievance-portal-2229a",
  storageBucket: "grievance-portal-2229a.firebasestorage.app",
  messagingSenderId: "950913175505",
  appId: "1:950913175505:web:8558449a45398a29ccdaf0",
  measurementId: "G-HFCFZP2MBR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const OFFICERS_AND_ADMINS = [
  {
    email: 'admin@municipal.gov',
    password: 'admin123',
    name: 'System Admin',
    role: 'admin',
    department: 'All'
  },
  {
    email: 'amit.patel@municipal.gov',
    password: 'officer123',
    name: 'Amit Patel',
    role: 'officer',
    department: 'Water Supply'
  },
  {
    email: 'sarah.khan@municipal.gov',
    password: 'officer123',
    name: 'Sarah Khan',
    role: 'officer',
    department: 'Roads & Works'
  },
  {
    email: 'raj.kumar@municipal.gov',
    password: 'officer123',
    name: 'Raj Kumar',
    role: 'officer',
    department: 'Sanitation'
  },
  {
    email: 'priya.singh@municipal.gov',
    password: 'officer123',
    name: 'Priya Singh',
    role: 'officer',
    department: 'Electrical'
  }
];

async function seedUsers() {
  console.log('Seeding elevated user accounts...');

  for (const user of OFFICERS_AND_ADMINS) {
    try {
      // 1. Create the Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const uid = userCredential.user.uid;

      // 2. Create the protected Firestore profile document tracking their elevated role
      await setDoc(doc(db, 'users', uid), {
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        createdAt: new Date().toISOString()
      });

      console.log(`✅ successfully created ${user.role}: ${user.email}`);

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
         console.warn(`⚠️ User already exists: ${user.email}. Skipping...`);
      } else {
         console.error(`❌ Failed to create ${user.email}:`, error.message);
      }
    }
  }

  console.log('\nUser seeding complete! You can now log into these accounts.');
  process.exit(0);
}

// Ensure the developer inputs real config before running
if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.error("❌ CRITICAL: You must replace the 'firebaseConfig' object at the top of this script with your real Firebase credentials before executing.");
    process.exit(1);
} else {
    seedUsers();
}
