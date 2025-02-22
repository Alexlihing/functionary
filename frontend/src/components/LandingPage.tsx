import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router-dom for navigation

const CodeAnalysisTool = () => {
  const [directoryName, setDirectoryName] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  const handleDirectorySelection = async () => {
    try {
      // Open the directory picker
      const dirHandle = await (window as any).showDirectoryPicker();
      setDirectoryName(dirHandle.name); // Set the directory name

      // Here, you can send the directory handle to the backend
      console.log("Selected Directory:", dirHandle.name);

      // If backend needs the directory structure, iterate over it
      for await (const entry of dirHandle.values()) {
        console.log(entry.name, entry.kind); // Logs file/folder names inside the selected directory
      }

    } catch (error) {
      console.error("Directory selection failed:", error);
    }
  };

  const handleVisualizeClick = () => {
    navigate('/login'); // Navigate to the login page
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#09080f] to-[#7858d6]">
      {/* Landing Page Section */}
      <section className="py-20">
        <div className="w-full mx-auto text-center" id="123">
          <h1 className="text-5xl font-bold mb-6 text-white">
            Code Visualization Made Simple
          </h1>
          <p className="text-xl text-slate-200 mb-12">
            Understand complex codebases instantly with AI-powered visualization and analysis
          </p>
          
          {/* Visualize Button */}
          <button
            onClick={handleVisualizeClick}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-lg font-semibold"
            id = "visualize-btn"
          >
            Visualize Your Code
          </button>

          <div className="grid md:grid-cols-3 gap-8 mb-16 mt-16 px-4">
            <Card className="bg-white/10 backdrop-blur-md border border-slate-200/20">
              <CardHeader>
                <CardTitle className="text-white">Function Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200">
                  Visualize relationships between functions and trace code flow through your entire codebase
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border border-slate-200/20">
              <CardHeader>
                <CardTitle className="text-white">AI Context</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200">
                  Get intelligent explanations of code functionality powered by advanced language models
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border border-slate-200/20">
              <CardHeader>
                <CardTitle className="text-white">Quick Onboarding</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200">
                  Help new team members understand your codebase structure and patterns rapidly
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CodeAnalysisTool;