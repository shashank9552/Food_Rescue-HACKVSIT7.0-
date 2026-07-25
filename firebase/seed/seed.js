const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

// Connect based on runtime environment (Emulator vs Production)
if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log(`Connecting to Firestore Emulator at: ${process.env.FIRESTORE_EMULATOR_HOST}`);
  admin.initializeApp({
    projectId: "food-rescue-ai-demo"
  });
} else if (fs.existsSync(serviceAccountPath)) {
  console.log("Connecting to production Firebase using serviceAccountKey.json credentials...");
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  console.error("Error: serviceAccountKey.json not found and FIRESTORE_EMULATOR_HOST is not set.");
  console.error("To seed the emulator, run: export FIRESTORE_EMULATOR_HOST=localhost:8080 && npm run seed");
  process.exit(1);
}

const db = admin.firestore();

const restaurants = [
  {
    id: "spice_garden",
    name: "Spice Garden",
    location: { lat: 28.6519, lng: 77.2315 },
    pastListingsKg: [8, 9, 8, 9, 13, 14, 9, 8, 9, 8, 9, 13, 14, 9] // Average: 10kg, Fri/Sat busiest
  },
  {
    id: "cafe_delight",
    name: "Cafe Delight",
    location: { lat: 28.6448, lng: 77.2167 },
    pastListingsKg: [5, 5, 5, 5, 8, 9, 5, 5, 5, 5, 5, 8, 9, 5] // Average: 6kg, Fri/Sat busiest
  }
];

const ngos = [
  {
    id: "helping_hands",
    name: "Helping Hands",
    location: { lat: 28.6470, lng: 77.2260 },
    capacityKg: 20
  },
  {
    id: "anna_seva_trust",
    name: "Anna Seva Trust",
    location: { lat: 28.6600, lng: 77.2400 },
    capacityKg: 15
  }
];

const volunteers = [
  {
    id: "rahul",
    name: "Rahul",
    location: { lat: 28.6500, lng: 77.2300 },
    available: true
  },
  {
    id: "priya",
    name: "Priya",
    location: { lat: 28.6550, lng: 77.2200 },
    available: true
  }
];

async function deleteCollection(collectionPath) {
  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

async function seed() {
  try {
    console.log("Clearing existing collections...");
    await deleteCollection("restaurants");
    await deleteCollection("ngos");
    await deleteCollection("volunteers");
    await deleteCollection("foodListings");
    await deleteCollection("matches");

    console.log("Writing seed documents...");
    const batch = db.batch();

    restaurants.forEach((restaurant) => {
      const { id, ...data } = restaurant;
      batch.set(db.collection("restaurants").doc(id), data);
    });

    ngos.forEach((ngo) => {
      const { id, ...data } = ngo;
      batch.set(db.collection("ngos").doc(id), data);
    });

    volunteers.forEach((volunteer) => {
      const { id, ...data } = volunteer;
      batch.set(db.collection("volunteers").doc(id), data);
    });

    await batch.commit();
    console.log("Seeded.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed with error:", err);
    process.exit(1);
  }
}

seed();
