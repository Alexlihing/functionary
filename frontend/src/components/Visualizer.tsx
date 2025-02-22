import React from 'react';
import Chatbot from './Chatbot'; // Import the Chatbot component
import './Visualizer.css'; // Import the CSS for this page

const Visualizer = () => {
  const handleSendMessage = async (message: string) => {
    // Replace with your actual backend API call for the chatbot
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
    <div className="visualizer-container">
      {/* Main Content Area */}
      <div className="main-content">
        {/* Placeholder for the main content */}
        <h1>Code Visualizer</h1>
        <p>This is where the main content will go.</p>
      </div>

      {/* Chatbot Panel */}
      <div className="chatbot-panel">
        {/* Pass the handleSendMessage function to the Chatbot component */}
        <Chatbot onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default Visualizer;