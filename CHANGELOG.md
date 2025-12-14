# Changelog

All notable changes to HackJudge AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

#### 🎨 Landing Page Layout
- **Row-Based Layout**: Labels (SYSTEM, MISSION, TARGET, CONFIG, HACKATHON) now properly align with content using flex rows
- **Animation Fix**: TypeShuffle runs only once per mount, preventing re-animation on state changes
- **Jitter Prevention**: Added minHeight to animated sections to prevent layout shift
- **Hackathon Panel**: Shows ALL judging criteria in a bordered panel (removed 3-item limit)

## [2.2.0] - 2025-12-14

### Added

#### 🔥 Firecrawl Integration
- **Fast Web Scraping**: Uses Firecrawl for JS-rendered hackathon page scraping
- **Reliable Extraction**: Better handling of dynamic DevPost and custom pages
- **Graceful Fallback**: Falls back to basic fetch if Firecrawl not configured
- **New File**: `src/lib/firecrawl.ts` with `scrapeWithFirecrawl()` utility

#### 🔍 Exa AI Web Search
- **Smart Search**: Auto-detects when chat questions need web search
- **Developer-Focused**: Searches GitHub, StackOverflow, MDN, dev.to
- **Source Citations**: AI responses include relevant source links
- **New File**: `src/lib/exa.ts` with `searchExa()` utility

#### 🎫 Selective Issue Creation
- **Checkbox Selection**: Pick specific improvements to create as GitHub issues
- **Inline in Chat**: Improvements appear as interactive message in chat area
- **Create Button**: "CREATE X ISSUES" button only appears when items selected
- **Select All**: Quick button to select all improvements

### Changed

#### 🎨 UI Improvements
- **Improvements in Chat**: Moved from fixed panel to scrollable chat message
- **SEND Button**: Always visible with bright green styling
- **CI/CD Button**: Changed from blue to green for consistent terminal theme
- **Better Layout**: Chat area now fully scrollable with input always visible

#### 🧹 Cleanup
- **Removed plugin-github**: Removed unused Kestra plugin-github submodule
- **Demo Files Hidden**: Demo project and deployment guide in gitignore

---

## [2.1.0] - 2025-12-13


### Added

#### 🔗 User-Controlled GitHub Actions
- **[CREATE_ISSUE] Buttons**: Individual buttons on each improvement to create GitHub issues
- **[SETUP_CI_CD] Button**: One-click CI/CD pipeline setup via PR
- **[CREATE_ALL_X_ISSUES] Button**: Bulk issue creation for all improvements
- **GitHub Actions Panel**: New section on report page for GitHub integrations

#### 🐆 Kestra GitHub Plugin Flows
- **create-github-issue.yml**: On-demand issue creation via `io.kestra.plugin.github.issues.Create`
- **setup-cicd.yml**: On-demand CI/CD PR creation via `io.kestra.plugin.github.pulls.Create`
- **API Triggers**: New endpoints trigger Kestra flows instead of direct GitHub API calls

### Fixed

#### 🔧 Kestra Flow Bug Fixes
- **Missing `requests` dependency**: Added to `analyze_project` task `beforeCommands`
- **Invalid YAML syntax**: Removed obsolete GitHub tasks with Jinja templates in boolean fields
- **Flow revision**: Updated to revision 19 with all fixes applied

#### 🎨 Report Page Improvements
- **Repo URL Display**: Shows repository URL in report metadata
- **Component Import Fix**: Corrected `ChatPanel` import (was `MentorUplink`)
- **Type Safety**: Added `repoUrl` field to `EvaluationResult` interface

### Changed
- **GitHub actions are now user-initiated** instead of automatic post-evaluation
- **Kestra-first architecture**: All GitHub operations route through Kestra for audit trail

---

## [2.0.0] - 2025-12-12

### Added

#### 🆕 Chat with Codebase
- **AI Chat Panel**: Floating chat UI on report page to ask questions about your code
- **Streaming Responses**: Real-time SSE streaming using OpenRouter/Gemini
- **Code Context Extraction**: Kestra extracts up to 15 key source files for chat context
- **Suggested Questions**: Quick-start questions for common queries

#### 🔒 Security Scanning
- **npm audit Integration**: Automatic vulnerability scanning during evaluation
- **Security Score**: 0-100 score based on critical/high/moderate vulnerabilities
- **Vulnerability Summary**: Counts by severity level in final report

