import React, { useState } from 'react';
import Chatbot from './Chatbot'; // Correct import for the Chatbot component
import './Visualizer.css'; // Import the CSS for this page

const Visualizer = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = async (message: string) => {
    // TODO: Replace with actual backend API call for the chatbot
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

  const handleSearch = async () => {
    // TODO: Replace with actual backend API call for the search function
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: searchQuery }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }

    const data = await response.json();
    console.log(data); // Handle search results as needed
  };

  return (
    <div className="visualizer-container">
      {/* Main Content Area */}
      <div className="main-content">
        {/* Placeholder for the main content */}
        <h1>Insert Code Visualizer Here Somehow</h1>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        {/* Search Panel */}
        <div className="search-panel">
          <h3>Search Function</h3>
          <div className="search-input">
            <input
              type="text"
              placeholder="Enter search query..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
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
    </div>
  );
};

export default Visualizer;