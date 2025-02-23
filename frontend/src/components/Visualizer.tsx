import React from 'react';
import Chatbot from './Chatbot'; // Correct import for the Chatbot component
import './Visualizer.css'; // Import the CSS for this page

const Visualizer = () => {
  const handleSendMessage = async (message: string) => {





    //TODO: Replace with actual backend API call for the chatbot************



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
        <h1>Insert Code Visualizer Here Somehow</h1>
      </div>

      {/* Chatbot Panel */}
      <div className="chatbot-panel">
        {/* Header/Title */}
        <div className="chatbot-header">
            <h2>FunctionaryAI</h2>
        </div>
  
        {/* Pass the handleSendMessage function to the Chatbot component */}
        <Chatbot onSendMessage={handleSendMessage} />
      </div>
      
    </div>
  );
};

export default Visualizer;