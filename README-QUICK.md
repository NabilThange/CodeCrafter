# ⚡ Quick Reference

## Start & Stop

```powershell
# Start both apps
.\start-dev.ps1

# Stop both apps
.\stop-dev.ps1
```

## Access

- **Vane (Default)**: http://localhost:3000
- **WorldMonitor**: http://localhost:5173
- **Integrated**: Click "Monitor" in Vane sidebar

## Ports

| App | Port |
|-----|------|
| Vane | 3000 |
| WorldMonitor | 5173 |

## Configuration

**Vane** - Create `Vane/.env.local`:
```env
OPENAI_API_KEY=sk-...
```

**WorldMonitor** - No config needed!

## Status

✅ Port conflict fixed
✅ Vane is default page (port 3000)
✅ WorldMonitor is sub-page (port 5173)
✅ Scripts working

## Run Now

```powershell
.\start-dev.ps1
```

Then open: http://localhost:3000
