import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import DirectorySelector from './DirectorySelector'; // Import the DirectorySelector component
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Dashboard Header */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 text-slate-900">
            Welcome to Your Dashboard
          </h1>
          <p className="text-lg text-slate-600">
            Start analyzing your codebase by selecting a project directory.
          </p>
        </div>
      </section>

      {/* Directory Selection Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-dashed border-slate-300">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Select Your Project Directory</CardTitle>
              <CardDescription className="text-center">
                Choose the root folder of your project to analyze its structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Use the DirectorySelector component here */}
              <DirectorySelector />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;