# 🔓 Unlock All Pro Features (Local Development)

Since you're running World Monitor locally, you should have ZERO limitations!

## Quick Fix (Browser Console Method)

1. Open your browser at http://localhost:3000
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. Paste this command and press Enter:

```javascript
localStorage.setItem('wm-pro-key', 'local-dev-full-access')
```

5. **Refresh the page** (F5)

That's it! All Pro features are now unlocked:
- ✅ Unlimited panels (not just 40)
- ✅ Unlimited data sources (not just 80)
- ✅ Stock Analysis panel
- ✅ Backtesting panel
- ✅ Daily Market Brief
- ✅ AI Market Implications
- ✅ Deduction panel
- ✅ Custom AI Widget creation
- ✅ MCP panel connections

## Alternative: Environment Variable Method

If you want the unlock to persist across browser sessions automatically, you can also set it via environment variable, but it requires a longer key (16+ characters):

Add to your `.env.local`:
```bash
VITE_WORLDMONITOR_API_KEY=local-dev-full-access-key-123456
```

Then restart the dev server.

## Why This Works

The app checks three things for Pro access:
1. `wm-pro-key` in localStorage (✅ what we just set)
2. `WORLDMONITOR_API_KEY` from environment
3. Clerk authentication with Pro role

For local development, option #1 is the simplest!
