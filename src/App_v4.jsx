import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Menu, Trash2, X, MessageCircle, Sparkles, User, Mail } from "lucide-react";

// Mock backend URL - replace with your actual backend
const backendURL = "https://your-backend-url.com";

// Custom hook for managing chat state
const useChatState = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [user, setUser] = useState({ name: "", email: "" });
  const [chatStarted, setChatStarted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return {
    chatHistory,
    setChatHistory,
    question,
    setQuestion,
    generatingAnswer,
    setGeneratingAnswer,
    user,
    setUser,
    chatStarted,
    setChatStarted,
    showMenu,
    setShowMenu,
  };
};

// Custom hook for auto-scrolling
const useAutoScroll = (dependency) => {
  const containerRef = useRef(null);
  const isAtBottom = useRef(true);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    isAtBottom.current = scrollTop + clientHeight >= scrollHeight - 10;
  }, []);

  useEffect(() => {
    if (isAtBottom.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [dependency]);

  useEffect(() => {
    const chatDiv = containerRef.current;
    if (chatDiv) {
      chatDiv.addEventListener("scroll", handleScroll);
      return () => chatDiv.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  return containerRef;
};

// Loading animation component
const TypingIndicator = () => (
  <div className="flex items-center space-x-2 p-4">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
    <span className="text-gray-500 text-sm">AI is thinking...</span>
  </div>
);

// Welcome screen component
const WelcomeScreen = () => (
  <div className="flex-1 flex items-center justify-center p-6">
    <div className="text-center max-w-2xl">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Chat AI</h2>
        <p className="text-gray-600 text-lg mb-6">
          Your intelligent conversation partner is ready to help with anything you need.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
        <div className="p-4 bg-blue-50 rounded-lg">
          <MessageCircle className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p>Ask questions and get detailed answers</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <Sparkles className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p>Get creative help and brainstorming</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <User className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <p>Personalized assistance for your needs</p>
        </div>
      </div>
      
      <p className="text-gray-400 mt-6">Type your message below to get started!</p>
    </div>
  </div>
);

// Chat message component
const ChatMessage = ({ chat, index }) => {
  const isQuestion = chat.type === "question";
  
  return (
    <div className={`flex ${isQuestion ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${
        isQuestion 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md' 
          : 'bg-gray-100 text-gray-800 rounded-bl-md'
      }`}>
        <div className="whitespace-pre-wrap break-words">
          {chat.content}
        </div>
      </div>
    </div>
  );
};

// Header component
const ChatHeader = ({ user, showMenu, setShowMenu, onClearChat, onCloseChat }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu, setShowMenu]);

  return (
    <header className="flex justify-between items-center p-6 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat AI</h1>
          {user.name && (
            <p className="text-sm text-gray-500">Hello, {user.name}!</p>
          )}
        </div>
      </div>
      
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <button
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
              onClick={onClearChat}
            >
              <Trash2 className="w-4 h-4 mr-3 text-gray-500" />
              Clear Chat
            </button>
            <button
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
              onClick={onCloseChat}
            >
              <X className="w-4 h-4 mr-3 text-red-500" />
              Close Chat
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

// User details form component
const UserDetailsForm = ({ user, setUser, onStartChat }) => {
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onStartChat();
  }};

  return (
  <div className="flex-1 flex items-center justify-center p-6">
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
          <p className="text-gray-600">Please enter your details to get started</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your name"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                required
              />
            </div>
          </div>
          
          <button
            onClick={handleStartChat}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
          >
            Start Chatting
          </button>
          </div>
      </div>
    </div>
  </div>
);

// Main chat application component
const ChatApp = () => {
  const {
    chatHistory,
    setChatHistory,
    question,
    setQuestion,
    generatingAnswer,
    setGeneratingAnswer,
    user,
    setUser,
    chatStarted,
    setChatStarted,
    showMenu,
    setShowMenu,
  } = useChatState();

  const chatContainerRef = useAutoScroll([chatHistory, generatingAnswer]);

  // API functions
  const fetchChatHistory = useCallback(async () => {
    if (!user.email) return;
    
    try {
      const response = await fetch(`${backendURL}/chat?email=${user.email}`);
      const data = await response.json();
      setChatHistory(data?.length ? data : []);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  }, [user.email, setChatHistory]);

  const saveChatMessage = useCallback(async (type, content) => {
    try {
      await fetch(`${backendURL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, name: user.name, type, content }),
      });
    } catch (error) {
      console.error("Error saving chat message:", error);
    }
  }, [user.email, user.name]);

  // Event handlers
  const handleStartChat = (e) => {
    if (e) e.preventDefault();
    if (user.name && user.email) {
      setChatStarted(true);
      fetchChatHistory();
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      setChatHistory([]);
      setShowMenu(false);
    }
  };

  const handleCloseChat = async () => {
    if (window.confirm("Are you sure you want to close this chat? Your chat history will be saved.")) {
      try {
        await fetch(`${backendURL}/chat/close`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, chatHistory }),
        });
      } catch (error) {
        console.error("Error saving chat history:", error);
      }
      
      setChatStarted(false);
      setChatHistory([]);
      setUser({ name: "", email: "" });
      setShowMenu(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!question.trim() || generatingAnswer) return;

    setGeneratingAnswer(true);
    const currentQuestion = question.trim();
    setQuestion("");

    // Add user message to chat
    const userMessage = { type: "question", content: currentQuestion };
    setChatHistory(prev => [...prev, userMessage]);
    await saveChatMessage("question", currentQuestion);

    try {
      // Mock API call - replace with your actual API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: currentQuestion }] }] })
        }
      );
      
      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

      const assistantMessage = { type: "answer", content: aiResponse };
      setChatHistory(prev => [...prev, assistantMessage]);
      await saveChatMessage("answer", aiResponse);
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage = { type: "answer", content: "Sorry - Something went wrong. Please try again!" };
      setChatHistory(prev => [...prev, errorMessage]);
      await saveChatMessage("answer", "Sorry - Something went wrong. Please try again!");
    } finally {
      setGeneratingAnswer(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Effects
  useEffect(() => {
    if (user.email && chatStarted) {
      fetchChatHistory();
    }
  }, [user.email, chatStarted, fetchChatHistory]);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {!chatStarted ? (
        <UserDetailsForm 
          user={user} 
          setUser={setUser} 
          onStartChat={handleStartChat} 
        />
      ) : (
        <>
          <ChatHeader 
            user={user}
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            onClearChat={handleClearChat}
            onCloseChat={handleCloseChat}
          />
          
          <div className="flex-1 flex flex-col min-h-0">
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#CBD5E0 transparent" }}
            >
              {chatHistory.length === 0 ? (
                <WelcomeScreen />
              ) : (
                chatHistory.map((chat, index) => (
                  <ChatMessage key={index} chat={chat} index={index} />
                ))
              )}
              
              {generatingAnswer && <TypingIndicator />}
            </div>
            
            <div className="p-6 bg-white border-t border-gray-200">
              <div className="flex items-end space-x-4">
                <div className="flex-1">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message here..."
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={generatingAnswer}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={generatingAnswer || !question.trim()}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatApp;