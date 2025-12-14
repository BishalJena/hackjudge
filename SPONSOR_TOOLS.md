# HackJudge AI — Sponsor Tool Usage

> **AI Agents Assemble Hackathon Submission**
> This document explains exactly how HackJudge AI qualifies for each sponsor award track.

---

## 🏆 The Infinity Build Award — $5,000

> **Requirement:** Your project must use Cline CLI. Cline must be used to build capabilities on top of the CLI that improve the software development experience, and your project should demonstrate complete, working automation tools built through the CLI.

### How We Used Cline

Cline was our **primary development partner** throughout HackJudge. It didn't just assist—it **autonomously built complete, working automation tools** that directly improve the software development experience for hackathon participants.

#### Complete Automation Tools Built with Cline

| Tool | What It Does | File |
|------|-------------|------|
| **One-Click CI/CD Setup** | Creates a GitHub Actions workflow, pushes to a new branch, and opens a PR—all with one button | [`src/app/api/github/push-workflow/route.ts`](src/app/api/github/push-workflow/route.ts) |
| **Selective Issue Creator** | Lets users select specific improvements via checkboxes and batch-creates GitHub issues | [`src/app/api/github/create-issues/route.ts`](src/app/api/github/create-issues/route.ts) |
| **Firecrawl Hackathon Scraper** | Scrapes any hackathon page (DevPost, custom sites) to extract judging criteria | [`src/lib/hackathon-scraper.ts`](src/lib/hackathon-scraper.ts) |
| **Exa Web Search Integration** | Auto-searches GitHub, StackOverflow, MDN when chat questions need web context | [`src/lib/exa.ts`](src/lib/exa.ts) |
| **6-Agent Evaluation Pipeline** | Multi-agent system with specialized prompts for code, UX, performance, innovation | [`src/lib/evaluation.ts`](src/lib/evaluation.ts) |

#### How These Tools Improve Developer Experience

1. **CI/CD Pusher** → Eliminates manual YAML writing. One click = production-ready workflow
2. **Issue Creator** → Converts AI feedback into actionable GitHub issues automatically
3. **Hackathon Scraper** → Ingests judging criteria so AI evaluates against actual requirements
4. **Exa Search** → Provides web-sourced answers with citations for coding questions
5. **Multi-Agent Pipeline** → Parallelized evaluation across 6 specialized AI agents

#### Evidence of Cline Usage

- **Commit History**: The majority of production code was generated through Cline sessions
- **Complete Tools**: All automation features are fully functional, not prototypes
- **7-Day Build**: 2-week project scope completed in 7 days using Cline

### Evidence Links
- [push-workflow API](src/app/api/github/push-workflow/route.ts)
- [create-issues API](src/app/api/github/create-issues/route.ts)
- [Firecrawl integration](src/lib/firecrawl.ts)
- [Exa search integration](src/lib/exa.ts)
- [Evaluation pipeline](src/lib/evaluation.ts)
- [Prompt engineering](src/lib/prompts.ts)

---

## 🏆 The Wakanda Data Award — $4,000

> **Requirement:** Your project must use Kestra's built-in AI Agent to summarise data from other systems, with bonus credit if your agent can make decisions based on the summarised data.

### How We Used Kestra's AI Agent

Kestra orchestrates HackJudge's **intelligent evaluation pipeline** where an AI agent summarizes data from multiple systems and makes autonomous decisions.

#### ✅ Data Summarization from Multiple Systems

Our Kestra flow (`evaluate-hackathon-project`) uses `io.kestra.plugin.openai.ChatCompletion` to summarize data from:

| Data Source | What's Extracted |
|-------------|-----------------|
| **GitHub Repository** | File structure, language breakdown, commit patterns |
| **npm audit** | Security vulnerabilities (critical/high/moderate/low counts) |
| **Code Analysis** | TypeScript strictness, test coverage, design patterns |
| **README.md** | Documentation quality, setup instructions, demo links |
| **package.json** | Dependencies, scripts, build configuration |

The AI agent synthesizes this into:
- Executive summary (2-3 sentences)
- Top 3 strengths with evidence citations
- Top 3 improvements ranked by impact
- Overall readiness score (0-100) with justification

