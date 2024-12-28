const admin = require('firebase-admin');

// Initialize Firebase Admin with environment variables
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CERT_URL
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

const db = admin.firestore();

// Create the required indexes
async function createRequiredIndexes() {
  try {
    console.log('Creating notification index...');
    
    // Create the composite index
    await db.collection('notifications').doc('_dummy_').set({
      recipientId: 'dummy',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Delete the dummy document
    await db.collection('notifications').doc('_dummy_').delete();

    console.log('Notification index setup completed');
    console.log('Please visit the following URL to create the index:');
    console.log('https://console.firebase.google.com/project/esports-d882d/firestore/indexes');

  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
}

module.exports = { db, createRequiredIndexes };