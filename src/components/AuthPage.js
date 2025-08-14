import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./AuthPage.css";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const { signup, login, signInWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSignupSuccess(false);

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError("Request timed out. Please try again.");
    }, 30000); // 30 seconds timeout

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        await signup(email, password);
        setSignupSuccess(true);
        // Clear form after successful signup
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    setSignupSuccess(false);

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError("Sign-in timed out. Please try again.");
    }, 30000); // 30 seconds timeout

    try {
      await signInWithGoogle();
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Show success message after signup
  if (signupSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Check Your Email</h1>
            <p>We've sent a verification link to your email address.</p>
          </div>

          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Account Created Successfully!</h2>
            <p>
              Please check your email inbox (and spam folder) for a verification
              link. Click the link to verify your email address and access the
              application.
            </p>
            <div className="verification-steps">
              <h3>Next Steps:</h3>
              <ol>
                <li>Check your email inbox</li>
                <li>Click the verification link</li>
                <li>Return to this page and sign in</li>
              </ol>
            </div>
          </div>

          <button
            onClick={() => {
              setSignupSuccess(false);
              setIsLogin(true);
            }}
            className="auth-button primary"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Beliveau Data</h1>
          <p>Interactive 3D Data Visualization</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`tab ${isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button
            className={`tab ${!isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
              />
            </div>
          )}

          <button
            type="submit"
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="auth-button google"
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              className="link-button"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
