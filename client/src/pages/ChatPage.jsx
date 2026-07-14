import React, { useState, useEffect, useRef } from 'react';
import ChatSidebar from '../components/chat/ChatSidebar.jsx';
import ChatHeader from '../components/chat/ChatHeader.jsx';
import EmptyConversation from '../components/chat/EmptyConversation.jsx';
import MessageBubble from '../components/chat/MessageBubble.jsx';
import ChatInput from '../components/chat/ChatInput.jsx';
import TypingIndicator from '../components/chat/TypingIndicator.jsx';
import { PageContainer } from '../components/LayoutComponents.jsx';
import { useUI } from '../context/UIContext.jsx';
import { downloadChatPDF } from '../utils/pdfGenerator.js';

const ChatPage = () => {
  const { addNotification } = useUI();
  const messagesEndRef = useRef(null);

  // Initialize with a default dossier search thread to populate history
  const [conversations, setConversations] = useState([
    {
      id: 'thread-burglary',
      title: 'Burglary Investigation Vidyaranyapuram',
      messages: [
        {
          id: 'msg-1',
          sender: 'assistant',
          text: 'Initialized Burglary Investigation Vidyaranyapuram thread. Ask regarding suspects "Scorpio Shekhar", "Ramesh B", or shared coordinate logs.',
          timestamp: '11:15'
        }
      ]
    },
    {
      id: 'thread-cyber',
      title: 'Telegram Job Fraud Audit',
      messages: [
        {
          id: 'msg-2',
          sender: 'assistant',
          text: 'Initialized Telegram Job Fraud Audit thread. Analyzing 54 registered cyber crime cases across Bengaluru divisions.',
          timestamp: '10:04'
        }
      ]
    }
  ]);

  const [activeConversationId, setActiveConversationId] = useState('thread-burglary');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Auto-scroll to bottom of chat when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, loading]);

  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
  };

  const handleNewConversation = () => {
    const newId = 'thread-' + Date.now();
    const newTitle = `New Investigation #${conversations.length + 1}`;
    const newConv = {
      id: newId,
      title: newTitle,
      messages: []
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    addNotification('info', 'New conversation thread initialized.');
  };

  const handleDeleteConversation = (id) => {
    setConversations((prev) => prev.filter(c => c.id !== id));
    addNotification('warning', 'Conversation thread removed.');
    
    // Redirect active conversation if deleted
    if (activeConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        setActiveConversationId(null);
      }
    }
  };

  const handleRenameConversation = (id, newTitle) => {
    setConversations((prev) =>
      prev.map(c => (c.id === id ? { ...c, title: newTitle } : c))
    );
    addNotification('success', 'Conversation thread renamed.');
  };

  const handleClearAll = () => {
    setConversations([]);
    setActiveConversationId(null);
    addNotification('warning', 'All conversations wiped from archive.');
  };

  const handleSend = (textToSend) => {
    const text = textToSend || inputValue;
    if (!text || !text.trim() || !activeConversationId) return;

    const userMsg = {
      id: 'msg-user-' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update conversation messages list
    setConversations((prev) =>
      prev.map(c =>
        c.id === activeConversationId
          ? { ...c, messages: [...c.messages, userMsg] }
          : c
      )
    );

    setInputValue('');
    setLoading(true);

    const query = text.toLowerCase();

    // Simulated local answers matching suggested crime topics
    setTimeout(() => {
      let botResponse = "I scanned the crime databases but could not resolve this exact query. Try asking 'Show robbery cases in Bengaluru', 'Find repeat offenders', or 'Show cyber crimes in Mysuru'.";

      if (query.includes('robbery') || query.includes('bengaluru')) {
        botResponse = `Database Query: **Robbery Cases in Bengaluru**

Found **36 Cases** matching BNS Section 309 (Robbery) in Bengaluru division:
- **Primary Zones:** Indiranagar, Halasuru, Whitefield.
- **Modus Operandi:** Unlocked houses targeted between 13:00 - 15:30.
- **Associated Assets:** Traced Mahindra Scorpio plate **KA-09-MA-1234** at coordinate boundary overlaps.
- **Suspects Mapped:** KGS Gang (Shekhar, Ramesh B, Suresh Gowda).`;
      } else if (query.includes('offenders') || query.includes('repeat')) {
        botResponse = `Database Query: **Repeat Offenders tracked**

Found **79 Repeat Offenders** active in Karnataka State:
1. **Scorpio Shekhar (KGS Gang)**: 3 convictions, active burglary risk, absconding.
2. **Ramesh B (KGS Gang)**: Burglary transit, in custody.
3. **Suresh Gowda (KGS Gang)**: Lock entry expert, in custody.
4. **Ananya Hegde (MSM Gang)**: Cyber fraud operator, under surveillance.`;
      } else if (query.includes('cyber') || query.includes('mysuru')) {
        botResponse = `Database Query: **Cyber Crimes in Mysuru**

Found **18 Cases** matching cyber job scams in Mysuru division:
- **MO:** Telegram task groups promising ₹5,000 daily payout.
- **Deposit Nodes:** Traced bank account links to Mandya branch (SBI-300456102).
- **Suspects:** MSM Gang (Ananya Hegde accomplice cells).`;
      } else if (query.includes('summary') || query.includes('generate')) {
        botResponse = `System Report: **Crime Summary Register**

- **Total Seeds:** 1,978 documents compiled.
- **Registered FIRs:** 300 total (2024: 75, 2025: 127, 2026: 98).
- **Incident Hotspots:** 13 critical sectors in Karnataka.
- **Gangs Tracked:** 3 active gangs sharing asset networks.`;
      }

      const botMsg = {
        id: 'msg-bot-' + Date.now(),
        sender: 'assistant',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConversations((prev) =>
        prev.map(c =>
          c.id === activeConversationId
            ? { ...c, messages: [...c.messages, botMsg] }
            : c
        )
      );
      setLoading(false);
      addNotification('info', 'AI diagnostic query completed.');
    }, 1500);
  };

  const handleRegenerate = () => {
    if (!activeConversation || activeConversation.messages.length < 2) return;
    
    // Find the last user query in the message stack
    const messages = [...activeConversation.messages];
    let lastUserQuery = '';
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        lastUserQuery = messages[i].text;
        break;
      }
    }

    if (!lastUserQuery) return;

    // Pop the last AI message
    setConversations((prev) =>
      prev.map(c => {
        if (c.id === activeConversationId) {
          const popped = [...c.messages];
          if (popped[popped.length - 1].sender === 'assistant') {
            popped.pop();
          }
          return { ...c, messages: popped };
        }
        return c;
      })
    );

    handleSend(lastUserQuery);
  };

  const handleExport = async () => {
    if (!activeConversation) return;
    try {
      addNotification('info', 'Generating Chat PDF transcript...');
      const formattedMsgs = activeConversation.messages.map(m => ({
        sender: m.sender,
        content: m.text
      }));
      await downloadChatPDF(activeConversation.title, formattedMsgs);
      addNotification('success', 'Conversational dossier successfully exported as PDF register.');
    } catch (err) {
      console.error(err);
      addNotification('error', 'Failed to generate Chat PDF.');
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    addNotification('success', 'Case data log copied to clipboard.');
  };

  return (
    <PageContainer className="h-[calc(100vh-4.5rem)] flex p-0 max-w-none md:p-0 lg:p-0">
      <div className="flex-1 flex overflow-hidden bg-white dark:bg-[#030712] border-t border-slate-200 dark:border-slate-800/80">
        
        {/* Left Sidebar */}
        <ChatSidebar
          conversations={conversations.map(c => ({
            id: c.id,
            title: c.title,
            onRename: handleRenameConversation
          }))}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onClearAll={handleClearAll}
        />

        {/* Central Chat Window */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {activeConversation ? (
            <>
              {/* Chat Title Header */}
              <ChatHeader
                title={activeConversation.title}
                onExport={handleExport}
                onClearActive={() => {
                  setConversations(prev =>
                    prev.map(c => (c.id === activeConversationId ? { ...c, messages: [] } : c))
                  );
                  addNotification('warning', 'Active conversation messages wiped.');
                }}
              />

              {/* Message scroll container */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar">
                {activeConversation.messages.length === 0 ? (
                  <EmptyConversation onPromptClick={handleSend} />
                ) : (
                  activeConversation.messages.map((m, index) => (
                    <MessageBubble
                      key={m.id}
                      message={m}
                      onCopy={handleCopy}
                      onRegenerate={handleRegenerate}
                      isLast={index === activeConversation.messages.length - 1}
                    />
                  ))
                )}

                {loading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat input box */}
              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSend={() => handleSend()}
                disabled={loading}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none text-slate-500">
              <svg className="w-12 h-12 mb-4 text-slate-400 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1">
                No Active Dossier Thread
              </h3>
              <p className="text-xs text-slate-400">Initialize a new search using the sidebar controller.</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default ChatPage;
