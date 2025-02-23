import React, { useState } from 'react';

interface ChatbotProps {
  onSendMessage: (message: string) => Promise<string>; // Define the prop type
}

const Chatbot: React.FC<ChatbotProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (message.trim() === '') return;

    setIsLoading(true);
    try {
      const botResponse = await onSendMessage(message);
      setResponse(botResponse);
    } catch (error) {
      console.error('Error sending message:', error);
      setResponse('Failed to get a response from the chatbot.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      

      {/* Chatbot Messages */}
      <div className="chatbot-messages">
        {response && <div className="chatbot-response">{response}</div>}
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
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;