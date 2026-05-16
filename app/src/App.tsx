import { useEffect, useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import { ExperimentTracker } from './components/ExperimentTracker';
import { useConversation } from './hooks/useConversation';
import { CommandPalette } from './components/CommandPalette';
import { Menu, FlaskConical } from 'lucide-react';

function App() {
  const {
    conversations,
    activeConversation,
    messages,
    experiments,
    isLoading,
    fetchConversations,
    createConversation,
    selectConversation,
    send,
    addExperiment,
    importExperiments,
  } = useConversation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNew = async () => {
    await createConversation();
    setSidebarOpen(false);
  };

  const handleSend = useCallback(async (msg: string) => {
    if (!activeConversation) {
      const conv = await createConversation();
      if (conv) {
        send(msg, conv);
      }
    } else {
      send(msg);
    }
  }, [activeConversation, createConversation, send]);

  return (
    <div className="flex h-screen overflow-hidden bg-ghost-white">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform lg:transform-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar
          conversations={conversations}
          activeId={activeConversation?.id || null}
          onSelect={(conv) => { selectConversation(conv); setSidebarOpen(false); }}
          onNew={handleNew}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-steel-gray bg-white flex items-center px-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-md hover:bg-fog-gray transition-colors"
          >
            <Menu size={18} />
          </button>

          <div className="flex-1 flex items-center justify-center lg:justify-start lg:ml-0">
            <h1 className="text-sm font-semibold text-ink-blue tracking-[-0.02em]">
              {activeConversation?.title || 'Autoresearch Assistant'}
            </h1>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-slate-text hover:bg-fog-gray border border-steel-gray/60 transition-colors"
            >
              <kbd className="font-mono text-[10px]">⌘K</kbd>
            </button>
            <button
              onClick={() => setTrackerOpen(!trackerOpen)}
              className={`p-2 rounded-md transition-colors xl:hidden ${
                trackerOpen ? 'bg-deep-plum/10 text-deep-plum' : 'hover:bg-fog-gray text-slate-text'
              }`}
            >
              <FlaskConical size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            onSend={handleSend}
          />

          <div className="hidden xl:block">
            {activeConversation && (
              <ExperimentTracker
                experiments={experiments}
                onAdd={addExperiment}
                onImport={(tsv) => importExperiments(tsv, activeConversation.id)}
                conversationId={activeConversation.id}
              />
            )}
          </div>

          {trackerOpen && activeConversation && (
            <div className="xl:hidden fixed inset-y-14 right-0 z-40 w-80 shadow-lg">
              <ExperimentTracker
                experiments={experiments}
                onAdd={addExperiment}
                onImport={(tsv) => importExperiments(tsv, activeConversation.id)}
                conversationId={activeConversation.id}
              />
            </div>
          )}
        </div>
      </div>

      {commandPaletteOpen && (
        <CommandPalette
          onClose={() => setCommandPaletteOpen(false)}
          onNewSession={handleNew}
          onSelectConversation={(conv) => { selectConversation(conv); setCommandPaletteOpen(false); }}
          conversations={conversations}
        />
      )}
    </div>
  );
}

export default App;