#### ✅ BONUS: Decision-Making Based on Summarized Data

The Kestra AI agent makes **autonomous decisions**:

| Decision | How It Works |
|----------|-------------|
| **Classification** | Categorizes projects as STRONG (80+), GOOD (60-79), NEEDS_WORK (40-59), WEAK (<40) based on aggregated scores |
| **Priority Ranking** | Ranks improvements by impact/effort ratio to tell users what to fix FIRST |
| **Award Eligibility** | Determines which hackathon award tracks the project qualifies for |
| **Issue Creation** | Decides what GitHub issues to create based on weakness severity |

#### Kestra Flows

| Flow | Purpose | File |
|------|---------|------|
| `evaluate-hackathon-project` | Main evaluation pipeline with AI summarization | [`kestra/flows/main_hackjudge.evaluate-hackathon-project.yml`](kestra/flows/main_hackjudge.evaluate-hackathon-project.yml) |
| `create-github-issue` | Creates issues using `io.kestra.plugin.github.issues.Create` | [`kestra/flows/main_hackjudge.create-github-issue.yml`](kestra/flows/main_hackjudge.create-github-issue.yml) |
| `setup-cicd` | Creates CI/CD PRs using GitHub API | [`kestra/flows/main_hackjudge.setup-cicd.yml`](kestra/flows/main_hackjudge.setup-cicd.yml) |

#### Live Kestra Instance
- **URL**: `http://143.110.240.38:8080`
- **Namespace**: `hackjudge`
- Running on DigitalOcean Droplet with PostgreSQL backend

### Evidence Links
- [Evaluation flow](kestra/flows/main_hackjudge.evaluate-hackathon-project.yml)
- [Create issue flow](kestra/flows/main_hackjudge.create-github-issue.yml)
- [Setup CI/CD flow](kestra/flows/main_hackjudge.setup-cicd.yml)

---

## 🏆 The Iron Intelligence Award — $3,000

> **Requirement:** Your project must use the Oumi open-source library and must include Oumi's Reinforcement Learning fine-tuning features as part of your submission.

### Status: Not Applying

HackJudge uses inference-only LLMs via Together AI and OpenRouter. We did not use Oumi's RL fine-tuning features for this project.

---

## 🏆 The Stormbreaker Deployment Award — $2,000

> **Requirement:** Your project must be deployed on Vercel, and the deployment must be live. Any standard Vercel deployment qualifies.

### Live Deployment

🔗 **https://hack-judge-drab.vercel.app**

### Deployment Details

| Aspect | Details |
|--------|---------|
| **Framework** | Next.js 15 with App Router |
| **Deployment** | `vercel --prod` with automatic HTTPS |
| **API Routes** | 15+ serverless functions |
| **Streaming** | SSE for real-time evaluation progress |
| **OAuth** | GitHub OAuth fully functional |

### API Routes Running on Vercel

| Route | Function |
|-------|----------|
| `/api/evaluate` | Triggers evaluation pipeline |
| `/api/chat` | AI chat with Exa web search |
| `/api/github/repos` | Lists user repositories |
| `/api/github/push-workflow` | Creates CI/CD PR |
| `/api/github/create-issues` | Batch creates issues |
| `/api/hackathon/scrape` | Firecrawl integration |
| `/api/auth/github/*` | OAuth flow |

### Performance

- ⚡ Fast cold starts with Vercel Functions
- 🌍 Global CDN distribution
- 🔒 Secure environment variable management
- 📱 Responsive terminal-style UI on all devices

