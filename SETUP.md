# Trading Dashboard — Setup Guide

A systemic trading dashboard with tier-based setup classification, pre-trade green light checker, journal, statistics, and cross-device cloud sync via Google Sheets.

## Quick start (local only)

1. Download all the files in this folder
2. Open `index.html` in your browser
3. Start logging trades

That's it. Your data is saved in your browser's local storage. **Note: data only exists in this one browser.** If you clear cookies or use another device, you'll start fresh.

For cross-device sync, follow the setup below.

---

## Cross-device sync setup (recommended)

This uses **Google Sheets** as a free backend. Your trades sync to a Google Sheet you own, accessible from any device.

### Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet
2. Rename it something like "Trading Journal"
3. Leave the default tab named `Sheet1` — the script will create a `Trades` tab automatically

### Step 2 — Open the Apps Script editor

1. In your sheet, click **Extensions → Apps Script**
2. A new tab opens with a code editor
3. Delete any default code you see in `Code.gs`

### Step 3 — Paste the backend code

1. Open the `google-apps-script.gs` file from this repo
2. Copy all of its contents
3. Paste it into the Apps Script editor, replacing what was there

### Step 4 — Set your secret key

1. At the top of the script, find this line:
   ```javascript
   const SECRET_KEY = 'CHANGE-ME-TO-A-RANDOM-STRING';
   ```
2. Replace `CHANGE-ME-TO-A-RANDOM-STRING` with a random string of your choice. Example: `my-trading-key-7x9k2`
3. **Remember this key** — you'll paste it into the dashboard later

### Step 5 — Deploy as a Web App

1. Click **Deploy → New deployment** (top right)
2. Click the gear icon next to "Select type" → choose **Web app**
3. Fill in:
   - **Description**: Trading Dashboard API (optional)
   - **Execute as**: Me (your account)
   - **Who has access**: **Anyone** ← important
4. Click **Deploy**
5. Google will ask to authorize — click **Authorize access**, choose your account, click **Advanced** → **Go to (project name) (unsafe)** → **Allow**
   - It's safe — this is your own script running on your own data
6. After deployment, copy the **Web app URL** (looks like `https://script.google.com/macros/s/AKfyc.../exec`)

### Step 6 — Connect the dashboard

1. Open `index.html` in your browser
2. Click the **gear icon** (top right)
3. Paste the **Web app URL** into the first field
4. Paste your **secret key** (same string you put in the script) into the second field
5. Click **Test connection** — should say success
6. Click **Save** — your trades will sync

### Step 7 — Use on other devices

On any other device or browser:
1. Open the same `index.html` (hosted on GitHub Pages or wherever)
2. Click the gear icon
3. Paste the same URL and secret key
4. Your trades automatically load from the cloud

---

## Hosting the dashboard on GitHub Pages (for cross-device access)

1. Create a new repo on GitHub
2. Upload `index.html`, `styles.css`, `app.js`, `storage.js` to the repo root
3. Go to repo **Settings → Pages**
4. Source: **Deploy from a branch**, Branch: **main**, Folder: **/ (root)**
5. Click Save. After ~1 minute, your dashboard is live at `https://yourusername.github.io/yourrepo/`
6. Open that URL on any device, configure sync once per device, and your trades sync automatically

---

## File list

| File | Purpose |
|---|---|
| `index.html` | Main dashboard UI |
| `styles.css` | Styling |
| `storage.js` | Local + cloud storage layer |
| `app.js` | Application logic |
| `google-apps-script.gs` | Backend code for Google Sheets |
| `SETUP.md` | This file |
| `README.md` | Project overview |

---

## Troubleshooting

**Test connection fails**
- Check that you deployed the script as a **Web app** with **Anyone** access (not "Only myself")
- Check that the secret key in the script exactly matches what you entered in settings
- The URL should end in `/exec`, not `/dev`

**Trades not syncing**
- Check the sync indicator at the top of the dashboard — it should say "Cloud synced"
- Try clicking the gear icon → Save again to force a re-sync
- Check the Google Sheet to see if rows are being added when you log trades

**Re-deploying the script after changes**
- Apps Script requires a **new deployment** each time you change code
- Click Deploy → Manage deployments → pencil icon → Version: New version → Deploy
- The URL stays the same, you don't need to update the dashboard

**Data conflicts between devices**
- The dashboard pulls from cloud on every page load
- Each save pushes to cloud
- Last write wins — if you log a trade offline and another device logs while you were offline, the cloud version may overwrite local
- For safety: log trades on one device at a time, or always refresh when switching devices

---

## Privacy notes

- Your Google Sheet is private to your Google account
- The "Anyone" access on the Web App means anyone with both the URL AND your secret key can read/write
- Keep your secret key private — treat it like a password
- The dashboard makes no other network requests besides to your script URL
