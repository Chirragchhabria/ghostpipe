# GhostPipe — NTPC Dadri → Yamuna fly-ash diversion detector

**Bharat Builds Tour 2026 · Event 02 Environmental Hacks · Track 03 Waste & Energy · DTU Delhi**

Trucks claim full ₹4,500/MT fly-ash utilisation subsidy for 40 MT loads, dump the ash in the
Yamuna floodplain, and deliver a fraction. ASHTRACK GPS is spoofable; paper manifests lie.
GhostPipe checks the two things that can't lie: **satellite physics** (Sentinel-2 SWIR) and
**physical weight** (NH weigh-in-motion) — then drafts the NGT prosecution brief.

## Live demo (2-minute path)

1. **Fresh ash on the floodplain** — drag the compare slider. 38% of tile Y-7 flipped
   soil → ash, ΔFADI +0.140. (Demo pixels are synthetic; the FADI formula is production.)
2. **Haul ledger** — click `ASH-1042`: paper 40 MT → scale 14.6 MT, GPS 52 km off the
   declared Khurja destination. Verdict FLAG, ₹1.14L subsidy at risk. Click `ASH-1043`
   to see a clean delivery stay CLEAN — no false positives.
3. **Prosecution brief** — Download brief (`.txt`) or Copy Bedrock prompt for the
   full Claude-drafted version.

```bash
bun install
bun run dev      # → http://localhost:5173
bun run build    # production build → dist/
```

## Architecture (AWS — wiring next, interfaces frozen)

```
Amplify (this UI)
  → API Gateway  POST /fadi /reconcile /dossier
  → Lambda       FADI band math over s3://sentinel-cogs + 3-way reconciler
                 (mirror: src/lib/*.ts · deploy: lambda/fadi-processor/)
  → DynamoDB     trips · verdicts · spectral-cells
  → Bedrock      Claude 3.5 Sonnet drafts the NGT brief
                 (prompt: src/lib/dossier.ts → buildDossierPrompt)
```

Set `VITE_API_URL` to the API Gateway URL to go live; without it the app runs on
the deterministic local chain so the demo never breaks on stage.

## Why this wins the rubric

| Pillar | GhostPipe answer |
|---|---|
| Reality check | NTPC 270MT pattern, Fly Ash Notification 2021 fines to ₹1,000/MT, NGT jurisdiction — not "AI green planet" |
| Technical depth | SWIR band math + manifest × weighbridge × GPS reconciliation + Bedrock legal chain |
| Shipped demo | Live tile compare, clickable ledger with evidence math, one-click brief download |
| Innovation | No YOLO-trash cliché; physics + ground-truth weight catch what GPS spoofing hides |
| Quantified impact | 40 MT audited/haul · ~₹1.8L theft flagged/trip · 35 km riverbed under watch |

## Submission checklist (Oct 11, 8 PM IST)

- [x] Public GitHub repo with working `bun run build`
- [ ] WeMakeDevs profiles verified (all members)
- [ ] AWS Builder Center profiles verified
- [ ] Hosted URL (Amplify) attached — pending AWS wiring
- [ ] 2–3 min video: 15s problem → 90s live clicks → 30s AWS arch
- [ ] Portal submission with repo + video + demo URL

## Honest demo-data note

Plant/drop-cell coordinates are approximate public locations; satellite tiles in the UI
are synthetic stand-ins rendered with the production FADI thresholds. Swap the tile
source for `s3://sentinel-cogs` chips and no UI code changes.
