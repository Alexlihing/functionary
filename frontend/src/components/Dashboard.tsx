import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import DirectorySelector from './DirectorySelector';
import Chatbot from './Visualizer'; // Import the Chatbot component
import './Dashboard.css';

const Dashboard = () => {
  const [directorySelected, setDirectorySelected] = useState(false);

  const handleDirectorySelect = () => {
    setDirectorySelected(true);
  };

  const handleSendMessage = async (message: string) => {
    // Replace with your actual backend API call
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch response from chatbot');
    }

    const data = await response.json();
    return data.response;
  };

  return (
    <div className="min-h-screen w-full">
      {/* Dashboard Header */}
      <section className="py-24 w-full bg-clear">
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
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto bg-clear">
          <Card className="border-2 border-transparent bg-clear">
            <CardContent>
              <DirectorySelector onDirectorySelect={handleDirectorySelect} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Chatbot Section */}
      {directorySelected && (
        <section className="py-8 px-4">
          <div className="max-w-3xl mx-auto bg-clear">
            <Card className="border-2 border-transparent bg-clear">
              <CardContent>
                <Chatbot onSendMessage={handleSendMessage} />
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;