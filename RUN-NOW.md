# 🚀 Ready to Run!

## ✅ What's Fixed
- Syntax error in WorldMonitor fixed (panel-layout.ts line 212)
- PowerShell script fixed (removed problematic characters)
- All integration files created
- Vane dependencies installed

## 🎯 Run This Now

```powershell
.\start-dev.ps1
```

This will:
1. Start WorldMonitor on port 5173
2. Start Vane on port 3000
3. Open two PowerShell windows (one for each app)

## 📍 Then Open Your Browser

Go to: **http://localhost:3000**

You'll see:
1. Vane setup wizard (first time only)
2. Configure your AI provider
3. Click "Monitor" in sidebar to access WorldMonitor

## ⚙️ Quick Configuration

### Minimum Config for Vane
Create `Vane/.env.local`:

**Option 1: OpenAI**
```env
OPENAI_API_KEY=sk-proj-...
```

**Option 2: Claude**
```env
ANTHROPIC_API_KEY=sk-ant-...
```

**Option 3: Ollama (Free)**
1. Install Ollama: https://ollama.ai
2. Run: `ollama pull llama3.2`
3. Select Ollama in Vane setup wizard

### WorldMonitor
No configuration needed! Works immediately.

## 🎉 That's It!

Everything is ready. Just run the script and start exploring!

**Command:**
```powershell
.\start-dev.ps1
```

**Then visit:** http://localhost:3000
