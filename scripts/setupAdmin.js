const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCxdoKab4agDCag2syrjpeF2vYfNTIbYEE",
  authDomain: "esports-d882d.firebaseapp.com",
  projectId: "esports-d882d",
  storageBucket: "esports-d882d.appspot.com",
  messagingSenderId: "314534424935",
  appId: "1:314534424935:web:4f2c8a8c3f5b8b8b8b8b8b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const setupAdmin = async () => {
  try {
    // Admin credentials
    const email = 'admin@esports.com';
    const password = 'Admin@123';

    // Try to sign in first
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Signed in as admin');
    } catch (error) {
      // If user doesn't exist, create new admin account
      if (error.code === 'auth/user-not-found') {
        console.log('Creating new admin account...');
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        throw error;
      }
    }

    // Get the current user
    const user = auth.currentUser;
    if (!user) throw new Error('No user found');

    // Update or create admin document in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create new admin document
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        role: 'admin',
        isAdmin: true,
        displayName: 'Admin',
        createdAt: new Date().toISOString(),
        photoURL: null,
        active: true,
      });
      console.log('Admin user created successfully');
    } else {
      // Update existing user to admin
      await setDoc(userRef, {
        ...userDoc.data(),
        role: 'admin',
        isAdmin: true,
      }, { merge: true });
      console.log('Existing user updated to admin');
    }

    console.log('Admin setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
};

setupAdmin();
