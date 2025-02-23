import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import Visualizer from "./components/Visualizer"; // Import the Visualizer page
import "./App.css";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("http://localhost:5001/api/auth/user", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log("Auth API Response:", data);
        if (data?.user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch((err) => {
        console.error("❌ Error checking authentication:", err);
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <h2>Loading...</h2>
      </div>
    );
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <LandingPage />,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/dashboard",
      element: isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />,
    },
    {
      path: "/visualizer",
      element: <Visualizer />,
      errorElement: <div>Something went wrong. Please try again.</div>, // Add error handling
    },
  ]);

  return (
    <div className="app-container">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;