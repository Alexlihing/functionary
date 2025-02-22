import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import DirectorySelector from "./components/DirectorySelector"; // Import DirectorySelector if needed
import "./App.css";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ✅ Check authentication status on component mount
  useEffect(() => {
    fetch("http://localhost:5001/api/auth/user", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log("Auth API Response:", data); // Debugging log

        if (data?.user) {
          setIsAuthenticated(true); // ✅ User is authenticated
        } else {
          setIsAuthenticated(false); // ❌ User is not authenticated
        }
      })
      .catch((err) => {
        console.error("❌ Error checking authentication:", err);
        setIsAuthenticated(false); // Assume not authenticated on error
      })
      .finally(() => {
        setIsLoading(false); // ✅ Set loading to false after the check
      });
  }, []);

  // ✅ Show a loading screen until authentication check completes
  if (isLoading) {
    return (
      <div className="loading-screen">
        <h2>Loading...</h2>
      </div>
    ); // Replace with a proper loading spinner if needed
  }

  // ✅ Define routes using createBrowserRouter
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
  ]);

  return (
    <div className="app-container">
      {/* ✅ Use RouterProvider for proper routing */}
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
