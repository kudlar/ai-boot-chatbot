"use client";

import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
};

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const formatTime = (date: Date | undefined) => {
    if (!date) return '';
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const shouldShowTimestamp = (index: number) => {
    if (index === 0) return true;
    
    const currentMsg = messages[index];
    const prevMsg = messages[index - 1];
    
    if (!currentMsg.timestamp || !prevMsg.timestamp) return false;
    
    // Show timestamp if messages are more than 5 minutes apart
    return currentMsg.timestamp.getTime() - prevMsg.timestamp.getTime() > 5 * 60 * 1000;
  };

  return (
    <div className="space-y-2">
      {messages.map((message, index) => {
        const isUser = message.role === 'user';
        const showTimestamp = shouldShowTimestamp(index);
        const isFirstInGroup = index === 0 || messages[index - 1].role !== message.role;
        const isLastInGroup = index === messages.length - 1 || messages[index + 1].role !== message.role;
        
        return (
          <div key={index} className="w-full">
            {showTimestamp && (
              <div className="flex justify-center my-4">
                <div className="bg-white text-gray-500 text-xs px-2">
                  {formatDate(message.timestamp) + ' ' + formatTime(message.timestamp)}
                </div>
              </div>
            )}
            
            <div className={`flex mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className="flex flex-col max-w-[75%]">
                {isFirstInGroup && !isUser && (
                  <div className="text-xs text-gray-500 ml-2 mb-1">AI</div>
                )}
                
                <div 
                  className={`px-3 py-2 rounded-2xl ${
                    isUser 
                      ? 'bg-[#0084ff] text-white' 
                      : 'bg-[#f0f0f0] text-black'
                  } ${
                    !isLastInGroup && isUser ? 'rounded-br-md' : ''
                  } ${
                    !isLastInGroup && !isUser ? 'rounded-bl-md' : ''
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <div className="my-2 rounded-md overflow-hidden bg-gray-800">
                            <div className="px-3 py-1 text-xs text-gray-200 flex justify-between items-center">
                              <span>{match[1]}</span>
                              <button 
                                onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                                className="text-xs text-gray-400 hover:text-white"
                              >
                                Copy
                              </button>
                            </div>
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className={`${className} rounded px-1 py-0.5 ${isUser ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-800'}`} {...props}>
                            {children}
                          </code>
                        );
                      },
                      p({ children }) {
                        return <p className="mb-1 last:mb-0">{children}</p>;
                      }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                
                {isFirstInGroup && isUser && (
                  <div className="text-xs text-gray-500 text-right mr-2 mt-1">Me</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 