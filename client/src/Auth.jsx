import { useState } from "react";
import { supabase } from "./supabaseClient";

function Auth({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else onLogin(data.user);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else onLogin(data.user);
    }
  };

  return (
    <div className="app-shell">
      <div className="auth-shell stagger">
        <span className="wordmark">Expense Tracker</span>
        <h1 className="auth-title">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>
        <p className="auth-sub">
          {isSignUp
            ? "Track spending and split bills with ease."
            : "Log in to track your spending and settle up with groups."}
        </p>
        <div className="card-soft auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="email"
              placeholder="Email"
              className="text-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="text-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="btn btn-primary auth-submit">
              {isSignUp ? "Sign up" : "Log in"}
            </button>
          </form>
        </div>
        <p className="auth-toggle">
          {isSignUp ? "Already have an account?" : "New to Expense Tracker?"}{" "}
          <button
            type="button"
            className="link-btn"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Log in" : "Create an account"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;
