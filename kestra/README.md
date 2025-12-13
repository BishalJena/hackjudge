# Kestra Orchestration — HackJudge AI

> **Author:** HackJudge AI Team  
> **Last Updated:** 2025-12-13  
> **Version:** 2.1.0 (GitHub Plugin Integration)

---

## Table of Contents

1. [Project Vision & Current State](#project-vision--current-state)
2. [Critical Analysis: Gaps & Opportunities](#critical-analysis-gaps--opportunities)
3. [GitHub Plugin: Capabilities](#github-plugin-capabilities)
4. [Strategic Improvements](#strategic-improvements)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Quick Start Guide](#quick-start-guide)
7. [Workflow Reference](#workflow-reference)
8. [API & Configuration](#api--configuration)
9. [Troubleshooting](#troubleshooting)

---

## Project Vision & Current State

### What is HackJudge AI?

HackJudge AI is an **autonomous hackathon review agent** that evaluates projects like a panel of expert judges. Developers submit a GitHub repository and receive:

- 📊 **Readiness Score** (0-100)
- 🔍 **Multi-Dimensional Analysis** (Code, UX, Performance, Innovation, Presentation, Security)
- ✅ **Actionable Improvements** ranked by impact
- 💬 **Mentor Uplink** — AI-powered chat for project guidance

### Current Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    HACKJUDGE EVALUATION PIPELINE                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   GitHub Repo ──▶ Clone ──▶ Analyze ──▶ AI Agents ──▶ Report   │
│                     │         │            │             │      │
│                     ▼         ▼            ▼             ▼      │
│               Security    Metadata     6 Specialized   Chat     │
│               Scan        Extract      Agents          Context  │
│                                                                 │
│   Current Limitation: One-way evaluation only                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### What's Working Well ✅

| Feature | Status | Technology |
|---------|--------|------------|
| Multi-Agent Evaluation | ✅ Complete | Kestra + OpenRouter |
| Security Scanning | ✅ Complete | npm audit in Docker |
| CI/CD Detection | ✅ Complete | File-based detection |
| Mentor Uplink (Chat) | ✅ Complete | Streaming LLM |
| **GitHub Issue Creation** | ✅ Complete | Kestra GitHub Plugin (`issues.Create`) |
| **CI/CD PR Setup** | ✅ Complete | Kestra GitHub Plugin (`pulls.Create`) |
| Vision Analysis | ✅ Complete | `/vision` command |

> **v2.1.0 Update:** GitHub actions are now **user-controlled** via buttons on the report page, triggering dedicated Kestra flows.

---

## Critical Analysis: Gaps & Opportunities

### 🔴 Current Limitations

| Gap | Impact | Root Cause |
|-----|--------|------------|
| **Passive Feedback** | Users must manually implement suggestions | No automated PR creation |
| **One-Time Evaluation** | No continuous monitoring | Missing webhook triggers |
| **Isolated Reports** | Results stay in HackJudge | No GitHub Issues integration |
| **Manual CI/CD** | Users must click a button | Not part of Kestra workflow |
| **No Re-Evaluation Loop** | Can't track improvement | No issue comments on re-run |

### 🟡 Underutilized Capabilities

1. **Shell-Based GitHub Ops**: We use raw `git clone` instead of leveraging Kestra's ecosystem
2. **Post-Evaluation Actions**: Nothing happens after the report is generated
3. **User Repo Integration**: We analyze but don't contribute back
4. **Continuous Improvement**: No automated follow-up or re-evaluation triggers

### 🟢 Opportunities with GitHub Plugin

The Kestra GitHub plugin (`io.kestra.plugin.github`) enables **bi-directional integration**:

| Current State | Future State |
|---------------|--------------|
| Clone via shell | Clone via shell (no change, plugin doesn't support clone) |
| Report in HackJudge only | **Create GitHub Issue** with results |
| Manual CI/CD button | **Auto-Create PR** with CI workflow |
| One-time evaluation | **Trigger workflow** on push/PR |
| Static feedback | **Comment on Issues** for re-evaluations |

---

## GitHub Plugin: Capabilities

### Available Tasks (11 Total)

| Category | Task | Type | HackJudge Relevance |
|----------|------|------|---------------------|
| **Actions** | RunWorkflow | `io.kestra.plugin.github.actions.RunWorkflow` | ⭐⭐⭐ Trigger CI after setup |
| **Pulls** | Create | `io.kestra.plugin.github.pulls.Create` | ⭐⭐⭐ Auto-create PRs |
| **Pulls** | Search | `io.kestra.plugin.github.pulls.Search` | ⭐ |
| **Issues** | Create | `io.kestra.plugin.github.issues.Create` | ⭐⭐⭐ Post evaluation to repo |
| **Issues** | Comment | `io.kestra.plugin.github.issues.Comment` | ⭐⭐ Update on re-eval |
| **Issues** | Search | `io.kestra.plugin.github.issues.Search` | ⭐ |
| **Code** | Search | `io.kestra.plugin.github.code.Search` | ⭐ |
| **Commits** | Search | `io.kestra.plugin.github.commits.Search` | ⭐ |
| **Repositories** | Search | `io.kestra.plugin.github.repositories.Search` | ⭐ |
| **Topics** | Search | `io.kestra.plugin.github.topics.Search` | ⭐ |
| **Users** | Search | `io.kestra.plugin.github.users.Search` | ⭐ |

### Authentication

```yaml
# In Kestra task:
oauthToken: "{{ secret('GITHUB_TOKEN') }}"
```

> [!IMPORTANT]
> The GitHub token must have `repo` scope for creating PRs/Issues and `workflow` scope for triggering Actions.

---

## Strategic Improvements

### Improvement 1: Auto-Create GitHub Issue with Evaluation

**Goal:** After evaluation, create a GitHub Issue in the user's repo with the summary.

**Flow Addition:**
```yaml
- id: create_evaluation_issue
  type: io.kestra.plugin.github.issues.Create
  oauthToken: "{{ secret('GITHUB_TOKEN') }}"
  repository: "{{ inputs.owner }}/{{ inputs.repo }}"
  title: "🤖 HackJudge AI Evaluation: {{ outputs.readiness_score }}/100"
  body: |
    ## Evaluation Summary
    **Status:** {{ outputs.status }}
    **Score:** {{ outputs.readiness_score }}/100

    ### Dimension Scores
    | Dimension | Score |
    |-----------|-------|
    | Innovation | {{ outputs.dimensions.innovation }}/100 |
    | Technical | {{ outputs.dimensions.technical }}/100 |
    | UX | {{ outputs.dimensions.ux }}/100 |
    | Code Quality | {{ outputs.dimensions.codeQuality }}/100 |
    | Security | {{ outputs.dimensions.security }}/100 |

    ### Top Improvements
    {{ outputs.top_improvements }}

    ---
    [View Full Report](https://hackjudge.ai/report/{{ inputs.project_id }})
  labels:
    - hackjudge
    - evaluation
```

**Benefit:** Users get feedback directly in their repo. No need to visit HackJudge.

---

### Improvement 2: Auto-Create CI/CD PR (Replace API Route)

**Goal:** Move CI/CD setup from Next.js API to Kestra, creating a proper PR.

**Flow Addition:**
```yaml
- id: setup_cicd_pr
  type: io.kestra.plugin.github.pulls.Create
  oauthToken: "{{ secret('GITHUB_TOKEN') }}"
  repository: "{{ inputs.owner }}/{{ inputs.repo }}"
  sourceBranch: hackjudge/add-cicd
  targetBranch: main
  title: "ci: add automated CI/CD pipeline (via HackJudge)"
  body: |
    This PR was automatically generated by **HackJudge AI**.

    ## Changes
    - Added `.github/workflows/ci.yml` for Node.js CI

    ## Why?
    Your project was missing CI/CD. This workflow will:
    - Run on every push and PR to main
    - Install dependencies
    - Build the project
    - Run tests

    ---
    _Powered by [HackJudge AI](https://hackjudge.ai)_
  draft: false
```

**Benefit:** Cleaner integration, visible in user's PR history, mergeable with review.

---

### Improvement 3: Update Issue on Re-Evaluation

**Goal:** When a user re-evaluates, comment on the existing issue instead of creating a new one.

**Flow Logic:**
1. Search for existing issue with label `hackjudge`
2. If found, add a comment with the new score
3. If not found, create a new issue

```yaml
- id: update_or_create_issue
  type: io.kestra.plugin.github.issues.Comment
  oauthToken: "{{ secret('GITHUB_TOKEN') }}"
  repository: "{{ inputs.owner }}/{{ inputs.repo }}"
  issueNumber: "{{ outputs.existing_issue_number }}"
  body: |
    ## 🔄 Re-Evaluation Complete

    **New Score:** {{ outputs.readiness_score }}/100
    **Change:** {{ outputs.score_delta }}

    ### What Improved
    {{ outputs.improvements_made }}

    ---
    [View Full Report](https://hackjudge.ai/report/{{ inputs.project_id }})
```

**Benefit:** Track improvement over time in a single issue thread.

---

### Improvement 4: Trigger User's CI After Setup

**Goal:** If we create a CI workflow via PR, trigger it after merge.

```yaml
- id: trigger_ci_workflow
  type: io.kestra.plugin.github.actions.RunWorkflow
  oauthToken: "{{ secret('GITHUB_TOKEN') }}"
  repository: "{{ inputs.owner }}/{{ inputs.repo }}"
  workflowId: ci.yml
  ref: main
```

**Benefit:** Validate the CI we set up actually works.

---

## Implementation Roadmap

### Phase 1: Foundation (Current ✅)
- [x] Kestra evaluation pipeline
- [x] Security scanning
- [x] AI-powered analysis
- [x] Mentor Uplink chat

### Phase 2: GitHub Integration (Next 🚧)
- [ ] Add `GITHUB_TOKEN` secret to Kestra
- [ ] Implement `issues.Create` after report generation
- [ ] Replace Next.js CI/CD button with `pulls.Create`
- [ ] Add conditional logic for existing issues

### Phase 3: Automation (Future 📋)
- [ ] GitHub webhook triggers for auto-evaluation
- [ ] Re-evaluation comments on existing issues
- [ ] Trigger user's CI after PR merge
- [ ] CodeRabbit integration via Kestra

---

## Quick Start Guide

### 1. Start Kestra

```bash
cd kestra
docker-compose up -d
```

**Kestra UI:** http://localhost:8080
- **Username:** `admin@kestra.io`
- **Password:** `Admin1234`

### 2. Configure Secrets

In Kestra UI: **Namespace** → **hackjudge** → **Secrets**

| Secret | Description | Required |
|--------|-------------|----------|
| `OPENAI_API_KEY` | OpenRouter API key (base64) | Yes |
| `GITHUB_TOKEN` | GitHub PAT with `repo`, `workflow` scopes | For GitHub Integration |

Encode with:
```bash
echo -n "your-key" | base64
```

### 3. Local Flow Sync

Flows auto-sync from `flows/` directory. Naming convention:
```
main_<namespace>.<flowId>.yml
```

Example: `main_hackjudge.evaluate-hackathon-project.yml`

---

## Workflow Reference

### Current Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                 EVALUATION PIPELINE (v2.1)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Clone Repository (shell)                                │
│  2. Security Scan (npm audit)                               │
│  3. Analyze Project                                         │
│     ├── Code Quality Agent                                  │
│     ├── UX & Design Agent                                   │
│     ├── Product Agent (Vision Clarity)                      │
│     └── Presentation Agent                                  │
│  4. Extract Code Context (for Chat)                         │
│  5. AI Summary via OpenRouter                               │
│  6. Generate Final Report                                   │
│  7. [NEW] Create GitHub Issue  ← GitHub Plugin              │
│  8. [NEW] Create CI/CD PR      ← GitHub Plugin              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `repo_url` | STRING | Yes | GitHub repository URL |
| `branch` | STRING | No | Branch to evaluate (default: main) |
| `hackathon_url` | STRING | No | Hackathon page for criteria |
| `job_id` | STRING | Yes | Unique job identifier |
| `owner` | STRING | Yes (for GitHub plugin) | Repo owner |
| `repo` | STRING | Yes (for GitHub plugin) | Repo name |

### Outputs

- `final_report.json` — Full evaluation report
- `security_audit.json` — Security scan results
- `code_context.json` — Extracted code for chat

---

## API & Configuration

### Trigger Evaluation

```bash
curl -X POST "http://localhost:8080/api/v1/executions/hackjudge/evaluate-hackathon-project" \
  -u "admin@kestra.io:Admin1234" \
  -H "Content-Type: application/json" \
  -d '{
    "repo_url": "https://github.com/owner/repo",
    "branch": "main",
    "job_id": "eval_123456"
  }'
```

### Docker Compose Configuration

```yaml
# docker-compose.yml
micronaut:
  io:
    watch:
      enabled: true
      paths:
        - /app/flows
```

---

## Troubleshooting

### Flow Not Syncing

1. Check file naming: `main_<namespace>.<flowId>.yml`
2. Restart Kestra: `docker-compose restart kestra`
3. Check logs: `docker-compose logs kestra`

### Docker Socket Permission

```bash
sudo chmod 666 /var/run/docker.sock
```

### Container Networking

Use `host.docker.internal` for callback URLs when running locally.

### GitHub Plugin Errors

| Error | Solution |
|-------|----------|
| `401 Unauthorized` | Check `GITHUB_TOKEN` secret is set |
| `403 Forbidden` | Token needs `repo` and `workflow` scopes |
| `422 Validation failed` | Branch name or PR params incorrect |

---

## References

- [Kestra GitHub Plugin Docs](https://kestra.io/plugins/plugin-github)
- [Plugin Source Code](https://github.com/kestra-io/plugin-github)
- [GitHub REST API Docs](https://docs.github.com/en/rest)
- [Kestra Secrets Management](https://kestra.io/docs/concepts/secrets)

---

<p align="center">
  <strong>HackJudge AI × Kestra</strong> — Orchestrating Excellence 🚀
</p>
