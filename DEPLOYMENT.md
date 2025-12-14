# HackJudge AI - Deployment Guide

Complete guide to deploy HackJudge AI in production.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Vercel        │────▶│   Kestra Cloud   │────▶│   GitHub API    │
│   (Frontend)    │     │   (Orchestrator) │     │   (Repo Data)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         │                       ▼
         │              ┌──────────────────┐
         └─────────────▶│   OpenRouter     │
                        │   (AI API)       │
                        └──────────────────┘
```

---

## Option 1: Recommended Setup (Vercel + Kestra Cloud)

### Step 1: Deploy Frontend to Vercel

1. **Push code to GitHub** (skip if already done)
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your HackJudge repository
   - Framework: **Next.js** (auto-detected)

3. **Configure Environment Variables**
   
   | Variable | Description | Example |
   |----------|-------------|---------|
   | `OPENROUTER_API_KEY` | AI API key from openrouter.ai | `sk-or-v1-xxx...` |
   | `GITHUB_ID` | GitHub OAuth App Client ID | `Iv1.abc123...` |
   | `GITHUB_SECRET` | GitHub OAuth App Client Secret | `abc123...` |
   | `NEXTAUTH_SECRET` | Random 32+ char string | `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | Your Vercel URL | `https://hackjudge.vercel.app` |
   | `KESTRA_API_URL` | Kestra endpoint | `https://your-kestra.kestra.cloud` |
   | `EXA_API_KEY` | Exa search API key (optional) | `exa-xxx...` |

4. **Deploy**
   - Click "Deploy"
   - Wait ~2 minutes for build

### Step 2: Set Up Kestra Cloud (Free Tier)

1. **Sign up for Kestra Cloud**
   - Go to [kestra.io/cloud](https://kestra.io/cloud)
   - Create account (free tier available)

2. **Create Namespace**
   ```
   Namespace: main.hackjudge
   ```

3. **Upload Flows**
   - Go to Flows → Create Flow
   - Copy content from `kestra/flows/main_hackjudge.evaluate-hackathon-project.yml`
   - Save and enable

4. **Configure Secrets**
   - Go to Secrets → Add Secret
   - Add `GITHUB_TOKEN` with a GitHub Personal Access Token
   - Add `OPENROUTER_API_KEY` with your AI API key

5. **Get API Endpoint**
   - Your Kestra URL: `https://[your-namespace].kestra.cloud`
   - Update `KESTRA_API_URL` in Vercel

---

## Option 2: Self-Hosted (Render + Docker Kestra)

### Step 1: Deploy Frontend to Render

1. **Create Web Service**
   - Go to [render.com](https://render.com)
   - New → Web Service
   - Connect GitHub repository

2. **Configure**
   ```
   Name: hackjudge-frontend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Add Environment Variables** (same as Vercel above)

### Step 2: Deploy Kestra on Render (Docker)

1. **Create Docker Web Service**
   - New → Web Service
   - Choose "Docker" environment

2. **Use Kestra Docker Image**
   Create a `Dockerfile.kestra` in your repo:
   ```dockerfile
   FROM kestra/kestra:latest-full
   
   # Copy flows
   COPY kestra/flows /app/flows
   
   # Expose port
   EXPOSE 8080
   
   # Start Kestra in standalone mode
   CMD ["server", "standalone", "--flow-path=/app/flows"]
   ```

3. **Configure Render Service**
   ```
   Name: hackjudge-kestra
   Docker Command: (leave empty, uses CMD)
   Port: 8080
   Health Check Path: /health
   ```

4. **Add Environment Variables**
   ```
   KESTRA_CONFIGURATION: |
     kestra:
       repository:
         type: postgres
       storage:
         type: local
   DATABASE_URL: (your Postgres connection string)
   ```

> ⚠️ **Note**: For production, use Kestra Cloud or Kubernetes. Render's Docker hosting works but has limitations for workflow execution.

---

## Option 3: Production (Kubernetes + Helm)

For high-availability production deployments:

```bash
# Add Kestra Helm repo
helm repo add kestra https://helm.kestra.io/

# Install with custom values
helm install kestra kestra/kestra \
  --namespace kestra \
  --create-namespace \
  --set configuration.kestra.repository.type=postgres \
  --set postgresql.enabled=true
```

See [Kestra Helm Documentation](https://kestra.io/docs/installation/kubernetes) for full configuration.

---

## GitHub OAuth Setup

Required for the "Create Issues" and "Push CI/CD" features.

1. **Create OAuth App**
   - Go to GitHub → Settings → Developer Settings → OAuth Apps
   - Click "New OAuth App"

2. **Configure**
   ```
   Application name: HackJudge AI
   Homepage URL: https://your-domain.com
   Authorization callback URL: https://your-domain.com/api/auth/callback/github
   ```

3. **Get Credentials**
   - Copy Client ID → `GITHUB_ID`
   - Generate Client Secret → `GITHUB_SECRET`

---

## Verify Deployment

### 1. Test Frontend
- Visit your deployed URL
- Should see the HackJudge landing page

### 2. Test GitHub Auth
- Click "Sign in with GitHub"
- Should redirect and authenticate

### 3. Test Evaluation
- Enter a GitHub repo URL
- Click "Evaluate"
- Should trigger Kestra workflow

### 4. Test Issue Creation
- Go to report page
- Select improvements
- Click "Create Issues"
- Verify issues created in GitHub repo

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Auth callback error | Check `NEXTAUTH_URL` matches your domain |
| Kestra flow not found | Verify flows are uploaded to correct namespace |
| API timeout | Check Kestra is running and accessible |
| Issues not creating | Verify GitHub token has `repo` scope |

---

## Cost Estimates

| Service | Free Tier | Paid |
|---------|-----------|------|
| Vercel | Unlimited static, 100GB bandwidth | $20/mo Pro |
| Kestra Cloud | 10 executions/day | Contact sales |
| OpenRouter | Pay per token (~$0.001/1K) | - |
| Render | 750 hours/mo | $7/mo Starter |

---

## Quick Start Commands

```bash
# Clone and setup
git clone https://github.com/BishalJena/hackjudge
cd hackjudge
npm install

# Copy environment template
cp .env.example .env.local
# Edit .env.local with your keys

# Test locally
npm run dev

# Build for production  
npm run build
```
![alt text](vscode-file://vscode-app/Users/bishal/.gemini/antigravity/brain/0c628ef9-34e1-4f13-9dc2-6b16fe99af4e/chat_improvements_final_1765711379081.webp)