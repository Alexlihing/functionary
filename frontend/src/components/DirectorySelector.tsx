import React, { useState } from "react";
import { FolderOpen } from "lucide-react"; // Icon for clarity
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import { dirAnalysis } from "./dirAnalysis"; // Import dirAnalysis

const DirectorySelector: React.FC = () => {
  const [directoryPath, setDirectoryPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const navigate = useNavigate();

  const handleDirectorySelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setError("No directory selected or selection was canceled.");
      return;
    }

    setSelectedFiles(files);
    setDirectoryPath(files[0]?.webkitRelativePath.split("/")[0] || "Unknown Directory");
    setError(null);

    // Call dirAnalysis function
    dirAnalysis(Array.from(files));
  };

  const handleGoToVisualizer = () => {
    if (directoryPath) {
      navigate("/visualizer");
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
          <input
            type="file"
            webkitdirectory="true"
            multiple
            onChange={handleDirectorySelect}
            className="hidden"
            id="directoryInput"
          />
          <label
            htmlFor="directoryInput"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer mb-4"
          >
            Select Directory
          </label>

          {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}

          {directoryPath && (
            <p className="mt-4 text-sm text-gray-700 text-center">
              <strong>Selected Directory:</strong> {directoryPath}
            </p>
          )}

          {/* Button to navigate to the Visualizer page */}
          <button
            onClick={handleGoToVisualizer}
            disabled={!directoryPath}
            className={`px-6 py-3 ${
              directoryPath ? "bg-green-600 hover:bg-green-700 cursor-pointer" : "bg-gray-400 cursor-not-allowed"
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
