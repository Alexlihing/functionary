import React, { useState } from "react";
import { Upload } from "lucide-react"; // Assuming you use this icon
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"; // Assuming you use ShadCN UI

const DirectorySelector: React.FC = () => {
  const [directoryPath, setDirectoryPath] = useState<string | null>(null);

  const handleSelectDirectory = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/select-directory");
      const data: { path?: string } = await response.json();

      console.log("📂 Full Path Received from Backend:", data.path); // ✅ Debugging output

      if (data.path) {
        setDirectoryPath(data.path); // ✅ Display full absolute path in UI
      } else {
        alert("No directory selected.");
      }
    } catch (error) {
      console.error("❌ Error selecting directory:", error);
    }
  };

  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Select Your Project Directory</CardTitle>
        <CardDescription className="text-center">
          Choose the root folder of your project to analyze its structure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <button
            onClick={handleSelectDirectory}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Select Directory
          </button>

          {directoryPath && (
            <p className="mt-4 text-sm text-gray-700 text-center">
              <strong>Selected Path:</strong> {directoryPath}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DirectorySelector;
