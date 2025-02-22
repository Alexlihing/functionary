import { RouterProvider } from "react-router-dom";
import router from "./components/router/routes";  // Assuming your router is set up here
import DirectorySelector from "./components/DirectorySelector";  // Your component
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
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

  return (
    <div className="app-container">
      <Router>
        {/* Handle routing */}
        <Routes>
          {/* Default route redirects to the login page if not authenticated */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
            } 
          />
          
          {/* Login page route */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Home page route, protected by authentication */}
          <Route 
            path="/home" 
            element={
              isAuthenticated ? <LandingPage /> : <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </Router>

      {/* Directory Selector Component
      <div className="directory-selector-container">
        <DirectorySelector />
      </div> */}

      {/* RouterProvider Component */}
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
