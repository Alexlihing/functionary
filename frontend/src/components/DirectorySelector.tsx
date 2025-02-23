import React, { useState } from "react";
import { FolderOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useNavigate } from "react-router-dom";

const DirectorySelector: React.FC = () => {
  const [directoryPath, setDirectoryPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [dirAnalysis, setDirAnalysis] = useState<any>(null);

  const handleDirectorySelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setError("No directory selected or selection was canceled.");
      return;
    }

    setError(null);

    // Convert files into a structured array
    const fileList = Array.from(files).map((file) => ({
      name: file.name,
      path: file.webkitRelativePath,
      size: file.size,
      type: file.type,
      content: null as string | ArrayBuffer | null,
      fileObject: file,
    }));

    let excludedDirs = new Set([".git"]);
    try {
      await Promise.all(
        fileList.map((file) => {
          if (file.name === ".gitignore") {
            return new Promise<void>((resolve, reject) => {
              const fileReader = new FileReader();
              fileReader.onload = (event) => {
                if (event.target?.result) {
                  console.log("Reading .gitignore file:", file.name);
                  excludedDirs = readGitignore(event.target.result as string, excludedDirs);
                  resolve();
                } else {
                  reject(`Error reading .gitignore file: ${file.name}`);
                }
              };
              fileReader.onerror = () => {
                reject(`Error reading .gitignore file: ${file.name}`);
              };
              fileReader.readAsText(file.fileObject);
            });
          }
          return Promise.resolve();
        })
      );

      console.log("Excluded directories:", excludedDirs);

      const filteredFiles = fileList.filter((file) => {
        const excludeCheck = file.path.split("/").some((dir) => excludedDirs.has(dir));
        return !excludeCheck && (file.name.endsWith(".js") || file.name.endsWith(".jsx") || file.name.endsWith(".ts") || file.name.endsWith(".tsx"));
      });

      filteredFiles.forEach((file) => {
        console.log(file.path);
      });

      await Promise.all(
        filteredFiles.map((file) => {
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
            } else {
              resolve(); // No reading needed for non-JS/TS files
            }
          });
        })
      );

      setIsUploading(true);
      const response = await fetch("http://localhost:5001/api/dirAnalysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directory: directoryPath, files: filteredFiles }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error("Failed to analyze directory.");
      }

      console.log("Directory analysis response:", responseData.files);
      setDirAnalysis(responseData.files);
      setDirectoryPath(files[0]?.webkitRelativePath.split("/")[0] || "Unknown Directory");

      console.log("Directory analysis completed!");
    } catch (error) {
      setError("Error analyzing directory: " + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  function readGitignore(content: string, prevExcludedDirs: Set<string>): Set<string>  {
    const lines = content.split("\n");
    const newExcludedDirs = new Set(prevExcludedDirs);
    lines.forEach((line) => {
      let trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        if (trimmedLine.startsWith("/")) {
          trimmedLine = trimmedLine.slice(1).trim();
        }
        console.log("Adding to excluded directories:", trimmedLine);
        newExcludedDirs.add(trimmedLine);
      }
    });
    console.log("Updated excluded directories:", newExcludedDirs);
    return newExcludedDirs;

  };

  const handleGoToVisualizer = () => {
    if (directoryPath) {
      navigate("/visualizer", { state: { files: dirAnalysis } });
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
