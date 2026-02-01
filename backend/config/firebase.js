const admin = require('firebase-admin');

const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL'
];

const hasFirebaseCredentials = requiredEnvVars.every((key) => Boolean(process.env[key]));

let storage = null;
let messaging = null;

// Avoid initializing Firebase when credentials are missing so Jest/local runs do not crash.
if (hasFirebaseCredentials) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  };

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
    });
  }

  storage = admin.storage();
  messaging = admin.messaging();
} else if (process.env.NODE_ENV !== 'test') {
  console.warn('[firebase] Missing credentials. Firebase messaging & storage are disabled.');
}

module.exports = {
  admin: hasFirebaseCredentials ? admin : null,
  storage,
  messaging,
  isFirebaseConfigured: hasFirebaseCredentials
};
