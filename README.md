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
- 🔗 **GitHub Actions** — Create issues & CI/CD PRs directly from the report
- 🏆 **Award Eligibility** analysis
- 📄 **Auto-generated DevPost draft** and **60-second pitch script**

---

## ✨ Key Features

### 💬 Chat with Codebase (v2.0)
Ask questions about your code and get AI-powered suggestions:
- Floating chat panel on report page
- Context-aware responses using extracted code snippets
- Streaming responses for real-time feedback
- **🔍 Exa Web Search** (v2.2): Auto-searches GitHub, StackOverflow, MDN for relevant answers

### 🎫 Selective Issue Creation (v2.2)
Create GitHub issues for specific improvements:
- Checkbox selection for each improvement
- Inline interactive UI in chat area
- "CREATE X ISSUES" with select all option
- Issues created with proper labels and formatting

### 🔥 Firecrawl Integration (v2.2)
Fast, reliable hackathon page scraping:
- JS-rendered page support for dynamic content
- Better DevPost and custom hackathon page extraction
- Graceful fallback to basic fetch

### 🔒 Security Scanning (v2.0)
Automatic vulnerability detection:
- **npm audit** integration
- Security score (0-100) based on vulnerability severity
- Counts: critical, high, moderate, low vulnerabilities

### 🔄 CI/CD Detection (v2.0)
Evaluate deployment readiness:
- GitHub Actions, GitLab CI, Jenkins detection
- Docker/docker-compose configuration
- Deploy configs (Vercel, Netlify, Fly.io, Render)


### Multi-Agent AI Analysis
```
┌─────────────────────────────────────────────────────────────────┐
│                    EVALUATION PIPELINE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   GitHub Repo ──▶ Clone ──▶ Analyze ──▶ AI Agents ──▶ Report   │
│                     │         │            │             │      │
│                     ▼         ▼            ▼             ▼      │
│               Security    CI/CD       6 Specialized   Chat     │
│               Scan        Check       Agents          Context  │
│                                                                 │
│   Final Output: Comprehensive Report + Chat with Codebase       │
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
│ Security:          95/100 [██████████░░░░░░]   │
└─────────────────────────────────────────────────┘
```

### Content Generation
- **DevPost Submission Draft** — Ready-to-paste hackathon submission
- **60-Second Pitch Script** — Structured pitch with timing markers
- **Improvement Roadmap** — Prioritized list of quick wins

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Required For |
|-------------|---------|--------------|
| **Node.js** | 18.17+ | Frontend & API |
| **npm** | 9+ | Package management |
| **Docker** | 20+ | Kestra orchestration (optional) |
| **Docker Compose** | 2.0+ | Kestra + PostgreSQL (optional) |

> **Note:** Docker is optional. Without Kestra, the app runs in **LLM Fallback Mode** which uses direct AI calls instead of the full workflow pipeline.

---

### Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/BishalJena/HackJudge.git
cd HackJudge

# Install dependencies
npm install
```

---

### Step 2: Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
# ========== REQUIRED ==========

# GitHub OAuth App (create at https://github.com/settings/developers)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Provider (get key at https://api.together.xyz or https://openrouter.ai)
OPENAI_API_KEY=your_together_or_openrouter_api_key

# ========== OPTIONAL (for Kestra mode) ==========

# Kestra API endpoint
KESTRA_API_URL=http://localhost:8080/api/v1
```

#### Creating a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name:** `HackJudge AI (Local)`
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/github/callback`
4. Copy **Client ID** and generate a new **Client Secret**

---

### Step 3: Run the Application

#### Option A: Full Kestra Mode (Recommended)

For the complete 6-step evaluation pipeline with security scanning:

```bash
# Terminal 1: Start Kestra (Docker required)
cd kestra
docker-compose up -d

# Wait for Kestra to be ready (check http://localhost:8080)
# Then deploy the workflow
docker exec -i kestra-kestra-1 kestra flow namespace update hackjudge flows/

# Terminal 2: Start the Next.js app
cd ..
npm run dev
```

**Kestra Dashboard:** [http://localhost:8080](http://localhost:8080)

#### Option B: LLM Fallback Mode (No Docker)

If you don't have Docker or just want to run quickly:

```bash
npm run dev
```

This runs a 4-step AI evaluation using direct LLM calls (no security scanning).

---

### Step 4: Open the App

Open [http://localhost:3000](http://localhost:3000) in your browser.

1. Click **Sign in with GitHub**
2. Select a repository from your account
3. Click **EXECUTE** to start evaluation
4. View real-time progress and final report

---

### Troubleshooting

| Issue | Solution |
|-------|----------|
| `Kestra not available, using mock mode` | Normal if Docker/Kestra isn't running - uses LLM fallback |
| `ECONNREFUSED` on port 8080/8081 | Start Kestra: `cd kestra && docker-compose up -d` |
| GitHub OAuth fails | Check callback URL matches exactly in GitHub settings |
| `401` on `/api/github/repos` | Sign in with GitHub first |
| Infinite 401 requests | Clear cookies for localhost:3000 and refresh |

---

### Docker Commands Reference

```bash
# Start Kestra
cd kestra && docker-compose up -d

# View Kestra logs
docker-compose logs -f kestra

# Stop Kestra
docker-compose down

# Reset Kestra (remove all data)
docker-compose down -v
```

See [`kestra/README.md`](kestra/README.md) for detailed Kestra configuration.

---

## 📁 Project Structure

```
hackjudge/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # GitHub OAuth endpoints
│   │   │   ├── chat/          # 💬 Chat with Codebase API (v2.0)
│   │   │   ├── evaluate/      # Evaluation trigger & status
│   │   │   ├── github/        # 🔗 Repos & branches APIs (v2.0)
│   │   │   └── kestra/        # Kestra callback endpoint
│   │   ├── dashboard/         # Evaluation dashboard page
│   │   └── report/[projectId] # Evaluation report page
│   │
│   ├── components/            # React Components
│   │   ├── ChatPanel.tsx      # 💬 Floating chat panel (v2.0)
│   │   └── ui/                # Reusable UI components
│   │
│   ├── lib/                   # Core Utilities
│   │   ├── evaluation.ts      # Evaluation orchestration
│   │   ├── llm.ts             # LLM client (OpenRouter/Together AI)
│   │   ├── kestra.ts          # Kestra API + report transform
│   │   ├── store.ts           # In-memory evaluation store
│   │   └── github.ts          # GitHub API utilities
│   │
│   └── types/                 # TypeScript Definitions
│       └── index.ts           # All type interfaces (incl. security, cicd)
│
├── kestra/                    # Kestra Workflow Definitions
│   ├── docker-compose.yml     # Kestra + PostgreSQL setup
│   ├── flows/
│   │   └── main_hackjudge.evaluate-hackathon-project.yml  # Main flow
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
| `/api/github/repos` | GET | List user's GitHub repositories (v2.0) |
| `/api/github/branches` | GET | List branches for a repository (v2.0) |
| `/api/github/create-issue` | POST | 🔗 Create GitHub issue for improvement (v2.1) |
| `/api/github/setup-cicd` | POST | 🔗 Create CI/CD PR via Kestra (v2.1) |
| `/api/evaluate` | POST | Start new evaluation |
| `/api/evaluate/[id]/status` | GET | Poll evaluation progress |
| `/api/evaluate/[id]/stream` | GET | SSE real-time progress stream |
| `/api/evaluate/[id]/report` | GET | Fetch completed evaluation report |
| `/api/chat` | POST | 💬 Chat with codebase (v2.0) |

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
