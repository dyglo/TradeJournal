# Trade Journal Desktop App

A simple, lightweight Windows desktop Trade Journal application built with Electron. It allows traders to log their trades, automatically calculates risk-reward ratios, and provides basic statistics like win rate and total trades.

## Features
- Add, edit, and delete trades easily.
- Automatic Risk:Reward (RR) calculation based on Entry, Stop Loss, and Take Profit.
- Clean and simple desktop-friendly user interface.
- Local data persistence (saves automatically to your machine).
- No backend, no database required.

## How to Run Locally
To run the application in development mode on your local machine, you need [Node.js](https://nodejs.org/) installed.

1. Clone the repository:
   ```bash
   git clone https://github.com/dyglo/TradeJournal.git
   cd TradeJournal
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```

## How to Build Locally
If you want to manually build the Windows `.exe` installer on your machine:

1. Ensure dependencies are installed (`npm install`).
2. Run the build script:
   ```bash
   npm run build
   ```
3. The generated installer will be located in the `dist/` directory.

## How Releases Work
This project uses GitHub Actions for Continuous Integration and Deployment (CI/CD). 
When a new version tag (e.g., `v1.0.0`) is pushed to the repository, the GitHub Actions workflow automatically:
1. Installs the necessary dependencies.
2. Builds the Windows NSIS installer using `electron-builder`.
3. Creates a new GitHub Release.
4. Uploads the compiled `.exe` installer as an asset to the release.

## Download the Installer
You can always find the latest compiled Windows installer (`.exe`) on the GitHub Releases page:
👉 **[Download Latest Release](https://github.com/dyglo/TradeJournal/releases/latest)**

---

## How to add this app to a website download page

If you want to distribute this app on your own website, you can easily link directly to the GitHub Releases.

**Option 1: Link to the Latest Release Page (Recommended)**
This ensures users always see the release notes and get the newest version.
```html
<a href="https://github.com/dyglo/TradeJournal/releases/latest" class="button">Download for Windows</a>
```

**Option 2: Direct Link to the Installer Asset**
If you want a direct download link that immediately starts downloading the `.exe` file for a specific version (e.g., `v1.0.0`):
```html
<a href="https://github.com/dyglo/TradeJournal/releases/download/v1.0.0/Trade-Journal-Setup-1.0.0.exe" class="button">Download for Windows</a>
```
*(Note: You will need to update the version number in the URL when you release new updates if using the direct link method.)*
