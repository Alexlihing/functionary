import React from 'react';
import { Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const CodeAnalysisTool = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Landing Page Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 text-slate-900">
            Code Visualization Made Simple
          </h1>
          <p className="text-xl text-slate-600 mb-12">
            Understand complex codebases instantly with AI-powered visualization and analysis
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardHeader>
                <CardTitle>Function Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Visualize relationships between functions and trace code flow through your entire codebase
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Context</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Get intelligent explanations of code functionality powered by advanced language models
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Onboarding</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Help new team members understand your codebase structure and patterns rapidly
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-dashed border-slate-300">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Upload Your Codebase</CardTitle>
              <CardDescription className="text-center">
                Drag and drop your project files or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-lg">
                <Upload className="w-16 h-16 text-slate-400 mb-4" />
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  directory=""
                  webkitdirectory=""
                />
                <label
                  htmlFor="file-upload"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Select Files
                </label>
                <p className="mt-4 text-sm text-slate-500">
                  Supported formats: .js, .jsx, .ts, .tsx, .py, .java
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default CodeAnalysisTool;