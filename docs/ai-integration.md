# AI Integration

## Overview

The AI assistant uses Ollama to run Phi-3 Mini (3.8B parameters) locally on the user's machine. No medical data is sent to any external API.

## Setup

```bash
# Install Ollama from https://ollama.com
curl -fsSL https://ollama.com/install.sh | sh

# Pull the model (one-time, ~2.3GB download)
ollama pull phi3:mini

# Start the server
ollama serve
# Runs at http://localhost:11434
```

## Why Phi-3 Mini

- Small enough to run on a consumer laptop (needs ~4GB RAM)
- Good performance on medical question-answering tasks
- Supports Indian English and some Hindi
- MIT licensed, free to use
- No API costs

## How the Fallback Works
User sends message
→ Backend tries Ollama at localhost:11434
→ If Ollama running: get AI response
→ If Ollama not running: return fallback message asking user to start Ollama

## Prompt Template

Every user message is wrapped with medical context before being sent to the model:

- Identifies as a healthcare AI assistant for Indian users
- Includes disclaimer that it is not a substitute for professional advice
- Asks model to reference Indian hospitals, medicine names, and government schemes like Ayushman Bharat where relevant
- Requests structured markdown output

## Limitations

- Phi-3 Mini is not a medical-grade model. It can make mistakes.
- Every response includes a disclaimer to consult a qualified doctor.
- The model has no memory between sessions unless chat history is explicitly passed.
- Response time depends on user hardware. Average is 2-5 seconds on a modern laptop.
