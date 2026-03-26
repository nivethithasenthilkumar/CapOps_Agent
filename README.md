# CapOps Agent

CapOps Agent is an Intelligent BPO Assistant designed for Capgemini's internal operations. It autonomously resolves HR, Finance, and IT support queries. The system incorporates an advanced LangChain orchestrator with Claude API to provide intelligent routing, RAG over knowledge bases, live sentiment analysis, dynamic action execution, and a real-time React dashboard. 

The architecture supports multiple channels (Web, Voice, Email) and seamlessly escalates consecutive frustrated queries to human agents with a summarized context package.

## Architecture Diagram

```text
       +---------------+       +-----------------+       
       | React Web App | <---> | NGINX Balancer  | <---> [ Port 8001 / 8002 ]
       | (Tailwind CSS)|       | (Round-Robin)   |       
       +-------^-------+       +-----------------+       
               |                        |
               v                        v
       +---------------+       +------------------+      +----------------+
       | Web Speech API|       | FastAPI Backend  | ---> |  ChromaDB RAG  |
       | (STT / Voice) |       | (Core Logic)     |      | (Knowledge KB) |
       +---------------+       +--------^---------+      +----------------+
                                        |
                            +-----------v-----------+
                            |  Anthropic Claude   |
                            |  API (Sonnet)       |
                            +-----------------------+
```

## Features Complete
1. FastAPI Backend (main.py)
2. LangChain Orchestrator (agent.py)
3. ChromaDB RAG (rag.py)
4. Mock API Actions (actions.py)
5. Intent Classifier (nlu.py)
6. Sentiment Analysis (sentiment.py)
7. Session Management (session.py)
8. Security Rules (security.py)
9. Analytics Logging (analytics.py)
10. Claude Vision (vision.py)
11. 4 Realistic Mined KBs + Mock Data
12. React Vite Web App
13. Live Dashboard + KPIs
14. Voice Input (Browser native)
15. Escalation Banner
16. NGINX Load Balancing
17. Recharts Visualization

## Setup Instructions

### Backend Start
1. `cd backend`
2. `pip install -r requirements.txt`
3. Terminal 1: `uvicorn main:app --port 8001`
4. Terminal 2: `uvicorn main:app --port 8002`

### Frontend Start
1. `cd frontend`
2. `npm install`
3. `npm run dev` (or build to serve via Nginx: `npm run build`)

### Nginx
1. Ensure Nginx is installed.
2. Copy `nginx/nginx.conf` and restart Nginx.

## Sample cURL Requests

**Chat Request:**
```bash
curl -X POST http://localhost:80/api/chat \
-H "Content-Type: application/json" \
-d '{"message": "I need help resetting my SAP password. My ID is CG-1234."}'
```

**Health Check:**
```bash
curl http://localhost:80/api/health
```

**Dashboard Stats:**
```bash
curl http://localhost:80/api/dashboard/stats
```

## Environment Variables
- `ANTHROPIC_API_KEY`: API Key for Claude
- `WORKER_ID`: Identifier for load balancing
- `PORT`: Server port
- `CHROMA_DB_PATH`: Vector DB persist location
- `LOG_PATH`: Session logs path
