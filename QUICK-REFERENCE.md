# 📋 Quick Reference Card

## 🚀 Start Command
```powershell
.\start-dev.ps1
```

## 📍 URLs
| App | Port | URL |
|-----|------|-----|
| **Vane (Default)** | 3000 | http://localhost:3000 |
| **WorldMonitor** | 5173 | http://localhost:5173 |

## 🔧 Configuration Files
| App | File | Required? |
|-----|------|-----------|
| Vane | `Vane/.env.local` | ✅ Yes (AI key) |
| WorldMonitor | `worldmonitor/.env.local` | ❌ No (optional) |

## 🎯 Navigation
1. Open http://localhost:3000 (Vane)
2. Click "Monitor" in sidebar
3. WorldMonitor opens on port 5173

## ⚙️ Minimum Vane Config
Create `Vane/.env.local`:
```env
OPENAI_API_KEY=sk-proj-...
```

## 🛑 Stop Applications
- Close the PowerShell windows
- Or press Ctrl+C in each terminal

## 🔄 Restart
```powershell
.\start-dev.ps1
```

## 📚 Documentation
- `FINAL-STATUS.md` - Current status
- `START-HERE.md` - Getting started
- `CHECKLIST.md` - Verification steps

## ✅ Status
- Port conflict: FIXED ✅
- Syntax error: FIXED ✅
- Integration: COMPLETE ✅
- Ready to launch: YES ✅
