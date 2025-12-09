# HackJudge AI

> 🏆 **Autonomous Hackathon Review Agent** — Get instant, AI-powered feedback on your hackathon projects.

[![CI](https://github.com/your-username/hackjudge/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/hackjudge/actions/workflows/ci.yml)
[![CodeRabbit](https://img.shields.io/badge/CodeRabbit-AI_Review-blue?logo=github)](https://coderabbit.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

```
┌─────────────────────────────────────────────────┐
│  HackJudge AI                                   │
│  ════════════════════════════════════════════   │
│                                                 │
│  > Autonomous Hackathon Review Agent            │
│  > Powered by Kestra + Together AI              │
│                                                 │
└─────────────────────────────────────────────────┘
```

## ✨ Features

- **🔍 Multi-Agent Analysis** — 6 specialized AI agents evaluate your project
- **📊 Dimension Scoring** — Innovation, Technical, UX, Performance, Code Quality, Presentation
- **🎯 Hackathon Alignment** — Matches evaluation to your specific hackathon criteria
- **📝 Auto-Generated Content** — DevPost drafts, pitch scripts, architecture diagrams
- **⚡ Real-Time Progress** — Watch the evaluation as it happens
- **🖥️ Terminal Aesthetic** — Beautiful CLI-inspired design

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/hackjudge.git
cd hackjudge

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
hackjudge/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # GitHub OAuth
│   │   │   ├── evaluate/      # Evaluation endpoints
│   │   │   ├── projects/      # Project history
│   │   │   └── repos/         # GitHub repos
│   │   ├── dashboard/         # Dashboard page
│   │   └── report/[projectId] # Report page
│   ├── components/ui/         # Reusable UI components
│   ├── lib/                   # Utilities & helpers
│   └── types/                 # TypeScript interfaces
├── .coderabbit.yaml           # CodeRabbit configuration
├── .github/                   # GitHub templates & workflows
└── kestra/                    # Kestra workflow definitions
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS, Terminal aesthetic |
| **Orchestration** | Kestra (workflow engine) |
| **AI/LLM** | Together AI / OpenAI |
| **Deployment** | Vercel |
| **Code Review** | CodeRabbit |

## 📊 Evaluation Dimensions

```
┌─────────────────────────────────────────────────┐
│ DIMENSIONS                                      │
│ ────────────────────────────────────────────    │
│ Innovation:        78/100 [████████░░░░░░░░]   │
│ Technical:         85/100 [█████████░░░░░░░]   │
│ UX & Design:       81/100 [████████░░░░░░░░]   │
│ Performance:       62/100 [██████░░░░░░░░░░]   │
│ Code Quality:      87/100 [█████████░░░░░░░]   │
│ Presentation:      76/100 [███████░░░░░░░░░]   │
└─────────────────────────────────────────────────┘
```

## 🔄 How It Works

```
User Input          Kestra Pipeline           AI Agents           Output
    │                     │                       │                  │
    ▼                     ▼                       ▼                  ▼
┌─────────┐         ┌───────────┐          ┌───────────┐      ┌───────────┐
│ GitHub  │────────▶│Clone Repo │─────────▶│Code Agent │─────▶│  Judge    │
│  URL    │         │Build App  │          │UX Agent   │      │  Report   │
│         │         │Lighthouse │          │Perf Agent │      │           │
│ Rubric  │         │Screenshot │          │Product Ag │      │Improvements│
│  URL    │         │           │          │Present Ag │      │           │
└─────────┘         └───────────┘          └───────────┘      └───────────┘
```

## 🔧 Environment Variables

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# Together AI (for LLM agents)
TOGETHER_API_KEY=your_api_key

# Kestra (workflow orchestration)
KESTRA_API_URL=http://localhost:8080/api/v1
```

See `.env.example` for all available options.

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/github` | GET | GitHub OAuth redirect |
| `/api/repos` | GET | List user's repositories |
| `/api/evaluate` | POST | Start new evaluation |
| `/api/evaluate/[id]/status` | GET | Poll evaluation progress |
| `/api/evaluate/[id]/report` | GET | Fetch completed report |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

All PRs are automatically reviewed by [CodeRabbit](https://coderabbit.ai) for code quality.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon

Built for the **AI Agents Assemble Hackathon** (Dec 8–14, 2025).

### Sponsor Tools Used

- ✅ **Kestra** — Multi-step workflow orchestration
- ✅ **Vercel** — Frontend deployment
- ✅ **Together AI** — LLM inference
- ✅ **CodeRabbit** — AI code review

---

<p align="center">
  <strong>HackJudge AI</strong> — Ship with Confidence 🚀
</p>
