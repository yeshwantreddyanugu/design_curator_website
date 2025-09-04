import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
  signOut
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoJb3hnUHHix_SwIeCz3KrYfC2KZWseIM",
  authDomain: "patternbank-82fce.firebaseapp.com",
  projectId: "patternbank-82fce",
  storageBucket: "patternbank-82fce.appspot.com",
  messagingSenderId: "709257770641",
  appId: "1:709257770641:web:3e8c2741defa2856653130",
  measurementId: "G-6BSHZFK0JE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export interface User {
  id?: number;
  uid: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert Firebase user to our User type
const firebaseUserToAppUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email || '',
  name: firebaseUser.displayName || '',
  role: 'USER',
  // Add any additional fields you want to store
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check for existing session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('patternbank_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('patternbank_user');
      }
    }

    // Firebase auth state listener
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const appUser = firebaseUserToAppUser(firebaseUser);
        setUser(appUser);
        localStorage.setItem('patternbank_user', JSON.stringify(appUser));
      } else {
        setUser(null);
        localStorage.removeItem('patternbank_user');
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Firebase email/password login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const appUser = firebaseUserToAppUser(userCredential.user);
      
      // Try to fetch additional user data from backend
      try {
        const response = await fetch(`https://az.lytortech.com/api/users/${appUser.uid}`, {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });

        if (response.ok) {
          const backendUser = await response.json();
          const mergedUser = { ...appUser, ...backendUser };
          setUser(mergedUser);
          localStorage.setItem('patternbank_user', JSON.stringify(mergedUser));
          toast({
            title: "Login successful",
            description: `Welcome back, ${mergedUser.name}!`,
          });
          return true;
        }
      } catch (error) {
        console.warn('Backend unavailable, using Firebase data:', error);
      }

      // Fallback to just Firebase data
      setUser(appUser);
      localStorage.setItem('patternbank_user', JSON.stringify(appUser));
      toast({
        title: "Login successful",
        description: `Welcome back, ${appUser.name}!`,
      });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "Invalid credentials or server error.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Firebase email/password signup
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase profile with display name
      await updateFirebaseProfile(userCredential.user, { displayName: name });
      
      const appUser = firebaseUserToAppUser(userCredential.user);
      
      // Try to create user in backend
      try {
        const response = await fetch('https://az.lytortech.com/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(appUser),
        });

        if (response.ok) {
          const backendUser = await response.json();
          const mergedUser = { ...appUser, ...backendUser };
          setUser(mergedUser);
          localStorage.setItem('patternbank_user', JSON.stringify(mergedUser));
          toast({
            title: "Account created",
            description: `Welcome to PatternBank, ${mergedUser.name}!`,
          });
          return true;
        } else if (response.status === 400) {
          toast({
            title: "Signup failed",
            description: "User with this email already exists.",
            variant: "destructive",
          });
          return false;
        }
      } catch (error) {
        console.warn('Backend unavailable, using Firebase data:', error);
      }

      // Fallback to just Firebase data
      setUser(appUser);
      localStorage.setItem('patternbank_user', JSON.stringify(appUser));
      toast({
        title: "Account created",
        description: `Welcome to PatternBank, ${appUser.name}!`,
      });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const appUser = firebaseUserToAppUser(result.user);
      
      // Try to fetch or create user in backend
      try {
        // First try to get existing user
        const response = await fetch(`https://az.lytortech.com/api/users/${appUser.uid}`, {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });

        if (response.ok) {
          const backendUser = await response.json();
          const mergedUser = { ...appUser, ...backendUser };
          setUser(mergedUser);
          localStorage.setItem('patternbank_user', JSON.stringify(mergedUser));
          toast({
            title: "Login successful",
            description: `Welcome back, ${mergedUser.name}!`,
          });
          return true;
        } else {
          // If user doesn't exist, create them
          const createResponse = await fetch('https://az.lytortech.com/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            },
            body: JSON.stringify(appUser),
          });

          if (createResponse.ok) {
            const backendUser = await createResponse.json();
            const mergedUser = { ...appUser, ...backendUser };
            setUser(mergedUser);
            localStorage.setItem('patternbank_user', JSON.stringify(mergedUser));
            toast({
              title: "Account created",
              description: `Welcome to PatternBank, ${mergedUser.name}!`,
            });
            return true;
          }
        }
      } catch (error) {
        console.warn('Backend unavailable, using Firebase data:', error);
      }

      // Fallback to just Firebase data
      setUser(appUser);
      localStorage.setItem('patternbank_user', JSON.stringify(appUser));
      toast({
        title: "Login successful",
        description: `Welcome ${appUser.name}!`,
      });
      return true;
    } catch (error) {
      console.error('Google sign in error:', error);
      toast({
        title: "Login failed",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      const updatedUser = { ...user, ...userData };
      
      // Try to update in backend
      try {
        const response = await fetch(`https://az.lytortech.com/api/users/${user.uid}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(updatedUser),
        });

        if (response.ok) {
          const backendUser = await response.json();
          setUser(backendUser);
          localStorage.setItem('patternbank_user', JSON.stringify(backendUser));
          toast({
            title: "Profile updated",
            description: "Your profile has been updated successfully.",
          });
          return true;
        }
      } catch (error) {
        console.warn('Backend unavailable, updating locally:', error);
      }

      // Fallback to local update
      setUser(updatedUser);
      localStorage.setItem('patternbank_user', JSON.stringify(updatedUser));
      toast({
        title: "Profile updated",
        description: "Your profile has been updated.",
      });
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('patternbank_user');
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        signInWithGoogle,
        logout,
        isLoading,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};