"use client";

import { FormEvent } from 'react';

interface InputFieldProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop: () => void;
}

export default function InputField({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
}: InputFieldProps) {
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center bg-gray-100 rounded-full">
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Aa"
          className="flex-1 px-4 py-2 bg-transparent border-0 focus:outline-none resize-none text-sm"
          rows={1}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (input.trim()) {
                handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
              }
            }
          }}
        />
        <button
          type={isLoading ? "button" : "submit"}
          onClick={isLoading ? stop : undefined}
          disabled={isLoading ? false : !input.trim()}
          className="p-2 mx-2 rounded-full"
        >
          {isLoading ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-500">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={input.trim() ? "text-[#0084ff]" : "text-gray-300"}>
              <path d="M2 12L20 4L12 21L10 14L2 12Z" fill="currentColor"/>
            </svg>
          )}
        </button>
      </div>
    </form>
  );
} 