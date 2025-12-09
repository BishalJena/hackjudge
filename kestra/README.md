# Kestra Workflows for HackJudge AI

This directory contains Kestra workflow definitions for the HackJudge AI evaluation pipeline.

## Quick Start

### 1. Start Kestra

```bash
cd kestra
docker-compose up -d
```

Kestra UI will be available at: http://localhost:8080

### 2. Load Workflows

The flows are automatically loaded from the `flows/` directory when Kestra starts.

Alternatively, upload manually via UI or API:

```bash
curl -X POST http://localhost:8080/api/v1/flows \
  -H "Content-Type: application/x-yaml" \
  --data-binary @flows/evaluate-hackathon-project.yaml
```

### 3. Configure Secrets

In Kestra UI, go to **Namespace** → **hackjudge** → **Secrets** and add:

| Secret | Description |
|--------|-------------|
| `TOGETHER_API_KEY` | Your Together AI API key |
| `OPENAI_API_KEY` | (Optional) OpenAI API key |
| `SLACK_WEBHOOK_URL` | (Optional) Slack webhook for notifications |

## Workflow: evaluate-hackathon-project

Main evaluation pipeline with 8 tasks:

```
┌─────────────────────────────────────────────────────────────┐
│                 EVALUATION PIPELINE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Clone Repository                                        │
│     └── io.kestra.plugin.git.Clone                         │
│                                                             │
│  2. Extract Metadata                                        │
│     └── Analyze package.json, README, structure            │
│                                                             │
│  3. Scrape Hackathon Criteria (optional)                   │
│     └── Extract judging criteria from hackathon page       │
│                                                             │
│  4. Build Project                                           │
│     └── npm install && npm run build (in Docker)           │
│                                                             │
│  5. Capture Screenshots                                     │
│     └── Playwright: desktop + mobile views                 │
│                                                             │
│  6. Lighthouse Audit                                        │
│     └── Performance, accessibility, SEO metrics            │
│                                                             │
│  7. Multi-Agent Analysis (PARALLEL)                        │
│     ├── Code Quality Agent                                 │
│     ├── UX & Design Agent                                  │
│     ├── Performance Agent                                  │
│     ├── Product Agent                                      │
│     └── Presentation Agent                                 │
│                                                             │
│  8. Aggregate Results                                       │
│     └── Combine all agent outputs into final report        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `repo_url` | STRING | Yes | GitHub repository URL |
| `branch` | STRING | No | Branch to evaluate (default: main) |
| `hackathon_url` | STRING | No | Hackathon page for criteria extraction |
| `job_id` | STRING | Yes | Unique job identifier |
| `settings` | JSON | No | Evaluation settings |

## Outputs

Final report saved to: `/tmp/hackjudge/{job_id}/artifacts/final_report.json`

## Triggering via API

```bash
curl -X POST "http://localhost:8080/api/v1/executions/hackjudge/evaluate-hackathon-project" \
  -H "Content-Type: application/json" \
  -d '{
    "repo_url": "https://github.com/owner/repo",
    "branch": "main",
    "hackathon_url": "https://devpost.com/hackathons/example",
    "job_id": "eval_123456"
  }'
```

## Monitoring

- **Kestra UI**: http://localhost:8080
- **Executions**: http://localhost:8080/ui/executions
- **Logs**: http://localhost:8080/ui/executions/{execution_id}/logs

## Troubleshooting

### Docker Socket Permission

If you see Docker permission errors:

```bash
sudo chmod 666 /var/run/docker.sock
```

### Database Connection

Check PostgreSQL is healthy:

```bash
docker-compose ps
docker-compose logs postgres
```

### Flow Not Loading

Verify YAML syntax:

```bash
kestra validate flows/evaluate-hackathon-project.yaml
```
