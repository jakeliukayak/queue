# Firebase Backend Integration Guide

This guide explains how to integrate the queuing system with Firebase for production deployment.

## Architecture

- **Frontend**: Static Next.js site hosted on GitHub Pages
- **Backend**: Firebase Functions for API endpoints
- **Database**: Firebase Realtime Database or Firestore for queue storage
- **SMS**: Twilio integration via Firebase Functions

## Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Firestore or Realtime Database
4. Enable Firebase Functions

### 2. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 3. Initialize Firebase in Your Project

```bash
firebase init functions
firebase init firestore  # or hosting for Realtime Database
```

### 4. Create Firebase Functions

Create `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const twilio = require('twilio');

admin.initializeApp();
const db = admin.firestore();

// Initialize Twilio
const twilioClient = twilio(
  functions.config().twilio.account_sid,
  functions.config().twilio.auth_token
);
const twilioPhone = functions.config().twilio.phone_number;

// CORS middleware
const cors = require('cors')({origin: true});

// Create a new ticket
exports.createTicket = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      const { phoneNumber } = req.body;

      // Get current ticket number
      const counterRef = db.collection('config').doc('counter');
      const counter = await db.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        const currentNumber = counterDoc.exists ? counterDoc.data().current : 0;
        const newNumber = currentNumber + 1;
        transaction.set(counterRef, { current: newNumber });
        return newNumber;
      });

      // Create ticket
      const ticket = {
        ticketNumber: counter,
        phoneNumber,
        status: 'waiting',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('tickets').add(ticket);

      // Send confirmation SMS
      try {
        await twilioClient.messages.create({
          body: `Your ticket number is ${counter}. You will receive an SMS when you're next in line.`,
          from: twilioPhone,
          to: phoneNumber
        });
      } catch (smsError) {
        console.error('SMS error:', smsError);
      }

      res.json({
        success: true,
        ticketNumber: counter,
        id: docRef.id
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      res.status(500).json({ error: 'Failed to create ticket' });
    }
  });
});

// Get queue
exports.getQueue = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const snapshot = await db.collection('tickets')
        .where('status', '==', 'waiting')
        .orderBy('timestamp', 'asc')
        .get();

      const queue = [];
      snapshot.forEach(doc => {
        queue.push({ id: doc.id, ...doc.data() });
      });

      res.json({ queue });
    } catch (error) {
      console.error('Error fetching queue:', error);
      res.status(500).json({ error: 'Failed to fetch queue' });
    }
  });
});

// Call next customer
exports.callNext = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      const { ticketId } = req.body;

      // Mark current ticket as called
      await db.collection('tickets').doc(ticketId).update({
        status: 'called'
      });

      // Get next ticket
      const snapshot = await db.collection('tickets')
        .where('status', '==', 'waiting')
        .orderBy('timestamp', 'asc')
        .limit(1)
        .get();

      let nextTicket = null;
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        nextTicket = { id: doc.id, ...doc.data() };

        // Send SMS to next customer
        try {
          await twilioClient.messages.create({
            body: `Your turn is next! Ticket #${nextTicket.ticketNumber}`,
            from: twilioPhone,
            to: nextTicket.phoneNumber
          });
        } catch (smsError) {
          console.error('SMS error:', smsError);
        }
      }

      // Delete the called ticket after a delay
      setTimeout(async () => {
        await db.collection('tickets').doc(ticketId).delete();
      }, 5000);

      res.json({ success: true, nextTicket });
    } catch (error) {
      console.error('Error calling next:', error);
      res.status(500).json({ error: 'Failed to call next' });
    }
  });
});

// Remove ticket
exports.removeTicket = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      const { ticketId } = req.body;
      await db.collection('tickets').doc(ticketId).delete();
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing ticket:', error);
      res.status(500).json({ error: 'Failed to remove ticket' });
    }
  });
});
```

### 5. Set Twilio Configuration

```bash
firebase functions:config:set twilio.account_sid="YOUR_ACCOUNT_SID"
firebase functions:config:set twilio.auth_token="YOUR_AUTH_TOKEN"
firebase functions:config:set twilio.phone_number="YOUR_TWILIO_PHONE"
```

### 6. Update Frontend API Calls

Update your frontend files to call Firebase Functions instead of local API routes:

```typescript
// In ticket/page.tsx and admin/page.tsx
const FIREBASE_FUNCTIONS_URL = 'https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net';

// Example:
const response = await fetch(`${FIREBASE_FUNCTIONS_URL}/createTicket`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phoneNumber }),
});
```

### 7. Deploy Functions

```bash
firebase deploy --only functions
```

### 8. Firestore Security Rules

Create `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only allow authenticated admins to read/write
    match /tickets/{ticket} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /config/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## Cost Considerations

- **Firebase Functions**: Pay per invocation (Generous free tier)
- **Firestore**: Pay per read/write operation
- **Twilio SMS**: Pay per message sent (~$0.0075 per SMS in US)

## Monitoring

- View logs: `firebase functions:log`
- Monitor in Firebase Console under Functions tab
- Set up alerts for errors and usage

## Next Steps

1. Implement Firebase Authentication for admin panel
2. Add webhook support for Twilio delivery status
3. Set up Firebase hosting for the frontend (alternative to GitHub Pages)
4. Implement queue analytics and reporting
