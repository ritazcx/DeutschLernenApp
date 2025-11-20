import React, { useState, useRef, useEffect } from 'react';
import { Message, Scenario } from '../types';
import { sendMessageToGemini } from '../services/geminiChat';
import { Send, Mic, ChevronLeft } from 'lucide-react';

interface ChatInterfaceProps {
  scenario: Scenario | null;
  onBack: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ scenario, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial greeting
    if (messages.length === 0) {
      const initialText = scenario 
        ? `Hallo! Willkommen bei "${scenario.title}". Ich bin bereit.`
        : "Hallo! Wie kann ich dir heute helfen, Deutsch zu lernen?";
      
      setMessages([{
        id: 'init',
        role: 'model',
        text: initialText,
        timestamp: new Date()
      }]);
    }
  }, [scenario]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const responseMsg = await sendMessageToGemini([...messages, userMsg], userMsg.text, scenario);

    setMessages(prev => [...prev, responseMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="h-16 bg-white/90 backdrop-blur border-b border-gray-200 flex items-center px-4 justify-between shadow-sm z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ChevronLeft />
        </button>
        <div className="text-center">
           <h2 className="font-bold text-gray-900">{scenario ? scenario.title : 'Chat Tutor'}</h2>
           <p className="text-[10px] text-green-600 font-medium flex items-center justify-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
           </p>
        </div>
        <div className="w-8"></div> {/* Spacer */}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[80%] ${
              msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'
            }`}
          >
            <div
              className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
            {msg.role === 'model' && msg.text.includes("Correction:") && (
              <div className="mt-1 text-[10px] text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                Grammar Hint Available
              </div>
            )}
          </div>
        ))}
        {isLoading && (
           <div className="self-start bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm">
             <div className="flex space-x-1">
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2 bg-gray-100 rounded-full p-1 pr-2 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type in German..."
            className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 text-sm text-gray-900 placeholder-gray-500"
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`p-2 rounded-full transition-all ${
              inputValue.trim() ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-300 text-gray-500'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};