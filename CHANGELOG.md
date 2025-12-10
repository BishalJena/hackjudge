# Changelog

All notable changes to HackJudge AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
| 0.2.0 | 2025-12-10 | Fixed Kestra workflow, CodeRabbit detection, award eligibility |
| 0.1.0 | 2025-12-09 | Initial release with full evaluation pipeline |

[Unreleased]: https://github.com/BishalJena/HackJudge/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/BishalJena/HackJudge/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/BishalJena/HackJudge/releases/tag/v0.1.0
