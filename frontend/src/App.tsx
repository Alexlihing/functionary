import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard"; // Assuming you have a Dashboard component
import DirectorySelector from "./components/DirectorySelector"; // Your component
import './App.css';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check authentication status on component mount
  useEffect(() => {
    fetch("http://localhost:5001/api/auth/google", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setIsAuthenticated(true); // User is authenticated
        } else {
          setIsAuthenticated(false); // User is not authenticated
        }
      })
      .catch((err) => {
        console.error("Error checking authentication:", err);
        setIsAuthenticated(false); // Assume not authenticated on error
      })
      .finally(() => {
        setIsLoading(false); // Set loading to false after the check
      });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Replace with a proper loading spinner
  }

  // Define your routes using createBrowserRouter
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LandingPage />, // Always show the landing page first
    },
    {
      path: "/login",
      element: <LoginPage />, // Login page
    },
    {
      path: "/dashboard",
      element: isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />, // Protected route
    },
  ]);

  return (
    <div className="app-container">
      {/* Use RouterProvider for routing */}
      <RouterProvider router={router} />
    </div>
  );
};

export default App;