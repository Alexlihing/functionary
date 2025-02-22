import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import DirectorySelector from './DirectorySelector'; // Import the DirectorySelector component
import './Dashboard.css';

const Dashboard = () => {
  console.log("Dashboard Component Loaded"); // Debugging log

  return (
    <div className="min-h-screen w-full ">
      {/* Dashboard Header */}
      <section className="py-24 w-full bg-clear ">
        <div className="w-full text-center">
          <h1 className="text-4xl font-bold mb-4 text-slate-50">
            Welcome to Your Dashboard
          </h1>
          <p className="text-lg text-slate-50">
            Start analyzing your codebase by selecting a project directory.
          </p>
        </div>
      </section>

      {/* Directory Selection Section */}
      <section className="py-8 px-4 ">
        <div className="max-w-3xl mx-auto bg-clear">
          <Card className="border-2 border-transparent bg-clear">
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