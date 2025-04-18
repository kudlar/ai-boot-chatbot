"use client";

import { useState, useEffect, useRef, FormEvent } from 'react';
import MessageList from './MessageList';
import InputField from './InputField';
import ErrorDisplay from './ErrorDisplay';
import LoadingIndicator from './LoadingIndicator';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

export default function ChatInterface() {
  const [model, setModel] = useState<'gpt-4' | 'gpt-3.5-turbo'>('gpt-4');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedModel = localStorage.getItem('chatModel');
    if (savedModel) {
      setModel(savedModel as 'gpt-4' | 'gpt-3.5-turbo');
    }
    
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (e) {
        console.error('Failed to load chat history', e);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('chatModel', model);
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [model, messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: '',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, assistantMessage]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunkText = decoder.decode(value, { stream: !done });
          
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              newMessages[newMessages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + chunkText,
              };
            }
            return newMessages;
          });
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err as Error);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Stop generation
  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };
  
  // Clear chat
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200">
        <div className="h-14 max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">AI Assistant</h1>
            <span className="ml-2 text-sm text-gray-500">{isLoading ? 'Typing...' : 'Online'}</span>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as 'gpt-4' | 'gpt-3.5-turbo')}
              className="bg-white border border-gray-200 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5</option>
            </select>
            <button 
              onClick={clearChat}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Clear chat"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Start a new conversation</h2>
              <p className="text-gray-500 max-w-xs">Send a message to start chatting with the AI assistant</p>
            </div>
          ) : (
            <MessageList messages={messages} />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-10">
          <ErrorDisplay error={error.message} />
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-10">
          <LoadingIndicator />
        </div>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <InputField
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
          />
        </div>
      </div>
    </div>
  );
} 