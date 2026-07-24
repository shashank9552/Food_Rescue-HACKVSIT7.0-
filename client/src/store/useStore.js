import { create } from 'zustand';
import { collection, onSnapshot, addDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useStore = create((set) => ({
  userRole: null, // restaurant, ngo, volunteer, admin
  userName: '',
  rescueItems: [],
  socketConnected: false,

  setRole: (role) => set({ userRole: role }),
  setUserName: (name) => set({ userName: name }),
  
  // Set up Firestore subscription in real-time
  initSocket: () => {
    console.log("[Firebase Store] Subscribing to Firestore /foodListings...");
    const q = query(collection(db, 'foodListings'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      set({ rescueItems: items, socketConnected: true });
    }, (err) => {
      console.error("[Firebase Store] Firestore subscription failed:", err);
      set({ socketConnected: false });
    });

    return unsubscribe;
  },

  addRescueItem: async (itemData) => {
    const quantity = parseFloat(itemData.name.match(/\d+/)?.[0]) || 8;
    const newItem = {
      name: itemData.name,
      description: itemData.description || '',
      restaurantName: itemData.restaurantName,
      address: itemData.address,
      status: 'posted',
      ngoName: null,
      volunteerName: null,
      timestamp: new Date().toISOString(),
      restaurantLocation: { lat: 28.6519, lng: 77.2315 }, // Delhi area location centroid
      quantityKg: quantity
    };

    try {
      await addDoc(collection(db, 'foodListings'), newItem);
      console.log("[Firebase Store] Added new food listing to Firestore.");
    } catch (err) {
      console.error("[Firebase Store] Failed to add listing:", err);
    }
  },

  claimRescueItem: async (itemId, ngoName) => {
    try {
      const itemRef = doc(db, 'foodListings', itemId);
      await updateDoc(itemRef, {
        status: 'claimed',
        ngoName: ngoName,
        claimedByNgo: ngoName,
        claimedByNgoName: ngoName
      });
      console.log(`[Firebase Store] Item ${itemId} claimed by NGO ${ngoName}.`);
    } catch (err) {
      console.error("[Firebase Store] Failed to claim item:", err);
    }
  },

  pickupRescueItem: async (itemId, volunteerName) => {
    try {
      const itemRef = doc(db, 'foodListings', itemId);
      await updateDoc(itemRef, {
        status: 'picked_up',
        volunteerName: volunteerName,
        assignedVolunteer: volunteerName
      });
      console.log(`[Firebase Store] Item ${itemId} picked up by volunteer ${volunteerName}.`);
    } catch (err) {
      console.error("[Firebase Store] Failed to pick up item:", err);
    }
  },

  deliverRescueItem: async (itemId) => {
    try {
      const itemRef = doc(db, 'foodListings', itemId);
      await updateDoc(itemRef, {
        status: 'delivered'
      });
      console.log(`[Firebase Store] Item ${itemId} marked as delivered.`);
    } catch (err) {
      console.error("[Firebase Store] Failed to mark item as delivered:", err);
    }
  },

  setRescueItems: (items) => set({ rescueItems: items }),
}));
