import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { ChatMessage } from '../types.js';

interface ChatDrawerProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentPlayerId: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ messages, onSendMessage, currentPlayerId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);

  useEffect(() => {
    if (!isOpen && messages.length > prevMessagesLength.current) {
      setUnreadCount((c) => c + (messages.length - prevMessagesLength.current));
    }
    prevMessagesLength.current = messages.length;
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-5 right-5 z-40 bg-purple-600 hover:bg-purple-500 text-white p-3.5 rounded-full shadow-lg shadow-purple-900/40 transition-all transform hover:scale-105 flex items-center justify-center border border-purple-400/30"
          title="Open Chat"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Modal / Sidebar */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[90vw] max-w-sm sm:w-80 h-96 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-3.5 bg-slate-800/90 border-b border-slate-700/70 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <span className="font-bold text-sm text-slate-200">Room Chat</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-sm">
            {messages.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-10">
                No messages yet. Say hi or throw some shade!
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.playerId === currentPlayerId;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-slate-400 px-1 mb-0.5 font-medium">
                      {isMe ? 'You' : m.playerName}
                    </span>
                    <div
                      className={`max-w-[85%] px-3 py-1.5 rounded-2xl break-words ${
                        isMe
                          ? 'bg-purple-600 text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSubmit} className="p-2.5 bg-slate-800/80 border-t border-slate-700/60 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type message..."
              maxLength={200}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-purple-600 disabled:opacity-40 hover:bg-purple-500 text-white p-2 rounded-xl transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

