import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

interface User {
  id: string;
  name: string;
  email: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/user", { credentials: "include" })
      .then((res) => res.json())
      .then((data: { user?: User }) => {
        if (data?.user) {
          setUser(data.user);
          navigate("/"); // Redirect to homepage if logged in
        }
      })
      .catch((err) => console.error(err));
  }, [navigate]);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5001/api/auth/google"; // Redirect to backend auth route
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="card-header">
          <h2 className="card-title">Welcome back</h2>
          <p className="card-description">Sign in with Google to continue</p>
        </div>
        <div className="card-content">
          <button className="google-signin-btn" onClick={handleGoogleLogin}>
            <svg
              className="google-icon"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
