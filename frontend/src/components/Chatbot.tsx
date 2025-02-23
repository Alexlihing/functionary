import React, { useState } from "react";

interface ChatbotProps {
  onSendMessage: (message: string) => Promise<string>;
}

interface ChatResponse {
  summary: string;
  detailedExplanation: string;
  codeSnippets: { description: string; snippet: string }[];
}

const Chatbot: React.FC<ChatbotProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    setIsLoading(true);
    try {
      const botResponse = await onSendMessage(message);
      console.log("Raw Bot Response:", botResponse);

      // Parse JSON response safely
      const parsedResponse = botResponse;
      setResponse(parsedResponse);
    } catch (error) {
      console.error("Error parsing response:", error);
      setResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chatbot Messages */}
      <div className="chatbot-messages">
        {response && (
          <div className="chatbot-response">
            <h3>Summary</h3>
            <p>{response.summary}</p>

            <h3>Detailed Explanation</h3>
            <p>{response.detailedExplanation}</p>

            {response.codeSnippets.length > 0 && (
              <div>
                <h3>Code Snippets</h3>
                {response.codeSnippets.map((snippet, index) => (
                  <div key={index} className="code-snippet">
                    <p>
                      <strong>{snippet.description}</strong>
                    </p>
                    <pre>
                      <code>{snippet.snippet}</code>
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chatbot Input */}
      <div className="chatbot-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything about your code..."
          disabled={isLoading}
        />
        <button onClick={handleSendMessage} disabled={isLoading}>
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
