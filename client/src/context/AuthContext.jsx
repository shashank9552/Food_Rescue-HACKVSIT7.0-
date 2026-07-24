import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with Email and Password
  const signup = async (email, password, name) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;
      
      // Initialize basic profile without a role (user must select a role next)
      const profile = {
        name,
        email,
        createdAt: new Date().toISOString(),
        role: null,
        phone: '',
        location: null
      };

      await setDoc(doc(db, 'users', currentUser.uid), profile);
      setUserProfile(profile);
      return currentUser;
    } catch (err) {
      console.error("Signup failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Log in with Email and Password
  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Google Authentication
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const currentUser = userCredential.user;

      // Check if user profile already exists
      const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
      if (!docSnap.exists()) {
        // Create basic profile without a role
        const profile = {
          name: currentUser.displayName || 'Google User',
          email: currentUser.email,
          createdAt: new Date().toISOString(),
          role: null,
          phone: '',
          location: null
        };
        await setDoc(doc(db, 'users', currentUser.uid), profile);
        setUserProfile(profile);
      } else {
        setUserProfile(docSnap.data());
      }
      return currentUser;
    } catch (err) {
      console.error("Google Auth failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Log out
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (err) {
      console.error("Logout failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update profile role
  const updateUserRole = async (role, details = {}) => {
    if (!user) throw new Error("No authenticated user found.");
    setLoading(true);
    try {
      const updatedProfile = {
        ...userProfile,
        role,
        phone: details.phone || '',
        location: details.location || null,
        name: details.name || userProfile.name
      };

      await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });
      setUserProfile(updatedProfile);

      // Create role-specific sub-collection profile (restaurants, ngos, volunteers)
      if (role === 'restaurant') {
        await setDoc(doc(db, 'restaurants', user.uid), {
          ownerId: user.uid,
          restaurantName: details.restaurantName || details.name || userProfile.name,
          address: details.address || '',
          latitude: details.location?.lat || 28.6519,
          longitude: details.location?.lng || 77.2315,
          contact: details.phone || ''
        });
      } else if (role === 'ngo') {
        await setDoc(doc(db, 'ngos', user.uid), {
          ownerId: user.uid,
          ngoName: details.ngoName || details.name || userProfile.name,
          capacity: details.capacity || 20,
          address: details.address || '',
          latitude: details.location?.lat || 28.6470,
          longitude: details.location?.lng || 77.2260
        });
      } else if (role === 'volunteer') {
        await setDoc(doc(db, 'volunteers', user.uid), {
          ownerId: user.uid,
          name: details.name || userProfile.name,
          phone: details.phone || '',
          location: details.location || { lat: 28.6500, lng: 77.2300 },
          available: true
        });
      }
    } catch (err) {
      console.error("Profile update failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Monitor Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
