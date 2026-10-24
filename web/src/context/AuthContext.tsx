import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updatePassword,
  type User,
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

/**
 * Legacy accounts used an email-derived Firebase password. This helper exists
 * only to migrate those accounts after the user proves possession of the
 * legacy password AND the old profile password matches. Never use it for new
 * accounts and never persist a password in Realtime Database.
 */
function legacyFirebasePassword(email: string): string {
  let hash = 0;
  const normalized = email.trim().toLowerCase();
  for (let i = 0; i < normalized.length; i += 1) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
    hash |= 0;
  }
  return `AL_App_${hash}_2026!`;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      unsubscribeProfile?.();
      unsubscribeProfile = undefined;
      setCurrentUser(user);
      setUserProfile(null);

      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Privileges must come from trusted Firebase custom claims, never a
        // client-editable profile field or a hard-coded email in the bundle.
        const token = await user.getIdTokenResult();
        const trustedAdmin = token.claims.admin === true;

        const userRef = ref(database, `users/${user.uid}`);
        unsubscribeProfile = onValue(userRef, (snapshot) => {
          const data = snapshot.exists() ? snapshot.val() : {};
          const expiry = Number(data.premiumExpiry || data.premiumValidUntil || 0);
          const premium = data.isPremium === true && (expiry === 0 || expiry > Date.now());

          setUserProfile({
            uid: user.uid,
            name: data.name || user.displayName || user.email?.split('@')[0] || 'Student',
            email: user.email || '',
            phone: data.phone || '',
            district: data.district || '',
            isPremium: premium,
            premiumExpiry: expiry,
            isAdmin: trustedAdmin,
            language: data.language || 'tamil',
            freeDownloadsCount: Number(data.freeDownloadsCount || 0),
          });
          setIsLoading(false);
        }, (error) => {
          console.error('Profile load error:', error);
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Could not load trusted account claims:', error);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeProfile?.();
      unsubscribeAuth();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass) return { success: false, error: 'Enter your email and password.' };

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, pass);
      return { success: true };
    } catch (primaryError) {
      // One-time compatibility migration for accounts created by the previous
      // app. The legacy deterministic credential is never used for new users.
      try {
        const legacyCredential = await signInWithEmailAndPassword(auth, cleanEmail, legacyFirebasePassword(cleanEmail));
        const userRef = ref(database, `users/${legacyCredential.user.uid}`);
        const snapshot = await get(userRef);
        const storedLegacyPassword = snapshot.exists() ? snapshot.val().password : null;

        if (typeof storedLegacyPassword !== 'string' || storedLegacyPassword !== pass) {
          await signOut(auth);
          return { success: false, error: 'Invalid email or password.' };
        }

        await updatePassword(legacyCredential.user, pass);
        // Firebase Auth now owns the credential; remove the old plaintext copy.
        await update(userRef, { password: null });
        return { success: true };
      } catch {
        return {
          success: false,
          error: getErrorMessage(primaryError, 'Invalid email or password.'),
        };
      }
    }
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    phone: string,
    district: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (name.trim().length < 2 || !cleanEmail || pass.length < 8) {
      return { success: false, error: 'Enter your name, a valid email, and a password of at least 8 characters.' };
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const profileData = {
        name: name.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        district: district.trim(),
        isPremium: false,
        language: 'tamil',
        freeDownloadsCount: 0,
        createdAt: Date.now(),
      };
      await set(ref(database, `users/${credential.user.uid}`), profileData);
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'Registration failed.') };
    }
  };

  const resetPassword = async (
    email: string,
    _phone: string,
    _newPass: string,
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return { success: false, message: 'Enter your registered email address.' };

    try {
      // Phone + email supplied by the client is not proof of identity. Use
      // Firebase's verified email recovery flow instead of writing a password
      // field to the database or changing an unverified account credential.
      await sendPasswordResetEmail(auth, cleanEmail);
      return { success: true, message: 'If this email is registered, a password-reset link has been sent.' };
    } catch {
      // Avoid account enumeration by returning the same user-facing message.
      return { success: true, message: 'If this email is registered, a password-reset link has been sent.' };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const updateProfile = async (district: string, phone: string, language: string) => {
    if (!currentUser) throw new Error('You must be signed in.');
    await update(ref(database, `users/${currentUser.uid}`), {
      district: district.trim(),
      phone: phone.trim(),
      language: language.trim().toLowerCase(),
    });
  };

  const incrementDownloadCount = async () => {
    // Client-side increments are not an enforceable quota. A trusted backend
    // endpoint must perform an atomic, authenticated increment before use.
    throw new Error('Download quota updates must be performed by the secure backend.');
  };

  const unlockPremium = async () => {
    // Never grant paid entitlements from an untrusted client.
    throw new Error('Premium access can only be activated after server-side payment or code verification.');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin: userProfile?.isAdmin === true,
        isPremium: userProfile?.isPremium === true,
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
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
