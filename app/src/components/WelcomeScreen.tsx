import { useState } from 'react';
import { Cpu, Timer, TrendingDown, Zap, BookOpen, Apple, Monitor, Terminal, ChevronRight } from 'lucide-react';

interface WelcomeScreenProps {
  onSend: (message: string) => void;
}

const PLATFORMS = [
  {
    id: 'mac',
    label: 'Mac (Apple Silicon)',
    icon: Apple,
    description: 'M1, M2, M3, or M4 chip',
    prompt: "I have a Mac with Apple Silicon. Walk me through setting up autoresearch from scratch, step by step. Start with checking my chip, installing uv, cloning the macOS fork, and running my first training.",
  },
  {
    id: 'nvidia-windows',
    label: 'Windows + NVIDIA',
    icon: Monitor,
    description: 'RTX 3060, 4070, 4090, etc.',
    prompt: "I have a Windows PC with an NVIDIA GPU. Walk me through setting up autoresearch from scratch, step by step. Start with verifying my GPU with nvidia-smi, installing uv, cloning the repo, and running my first training.",
  },
  {
    id: 'nvidia-linux',
    label: 'Linux + NVIDIA',
    icon: Terminal,
    description: 'Ubuntu, Debian, etc.',
    prompt: "I have a Linux machine with an NVIDIA GPU. Walk me through setting up autoresearch from scratch, step by step. Start with verifying CUDA, installing uv, cloning the repo, and running my first training.",
  },
];

const QUICK_PROMPTS = [
  {
    icon: TrendingDown,
    title: "Suggest research ideas",
    prompt: "I've got autoresearch running and want to improve val_bpb. Suggest 5 concrete experiment ideas ranked by expected impact, covering architecture changes, optimizer tweaks, and hyperparameter adjustments. For each, explain the hypothesis and what to change in train.py.",
  },
  {
    icon: Zap,
    title: "Write better program.md",
    prompt: "Help me write a more effective program.md that will guide the AI agent to find improvements faster. What instructions, strategies, and constraints should I include? Show me a complete improved version.",
  },
  {
    icon: BookOpen,
    title: "Interpret my results",
    prompt: "Help me interpret my autoresearch experiment results. I'll paste my results.tsv data. Explain what's working, what patterns you see, and what I should try next based on the results.",
  },
  {
    icon: Timer,
    title: "Explain how it all works",
    prompt: "Explain autoresearch in detail for a technical person. Cover the experiment loop, what val_bpb means, how the 5-minute time budget works, what train.py contains (GPT architecture, Muon optimizer), and what makes a good research direction.",
  },
];

export function WelcomeScreen({ onSend }: WelcomeScreenProps) {
  const [view, setView] = useState<'main' | 'setup'>('main');

  return (
    <div className="flex-1 flex items-center justify-center p-8 relative overflow-y-auto">
      {/* Dotted grid background */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle, #023247 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-2xl w-full relative z-10">
        {view === 'main' ? (
          <>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-deep-plum/5 border border-deep-plum/10 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-success-moss animate-pulse" />
                <span className="text-[11px] font-medium text-deep-plum tracking-wide uppercase">Autoresearch Assistant</span>
              </div>
              <h1 className="text-[32px] font-semibold text-ink-blue tracking-[-0.03em] leading-tight mb-3">
                AI-powered research,<br />while you sleep.
              </h1>
              <p className="text-sm text-slate-text max-w-md mx-auto leading-relaxed">
                Set up Karpathy's autonomous research system. An AI agent modifies code, trains for 5 minutes,
                keeps improvements, discards failures, and repeats — running ~100 experiments overnight.
              </p>
            </div>

            {/* Setup CTA */}
            <button
              onClick={() => setView('setup')}
              className="w-full mb-6 p-4 rounded-xl bg-deep-plum text-white flex items-center justify-between hover:opacity-95 transition-opacity shadow-[0_0_0_1px_rgba(17,26,74,0.2),0_4px_12px_rgba(17,26,74,0.15)]"
            >
              <div className="flex items-center gap-3">
                <Cpu size={18} />
                <div className="text-left">
                  <p className="text-sm font-medium">Get Started — Set Up Autoresearch</p>
                  <p className="text-[11px] text-white/70">Guided setup for Mac, Windows, or Linux</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/60" />
            </button>

            {/* Quick prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUICK_PROMPTS.map((item) => (
                <button
                  key={item.title}
                  onClick={() => onSend(item.prompt)}
                  className="group text-left p-4 rounded-xl border border-steel-gray bg-white hover:border-deep-plum/20 hover:shadow-[0_0_0_1px_rgba(17,26,74,0.05),0_2px_8px_rgba(0,0,0,0.06)] transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-fog-gray flex items-center justify-center group-hover:bg-deep-plum/5 transition-colors shrink-0">
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
          </>
        ) : (
          <>
            <button
              onClick={() => setView('main')}
              className="text-xs text-slate-text hover:text-charcoal mb-6 flex items-center gap-1 transition-colors"
            >
              ← Back
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-ink-blue tracking-[-0.02em] mb-2">
                Select Your Platform
              </h2>
              <p className="text-sm text-slate-text">
                Choose your hardware to get platform-specific setup instructions.
              </p>
            </div>

            <div className="space-y-3">
              {PLATFORMS.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => onSend(platform.prompt)}
                  className="w-full group text-left p-5 rounded-xl border border-steel-gray bg-white hover:border-deep-plum/20 hover:shadow-[0_0_0_1px_rgba(17,26,74,0.05),0_4px_12px_rgba(0,0,0,0.06)] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-fog-gray flex items-center justify-center group-hover:bg-deep-plum/5 transition-colors shrink-0">
                      <platform.icon size={20} className="text-deep-plum" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-blue">{platform.label}</p>
                      <p className="text-xs text-slate-text">{platform.description}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-text group-hover:text-deep-plum transition-colors" />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-fog-gray border border-steel-gray/50">
              <p className="text-xs text-slate-text leading-relaxed">
                <strong className="text-charcoal">No compatible hardware?</strong> Autoresearch requires an NVIDIA GPU or Apple Silicon Mac.
                Cloud GPU options (Lambda Labs, RunPod, Vast.ai) are available starting at ~$1/hour for an RTX 4090.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
