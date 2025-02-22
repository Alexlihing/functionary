import React, { useState } from "react";
import { FolderOpen } from "lucide-react"; // Icon for clarity
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const DirectorySelector: React.FC = () => {
  const [directoryPath, setDirectoryPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSelectDirectory = async () => {
    try {
      // Call the backend to open the OS-native folder picker
      const response = await fetch("http://localhost:5001/api/select-directory", {
        method: "GET",
        credentials: "include", // Ensure session cookies are sent
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.path) {
        throw new Error("No directory selected or selection was canceled.");
      }

      console.log("📂 Full Path Received from Backend:", data.path);
      setDirectoryPath(data.path);
      setError(null);
    } catch (error: any) {
      console.error("❌ Error selecting directory:", error);
      setError(error.message || "Failed to select directory. Please try again.");
    }
  };

  const handleGoToVisualizer = () => {
    if (directoryPath) {
      navigate("/visualizer"); // Navigate to the Visualizer page
    } else {
      setError("Please select a directory first.");
    }
  };

  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Select Your Project Directory</CardTitle>
        <CardDescription className="text-center">
          Choose the root folder of your project to analyze its structure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
          <FolderOpen className="w-12 h-12 text-gray-400 mb-4" />
          <button
            onClick={handleSelectDirectory}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer mb-4"
          >
            Select Directory
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
          )}

          {directoryPath && (
            <p className="mt-4 text-sm text-gray-700 text-center">
              <strong>Full Path:</strong> {directoryPath}
            </p>
          )}

          {/* Button to navigate to the Visualizer page */}
          <button
            onClick={handleGoToVisualizer}
            disabled={!directoryPath} // Disable if no directory is selected
            className={`px-6 py-3 ${
              directoryPath
                ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed"
            } text-white rounded-lg mt-4`}
          >
            Go to Visualizer
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DirectorySelector;