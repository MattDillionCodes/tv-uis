# Launch prep: get "Matrix Home" ready to go public

You're working inside the repo for **Matrix Home**, an Android TV / Google TV home-screen launcher I built (inspired by The Matrix & Unix terminals). I'm about to make this repo public and feature it on my website, where viewers pick a UI and get a prompt that tells *their* Claude Code or Codex to download my release APK and install it on their TV over adb. Your job is to make this project clean, fast, safe, and public-ready — and make sure it matches exactly what the website's install prompt expects.

## How to work
- Start by reading the whole repo. Before changing anything, write `LAUNCH_AUDIT.md`: every issue you find, grouped as **Blocker / Should fix / Nice to have**, with file paths. Then show me the summary and wait for my go-ahead.
- Work on a new branch `launch-prep`. Small, focused commits with clear messages. Don't push, create releases, change GitHub settings, or add secrets without asking me first.
- Don't rewrite git history without asking. Don't delete features — if something looks like bloat, list it and ask.
- Keep me updated in short plain-English lines. I procrastinate and lose focus on long sessions, so work in clear chunks and tell me when a chunk is done and what's next.

## The website contract (must match exactly)
The install prompt viewers run depends on these. If the repo already uses a different value, **don't change the app** — tell me, and I'll update the website config instead.

| Field | Value the website uses |
|---|---|
| Repo | https://github.com/MattDillionCodes/matrix-home |
| Release asset name | `matrix-home.apk` (same name on every release) |
| Checksum asset | `matrix-home.apk.sha256` — format: `<sha256>  matrix-home.apk` |
| Download URL | https://github.com/MattDillionCodes/matrix-home/releases/latest/download/matrix-home.apk |
| applicationId | `com.mattdillionshoots.matrixhome` |
| Home activity | `com.mattdillionshoots.matrixhome/.MainActivity` |
| minSdk | Android 9 (API level to match) |

The home activity must have an intent filter with `MAIN` + `HOME` + `DEFAULT`, and the app must also be launchable from the TV apps list (`LEANBACK_LAUNCHER`). The install prompt runs `adb shell am start -n com.mattdillionshoots.matrixhome/.MainActivity` and `cmd package set-home-activity com.mattdillionshoots.matrixhome/.MainActivity`, so that component name must resolve.

## Checklist

### 1. Name, branding & legal (public = people will look closely)
- The app name, icon, banner, wallpapers, fonts and sample content must be **original or properly licensed**. Remove any logos, icons, artwork, trademarked names or copied assets from the products that inspired it. "Inspired by The Matrix & Unix terminals" is fine in the README, not in the app name or icon.
- Check every font and image for its license; list them in `THIRD_PARTY_NOTICES.md`.
- If any code came from another open-source launcher or library, find its license and tell me what it requires (e.g. GPL code means this repo must stay GPL-compatible). Suggest a LICENSE for the repo and ask me before adding it.
- README gets a short disclaimer: independent project, not affiliated with Google, Amazon, the device makers, or the products that inspired it.

### 2. No ads, tracking, or bloat
- List every dependency and every network call the app makes. Remove ad SDKs, analytics, and crash reporters that send data without opt-in. If something needs the network (weather, artwork), make it obvious and optional.
- Remove unused dependencies, resources, permissions, and dead code. Show me the permission list before/after.
- For listing installed apps, use a `<queries>` block for `MAIN`/`LEANBACK_LAUNCHER` intents instead of `QUERY_ALL_PACKAGES` unless there's a real reason.

### 3. Security & secrets
- Scan the working tree **and git history** for API keys, tokens, keystores, passwords, `local.properties`, `google-services.json` with real values, etc. (use `gitleaks` or `trufflehog` if installed; otherwise grep carefully). If anything leaked into history, stop and tell me — the key needs rotating and history may need cleaning before going public.
- Release signing reads from environment variables / CI secrets, never committed files. `.gitignore` covers keystores, `local.properties`, build outputs, IDE files.
- Add `SECURITY.md` with how to report a problem (ask me for the contact).

