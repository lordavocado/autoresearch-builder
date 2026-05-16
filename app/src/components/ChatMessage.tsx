import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, User, Bot } from 'lucide-react';
import { useState } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function CodeBlock({ children, className }: { children: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3">
      <pre className={`bg-ink-blue text-ghost-white rounded-lg p-4 overflow-x-auto text-xs font-mono leading-relaxed ${className || ''}`}>
        <code>{children}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 text-white/60 hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
    </div>
  );
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  if (role === 'system') return null;

  return (
    <div className={`flex gap-3 py-4 ${role === 'user' ? 'justify-end' : ''}`}>
      {role === 'assistant' && (
        <div className="w-7 h-7 rounded-full bg-deep-plum/10 flex items-center justify-center shrink-0 mt-0.5">
          <Bot size={14} className="text-deep-plum" />
        </div>
      )}

      <div
        className={`max-w-[85%] ${
          role === 'user'
            ? 'bg-deep-plum text-white rounded-2xl rounded-br-md px-4 py-2.5'
            : 'bg-fog-gray rounded-2xl rounded-bl-md px-4 py-3'
        }`}
      >
        {role === 'user' ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose-sm text-charcoal">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ children, className, ...props }) {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="px-1.5 py-0.5 bg-steel-gray/60 rounded text-xs font-mono text-ink-blue" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return <CodeBlock className={className}>{String(children)}</CodeBlock>;
                },
                pre({ children }) {
                  return <>{children}</>;
                },
                p({ children }) {
                  return <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>;
                },
                h1({ children }) {
                  return <h1 className="text-lg font-semibold text-ink-blue mt-4 mb-2">{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className="text-base font-semibold text-ink-blue mt-3 mb-2">{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className="text-sm font-semibold text-ink-blue mt-3 mb-1">{children}</h3>;
                },
                ul({ children }) {
                  return <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>;
                },
                li({ children }) {
                  return <li className="text-sm leading-relaxed">{children}</li>;
                },
                strong({ children }) {
                  return <strong className="font-semibold text-ink-blue">{children}</strong>;
                },
                a({ children, href }) {
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-deep-plum underline underline-offset-2 hover:text-action-orange transition-colors">
                      {children}
                    </a>
                  );
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto my-3">
                      <table className="w-full text-xs border border-steel-gray rounded-lg overflow-hidden">{children}</table>
                    </div>
                  );
                },
                th({ children }) {
                  return <th className="bg-fog-gray px-3 py-2 text-left font-medium text-ink-blue border-b border-steel-gray">{children}</th>;
                },
                td({ children }) {
                  return <td className="px-3 py-2 border-b border-steel-gray/50">{children}</td>;
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {role === 'user' && (
        <div className="w-7 h-7 rounded-full bg-action-orange/10 flex items-center justify-center shrink-0 mt-0.5">
          <User size={14} className="text-action-orange" />
        </div>
      )}
    </div>
  );
}
