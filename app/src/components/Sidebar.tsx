import { Plus, MessageSquare, Beaker } from 'lucide-react';
import type { Conversation } from '../lib/supabase';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conv: Conversation) => void;
  onNew: () => void;
}

export function Sidebar({ conversations, activeId, onSelect, onNew }: SidebarProps) {
  return (
    <aside className="w-72 border-r border-steel-gray bg-fog-gray flex flex-col h-full">
      <div className="p-4 border-b border-steel-gray">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-4 py-2.5 bg-deep-plum text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Session
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 && (
          <p className="text-slate-text text-xs text-center py-8 px-4">
            No conversations yet. Start a new session to begin.
          </p>
        )}
        {conversations.map(conv => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 flex items-start gap-2.5 transition-colors text-sm ${
              activeId === conv.id
                ? 'bg-white shadow-[0_0_0_1px_rgba(17,26,74,0.05),0_1px_2px_rgba(0,0,0,0.1)]'
                : 'hover:bg-white/60'
            }`}
          >
            <MessageSquare size={14} className="mt-0.5 text-slate-text shrink-0" />
            <span className="truncate text-charcoal">{conv.title}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-steel-gray">
        <div className="flex items-center gap-2 text-xs text-slate-text">
          <Beaker size={12} />
          <span>Autoresearch Assistant</span>
        </div>
      </div>
    </aside>
  );
}