#### 🔄 CI/CD Detection
- **GitHub Actions Detection**: Checks for `.github/workflows/` directory
- **Docker Support**: Detects `Dockerfile` and `docker-compose.yml`
- **Deploy Configs**: Detects Vercel, Netlify, Fly.io, Render, Railway configs
- **CI/CD Status**: Included in evaluation dimensions

#### 📋 Vision/Idea Clarity Assessment
- **README Parsing**: Extracts Problem, Solution, Features, Vision sections
- **Clarity Score**: Rates how well the project vision is communicated
- **Enhanced Product Agent**: Now evaluates project vision alongside innovation

#### 🔗 GitHub Integration Improvements
- **Repository Dropdown**: After OAuth, select repos from dropdown (no URL pasting)
- **Branch Selector**: Choose specific branches for evaluation
- **Consolidated Landing Page**: Merged landing and dashboard into single flow

#### ⚙️ Kestra Flow Sync
- **Local Flow Synchronization**: Edit YAML files locally, auto-syncs to Kestra UI
- **Correct Configuration**: Uses `micronaut.io.watch` with proper file naming
- **File Naming Convention**: `main_<namespace>.<flowId>.yml` format

### Changed
- **Awards Section**: Only shows when relevant awards exist (hides for non-hackathon use)
- **Landing Page**: Consolidated with analysis options (Security Scan, CI/CD Check toggles)
- **Report Types**: Added `security` and `cicdStatus` to EvaluationResult interface

### Fixed
- **GitHub Token Cookie**: Fixed cookie name mismatch (`github_access_token` → `github_token`)
- **Select Component**: Fixed onChange signature to pass value directly
- **Toggle Component**: Removed unsupported `description` prop usage

## [0.3.0] - 2025-12-10

### Added

#### Kestra Native AI Plugin Integration
- **AI-Powered Summarization**: Added `ai_summarize_analysis` task using `io.kestra.plugin.openai.ChatCompletion`
- **Analysis Data Passthrough**: AI receives all agent outputs via Kestra `read()` function
- **Structured Decision Output**: AI returns JSON with `summary`, `submissionReady`, `topImprovements`, `eligibleTracks`
- **Flattened Response**: Parsed AI fields accessible at top level of `aiSummary` object

#### Workflow Resilience
- **Timeout Configuration**: `timeout: PT5M` per attempt, `clientTimeout: 120` for LLM response
- **Retry Logic**: Exponential backoff with `maxAttempt: 3`, `interval: PT10S`, `maxDuration: PT10M`
- **JSON Validation**: Shell task validates AI summary file with `python3 -c "import json; json.load(...)"`

### Fixed
- Fixed `available` flag to only be `true` after successful validation (not on file load)
- Replaced bare `except:` with specific exception handlers (`JSONDecodeError`, `Exception`)
- Changed deprecated `| json` filter to correct `| toJson` filter

### Technical Notes
- Kestra workflow revision: 10+
- All changes approved by CodeRabbit with ASSERTIVE review profile
- PR #2 merged with 4 review iterations

## [0.2.0] - 2025-12-10


### Fixed

#### Kestra Workflow - File Sharing Issue
- **CRITICAL FIX**: Resolved file sharing between Kestra tasks using `WorkingDirectory` pattern
- Tasks now properly share filesystem (clone → analyze → report)
- All 5 workflow tasks pass: `setup`, `clone_repository`, `analyze_project`, `generate_report`

### Changed

#### Kestra Workflow Improvements
- Rewrote `evaluate-hackathon-project.yaml` using `io.kestra.plugin.core.flow.WorkingDirectory`
- Combined all analysis agents into single `analyze_project` Python script for efficiency
- Switched from Git Clone plugin to `alpine/git` Docker image for better template support
- Added proper `taskRunner` configuration with Docker images per task
- Replaced nested template variables with direct `trigger.body.X` references

#### Authentication Updates
- Updated Kestra credentials: `admin@kestra.io` / `Admin1234`
- Fixed health check to use management port (8081) instead of API port (8080)

### Added

#### CodeRabbit Integration Prep
- Added CodeRabbit configuration detection (`.coderabbit.yaml` check)
- Added `coderabbitStatus` to evaluation report for future auto-setup feature

#### Award Eligibility Detection
- Detects sponsor tool usage (Kestra, Next.js, React, Together AI)
- Reports award eligibility in final evaluation

