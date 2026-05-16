import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { WelcomeScreen } from './WelcomeScreen';
import type { Message } from '../lib/supabase';
import { Loader as Loader2 } from 'lucide-react';

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (message: string) => void;
}

export function ChatPanel({ messages, isLoading, onSend }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {messages.length === 0 ? (
        <>
          <WelcomeScreen onSend={onSend} />
          <ChatInput onSend={onSend} isLoading={isLoading} />
        </>
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
            <div className="max-w-3xl mx-auto">
              {messages.map(msg => (
                <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
              ))}
              {isLoading && (
                <div className="flex gap-3 py-3 animate-fade-in">
                  <div className="w-7 h-7 rounded-full bg-deep-plum/8 flex items-center justify-center shrink-0 border border-deep-plum/10">
                    <Loader2 size={13} className="text-deep-plum animate-spin" />
                  </div>
                  <div className="bg-fog-gray rounded-2xl rounded-bl-sm px-4 py-3 shadow-[0_0_0_1px_rgba(17,26,74,0.03)]">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-deep-plum/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-deep-plum/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-deep-plum/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[11px] text-slate-text">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <ChatInput onSend={onSend} isLoading={isLoading} />
        </>
      )}
    </div>
  );
}
