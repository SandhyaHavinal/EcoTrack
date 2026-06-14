import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase';
import type { UserProfile } from '../types';

interface AuthContextType {
  currentUser: any;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<any>;
  signupWithEmail: (email: string, password: string, name: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

const DEFAULT_PROFILE = (uid: string, email: string, name: string): UserProfile => ({
  userId: uid,
  name,
  email,
  profilePhoto: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name.replace(/\s+/g, '')}`,
  carbonScore: 75,
  totalEmissions: 320,
  points: 150,
  role: email.includes('admin') ? 'admin' : 'user',
  badges: [
    {
      id: 'welcome',
      title: 'Eco Beginner',
      description: 'Started the journey to reduce carbon footprint.',
      earnedAt: new Date().toISOString(),
      icon: '🌱'
    }
  ],
  goals: [
    {
      id: 'goal-1',
      category: 'transport',
      target: 20, // 20% or 20kg
      current: 5,
      status: 'active',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  ],
  createdAt: new Date()
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Firestore operations helper
  const fetchOrCreateProfile = async (uid: string, email: string, name: string) => {
    if (isFirebaseConfigured && db) {
      const userDocRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile(data as UserProfile);
      } else {
        const newProfile = DEFAULT_PROFILE(uid, email, name);
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      }
    } else {
      // LocalStorage mode
      const storedUsers = JSON.parse(localStorage.getItem('ecotrack_users') || '{}');
      if (storedUsers[uid]) {
        setUserProfile(storedUsers[uid]);
      } else {
        const newProfile = DEFAULT_PROFILE(uid, email, name);
        storedUsers[uid] = newProfile;
        localStorage.setItem('ecotrack_users', JSON.stringify(storedUsers));
        setUserProfile(newProfile);
      }
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          try {
            await fetchOrCreateProfile(user.uid, user.email || '', user.displayName || 'Eco User');
          } catch (error) {
            console.error('Error fetching Firestore user profile:', error);
          }
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Offline/Local Auth Simulation
      const storedSession = localStorage.getItem('ecotrack_current_user');
      if (storedSession) {
        const user = JSON.parse(storedSession);
        setCurrentUser(user);
        fetchOrCreateProfile(user.uid, user.email, user.displayName);
      }
      setLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
      } else {
        // Simulated Auth
        const storedAuth = JSON.parse(localStorage.getItem('ecotrack_simulated_auth') || '[]');
        const userMatch = storedAuth.find((u: any) => u.email === email && u.password === password);
        
        if (userMatch) {
          const userObj = { uid: userMatch.uid, email: userMatch.email, displayName: userMatch.name };
          localStorage.setItem('ecotrack_current_user', JSON.stringify(userObj));
          setCurrentUser(userObj);
          await fetchOrCreateProfile(userMatch.uid, userMatch.email, userMatch.name);
          return userObj;
        } else {
          throw new Error('Invalid email or password.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await fetchOrCreateProfile(userCredential.user.uid, email, name);
        return userCredential.user;
      } else {
        // Simulated Auth
        const storedAuth = JSON.parse(localStorage.getItem('ecotrack_simulated_auth') || '[]');
        if (storedAuth.some((u: any) => u.email === email)) {
          throw new Error('Email is already registered.');
        }
        
        const uid = 'mock_uid_' + Math.random().toString(36).substr(2, 9);
        storedAuth.push({ uid, email, password, name });
        localStorage.setItem('ecotrack_simulated_auth', JSON.stringify(storedAuth));

        const userObj = { uid, email, displayName: name };
        localStorage.setItem('ecotrack_current_user', JSON.stringify(userObj));
        setCurrentUser(userObj);
        await fetchOrCreateProfile(uid, email, name);
        return userObj;
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        await fetchOrCreateProfile(
          userCredential.user.uid,
          userCredential.user.email || '',
          userCredential.user.displayName || 'Eco User'
        );
        return userCredential.user;
      } else {
        // Simulated Google Sign In
        const uid = 'google_mock_uid_' + Math.random().toString(36).substr(2, 9);
        const userObj = { uid, email: 'google.user@example.com', displayName: 'Google Eco Explorer' };
        localStorage.setItem('ecotrack_current_user', JSON.stringify(userObj));
        setCurrentUser(userObj);
        await fetchOrCreateProfile(uid, userObj.email, userObj.displayName);
        return userObj;
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await firebaseSignOut(auth);
      } else {
        localStorage.removeItem('ecotrack_current_user');
        setCurrentUser(null);
        setUserProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    
    const updatedProfile = { ...userProfile, ...data } as UserProfile;
    setUserProfile(updatedProfile);

    if (isFirebaseConfigured && db) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, data);
    } else {
      const storedUsers = JSON.parse(localStorage.getItem('ecotrack_users') || '{}');
      storedUsers[currentUser.uid] = updatedProfile;
      localStorage.setItem('ecotrack_users', JSON.stringify(storedUsers));
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      loading,
      loginWithEmail,
      signupWithEmail,
      loginWithGoogle,
      logout,
      updateProfileData
    }}>
      {children}
    </AuthContext.Provider>
  );
};
