import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import { ExperimentTracker } from './components/ExperimentTracker';
import { useConversation } from './hooks/useConversation';
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
  } = useConversation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleNew = async () => {
    await createConversation();
    setSidebarOpen(false);
  };

  const handleSend = async (msg: string) => {
    if (!activeConversation) {
      await createConversation();
    }
    send(msg);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-ghost-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
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

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-steel-gray bg-white flex items-center px-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-md hover:bg-fog-gray transition-colors"
          >
            <Menu size={18} />
          </button>

          <div className="flex-1 flex items-center justify-center lg:justify-start lg:ml-0">
            <h1 className="text-sm font-semibold text-ink-blue tracking-tight">
              {activeConversation?.title || 'Autoresearch Assistant'}
            </h1>
          </div>

          <button
            onClick={() => setTrackerOpen(!trackerOpen)}
            className={`p-2 rounded-md transition-colors xl:hidden ${
              trackerOpen ? 'bg-deep-plum/10 text-deep-plum' : 'hover:bg-fog-gray text-slate-text'
            }`}
          >
            <FlaskConical size={18} />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            onSend={handleSend}
          />

          {/* Experiment tracker - desktop always visible, mobile toggle */}
          <div className={`hidden xl:block`}>
            {activeConversation && (
              <ExperimentTracker
                experiments={experiments}
                onAdd={addExperiment}
                conversationId={activeConversation.id}
              />
            )}
          </div>

          {/* Mobile tracker overlay */}
          {trackerOpen && activeConversation && (
            <div className="xl:hidden fixed inset-y-14 right-0 z-40 w-80 shadow-lg">
              <ExperimentTracker
                experiments={experiments}
                onAdd={addExperiment}
                conversationId={activeConversation.id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
