import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { askQuestion } from '../services/api';

const Chatbot = ({ guideId, currentStepId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hi! Ask me anything about this guide.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { from: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askQuestion(guideId, input, currentStepId);
      const aiMessage = { from: 'ai', text: response.data.answer };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error asking question:", error);
      const errorMessage = { from: 'ai', text: "Sorry, I couldn't get an answer. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!guideId || !currentStepId) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="w-96 h-[32rem] bg-white rounded-xl shadow-2xl flex flex-col border border-slate-200">
          <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
            <div className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-blue-600"/>
                <h3 className="font-semibold text-slate-800">Guide Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-3 items-start ${msg.from === 'user' ? 'justify-end' : ''}`}>
                {msg.from === 'ai' && <Bot className="w-6 h-6 text-blue-500 shrink-0"/>}
                <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.from === 'ai' ? 'bg-slate-100 text-slate-800 rounded-bl-none' : 'bg-blue-600 text-white rounded-br-none'}`}>
                  {msg.text}
                </div>
                {msg.from === 'user' && <User className="w-6 h-6 text-slate-500 shrink-0"/>}
              </div>
            ))}
            {isLoading && (
                 <div className="flex gap-3 items-start">
                    <Bot className="w-6 h-6 text-blue-500 shrink-0"/>
                    <div className="max-w-xs px-4 py-2 rounded-2xl bg-slate-100 text-slate-800 rounded-bl-none">
                        <div className="flex items-center justify-center gap-1">
                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button onClick={handleSend} disabled={isLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400">
                <Send className="w-5 h-5"/>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-transform hover:scale-110"
        aria-label="Toggle Chatbot"
      >
        {isOpen ? <X className="w-8 h-8"/> : <MessageSquare className="w-8 h-8" />}
      </button>
    </div>
  );
};

export default Chatbot; 