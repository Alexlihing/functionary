import React, { useState } from "react";
import Chatbot from "./Chatbot"; // Correct import for the Chatbot component
import "./Visualizer.css"; // Import the CSS for this page
import FunctionMap from "./functionMap";

const Visualizer = () => {

  const handleSendMessage = async (message: string) => {
    try {
      const response = await fetch(
        "http://localhost:5001/RAGservice/GenExplain",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: message }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch response from chatbot");
      }

      const data = await response.json();
      console.log("Raw API Response:", data);

      // Extract the actual JSON from "completion" string
      if (data.completion) {
        const match = data.completion.match(/```json\n([\s\S]*?)\n```/);
        if (match) {
          const extractedJson = JSON.parse(match[1]); // Convert to valid JSON
          console.log("Parsed JSON:", extractedJson);
          return extractedJson;
        }
      }

      throw new Error("Invalid response format");
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      return {
        summary: "Error",
        detailedExplanation: "Failed to fetch data.",
        codeSnippets: [],
      };
    }
  };


  return (
    <div className="visualizer-container">
      {/* Main Content Area */}
      <div className="main-content">
        {/* Placeholder for the main content */}
        <FunctionMap />
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        

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
