import { useState, useEffect, useRef } from 'react';
import { Search, Plus, MessageSquare, TriangleAlert as AlertTriangle, Lightbulb } from 'lucide-react';
import type { Conversation } from '../lib/supabase';

interface CommandPaletteProps {
  onClose: () => void;
  onNewSession: () => void;
  onSelectConversation: (conv: Conversation) => void;
  conversations: Conversation[];
}

export function CommandPalette({ onClose, onNewSession, onSelectConversation, conversations }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const actions = [
    { id: 'new', label: 'New Session', icon: Plus, action: () => { onNewSession(); onClose(); } },
    { id: 'troubleshoot', label: 'Common Troubleshooting', icon: AlertTriangle, action: () => { onClose(); } },
    { id: 'ideas', label: 'Research Ideas', icon: Lightbulb, action: () => { onClose(); } },
  ];

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredActions = actions.filter(a =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-[0_0_0_1px_rgba(17,26,74,0.08),0_16px_48px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-steel-gray">
          <Search size={16} className="text-slate-text shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search commands, conversations..."
            className="flex-1 text-sm bg-transparent outline-none text-charcoal placeholder:text-slate-text"
          />
          <kbd className="text-[10px] font-mono text-slate-text bg-fog-gray px-1.5 py-0.5 rounded border border-steel-gray/60">esc</kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-2">
          {filteredActions.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-medium text-slate-text uppercase tracking-wider px-2 py-1">Actions</p>
              {filteredActions.map(action => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-fog-gray transition-colors"
                >
                  <action.icon size={14} className="text-deep-plum shrink-0" />
                  <span className="text-sm text-charcoal">{action.label}</span>
                </button>
              ))}
            </div>
          )}

          {filteredConversations.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-slate-text uppercase tracking-wider px-2 py-1">Conversations</p>
              {filteredConversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-fog-gray transition-colors"
                >
                  <MessageSquare size={14} className="text-slate-text shrink-0" />
                  <span className="text-sm text-charcoal truncate">{conv.title}</span>
                </button>
              ))}
            </div>
          )}

          {filteredActions.length === 0 && filteredConversations.length === 0 && (
            <p className="text-center text-sm text-slate-text py-6">No results found</p>
          )}
        </div>
      </div>
    </div>
  );
}
