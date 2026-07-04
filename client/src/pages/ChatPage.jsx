import React from 'react';

const ChatPage = () => {
  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
      <h1 className="text-3xl font-display font-bold text-police-cyan mb-2">Intelligent Investigation Assistant</h1>
      <p className="text-gray-400 mb-6">Ask conversational questions about criminal files, assets, and connections in English or Kannada.</p>
      
      <div className="flex-1 glass-panel rounded-lg p-6 border border-police-accent/30 flex flex-col justify-between">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          <div className="flex justify-start">
            <div className="bg-police-blue p-4 rounded-lg max-w-lg text-sm">
              <p className="font-semibold text-police-cyan mb-1">KSP AI Assistant</p>
              Greeting, Officer. How can I assist you with your case records today?
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <input 
            type="text" 
            placeholder="Type your query (e.g. Find matching suspects for burglary in Mysuru)..." 
            className="flex-1 bg-police-navy border border-police-accent/50 rounded px-4 py-2 text-sm focus:outline-none focus:border-police-cyan"
            disabled
          />
          <button className="bg-police-cyan text-police-dark font-semibold px-6 py-2 rounded text-sm cursor-not-allowed opacity-50" disabled>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
