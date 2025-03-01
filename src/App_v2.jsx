import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import "./App.css";

const backendURL = import.meta.env.VITE_APP_BACKEND_URL;

function ChatApp() {
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [user, setUser] = useState({ name: "", email: "" });
  const [chatStarted, setChatStarted] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (user.email) {
      fetchChatHistory();
    }
  }, [user.email]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, generatingAnswer]);

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`${backendURL}/chat`, {
        params: { email: user.email },
      });
      // setChatHistory(response.data);
      setChatHistory(response.data?.length ? response.data : []);

    } catch (error) {
      console.error("Error fetching chat history:", error);

      // setChatHistory([]);
    }
  };

  const startChat = async (e) => {
    e.preventDefault();
    if (user.name && user.email) {
      setChatStarted(true);
      await fetchChatHistory();
    }
  };

  const clearChat = () => {
    setChatHistory([]); // Reset chat history
  };
  
  const closeChat = async () => {
    try {
      await axios.post(`${backendURL}/chat/close`, {
        email: user.email,
        chatHistory,
      });
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
    setChatStarted(false);
    setChatHistory([]);
    setUser({ name: "", email: "" });
  };

  const generateAnswer = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setGeneratingAnswer(true);
    const currentQuestion = question;
    setQuestion("");

    await saveChatMessage("question", currentQuestion);
    setChatHistory((prev) => [...prev, { type: "question", content: currentQuestion }]);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT}`,
        { contents: [{ parts: [{ text: currentQuestion }] }] }
      );
      const aiResponse = response.data.candidates[0].content.parts[0].text;

      await saveChatMessage("answer", aiResponse);
      setChatHistory((prev) => [...prev, { type: "answer", content: aiResponse }]);
    } catch (error) {
      console.error(error);
      await saveChatMessage("answer", "Sorry - Something went wrong. Please try again!");
      setChatHistory((prev) => [...prev, { type: "answer", content: "Sorry - Something went wrong. Please try again!" }]);
    } finally {
      setGeneratingAnswer(false);
    }
  };

  const saveChatMessage = async (type, content) => {
    try {
      await axios.post(`${backendURL}/chat`, { email: user.email,name: user.name, type, content });
    } catch (error) {
      console.error("Error saving chat message:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="h-full max-w-4xl mx-auto flex flex-col p-3">
        <header className="text-center py-4">
          <h1 className="text-4xl font-bold text-blue-800 hover:text-blue-500 transition-colors">
            Chat AI
          </h1>
        </header>

        {!chatStarted ? (
          <form onSubmit={startChat} className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-2xl font-bold text-center text-blue-600">Enter Details</h2>
            <div className="flex flex-col gap-3 mt-4">
              <input
                type="text"
                className="border border-gray-300 rounded p-3 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                placeholder="Enter your name"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                required
              />
              <input
                type="email"
                className="border border-gray-300 rounded p-3 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                placeholder="Please enter your email id"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Start Chat
              </button>
            </div>
          </form>
        ) : (
          <>
          <div className="align-middle">
            <button
              className="mt-4 px-4 py-1 mr-12 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
              onClick={clearChat}
              >
              Clear Chat
            </button>
            <button className="mt-4 px-4 py-1 w-auto bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors" onClick={closeChat}>Close Chat</button>
              </div>
            <div
            
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto mb-4 rounded-lg bg-white shadow-lg p-4 hide-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }} // Hide scrollbar for Firefox & IE
            > 
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="bg-blue-50 rounded-xl p-8 max-w-2xl">
                    <h2 className="text-2xl font-bold text-blue-600 mb-4">Welcome to Chat AI! 👋</h2>
                    <p className="text-gray-600 mb-4">
                      I'm here to help you with anything you'd like to know. You can ask me about:
                    </p>
                    <p className="text-gray-500 mt-6 text-sm">
                      Just type your question below and press Enter or click Send!
                    </p>
                  </div>
                </div>
              ) : (
                chatHistory.map((chat, index) => (
                  <div key={index} className={`mb-4 ${chat.type === "question" ? "text-right" : "text-left"}`}>
                    <div className={`inline-block max-w-[80%] p-3 rounded-lg overflow-auto hide-scrollbar ${chat.type === "question"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-green-100 text-gray-800 rounded-bl-none"
                      }`}>
                      <ReactMarkdown className="overflow-auto hide-scrollbar">
                        {chat.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))
              )}

              {generatingAnswer && (
                <div className="text-left">
                  <div className="inline-block bg-gray-100 p-3 rounded-lg animate-pulse">Typing...</div>
                </div>
              )}
            </div>
            <form onSubmit={generateAnswer} className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex gap-2">
                <textarea
                  required
                  className="flex-1 border border-gray-300 rounded p-3 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask anything..."
                  rows="2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      generateAnswer(e);
                    }
                  }}
                ></textarea>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors "
                  disabled={generatingAnswer}
                >
                  Send
                </button>
              </div>
            </form>
            {/* <div>
            <button
              className="mt-4 px-4 py-1 mr-12 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
              onClick={clearChat}
              >
              Clear Chat
            </button>
            <button className="mt-4 px-4 py-1 w-auto bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors" onClick={closeChat}>Close Chat</button>
              </div> */}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
