# Plate Calculator

Installable, offline-capable barbell plate calculator for solo and partnered workouts. All profiles, lifts, partners, and history stay in the browser on each device.

## Run locally

Requires Node.js 20 or newer.

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite.

## Verify

```powershell
npm test
npm run build
```

## Publish with GitHub Pages

Publishing is automatic via GitHub Actions on every push to `main`.

1. Create a public GitHub repository named `plate-calculator` (or match `VITE_REPO_NAME`).
2. Copy `.env.production.example` to `.env.production`.
3. Set `VITE_REPO_NAME` to the repository name and `VITE_PUBLIC_URL` to:

   `https://YOUR-GITHUB-USERNAME.github.io/plate-calculator/`

4. Commit and push to `main`. The workflow in `.github/workflows/deploy.yml` builds, tests, and deploys.
5. In the repository, open **Settings → Pages**.
6. Under **Build and deployment**, set **Source** to **GitHub Actions**.
7. After the workflow finishes, open:

   `https://YOUR-GITHUB-USERNAME.github.io/plate-calculator/`

Push to `main` again whenever you want to publish an update.

## Install on Android

1. Open the GitHub Pages URL in **Chrome**.
2. Tap Chrome's menu (⋮).
3. Choose **Install app** or **Add to Home screen**.
4. Confirm.

The app opens from the home screen and works offline after its first successful load. Its data remains on that phone. Clearing Chrome site data or uninstalling may remove local app data.

## Share by QR code

1. Open **Settings** in Plate Calculator.
2. Scroll to **Share Plate Calculator**.
3. Let another person scan the QR code with their phone camera.
4. They open the link in Chrome and follow the Android install steps above.

The QR appears only when `VITE_PUBLIC_URL` is configured or the app is running from a public HTTPS address. It shares the app link—not your private profile or workout history.

## Quick phone test without publishing

On a PC and Android phone connected to the same Wi-Fi:

```powershell
npm run build
npm run preview -- --host
```

Open the printed `Network` URL on the phone. Plain LAN HTTP is useful for testing but may not support reliable PWA installation/offline caching. GitHub Pages HTTPS is the recommended installation path.

## Troubleshooting

- **No Install option:** use the published HTTPS URL, then reload once.
- **Blank/broken Pages site:** `VITE_REPO_NAME` must exactly match the GitHub repository name.
- **No QR code:** confirm `VITE_PUBLIC_URL` in `.env.production`, then push to `main` to redeploy.
- **Old icon or version:** uninstall the app, clear Chrome site data for the Pages URL, then reinstall.