#### New Analysis Features
- Framework detection (Next.js, React, Vue.js, Express)
- TypeScript configuration detection
- ESLint/linting configuration detection
- Lockfile presence check for reproducible builds
- README length analysis for documentation quality

### Technical Notes
- Kestra workflow revision: 8
- Test coverage: 77% statements, 85% functions
- 80 tests passing

---

## [0.1.0] - 2025-12-09

### Added

#### Core Features
- **Multi-agent AI evaluation system** with 6 specialized agents:
  - Code Quality & Architecture Agent
  - UX & Design Agent
  - Performance Agent
  - Product & Innovation Agent
  - Presentation & Documentation Agent
  - Sponsor Tool Alignment Agent
- **Meta-judge aggregation** for synthesizing agent evaluations
- **DevPost submission generator** and pitch script generator
- **Hackathon readiness scoring** (0-100 scale with STRONG/GOOD/NEEDS_WORK/WEAK ratings)

#### LLM Integration (`c17002f`)
- Unified LLM client supporting Together AI and OpenAI
- Comprehensive prompt templates for all 6 evaluation agents
- Parallel agent execution with error handling
- JSON response parsing from LLM outputs
- Evaluation service orchestration with progress callbacks

#### Kestra Workflow Orchestration (`e9e16f0`)
- Complete evaluation workflow in YAML (`evaluate-hackathon-project.yaml`)
- Docker Compose setup for local Kestra deployment
- Kestra API client utilities:
  - Trigger evaluation workflows
  - Poll execution status
  - Map progress to frontend format
  - Download artifacts
- Graceful fallback to mock mode when Kestra unavailable

#### API Routes
- `POST /api/evaluate` - Trigger project evaluation
- `GET /api/evaluate/[jobId]/status` - Poll evaluation status
- `GET /api/evaluate/[jobId]/stream` - SSE real-time progress
- `GET /api/evaluate/[jobId]/report` - Fetch evaluation results
- `GET /api/repos` - List user GitHub repositories
- `POST /api/auth/github` - GitHub OAuth authentication

#### Frontend (`fa41a6c`)
- Modern landing page with glassmorphism design
- Dashboard with evaluation form and progress tracking
- Report page with:
  - Readiness radar chart
  - Agent feedback cards
  - Improvement suggestions
  - Award eligibility display
- Reusable UI components (Button, Input, Modal, ProgressBar, etc.)

#### Testing (`4f88d5f`)
- Jest + React Testing Library setup
- 85 unit and integration tests
- Coverage: 77% statements, 73% branches, 85% functions
- Test files for:
  - GitHub utilities
  - LLM client and agents
  - Kestra integration
  - Prompt templates
  - Evaluation service
  - React hooks

#### Documentation
- Comprehensive README with setup instructions
- Kestra setup guide with troubleshooting
- TypeScript type definitions for all data structures
- Inline code documentation

### Technical Stack
- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Testing**: Jest 30, React Testing Library
- **LLM**: Together AI, OpenAI (optional)
- **Orchestration**: Kestra
- **Authentication**: GitHub OAuth

### Sponsor Tool Integration
- **Kestra** - Workflow orchestration for evaluation pipeline
- **Together AI** - LLM inference for multi-agent analysis
- **Vercel** - Deployment platform (ready)
- **CodeRabbit** - AI code review integration

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 2.2.0 | 2025-12-14 | Firecrawl integration, Exa web search, selective issue creation, UI improvements |
| 2.1.0 | 2025-12-13 | User-controlled GitHub Actions, Kestra GitHub Plugin, Flow Bug Fixes |
| 2.0.0 | 2025-12-12 | Chat with Codebase, Security Scan, CI/CD Detection, Vision Assessment |
| 0.3.0 | 2025-12-10 | Kestra Native AI Plugin, workflow resilience |
| 0.2.0 | 2025-12-10 | Fixed Kestra workflow, CodeRabbit detection, award eligibility |
| 0.1.0 | 2025-12-09 | Initial release with full evaluation pipeline |

[Unreleased]: https://github.com/BishalJena/HackJudge/compare/v2.2.0...HEAD
[2.2.0]: https://github.com/BishalJena/HackJudge/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/BishalJena/HackJudge/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/BishalJena/HackJudge/compare/v0.3.0...v2.0.0
[0.3.0]: https://github.com/BishalJena/HackJudge/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/BishalJena/HackJudge/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/BishalJena/HackJudge/releases/tag/v0.1.0
