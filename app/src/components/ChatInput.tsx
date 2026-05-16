import { useState, useRef, useEffect } from 'react';
import { Send, Loader as Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim() || isLoading) return;
    onSend(value);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-steel-gray bg-white px-4 py-3">
      <div className="flex items-end gap-3 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask about setup, experiments, troubleshooting, or research ideas..."}
            rows={1}
            className="w-full resize-none rounded-xl border border-steel-gray bg-fog-gray px-4 py-3 text-[13px] text-charcoal placeholder:text-slate-text/70 focus:outline-none focus:border-deep-plum/25 focus:ring-2 focus:ring-deep-plum/8 transition-all"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          className="shrink-0 w-10 h-10 rounded-xl bg-action-orange text-white flex items-center justify-center hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_1px_3px_rgba(236,101,43,0.3)]"
        >
          {isLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Send size={15} />
          )}
        </button>
      </div>
      <div className="flex items-center justify-center gap-4 mt-2">
        <p className="text-[10px] text-slate-text/60">
          Enter to send · Shift+Enter for new line · ⌘K for commands
        </p>
      </div>
    </div>
  );
}
