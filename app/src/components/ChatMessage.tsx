import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, User, Bot } from 'lucide-react';
import { useState } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden">
      <pre className="bg-[#0d1117] text-[#e6edf3] rounded-lg p-4 overflow-x-auto text-[11px] font-mono leading-[1.6]">
        <code>{children}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-white/10 text-white/50 hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all"
        title="Copy to clipboard"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </div>
  );
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  if (role === 'system') return null;

  return (
    <div className={`flex gap-3 py-3 animate-fade-in ${role === 'user' ? 'justify-end' : ''}`}>
      {role === 'assistant' && (
        <div className="w-7 h-7 rounded-full bg-deep-plum/8 flex items-center justify-center shrink-0 mt-0.5 border border-deep-plum/10">
          <Bot size={13} className="text-deep-plum" />
        </div>
      )}

      <div
        className={`max-w-[85%] ${
          role === 'user'
            ? 'bg-deep-plum text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-[0_1px_3px_rgba(17,26,74,0.15)]'
            : 'bg-fog-gray rounded-2xl rounded-bl-sm px-4 py-3 shadow-[0_0_0_1px_rgba(17,26,74,0.03)]'
        }`}
      >
        {role === 'user' ? (
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="text-charcoal">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ children, className }) {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="px-1.5 py-0.5 bg-steel-gray/50 rounded text-[11px] font-mono text-ink-blue border border-steel-gray/40">
                        {children}
                      </code>
                    );
                  }
                  return <CodeBlock>{String(children)}</CodeBlock>;
                },
                pre({ children }) {
                  return <>{children}</>;
                },
                p({ children }) {
                  return <p className="text-[13px] leading-[1.6] mb-2.5 last:mb-0">{children}</p>;
                },
                h1({ children }) {
                  return <h1 className="text-base font-semibold text-ink-blue mt-4 mb-2 tracking-[-0.01em]">{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className="text-[15px] font-semibold text-ink-blue mt-3.5 mb-2 tracking-[-0.01em]">{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className="text-[13px] font-semibold text-ink-blue mt-3 mb-1.5">{children}</h3>;
                },
                ul({ children }) {
                  return <ul className="list-disc pl-4 mb-2.5 space-y-1">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="list-decimal pl-4 mb-2.5 space-y-1">{children}</ol>;
                },
                li({ children }) {
                  return <li className="text-[13px] leading-[1.6]">{children}</li>;
                },
                strong({ children }) {
                  return <strong className="font-semibold text-ink-blue">{children}</strong>;
                },
                a({ children, href }) {
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-deep-plum underline underline-offset-2 decoration-deep-plum/30 hover:decoration-deep-plum transition-colors">
                      {children}
                    </a>
                  );
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-2 border-deep-plum/20 pl-3 my-2.5 text-slate-text italic">
                      {children}
                    </blockquote>
                  );
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto my-3 rounded-lg border border-steel-gray">
                      <table className="w-full text-[11px]">{children}</table>
                    </div>
                  );
                },
                th({ children }) {
                  return <th className="bg-fog-gray px-3 py-2 text-left font-medium text-ink-blue border-b border-steel-gray">{children}</th>;
                },
                td({ children }) {
                  return <td className="px-3 py-2 border-b border-steel-gray/40 font-mono">{children}</td>;
                },
                hr() {
                  return <hr className="my-4 border-steel-gray/60" />;
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {role === 'user' && (
        <div className="w-7 h-7 rounded-full bg-action-orange/8 flex items-center justify-center shrink-0 mt-0.5 border border-action-orange/15">
          <User size={13} className="text-action-orange" />
        </div>
      )}
    </div>
  );
}
