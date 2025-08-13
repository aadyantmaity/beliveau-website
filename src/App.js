import React from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthPage from "./components/AuthPage";
import CSV3DVisualizer from "./components/CSV3DVisualizer";
import UserProfile from "./components/UserProfile";

function AppContent() {
  const { currentUser } = useAuth();

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