### 4. TV correctness
- Manifest: `android.software.leanback` and `android.hardware.touchscreen` declared `required="false"`; a 320×180 `android:banner`; correct HOME + LEANBACK_LAUNCHER filters; `launchMode` appropriate for a home app (pressing Home shouldn't stack copies).
- D-pad: every interactive element is focusable, has a clearly visible focus state, and there are no focus traps or dead ends. Back on the home screen does nothing harmful (doesn't exit to a blank screen).
- Layout is overscan-safe (keep content inside ~5% margins) and looks right at 720p, 1080p and 4K.
- Refreshes when apps are installed, updated, or removed. Works with no internet. Recovers cleanly after the process is killed or the TV reboots.
- Works with a game controller as well as a remote, if the UI supports it.

### 5. Performance (assume a cheap streaming stick)
- Many Google TV sticks have ~2 GB RAM, slow CPUs, and **32-bit-only** userspace. If there's native code, ship `armeabi-v7a` as well as `arm64-v8a`. Test or at least reason about the low end.
- Release build: R8 minify + `shrinkResources` on, with keep rules verified (release build must actually run, not just compile).
- Images: cached, downsampled to display size, no full-res bitmaps in lists. No wake locks, no polling loops, no work while the screen is idle.
- Measure cold start and memory if a device is connected (`adb shell am start -W -n com.mattdillionshoots.matrixhome/.MainActivity`, `adb shell dumpsys meminfo com.mattdillionshoots.matrixhome`). Report numbers before/after.
- Report APK size before/after.

### 6. Build & release pipeline
- Version: semantic `versionName` (start at `1.0.0` for launch) and an increasing `versionCode`.
- Add a GitHub Actions workflow: on a tag like `v1.0.0` → build the signed release APK → rename it to exactly `matrix-home.apk` → generate `matrix-home.apk.sha256` → create a GitHub Release with notes pulled from `CHANGELOG.md`, attaching both files.
- The keystore comes from repo secrets (e.g. base64 keystore + passwords). Tell me exactly which secrets to add and how — don't add them yourself. **Remind me to back up the keystore**: if it's lost, viewers can't update without uninstalling.
- Run `./gradlew lint` and `./gradlew assembleRelease`; fix errors and anything lint marks as a real problem.

### 7. Repo hygiene (viewers can read it, but only I can change it)
- `README.md`: what it is, a hero screenshot, supported devices (Android TV / Google TV; Fire TV = app only, no home-button takeover), "easiest install" pointing to my website, manual install (`adb install` + set as home), **how to undo**, FAQ, disclaimer.
- `CHANGELOG.md` with a `1.0.0` entry. `TESTING.md` with a manual test checklist + device matrix (Onn 4K Pro, Chromecast with Google TV, Google TV Streamer, Shield, a Google TV television, Fire TV).
- Tell me which GitHub settings to flip before going public (e.g. branch protection on main, whether to keep Issues/Discussions on, disable wiki if unused). Public repos are read-only to everyone except collaborators by default.

### 8. Website assets
If a TV is connected over adb, capture fresh screenshots for my site: `adb exec-out screencap -p > site-assets/<name>.png` (1920×1080 if possible) — a clean cover shot plus 3–6 screens showing the main features. Use neutral, non-copyrighted content on screen (no other brands' artwork front and center). Save them in `site-assets/`. If no TV is connected, write a shot list I can capture myself.

### 9. Final deliverables
1. `LAUNCH_READY.md` — the checklist above with ✅ / ⚠️ / ❌ for each item, plus what I still have to do by hand.
2. `SITE_ENTRY.json` — the block for my website config, filled with real values from the repo:
   ```json
   {
     "id": "matrix-home",
     "name": "Matrix Home",
     "inspiredBy": "The Matrix & Unix terminals",
     "tagline": "",
     "description": "",
     "status": "available",
     "version": "",
     "features": [],
     "removed": [],
     "repo": "https://github.com/MattDillionCodes/matrix-home",
     "apkName": "matrix-home.apk",
     "packageName": "",
     "homeActivity": "",
     "minAndroid": "",
     "extraSetup": []
   }
   ```
   `extraSetup` = any adb commands viewers must run after install for full functionality (e.g. granting usage-access or notification-listener permission), each as `{ "title": "...", "command": "adb shell ..." }`. Only include what's truly needed, and explain why.
3. A short summary for me: what changed, what's left, and the exact commands to cut the first release tag.
