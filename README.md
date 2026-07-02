# Kivuko la Muungano Hub — React Native (Expo) Demo

A native mobile starter for the "Kivuko la Muungano Hub" MVP, covering the same
5-step golden user flow as the web demo:

1. **Onboarding** (`src/screens/OnboardingScreen.tsx`) — registration form with
   Bara / Visiwani region toggle and a "Karibu, Mzalendo!" welcome banner.
2. **Matching** (`src/screens/MatchingScreen.tsx`) — simulated peer-matching
   engine with a radar loading animation, resolving to a mock Mainland↔Zanzibar
   pairing.
3. **Mission Chat** (`src/screens/MissionChatScreen.tsx`) — split chat + Union
   History quiz, ending in a reward modal (airtime + patriotism points).
4. **Certificate** (`src/screens/CertificateScreen.tsx`) — "Balozi wa Muungano"
   certificate with a mock QR code, styled to be CV-ready.
5. **Union Map** (`src/screens/UnionMapScreen.tsx`) — live map dashboard with
   glowing connection lines per completed mission, plus the elder audio archive.

## Running it

```bash
npm install
cp .env.example .env   # set EXPO_PUBLIC_API_URL to your API
npx expo start
```

Then open in Expo Go on your phone, or press `i` / `a` for an iOS/Android
simulator.

**API required:** Start the backend first (see `../kivuko_api/README.md`). By default
the app talks to `http://127.0.0.1:8000`. For production, set `EXPO_PUBLIC_API_URL`
in `.env` to your deployed API URL (e.g. Render).

## Notes for turning this into the real thing

- **Backend**: `../kivuko_api/` — Django REST API with PostgreSQL for production.
  All 5 demo screens now call live endpoints (register, match, chat, quiz, certificate, map).
- **QR codes**: `CertificateScreen.tsx` renders a *visual* mock QR (a seeded
  pseudo-random grid), not a real scannable code. Swap in
  `react-native-qrcode-svg` and encode a real verification URL
  (e.g. `https://kivukohub.go.tz/verify/{certId}`) — the API returns a real
  `verify_url`; swap in `react-native-qrcode-svg` to encode it as a scannable QR.
- **Matching / chat / quiz data** are loaded from the API (`src/api/client.ts`).
  `src/data/mockData.ts` remains as reference only.
- **Theme tokens** live in `src/theme/colors.ts`, using the exact flag-inspired
  palette from the brief (green `#117A65`, blue `#1F618D`, gold `#F1C40F`).
- **Audio**: play buttons currently just toggle icon state for the demo. Wire
  up `expo-av` to actually play the Nyerere/Karume welcome clip and the elder
  oral-history recordings.
- **Certificate/QR verification, WhatsApp bot, USSD, and the moderation
  dashboard** described in the master proposal are out of scope for this
  MVP screen set — this covers exactly the 5-step demo flow needed for the
  walkthrough video.
