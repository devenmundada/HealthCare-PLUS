# Deployment

## Vercel (Frontend)

The frontend is a standard Vite + React app and deploys to Vercel with zero config.

1. Go to https://vercel.com and import the GitHub repo
2. Set the root directory to `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend-url`

## Backend

The backend needs a server that can run Node.js and PostgreSQL. Options:

- Railway (easiest — deploys Node + Postgres together)
- Render
- AWS EC2

### Environment Variables (backend/.env)
DATABASE_URL=postgresql://user:password@host:5432/healthcare_db
JWT_SECRET=your-secret-key-here
PORT=3001
OLLAMA_URL=http://localhost:11434

### Database Setup on Server

```bash
# Run migrations
node scripts/migrate.js

# Seed with Indian hospital and doctor data
node scripts/seed.js
```

## Note on Ollama in Production

Ollama runs on the user's local machine, not the server. The backend just proxies the request to localhost:11434 on the user's device. If Ollama is not running, the AI feature shows a friendly message to start it.

For a fully cloud-hosted AI (no local Ollama requirement), you would replace the Ollama call with an API like Together AI or Groq — this is on the roadmap.
