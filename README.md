# Trading Dashboard

A systemic trading dashboard built for tier-based, emotion-free trading on Gold, GBPJPY, BTCUSD, and other instruments using session levels, round/200/500/800 standard levels, and 2-3 tap reversal patterns.

![Trading Dashboard](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-Personal-blue)

## Features

- **Pre-trade green light checker** — 14-point checklist with tier-aware confirmation rules. Will not let you trade until every condition is met.
- **Trade journal** — log every trade with tier, standard level, session, tap count, R achieved, and emotional state.
- **Performance statistics** — overall win rate, tier breakdown, system adherence tracking. Auto-generated insights identify your best-performing setup type.
- **Trade history** — full log with CSV export.
- **Cross-device sync** — optional Google Sheets backend for accessing your data from phone, laptop, anywhere.
- **Trading plan reference** — your full system on a single tab.

## Setup tiers

| Tier | Setup | Frequency |
|---|---|---|
| **T1** | 3-tap reversal at historical level | Wait weeks. Best risk/reward. |
| **T2** | 2nd tap reversal at zone | Bread and butter. 1-2 per week. |
| **T3** | 1H break + 5M retest | Continuation trades. No compounding. |

## Quick start

```bash
# Download or clone this repo
# Open index.html in your browser
# Start logging
```

For cross-device sync, see [SETUP.md](./SETUP.md) for the Google Sheets integration steps.

## Tech

- Plain HTML/CSS/JavaScript — no build step, no dependencies
- LocalStorage for offline-first usage
- Optional Google Apps Script backend for sync
- Works on desktop and mobile

## Core principles

1. **Standard level required** — round/200/500/800 must be inside every zone
2. **Active trading windows only** — London hours 2-4, NY hours 2-4 (Dubai time)
3. **No first-hour entries** — first hour of any session is for observation
4. **No consolidation entries** — even at a level
5. **3R minimum target** to next standard level
6. **Compound only on Tier 1 or 2** — never on Tier 3

See the Plan tab in the dashboard for the complete trading rules.

## License

Personal use. Built for one trader's specific system. Adapt freely.
