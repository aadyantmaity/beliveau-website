import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  sendEmailVerification,
  reload,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import LoadingSpinner from "../components/LoadingSpinner";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  // Send email verification
  async function sendVerificationEmail() {
    try {
      if (currentUser && !currentUser.emailVerified) {
        await sendEmailVerification(currentUser);
        setEmailVerificationSent(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Failed to send verification email. Please try again.");
    }
  }

  // Check if user's email is verified
  async function checkEmailVerification() {
    try {
      if (currentUser) {
        await reload(currentUser);
        return currentUser.emailVerified;
      }
      return false;
    } catch (error) {
      console.error("Error checking email verification:", error);
      return false;
    }
  }

  // Sign up with email and password
  async function signup(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Send verification email immediately after signup
      await sendEmailVerification(user);
      setEmailVerificationSent(true);

      // Add user to Firestore users collection
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        uid: user.uid,
        createdAt: new Date().toISOString(),
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        lastLoginAt: new Date().toISOString(),
        authProvider: "email",
        isActive: true,
        emailVerified: false,
        updatedAt: new Date().toISOString(),
      });

      return user;
    } catch (error) {
      // Handle specific Firebase auth errors
      if (error.code === "auth/email-already-in-use") {
        throw new Error(
          "An account with this email already exists. Please sign in instead."
        );
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        throw new Error(
          "Password is too weak. Please choose a stronger password."
        );
      } else if (error.code === "auth/network-request-failed") {
        throw new Error(
          "Network error. Please check your connection and try again."
        );
      } else {
        console.error("Signup error:", error);
        throw new Error("Sign-up failed. Please try again.");
      }
    }
  }

  // Sign in with email and password
  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if email is verified for email/password users
      if (
        user.providerData[0].providerId === "password" &&
        !user.emailVerified
      ) {
        // Send verification email if not already sent
        if (!emailVerificationSent) {
          await sendEmailVerification(user);
          setEmailVerificationSent(true);
        }
      }

      return userCredential;
    } catch (error) {
      // Handle specific Firebase auth errors
      if (error.code === "auth/user-not-found") {
        throw new Error(
          "No account found with this email. Please sign up instead."
        );
      } else if (error.code === "auth/wrong-password") {
        throw new Error("Incorrect password. Please try again.");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Please enter a valid email address.");
      } else if (error.code === "auth/too-many-requests") {
        throw new Error("Too many failed attempts. Please try again later.");
      } else if (error.code === "auth/network-request-failed") {
        throw new Error(
          "Network error. Please check your connection and try again."
        );
      } else {
        console.error("Login error:", error);
        throw new Error("Sign-in failed. Please try again.");
      }
    }
  }

  // Sign in with Google using redirect
  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      // Add custom parameters for better UX
      provider.setCustomParameters({
        prompt: "select_account",
      });

      // Use redirect instead of popup
      await signInWithRedirect(auth, provider);
      // Note: The page will redirect to Google, so we don't return anything here
    } catch (error) {
      // Handle specific Firebase auth errors
      if (error.code === "auth/redirect-cancelled-by-user") {
        throw new Error("Sign-in was cancelled. Please try again.");
      } else if (error.code === "auth/redirect-operation-pending") {
        throw new Error("Sign-in is already in progress. Please wait.");
      } else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        throw new Error(
          "An account already exists with this email using a different sign-in method."
        );
      } else if (error.code === "auth/network-request-failed") {
        throw new Error(
          "Network error. Please check your connection and try again."
        );
      } else {
        // For other errors, provide a generic message
        console.error("Google sign-in error:", error);
        throw new Error("Sign-in failed. Please try again.");
      }
    }
  }

  // Sign out
  function logout() {
    setEmailVerificationSent(false);
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    signInWithGoogle,
    logout,
    sendVerificationEmail,
    checkEmailVerification,
    emailVerificationSent,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingSpinner /> : children}
    </AuthContext.Provider>
  );
}
