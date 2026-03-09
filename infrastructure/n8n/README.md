# N8N Automation Stack — ScoreMyPrompt

Mini PC (Intel N100 16GB) home server for content automation.

## 3-Tier AI Strategy

| Tier | Model | Use (%) | Cost | Tasks |
|------|-------|---------|------|-------|
| 1 | Groq Llama 3.3 70B | 55% | Free API | Drafts, summaries, translations, analysis |
| 2 | Ollama Llama 3.2 3B | 30% | Local (free) | Hashtags, captions, reformatting |
| 3 | Claude Max | 15% | Subscription | Deep analysis, strategy (manual) |

## Quick Start

```bash
# 1. Environment setup
cp .env.example .env
nano .env  # Set passwords + Groq API key

# 2. Start stack
docker compose up -d

# 3. Pull Ollama model (first time only, ~2GB)
docker exec smp-ollama ollama pull llama3.2:3b

# 4. Open N8N
open http://localhost:5678

# 5. (Optional) Enable Cloudflare Tunnel for external webhooks
docker compose --profile tunnel up -d
```

## Services

| Service | Port | RAM | Purpose |
|---------|------|-----|---------|
| N8N | 5678 | ~500MB | Workflow automation |
| PostgreSQL | 5432 | ~100MB | N8N data storage |
| Redis | 6379 | ~50MB | Queue & caching |
| Ollama | 11434 | ~3-4GB | Local AI (Tier 2) |
| Cloudflared | — | ~30MB | Tunnel (optional) |

**Total:** ~4-5GB RAM on N100 16GB system (leaves ~11GB headroom)

## Workflows

### WF-0: RSS Collector
- **Schedule:** Every 6 hours
- **Flow:** AI/prompt RSS feeds → Google Sheets "RSS_Raw" tab
- **AI:** None (pure data collection)

### WF-1: Blog → Multi-Platform Content
- **Schedule:** Daily 6AM EST
- **Flow:** Blog post → 7 platform-specific drafts (X, LinkedIn, Bluesky, Reddit, YouTube, Instagram, TikTok)
- **AI:** Groq 70B (drafts) + Ollama 3B (hashtags)
- **Model:** Packing Assistant — prepares drafts, you publish natively

### WF-2: Content Draft Generator
- **Schedule:** Daily 8AM EST
- **Flow:** Content Calendar `draft_needed` slots → Ollama draft → Sheets update
- **AI:** Ollama 3B (short drafts)

### WF-3: Mention & Competitor Monitor
- **Schedule:** Every 4 hours
- **Flow:** Google Alerts RSS → Groq classification → Email alerts for high-priority mentions
- **AI:** Groq 70B (sentiment analysis + response drafting)

### WF-4: Weekly Newsletter
- **Schedule:** Tuesday 9AM EST
- **Flow:** RSS digest + our content → Groq newsletter draft → Resend API queue
- **AI:** Groq 70B (newsletter writing)
- **Integration:** ScoreMyPrompt `/api/newsletter/send` endpoint

### WF-5: Daily Schedule Packet
- **Schedule:** Daily 7AM EST
- **Flow:** Content Calendar → filter today's posts → Ollama format → email briefing
- **AI:** Ollama 3B (formatting)
- **Model:** Morning briefing — wake up to today's content ready to copy-paste

### WF-6: Internal Data → Content Ideas
- **Schedule:** Monday 8AM EST
- **Flow:** App analytics + leaderboard → Groq content ideas → Calendar
- **AI:** Groq 70B (content strategy)

## Content Flow

```
               WF-0: RSS Collection
                      |
    +-----------------+-----------------+
    |                 |                 |
  WF-6            WF-2              WF-4
  Data->Ideas   Draft Gen.        Newsletter
    |                |                 |
    +-----> Content Calendar <---------+
                    |
                  WF-1
           Blog -> 7 Platforms
                    |
                  WF-5
           Daily Schedule Packet
                    |
           Human publishes natively
                    |
                  WF-3
           Mention Monitor -> Respond
```

## Operations

- **Power:** N100 6W TDP → ~3,000 KRW/month (24/7)
- **Backup:** `docker compose exec postgres pg_dump -U n8n n8n > backup.sql`
- **Update:** `docker compose pull && docker compose up -d`
- **Logs:** `docker compose logs -f n8n`
- **Ollama models:** `docker exec smp-ollama ollama list`
- **Tunnel status:** `docker compose --profile tunnel logs cloudflared`
