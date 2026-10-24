import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updatePassword,
  type User 
} from 'firebase/auth';
import { ref, onValue, get, set, update } from 'firebase/database';
import { auth, database } from '../config/firebase';
import type { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isPremium: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string, phone: string, district: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, phone: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateProfile: (district: string, phone: string, language: string) => Promise<void>;
  incrementDownloadCount: () => Promise<void>;
  unlockPremium: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function javaHashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return hash;
}

export function getFirebaseAuthPassword(email: string): string {
  return `AL_App_${javaHashCode(email.trim().toLowerCase())}_2026!`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        const unsubscribeProfile = onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const expiry = data.premiumExpiry || 0;
            const isPremiumValid = Boolean(data.isPremium) && (expiry === 0 || expiry > Date.now());

            setUserProfile({
              uid: user.uid,
              name: data.name || '',
              email: data.email || user.email || '',
              phone: data.phone || '',
              district: data.district || '',
              isPremium: isPremiumValid,
              premiumExpiry: expiry,
              isAdmin: Boolean(data.isAdmin || data.email === 'admin@example.com' || data.email === 'arikarran14@gmail.com'),
              language: data.language || 'tamil',
              freeDownloadsCount: Number(data.freeDownloadsCount || 0)
            });
          } else {
            // New or fallback profile
            setUserProfile({
              uid: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'Student',
              email: user.email || '',
              phone: '',
              district: '',
              isPremium: false,
              isAdmin: user.email === 'admin@example.com' || user.email === 'arikarran14@gmail.com',
              language: 'tamil',
              freeDownloadsCount: 0
            });
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Profile load error:", error);
          setIsLoading(false);
        });

        return () => unsubscribeProfile();
      } else {
        setUserProfile(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    const standardPass = getFirebaseAuthPassword(cleanEmail);

    try {
      // 1. Try signing in with standardized hashed password
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, standardPass);
      const uid = cred.user.uid;
      const userRef = ref(database, `users/${uid}`);
      const snap = await get(userRef);

      if (snap.exists()) {
        const dbPass = snap.val().password;
        if (!dbPass || dbPass === cleanPass) {
          if (!dbPass) {
            await update(userRef, { password: cleanPass });
          }
          return { success: true };
        } else {
          await signOut(auth);
          return { success: false, error: 'Invalid email or password' };
        }
      } else {
        await update(userRef, { password: cleanPass });
        return { success: true };
      }
    } catch (err: any) {
      // 2. Fallback to direct password authentication for older accounts
      try {
        const credOld = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
        const uid = credOld.user.uid;
        // Migrate to standard password
        if (auth.currentUser) {
          await updatePassword(auth.currentUser, standardPass);
          await update(ref(database, `users/${uid}`), { password: cleanPass });
        }
        return { success: true };
      } catch (oldErr: any) {
        return { success: false, error: oldErr.message || 'Invalid email or password' };
      }
    }
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    phone: string,
    district: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const standardPass = getFirebaseAuthPassword(cleanEmail);

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, standardPass);
      const uid = cred.user.uid;

      const profileData: any = {
        name: name.trim(),
        email: cleanEmail,
        password: pass,
        phone: phone.trim(),
        district: district.trim(),
        isPremium: false,
        isAdmin: cleanEmail === 'admin@example.com' || cleanEmail === 'arikarran14@gmail.com',
        language: 'tamil',
        freeDownloadsCount: 0,
        createdAt: Date.now()
      };

      await set(ref(database, `users/${uid}`), profileData);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const resetPassword = async (
    email: string,
    phone: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const standardPass = getFirebaseAuthPassword(cleanEmail);

    try {
      // Sign in temporarily using standard pass
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, standardPass);
      const uid = cred.user.uid;
      const snap = await get(ref(database, `users/${uid}`));

      if (snap.exists()) {
        const dbPhone = snap.val().phone;
        if (dbPhone && dbPhone.replace(/[\s-]/g, '') === cleanPhone.replace(/[\s-]/g, '')) {
          await update(ref(database, `users/${uid}`), { password: newPass });
          await signOut(auth);
          return { success: true, message: 'Password reset successfully! Please log in.' };
        } else {
          await signOut(auth);
          return { success: false, message: 'Phone number does not match registered number.' };
        }
      } else {
        await signOut(auth);
        return { success: false, message: 'User profile not found.' };
      }
    } catch (err: any) {
      return { success: false, message: 'Authentication failed or email address not registered.' };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const updateProfile = async (district: string, phone: string, language: string) => {
    if (!currentUser) return;
    await update(ref(database, `users/${currentUser.uid}`), {
      district: district.trim(),
      phone: phone.trim(),
      language: language.trim().toLowerCase()
    });
  };

  const incrementDownloadCount = async () => {
    if (!currentUser || !userProfile) return;
    const currentCount = userProfile.freeDownloadsCount || 0;
    const nextCount = currentCount + 1;
    await update(ref(database, `users/${currentUser.uid}`), {
      freeDownloadsCount: nextCount
    });
  };

  const unlockPremium = async () => {
    if (!currentUser) return;
    await update(ref(database, `users/${currentUser.uid}`), {
      isPremium: true
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin: Boolean(userProfile?.isAdmin),
        isPremium: Boolean(userProfile?.isPremium),
        isLoading,
        login,
        register,
        resetPassword,
        logout,
        updateProfile,
        incrementDownloadCount,
        unlockPremium,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
