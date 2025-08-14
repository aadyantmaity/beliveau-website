import React, { useState, useEffect } from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthPage from "./components/AuthPage";
import EmailVerificationPage from "./components/EmailVerificationPage";
import CSV3DVisualizer from "./components/CSV3DVisualizerRefactored";
import UserProfile from "./components/UserProfile";

function AppContent() {
  const { currentUser, checkEmailVerification } = useAuth();
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [, setCheckingVerification] = useState(true);

  // Check email verification status when user changes
  useEffect(() => {
    const checkVerification = async () => {
      if (currentUser) {
        setCheckingVerification(true);
        try {
          // For Google users, email is automatically verified
          if (currentUser.providerData[0]?.providerId === "google") {
            setIsEmailVerified(true);
          } else {
            // For email/password users, check verification status
            const verified = await checkEmailVerification();
            setIsEmailVerified(verified);
          }
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
              <h1>Beliveau Data Visualizer</h1>
              <UserProfile />
            </div>
          </header>
          <main className="app-main">
            <CSV3DVisualizer />
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
