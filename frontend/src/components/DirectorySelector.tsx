import React, { useState } from "react";
import { FolderOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useNavigate } from "react-router-dom";

const DirectorySelector: React.FC = () => {
  const excludedDirs = new Set([".git"]);
  const [directoryPath, setDirectoryPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleDirectorySelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setError("No directory selected or selection was canceled.");
      return;
    }

    setError(null);
    setDirectoryPath(files[0]?.webkitRelativePath.split("/")[0] || "Unknown Directory");

    // Convert files into a structured array
    const fileList = Array.from(files).map((file) => ({
      name: file.name,
      path: file.webkitRelativePath,
      size: file.size,
      type: file.type,
      content: null as string | ArrayBuffer | null,
      fileObject: file,
    }));

    try {
      await Promise.all(
        fileList.map((file) => {
          return new Promise<void>((resolve, reject) => {
            if (file.name.endsWith(".js") || file.name.endsWith(".jsx") || file.name.endsWith(".ts") || file.name.endsWith(".tsx") || file.name === ".gitignore") {
              const fileReader = new FileReader();

              fileReader.onload = (event) => {
                if (event.target?.result) {
                  file.content = event.target.result;
                  resolve();
                } else {
                  reject(`Error reading file: ${file.name}`);
                }
              };

              fileReader.onerror = () => {
                reject(`Error reading file: ${file.name}`);
              };

              fileReader.readAsText(file.fileObject);

              if (file.name === ".gitignore") {
                fileReader.onload = (event) => {
                  if (event.target?.result) {
                    readGitignore(event.target.result as string);
                  }
                };
              }
            } else {
              resolve(); // No reading needed for non-JS/TS files
            }
          });
        })
      );

      fileList.forEach((file) => {
        console.log("Content of file:", file.name, file.content);
        const directoryName = file.path.split("/")[0];
        if (excludedDirs.has(directoryName) || !(file.name.endsWith(".js") || file.name.endsWith(".jsx") || file.name.endsWith(".ts") || file.name.endsWith(".tsx"))) {
          fileList.splice(fileList.indexOf(file), 1);
        }
      });

      setIsUploading(true);
      const response = await fetch("http://localhost:5001/api/dirAnalysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directory: directoryPath, files: fileList }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze directory.");
      }

      console.log("Directory analysis completed!");
    } catch (error) {
      setError("Error analyzing directory: " + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const readGitignore = (content: string) => {
    const lines = content.split("\n");

    lines.forEach((line) => {
      let trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        if (trimmedLine.startsWith("/")) {
          trimmedLine = trimmedLine.slice(1).trim();
        }
        if (!excludedDirs.has(trimmedLine)) {
          excludedDirs.add(trimmedLine);
        }
      }
    });
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
            {isUploading ? "Analyzing..." : "Select Directory"}
          </label>

          {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}

          {directoryPath && (
            <p className="mt-4 text-sm text-gray-700 text-center">
              <strong>Selected Directory:</strong> {directoryPath}
            </p>
          )}

          <button
            onClick={handleGoToVisualizer}
            disabled={!directoryPath}
            className={`px-6 py-3 ${directoryPath ? "bg-green-600 hover:bg-green-700 cursor-pointer" : "bg-gray-400 cursor-not-allowed"
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
