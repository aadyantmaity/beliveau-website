import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./EmailVerificationPage.css";

const EmailVerificationPage = () => {
  const { currentUser, sendVerificationEmail, checkEmailVerification, logout } =
    useAuth();
  const [verificationSent, setVerificationSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Check verification status on component mount
  useEffect(() => {
    if (currentUser) {
      setIsVerified(currentUser.emailVerified);
    }
  }, [currentUser]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendVerification = async () => {
    setLoading(true);
    setError("");

    try {
      await sendVerificationEmail();
      setVerificationSent(true);
      setCountdown(60); // 60 second cooldown
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    setError("");

    try {
      const verified = await checkEmailVerification();
      if (verified) {
        setIsVerified(true);
      } else {
        setError(
          "Email not verified yet. Please check your inbox and click the verification link."
        );
      }
    } catch (error) {
      setError("Failed to check verification status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (isVerified) {
    return (
      <div className="email-verification-container">
        <div className="email-verification-card">
          <div className="verification-success">
            <div className="success-icon">✓</div>
            <h2>Email Verified!</h2>
            <p>
              Your email has been successfully verified. You can now access the
              application.
            </p>
            <button
              className="verification-button primary"
              onClick={() => window.location.reload()}
            >
              Continue to App
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="email-verification-container">
      <div className="email-verification-card">
        <div className="verification-header">
          <h1>Email Verification Required</h1>
          <p>Please verify your email address to access the application.</p>
        </div>

        <div className="verification-info">
          <div className="verification-steps">
            <h3>Steps to verify your email:</h3>
            <ol>
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the verification link in the email</li>
              <li>Return to this page and click "Check Verification"</li>
            </ol>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="verification-actions">
          <button
            onClick={handleCheckVerification}
            className="verification-button primary"
            disabled={loading}
          >
            {loading ? "Checking..." : "Check Verification"}
          </button>

          <button
            onClick={handleSendVerification}
            className="verification-button secondary"
            disabled={loading || countdown > 0}
          >
            {countdown > 0
              ? `Resend in ${countdown}s`
              : loading
              ? "Sending..."
              : "Resend Verification Email"}
          </button>

          <button
            onClick={handleSignOut}
            className="verification-button signout"
            disabled={loading}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
