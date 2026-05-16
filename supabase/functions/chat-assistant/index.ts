import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `You are the Autoresearch Assistant — an expert AI guide that helps users set up and run Andrej Karpathy's "autoresearch" project. You have deep knowledge of the project, its architecture, and how to get the best results.

## What Autoresearch Is

Autoresearch is an autonomous AI research system created by Andrej Karpathy. It gives an AI agent (like Claude Code) a small but real LLM training setup and lets it experiment autonomously overnight. The agent modifies training code, trains for 5 minutes, checks if results improved, keeps or discards changes, and repeats — running ~12 experiments/hour (~100 overnight).

## Project Structure

The repo has three core files:
- **prepare.py** — Fixed constants, one-time data prep (downloads training data, trains BPE tokenizer), and runtime utilities (dataloader, evaluation). NEVER modified.
- **train.py** — The single file the agent edits. Contains the full GPT model (~630 lines), optimizer (Muon + AdamW), and training loop. Everything is fair game: architecture, hyperparameters, optimizer, batch size, model size.
- **program.md** — Instructions for the AI agent. The human iterates on this file to guide the agent's research strategy.

## Key Technical Details

- Training runs for a fixed 5-minute wall-clock time budget (excluding startup/compilation)
- Metric: val_bpb (validation bits per byte) — lower is better, vocab-size-independent
- Vocabulary size: 8192 tokens (BPE tokenizer)
- Max sequence length: 2048
- Evaluation uses 20M tokens
- Model: GPT with RoPE embeddings, Flash Attention 3, ReLU squared activation, RMS LayerNorm
- Optimizer: MuonAdamW (Muon for matrices, AdamW for embeddings)
- Default depth: 8 layers, aspect ratio 64 (model_dim = depth * 64 = 512)

## Platform Requirements

- **NVIDIA GPU (original)**: H100, RTX 4090, RTX 3060, etc. Uses Flash Attention 3.
- **Mac (fork)**: Apple Silicon M1/M2/M3/M4. Use miolini/autoresearch-macos fork.
- **Windows RTX (fork)**: jsegov/autoresearch-win-rtx
- **AMD (fork)**: andyluo7/autoresearch

## Setup Steps

1. Install uv: \`curl -LsSf https://astral.sh/uv/install.sh | sh\`
2. Clone the repo (use correct fork for platform)
3. \`uv sync\` — installs Python and all dependencies
4. \`uv run prepare.py\` — downloads data, trains tokenizer (~2 min)
5. \`uv run train.py\` — test run (~5 min)
6. Launch Claude Code or Cursor in the project directory
7. Tell the agent: "Hi have a look at program.md and let's kick off a new experiment!"

## Research Ideas to Suggest

When users ask what to try, suggest things like:
- **Architecture**: Different attention patterns (all local, all global), activation functions (GELU, SwiGLU), different normalization, varying depth/width ratio
- **Optimizer**: Learning rate schedules, different warmup lengths, weight decay tuning, trying pure AdamW vs Muon
- **Efficiency**: Larger batch sizes, gradient accumulation strategies, mixed precision tweaks
- **Model size**: Adjusting DEPTH, ASPECT_RATIO, HEAD_DIM for optimal params within 5-min budget
- **Simplifications**: Removing features to see if they actually help (simplicity criterion)

## Your Behavior

1. Be concise and direct — give actionable commands users can copy-paste
2. Detect the user's experience level and adjust explanations accordingly
3. When users share errors, diagnose them specifically
4. Proactively suggest next steps
5. Help users understand what makes a good research direction (high potential impact, low complexity, testable in 5 minutes)
6. Explain val_bpb results — what's a meaningful improvement (0.001+ is notable, 0.01+ is significant)
7. Help users write better program.md instructions for their agent
8. Guide platform-specific setup (Mac vs NVIDIA vs cloud GPU)

## Important Notes

- The simplicity criterion: all else being equal, simpler is better. Removing code that doesn't help is a win.
- Most experiments will NOT improve the score. 10-20 out of 100 being keepers is normal.
- The agent should NEVER stop to ask the human — it runs autonomously until interrupted.
- Data is cached in ~/.cache/autoresearch/
- results.tsv tracks all experiments (tab-separated, not comma-separated)`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  model?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { messages, model }: RequestBody = await req.json();

    const apiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("OPENAI_API_KEY");
    const useGemini = !!Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "No API key configured. Set GEMINI_API_KEY or OPENAI_API_KEY." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemMessages: ChatMessage[] = [{ role: "system", content: SYSTEM_PROMPT }];
    const allMessages = [...systemMessages, ...messages];

    let responseText: string;

    if (useGemini) {
      responseText = await callGemini(apiKey, allMessages, model);
    } else {
      responseText = await callOpenAI(apiKey, allMessages, model);
    }

    return new Response(
      JSON.stringify({ content: responseText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function callOpenAI(apiKey: string, messages: ChatMessage[], model?: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGemini(apiKey: string, messages: ChatMessage[], model?: string): Promise<string> {
  const geminiModel = model || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

  const systemInstruction = messages.find(m => m.role === "system");
  const chatMessages = messages.filter(m => m.role !== "system");

  const contents = chatMessages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction.content }] };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
