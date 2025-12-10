# HackJudge AI

> 🏆 **Autonomous Hackathon Review Agent** — Get instant, AI-powered feedback on your hackathon projects before the judges do.

[![CI](https://github.com/BishalJena/HackJudge/actions/workflows/ci.yml/badge.svg)](https://github.com/BishalJena/HackJudge/actions/workflows/ci.yml)
[![CodeRabbit](https://img.shields.io/badge/CodeRabbit-AI_Review-blue?logo=github)](https://coderabbit.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Kestra](https://img.shields.io/badge/Kestra-Orchestrated-5D4ED3)](https://kestra.io)
[![Together AI](https://img.shields.io/badge/Together_AI-Powered-FF6B6B)](https://together.xyz)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│   ██╗  ██╗ █████╗  ██████╗██╗  ██╗     ██╗██╗   ██╗██████╗  ██████╗ ███████╗  │
│   ██║  ██║██╔══██╗██╔════╝██║ ██╔╝     ██║██║   ██║██╔══██╗██╔════╝ ██╔════╝  │
│   ███████║███████║██║     █████╔╝      ██║██║   ██║██║  ██║██║  ███╗█████╗    │
│   ██╔══██║██╔══██║██║     ██╔═██╗ ██   ██║██║   ██║██║  ██║██║   ██║██╔══╝    │
│   ██║  ██║██║  ██║╚██████╗██║  ██╗╚█████╔╝╚██████╔╝██████╔╝╚██████╔╝███████╗  │
│   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝ ╚════╝  ╚═════╝ ╚═════╝  ╚═════╝ ╚══════╝  │
│                                                                               │
│   > Autonomous Hackathon Review Agent                                         │
│   > Powered by Kestra + Together AI + Multi-Agent Architecture                │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

## 🎯 What is HackJudge AI?

HackJudge AI is an **autonomous agent** that evaluates hackathon projects like a panel of expert judges would. Submit your GitHub repository, and our multi-agent system will analyze your code, UX, performance, documentation, and innovation — giving you actionable feedback *before* you present to real judges.

### The Problem

Hackathon participants often submit their projects without knowing how they'll be perceived by judges. Common questions include:
- *"Is my code quality good enough?"*
- *"Will judges understand what my project does?"*
- *"Am I using the sponsor tools correctly?"*
- *"What should I improve in my remaining time?"*

### Our Solution

HackJudge AI runs a **6-agent evaluation pipeline** orchestrated by **Kestra**, powered by **Together AI's LLMs**. Each agent specializes in a different evaluation dimension:

| Agent | Focus Areas |
|-------|-------------|
| 🔧 **Code Quality Agent** | Architecture, TypeScript usage, error handling, design patterns |
| 🎨 **UX & Design Agent** | Visual hierarchy, accessibility, responsiveness, color/typography |
| ⚡ **Performance Agent** | Lighthouse metrics, Core Web Vitals, bundle size, optimization |
| 💡 **Product Agent** | Innovation, market fit, problem clarity, hackathon relevance |
| 📝 **Presentation Agent** | README quality, documentation, demo readiness, OSS practices |
| 🏅 **Sponsor Agent** | Sponsor tool integration depth, award eligibility |

A **Meta-Judge** synthesizes all agent outputs into a cohesive report with:
- 📊 **Readiness Score** (0-100)
- 🎯 **Dimension Breakdown** (radar chart)
- ✅ **Prioritized Improvements** (ranked by impact vs. effort)
- 🏆 **Award Eligibility** analysis
- 📄 **Auto-generated DevPost draft** and **60-second pitch script**

---

## ✨ Key Features

### Multi-Agent AI Analysis
```
┌─────────────────────────────────────────────────────────────────┐
│                    EVALUATION PIPELINE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   GitHub Repo ──▶ Clone ──▶ Build ──▶ Analyze ──▶ Report       │
│                     │         │         │           │           │
│                     ▼         ▼         ▼           ▼           │
│               Metadata   Screenshots  Lighthouse  6 AI Agents   │
│               Extracted  Captured     Audit Run   in Parallel   │
│                                                                 │
│   Final Output: Comprehensive Judge Report + DevPost Draft      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Real-Time Progress Tracking
Watch your evaluation progress in real-time with Server-Sent Events (SSE):
- Live step-by-step updates
- Agent completion notifications
- Error reporting and graceful fallbacks

### Dimension Scoring
```
┌─────────────────────────────────────────────────┐
│ EVALUATION DIMENSIONS                           │
│ ────────────────────────────────────────────    │
│ Innovation:        78/100 [████████░░░░░░░░]   │
│ Technical:         85/100 [█████████░░░░░░░]   │
│ UX & Design:       81/100 [████████░░░░░░░░]   │
│ Performance:       62/100 [██████░░░░░░░░░░]   │
│ Code Quality:      87/100 [█████████░░░░░░░]   │
│ Presentation:      76/100 [███████░░░░░░░░░]   │
└─────────────────────────────────────────────────┘
```

### Content Generation
- **DevPost Submission Draft** — Ready-to-paste hackathon submission
- **60-Second Pitch Script** — Structured pitch with timing markers
- **Improvement Roadmap** — Prioritized list of quick wins

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.17+ 
- **npm** 9+
- **Docker** (for Kestra orchestration)

### Installation

```bash
# Clone the repository
git clone https://github.com/BishalJena/HackJudge.git
cd HackJudge

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env` file with the following:

```bash
# GitHub OAuth (for repository access)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Together AI (powers the AI agents)
TOGETHER_API_KEY=your_together_api_key

# Kestra (workflow orchestration)
KESTRA_API_URL=http://localhost:8080/api/v1

# Optional: OpenAI as fallback
OPENAI_API_KEY=your_openai_api_key
```

### Running with Kestra (Full Pipeline)

```bash
# Start Kestra (workflow engine)
cd kestra
docker-compose up -d

# Kestra UI available at http://localhost:8080
```

See [`kestra/README.md`](kestra/README.md) for detailed Kestra setup instructions.

---

## 📁 Project Structure

```
hackjudge/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # GitHub OAuth endpoints
│   │   │   ├── evaluate/      # Evaluation trigger & status
│   │   │   ├── projects/      # Project history
│   │   │   └── repos/         # GitHub repo listing
│   │   ├── dashboard/         # Evaluation dashboard page
│   │   └── report/[projectId] # Evaluation report page
│   │
│   ├── components/            # React Components
│   │   └── ui/                # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── ProgressBar.tsx
│   │       └── RadarChart.tsx
│   │
│   ├── hooks/                 # Custom React Hooks
│   │   ├── useEvaluation.ts   # Evaluation state management
│   │   └── useSSE.ts          # Server-Sent Events hook
│   │
│   ├── lib/                   # Core Utilities
│   │   ├── evaluation.ts      # Evaluation orchestration
│   │   ├── llm.ts             # LLM client (Together AI/OpenAI)
│   │   ├── prompts.ts         # Agent prompt templates
│   │   ├── kestra.ts          # Kestra API integration
│   │   └── github.ts          # GitHub API utilities
│   │
│   └── types/                 # TypeScript Definitions
│       └── index.ts           # All type interfaces
│
├── kestra/                    # Kestra Workflow Definitions
│   ├── docker-compose.yml     # Kestra + PostgreSQL setup
│   ├── flows/
│   │   └── evaluate-hackathon-project.yaml  # Main evaluation flow
│   └── README.md              # Kestra setup guide
│
├── .github/                   # GitHub Configuration
│   ├── workflows/             # CI/CD workflows
│   └── ISSUE_TEMPLATE/        # Issue templates
│
└── .coderabbit.yaml           # CodeRabbit AI review config
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16, React 19 | Modern React with App Router |
| **Language** | TypeScript 5 | Type-safe development |
| **Styling** | Tailwind CSS 4 | Utility-first styling |
| **Testing** | Jest 30, RTL | Unit & integration tests |
| **Orchestration** | Kestra | Multi-step workflow engine |
| **AI/LLM** | Together AI | Multi-agent LLM inference |
| **Code Review** | CodeRabbit | Automated PR reviews |
| **Deployment** | Vercel | Edge-optimized hosting |

---

## 🔄 How It Works

### Evaluation Flow

```
 User Input          Kestra Pipeline           AI Agents           Output
     │                     │                       │                  │
     ▼                     ▼                       ▼                  ▼
┌─────────┐         ┌───────────┐          ┌───────────┐      ┌───────────┐
│ GitHub  │         │ Clone     │          │ Code Agent│      │ Readiness │
│ Repo URL│────────▶│ Repository│          │ UX Agent  │      │ Score     │
│         │         │           │          │ Perf Agent│      │           │
│ Rubric  │         │ Extract   │          │ Product   │      │ Dimension │
│ URL     │────────▶│ Metadata  │─────────▶│ Present   │─────▶│ Scores    │
│ (opt)   │         │           │          │ Sponsor   │      │           │
│         │         │ Build &   │          │           │      │ DevPost   │
│         │         │ Screenshot│          │ Meta-Judge│      │ Draft     │
│         │         │ Lighthouse│          │ Aggregator│      │           │
└─────────┘         └───────────┘          └───────────┘      └───────────┘
```

### Agent Scoring Weights

The Meta-Judge uses these weights to calculate the final readiness score:

| Dimension | Weight |
|-----------|--------|
| Innovation | 15% |
| Technical Implementation | 20% |
| UX & Design | 15% |
| Performance | 15% |
| Code Quality | 20% |
| Presentation | 15% |

### Readiness Status Levels

| Score Range | Status | Meaning |
|-------------|--------|---------|
| 85-100 | 🟢 **STRONG** | Ready to win! Minor polish only. |
| 70-84 | 🟡 **GOOD** | Competitive submission with room for improvement. |
| 50-69 | 🟠 **NEEDS_WORK** | Core functionality present, significant gaps exist. |
| 0-49 | 🔴 **WEAK** | Major issues need addressing before submission. |

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/github` | GET | GitHub OAuth redirect |
| `/api/repos` | GET | List user's GitHub repositories |
| `/api/evaluate` | POST | Start new evaluation |
| `/api/evaluate/[id]/status` | GET | Poll evaluation progress |
| `/api/evaluate/[id]/stream` | GET | SSE real-time progress stream |
| `/api/evaluate/[id]/report` | GET | Fetch completed evaluation report |

### Example: Trigger Evaluation

```bash
curl -X POST http://localhost:3000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/owner/repo",
    "branch": "main",
    "hackathonUrl": "https://devpost.com/hackathons/example"
  }'
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Coverage

| Category | Coverage |
|----------|----------|
| Statements | 77% |
| Branches | 73% |
| Functions | 85% |
| Lines | 77% |

---

## 🏆 Hackathon

Built for the **AI Agents Assemble Hackathon** (December 8–14, 2025).

### Sponsor Tools Integration

| Sponsor | Integration | Description |
|---------|-------------|-------------|
| ✅ **Kestra** | Core | Full evaluation pipeline orchestration with 8 workflow tasks |
| ✅ **Together AI** | Core | Powers all 6 AI agents + Meta-Judge via Llama 3.1 70B |
| ✅ **Vercel** | Deployment | Frontend hosting with Edge Functions |
| ✅ **CodeRabbit** | DevOps | Automated AI code review on all PRs |

### Why These Tools?

- **Kestra** enables complex multi-step workflows with parallel agent execution, Docker sandboxing, and artifact management — essential for the evaluation pipeline.
- **Together AI** provides fast, cost-effective inference for running 6+ LLM agents in parallel with the Llama 3.1 70B Instruct model.
- **CodeRabbit** ensures code quality is maintained even during rapid hackathon development.

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

All PRs are automatically reviewed by [CodeRabbit](https://coderabbit.ai) for code quality.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📚 Additional Documentation

- [Kestra Setup Guide](kestra/README.md) — Detailed workflow orchestration setup
- [Contributing Guide](CONTRIBUTING.md) — How to contribute to HackJudge AI
- [Code of Conduct](CODE_OF_CONDUCT.md) — Community guidelines
- [Changelog](CHANGELOG.md) — Version history and release notes

---

<p align="center">
  <strong>HackJudge AI</strong> — Ship with Confidence 🚀<br/>
  <em>Know your score before the judges do.</em>
</p>