### Evidence Links
- [Live Deployment](https://hack-judge-drab.vercel.app)
- [package.json](package.json)
- [API routes directory](src/app/api/)

---

## 🏆 The Captain Code Award — $1,000

> **Requirement:** Your repository must demonstrate the use of CodeRabbit for PR reviews, code quality improvements, documentation, and open-source best practices. CodeRabbit activity should be clearly visible.

### CodeRabbit Configuration

We use CodeRabbit's **assertive review mode** with custom path instructions:

```yaml
# .coderabbit.yaml
reviews:
  profile: "assertive"
  path_instructions:
    - path: "kestra/**"
      instructions: "Focus on best practices, error handling, timeout configs"
    - path: "src/**/*.ts"
      instructions: "Ensure type safety, no 'any' types, proper error handling"
```

### PR Reviews by CodeRabbit

| PR | Description | Files Changed | CodeRabbit Feedback |
|----|-------------|--------------|-------------------|
| [#1](https://github.com/BishalJena/hackjudge/pull/1) | Kestra File Sharing Fix | 3 | Fixed CI permissions, WorkingDirectory pattern, error handling |
| [#2](https://github.com/BishalJena/hackjudge/pull/2) | Kestra AI Integration | 15 | Fixed timeout config, JSON validation, typed exceptions, retry logic |
| [#3](https://github.com/BishalJena/hackjudge/pull/3) | Phase 5 - GitHub Actions, Chat, Scraping | **110+** | Multiple review iterations covering API routes, security, UI components |

### PR #3 Details (Major Release)

This was our **largest PR** with CodeRabbit providing extensive feedback:

**Features Reviewed:**
- One-click CI/CD push via `/api/github/push-workflow`
- Batch issue creation via `/api/github/create-issues`
- Hackathon URL scraping from any site
- Vision detection with user confirmation
- Concise 200-word chat responses

**CodeRabbit Review Iterations:**
- Multiple rounds of feedback on API route security
- Error handling improvements in GitHub integrations
- Type safety in hackathon scraper
- SSE streaming best practices
- Component architecture suggestions

### Issues Caught by CodeRabbit (All PRs)

- ✅ Missing error handling in webhook callbacks
- ✅ Infinite wait risk in timeout configuration
- ✅ Missing JSON schema validation
- ✅ Bare exception handlers → typed exceptions
- ✅ Missing exponential retry on API calls
- ✅ CI permissions for GitHub Actions
- ✅ Security concerns in API routes (PR #3)
- ✅ Type safety in UI components (PR #3)

### Open Source Best Practices

| Practice | Evidence |
|----------|----------|
| **Comprehensive README** | [README.md](README.md) with ASCII art, badges, setup instructions, feature docs |
| **CHANGELOG** | [CHANGELOG.md](CHANGELOG.md) maintained for each version (v0.1.0 → v2.2.0) |
| **License** | MIT License |
| **CI/CD** | GitHub Actions workflow with build, lint, test |
| **.coderabbit.yaml** | Custom review configuration |
| **Clean PR Descriptions** | Context-rich PR descriptions with screenshots |

### Final Code Quality

- 0 linting errors
- Full TypeScript type safety
- 20+ issues caught before merge across 3 PRs

### Evidence Links
- [PR #1 - Kestra File Sharing](https://github.com/BishalJena/hackjudge/pull/1)
- [PR #2 - Kestra AI Integration](https://github.com/BishalJena/hackjudge/pull/2)
- [PR #3 - Phase 5: GitHub Actions, Chat, Scraping (110+ files)](https://github.com/BishalJena/hackjudge/pull/3)
- [.coderabbit.yaml](https://github.com/BishalJena/hackjudge/blob/main/.coderabbit.yaml)
- [CHANGELOG.md](CHANGELOG.md)
- [README.md](README.md)

---

## Summary

| Track | Prize | Applying | Key Evidence |
|-------|-------|----------|--------------|
| **Infinity Build (Cline)** | $5,000 | ✅ Yes | 5+ complete automation tools built with Cline |
| **Wakanda Data (Kestra)** | $4,000 | ✅ Yes | AI summarization + decision-making (bonus criteria) |
| **Iron Intelligence (Oumi)** | $3,000 | ❌ No | Uses inference-only LLMs |
| **Stormbreaker (Vercel)** | $2,000 | ✅ Yes | Live at hack-judge-drab.vercel.app |
| **Captain Code (CodeRabbit)** | $1,000 | ✅ Yes | **3 PRs reviewed (110+ files in PR#3), 20+ issues caught** |

**Total potential: $12,000** (applying for 4 tracks)

