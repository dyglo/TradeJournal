# Trade Journal Desktop App

A simple, lightweight Windows desktop Trade Journal application built with Electron. It allows traders to log their trades, automatically calculates risk-reward ratios, and provides basic statistics like win rate and total trades.

## What the App Does

Trade Journal is a local-first desktop application for tracking trading activity. It provides a clean form to log each trade with full details, automatically computes the Risk:Reward ratio, and displays a running stats panel so you can monitor your performance over time. All data is stored locally on your machine — no internet connection, no server, no account required.

**Features:**
- Add, edit, and delete trades with full details: pair, direction, entry, stop loss, take profit, risk %, outcome, notes, and date.
- Automatic Risk:Reward (RR) calculation based on entry, stop loss, and take profit values.
- Trade log table sorted newest first with colour-coded outcome badges.
- Stats panel showing total trades, wins, losses, break-even count, win rate, and average RR.
- Local data persistence — trades survive app restarts (stored as JSON in the OS app data folder).
- Clean, dark-themed desktop UI with no unnecessary animations.

---

## How to Run Locally

To run the application in development mode on your local machine, you need [Node.js](https://nodejs.org/) (v18 or later) installed.

```bash
# 1. Clone the repository
git clone https://github.com/dyglo/TradeJournal.git
cd TradeJournal

# 2. Install dependencies
npm install

# 3. Start the application
npm start
```

---

## How to Build Locally

To compile the Windows `.exe` NSIS installer on your machine:

```bash
# Requires wine on Linux/macOS for cross-compilation
npm run build
```

The generated installer will be located in the `dist/` directory as `Trade Journal Setup <version>.exe`.

---

## How Releases Work

This project uses **GitHub Actions** for automated CI/CD releases. The workflow file is located at `.github/workflows/release.yml`.

When a new version tag (e.g., `v1.0.0`) is pushed to the repository, the workflow automatically:

1. Checks out the repository on a `windows-latest` runner.
2. Installs Node.js dependencies with `npm ci`.
3. Runs `npm run build` to compile the Windows NSIS installer using `electron-builder`.
4. Creates a new GitHub Release for the tag.
5. Uploads the compiled `.exe` installer as a downloadable asset to the release.

**To trigger a new release yourself:**
```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

> **Note on workflow setup:** If you fork this repository or set it up fresh, you may need to manually create the `.github/workflows/release.yml` file. A copy of the workflow is provided in [`docs/release-workflow.yml.txt`](docs/release-workflow.yml.txt) — rename it to `.github/workflows/release.yml` and commit it to activate the CI/CD pipeline.

---

## Download the Installer

The latest compiled Windows installer (`.exe`) is always available on the GitHub Releases page:

**[Download Latest Release](https://github.com/dyglo/TradeJournal/releases/latest)**

---

## How to Add This App to a Website Download Page

If you want to distribute this app on your own website, you can link directly to the GitHub Releases page or to a specific installer asset.

### Option 1: Link to the Latest Release Page (Recommended)

This always points to the newest version and shows release notes automatically.

```html
<a href="https://github.com/dyglo/TradeJournal/releases/latest">
  Download for Windows
</a>
```

### Option 2: Direct Link to a Specific Installer Asset

Use this pattern to link directly to the `.exe` file for a specific version. The download starts immediately when the user clicks the link.

```
https://github.com/dyglo/TradeJournal/releases/download/v1.0.0/Trade.Journal.Setup.1.0.0.exe
```

Replace `v1.0.0` and the filename with the version you want to link to. You can find the exact asset filename on the [Releases page](https://github.com/dyglo/TradeJournal/releases).

```html
<a href="https://github.com/dyglo/TradeJournal/releases/download/v1.0.0/Trade.Journal.Setup.1.0.0.exe">
  Download for Windows
</a>
```

### URL Pattern Summary

| Purpose | URL Pattern |
|---|---|
| Always-latest release page | `https://github.com/dyglo/TradeJournal/releases/latest` |
| Direct download (specific version) | `https://github.com/dyglo/TradeJournal/releases/download/{tag}/{filename}.exe` |

---

## Project Structure

```
TradeJournal/
├── .github/
│   └── workflows/
│       └── release.yml        # GitHub Actions CI/CD workflow (tag-triggered)
├── docs/
│   └── release-workflow.yml.txt  # Workflow file backup / setup reference
├── src/
│   ├── main.js                # Electron main process
│   ├── preload.js             # Secure IPC bridge (contextIsolation)
│   └── renderer/
│       ├── index.html         # App UI
│       ├── style.css          # Dark theme stylesheet
│       └── app.js             # Renderer logic (trades, stats, persistence)
├── assets/                    # App icons (placeholder)
├── package.json               # Project config + electron-builder settings
└── README.md
```

---

## Remaining Limitations

- **Code signing:** The installer is not code-signed. Windows SmartScreen may show a warning on first run. Users can click "More info → Run anyway" to proceed. Code signing requires a paid certificate.
- **Auto-update:** There is no built-in auto-update mechanism. Users must download new releases manually from the Releases page.
- **Windows only:** The current build configuration targets Windows x64 only. macOS and Linux builds can be added to `electron-builder` config if needed.
- **No data export:** Trades are stored as local JSON. There is no CSV/Excel export in this version.
