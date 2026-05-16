import { Cpu, GitBranch, Timer, TrendingDown, Zap, BookOpen } from 'lucide-react';

interface WelcomeScreenProps {
  onSend: (message: string) => void;
}

const QUICK_PROMPTS = [
  {
    icon: Cpu,
    title: "Set up on my Mac",
    prompt: "I have a Mac with Apple Silicon. Walk me through setting up autoresearch from scratch.",
  },
  {
    icon: GitBranch,
    title: "Set up on NVIDIA GPU",
    prompt: "I have a Windows PC with an NVIDIA GPU. How do I set up autoresearch?",
  },
  {
    icon: TrendingDown,
    title: "Suggest research ideas",
    prompt: "I've got autoresearch running. What are the best experiment ideas to try for improving val_bpb? Suggest 5 concrete things to attempt.",
  },
  {
    icon: Timer,
    title: "Explain how it works",
    prompt: "Explain how autoresearch works in simple terms. What happens during each 5-minute experiment cycle?",
  },
  {
    icon: Zap,
    title: "Optimize my program.md",
    prompt: "Help me write a better program.md that will guide the AI agent to find improvements faster. What instructions should I include?",
  },
  {
    icon: BookOpen,
    title: "Interpret my results",
    prompt: "I ran some experiments and got these results. Help me understand what's working and what to try next. Here's my results.tsv data:",
  },
];

export function WelcomeScreen({ onSend }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-deep-plum/5 border border-deep-plum/10 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-success-moss animate-pulse" />
            <span className="text-[11px] font-medium text-deep-plum tracking-wide">AUTORESEARCH ASSISTANT</span>
          </div>
          <h1 className="text-3xl font-semibold text-ink-blue tracking-tight leading-tight mb-3">
            AI-powered research,<br />while you sleep.
          </h1>
          <p className="text-sm text-slate-text max-w-md mx-auto leading-relaxed">
            Set up Karpathy's autonomous research system with guided step-by-step instructions.
            Run experiments, interpret results, and improve your model overnight.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item.title}
              onClick={() => onSend(item.prompt)}
              className="group text-left p-4 rounded-xl border border-steel-gray bg-white hover:border-deep-plum/20 hover:shadow-[0_0_0_1px_rgba(17,26,74,0.05),0_2px_8px_rgba(0,0,0,0.06)] transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-fog-gray flex items-center justify-center group-hover:bg-deep-plum/5 transition-colors">
                  <item.icon size={15} className="text-deep-plum" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-blue mb-0.5">{item.title}</p>
                  <p className="text-[11px] text-slate-text line-clamp-2 leading-relaxed">{item.prompt.slice(0, 80)}...</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
