import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthPage from "./components/AuthPage";
import EmailVerificationPage from "./components/EmailVerificationPage";
import TabSystem from "./components/TabSystem";
import HeaderTabNavigation from "./components/HeaderTabNavigation";
import UserProfile from "./components/UserProfile";
import LoadingSpinner from "./components/LoadingSpinner";

function AppContent() {
  const { currentUser, checkEmailVerification } = useAuth();
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(true);

  // Check email verification status when user changes
  useEffect(() => {
    const checkVerification = async () => {
      if (currentUser) {
        setCheckingVerification(true);
        try {
          // For Google users, email is automatically verified
          if (currentUser.providerData[0]?.providerId === "google") {
            setIsEmailVerified(true);
            setCheckingVerification(false);
            return;
          }

          // For email/password users, check verification status
          const verified = await checkEmailVerification();
          setIsEmailVerified(verified);
        } catch (error) {
          console.error("Error checking email verification:", error);
          setIsEmailVerified(false);
        } finally {
          setCheckingVerification(false);
        }
      } else {
        setIsEmailVerified(false);
        setCheckingVerification(false);
      }
    };

    checkVerification();
  }, [currentUser, checkEmailVerification]);

  // Show loading spinner while checking verification status
  if (currentUser && checkingVerification) {
    return <LoadingSpinner />;
  }

  // Show email verification page for unverified users
  if (currentUser && !isEmailVerified) {
    return <EmailVerificationPage />;
  }

  return (
    <div className="App">
      {currentUser ? (
        <>
          <header className="app-header">
            <div className="header-content">
              <HeaderTabNavigation />
              <UserProfile />
            </div>
          </header>
          <main className="app-main">
            <TabSystem />
          </main>
        </>
      ) : (
        <AuthPage />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
