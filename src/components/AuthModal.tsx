// src/components/AuthModal.tsx
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function AuthModal() {
  const { signUp, signIn, error, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (isSignUp) {
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-xl w-96">
      <h2 className="text-xl font-semibold mb-4">
        {isSignUp ? "Sign Up" : "Sign In"}
      </h2>

      <input
        type="email"
        placeholder="Email"
        className="w-full mb-2 p-2 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full mb-2 p-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {!isSignUp && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <strong>New user?</strong> Click "Sign Up" below to create an account first.
        </div>
      )}

      <button
        onClick={handleAuth}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Loading..." : isSignUp ? "Create Account" : "Login"}
      </button>

      <p className="mt-3 text-sm text-gray-600 text-center">
        {isSignUp ? "Already have an account?" : "Don’t have an account?"}{" "}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-blue-500 hover:underline"
        >
          {isSignUp ? "Login" : "Sign Up"}
        </button>
      </p>
    </div>
  );
}
