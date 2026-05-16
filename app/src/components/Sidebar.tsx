import { Plus, MessageSquare, Beaker, ExternalLink } from 'lucide-react';
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
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-deep-plum flex items-center justify-center">
            <Beaker size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-blue tracking-[-0.01em]">Autoresearch</p>
            <p className="text-[10px] text-slate-text">Guided Assistant</p>
          </div>
        </div>
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-deep-plum text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity shadow-[0_1px_3px_rgba(17,26,74,0.2)]"
        >
          <Plus size={15} />
          New Session
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <p className="text-slate-text text-xs text-center py-8 px-4 leading-relaxed">
            No conversations yet. Start a new session to get guided through setup.
          </p>
        ) : (
          <div className="space-y-0.5">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-2.5 transition-all text-sm ${
                  activeId === conv.id
                    ? 'bg-white shadow-[0_0_0_1px_rgba(17,26,74,0.06),0_1px_3px_rgba(0,0,0,0.08)] text-ink-blue'
                    : 'hover:bg-white/60 text-charcoal'
                }`}
              >
                <MessageSquare size={13} className="mt-0.5 text-slate-text shrink-0" />
                <span className="truncate text-[13px]">{conv.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-steel-gray space-y-2">
        <a
          href="https://github.com/karpathy/autoresearch"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-slate-text hover:text-charcoal hover:bg-white/60 transition-colors"
        >
          <ExternalLink size={11} />
          Autoresearch GitHub
        </a>
        <div className="px-3 text-[10px] text-slate-text/70">
          Built on Karpathy's autoresearch framework
        </div>
      </div>
    </aside>
  );
}
