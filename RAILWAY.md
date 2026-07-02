# Railway deploy — kivuko-web

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
