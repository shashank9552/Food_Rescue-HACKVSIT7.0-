# Food Rescue AI — Firebase Backend

This directory contains the complete Firebase backend for the **Food Rescue AI** hackathon prototype. The system features Cloud Functions (2nd Gen), Firestore Security Rules, and a seeding utility script.

---

## 🚀 Critical Design Decision: Venue Wifi Reliability

A common hackathon failure mode is a live demo failing due to slow venue Wi-Fi or API quota limits. To ensure 100% demo reliability, this backend implements a **Haversine-first** distance calculation.

### How it works:
1. **Haversine (Baseline)**: The `findMatch` function immediately calculates the straight-line (Haversine) distance for all eligible NGOs using local mathematical operations (zero network calls, zero latency).
2. **Google Maps (Best-Effort Upgrade)**: In parallel, a call is dispatched to the Google Maps Distance Matrix API.
3. **1.5s Strict Timeout**: The Google Maps API request is bound to an `AbortController` set to **1.5 seconds**.
4. **Silent Fallback**: If the API call times out, encounters a network issue, has an invalid/missing key, or returns a quota error, it is caught silently. The backend logs a server-side warning and returns the Haversine distance.
5. **Annotated Response**: The return JSON marks each matching NGO with a `method: "google"` or `method: "haversine"` field, enabling transparent status reporting for judges without risk of crashes.

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- **Node.js**: v22.x
- **Firebase CLI**: Install globally with `npm install -g firebase-tools`

### 2. Install Dependencies
Run the install command inside the `functions` directory:
```bash
cd functions
npm install
```

To install dependencies for the database seeding tool:
```bash
cd ../seed
npm install
```

---

## 🔑 (Optional) Google Maps API Key Configuration

To test or demo real-world driving distance and travel times:

### 1. Retrieve & Restrict a Key
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Distance Matrix API**.
3. Create an API Key in **Credentials**.
4. **Security Recommendation**: Restrict the key to only allow requests to the **Distance Matrix API** to prevent misuse.

### 2. Store the Key as a Firebase Secret
Store the key securely using Firebase Secrets Manager:
```bash
firebase functions:secrets:set GOOGLE_MAPS_API_KEY="your_api_key_here"
```

*Note: The system will run completely fine using Haversine if no key is configured.*

---

## 🎛️ Running the Firebase Emulator

During local development, use the Firebase Emulator Suite:

```bash
cd ..
# Start firestore and functions emulators
firebase emulators:start --only functions,firestore
```

- **Firestore Emulator**: runs on port `8080`
- **Functions Emulator**: runs on port `5001`
- **Emulator UI**: accessible at `http://localhost:4000`

---

## 🌱 Seeding the Database

Populate your Firestore collections with mock Delhi-area coordinates:

```bash
# From the firebase/seed directory
export FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
npm run seed
```

This clears old records and seeds:
- **Spice Garden** (Restaurant, Delhi lat/lng, past weekly listings averaging 10kg)
- **Cafe Delight** (Restaurant, Delhi lat/lng, past weekly listings averaging 6kg)
- **Helping Hands** (NGO, capacity: 20kg)
- **Anna Seva Trust** (NGO, capacity: 15kg)
- **Rahul & Priya** (Volunteers, available: true)

---

## 📡 Frontend Integration Guide

Here is how the React frontend dev can invoke the callable functions using the Firebase SDK:

### 1. Initialize Functions client
```javascript
import { getFunctions, httpsCallable } from "firebase/functions";
const functions = getFunctions();
```

### 2. Find Closest NGO Matches (`findMatch`)
Input: `listingId` (string)
```javascript
const findMatch = httpsCallable(functions, 'findMatch');
const response = await findMatch({ listingId: "example_listing_id" });

// Output matches format:
// [
//   {
//     "id": "helping_hands",
//     "name": "Helping Hands",
//     "location": { "lat": 28.647, "lng": 77.226 },
//     "capacityKg": 20,
//     "distanceKm": 0.76,
//     "durationMin": null, // Float value present only if method is "google"
//     "method": "haversine" // "google" | "haversine"
//   },
//   ...
// ]
```

### 3. Predict Tomorrow's Waste (`predictWaste`)
Input: `restaurantId` (string)
```javascript
const predictWaste = httpsCallable(functions, 'predictWaste');
const response = await predictWaste({ restaurantId: "spice_garden" });

// Output format:
// {
//   "predictedKg": 12.5,
//   "basedOnDays": 7,
//   "weekendBoost": true
// }
```

---

## 🔒 Firestore Security Rules Reference

Security permissions configured in `firestore.rules`:
- `/foodListings/{id}`: read/create requires authentication; update requires authentication and the target status must be `claimed`, `picked_up`, or `delivered`.
- `/restaurants/{id}` & `/ngos/{id}`: read requires authentication; updates/deletions blocked from clients.
- `/volunteers/{id}`: read/write requires authentication.
- `/matches/{id}`: read/create requires authentication; updates/deletions blocked from clients.
