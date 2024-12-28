require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin with credentials
const serviceAccount = require(path.join(__dirname, '..', 'esports-d882d-firebase-adminsdk-jhjzf-e73781d9ce.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createIndexes() {
  try {
    console.log('Creating Firebase indexes...');
    
    const db = admin.firestore();
    
    // Create the composite index for notifications
    await db.collection('notifications').doc('_dummy_').set({
      recipientId: 'dummy',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Clean up the dummy document
    await db.collection('notifications').doc('_dummy_').delete();

    console.log('Index creation triggered successfully!');
    console.log('Please wait a few minutes for the index to be built.');
    console.log('You can monitor the index creation at:');
    console.log('https://console.firebase.google.com/project/esports-d882d/firestore/indexes');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
}

createIndexes();
