# Railway deploy — kivuko-web

## 502 fix (most common)

Your deploy logs show the app listening on one port, but **Networking** routes
to another. They must match.

Example from logs:
```
Kivuko web listening on 0.0.0.0:8080   ← app port
Networking → Port 8081                   ← WRONG → causes 502
```

**Fix:** kivuko-web → **Settings → Networking** → click **⋮** on your domain →
change port to **8080** (same number as in deploy logs) → Save.

Or delete the domain and **Generate Domain** again (Railway auto-detects PORT).

## If build keeps failing

1. **Pay Railway balance** (past-due banner blocks deploys).
2. Open **kivuko-web → Settings → Build**:
   - Builder: **Dockerfile**
   - Dockerfile path: `Dockerfile`
   - Remove any old custom Railpack command overrides.
3. Open **Settings → Deploy**:
   - Start command: `node server.js`
4. **Variables** (required at build time):
   ```
   EXPO_PUBLIC_API_URL=https://kivuko-api-production.up.railway.app
   ```
5. **Deployments → Deploy latest commit** on `main` (not an old failed deploy).

## Verify locally

```bash
npm ci
npm run build
node server.js
# open http://localhost:3000
```

## Expected deploy logs

```
npm run build
App exported to: dist
Kivuko web listening on 0.0.0.0:...
```
