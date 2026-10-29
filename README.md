# MDS TV UIs — showcase site

A static website (no build step, no backend) where viewers browse your TV launcher UIs, watch the demo, and get **step-by-step directions + a ready-to-paste prompt** for Claude Code or Codex that installs the UI on their TV.

```
index.html        page shell
styles.css        all styling
app.js            gallery, showcase pages, setup wizard, prompt generator
config.js         ← EDIT THIS: site info + your 5 UIs
setup-data.js     devices, computers, AI tools (menu paths, install commands)
assets/<ui-id>/   your photos + videos for each UI
prompts/          launch-prep prompts to run inside each UI's repo
tools/            helper script to regenerate those prompts
```

## Preview it locally

```bash
cd tv-ui-showcase
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening `index.html` directly also works.)

## Add or update a UI

Everything lives in `config.js`. For each UI:

1. **Media** — drop files in `assets/<id>/`, then set:
   - `cover`: `"assets/slate/cover.jpg"` (16:9, ~1920×1080, JPG/WebP under ~400 KB)
   - `gallery`: `["assets/slate/1.jpg", "assets/slate/2.jpg"]`
   - `youtubeId`: the ID from your YouTube demo (`youtube.com/watch?v=THIS_PART`) — best option, keeps the repo small
   - or `video`: `"assets/slate/demo.mp4"` (keep it short; GitHub blocks files over 100 MB)

   Until you add a `cover`, the card shows a built-in mockup in the UI's `accent` color.
2. **Install details** — must match the UI's repo exactly: `repo`, `apkName`, `packageName`, `homeActivity`, `minAndroid`. The `SITE_ENTRY.json` produced by the launch-prep prompt gives you these.
3. **Go live** — set `status: "available"` and `version: "1.0.0"`.

## Getting each UI repo launch-ready

`prompts/launch-<id>.md` is a prompt pre-filled with that UI's values. Open Claude Code (or Codex) **inside that UI's repo** and paste it. It audits the project, cleans out bloat/secrets/borrowed branding, sets up a GitHub Actions release that publishes `<apkName>` + `<apkName>.sha256` (exactly what the website's install prompt downloads), grabs screenshots, and hands you a `SITE_ENTRY.json` to paste into `config.js`.

Changed names/packages in `config.js`? Regenerate the prompts:

```bash
node tools/make-launch-prompts.js
```

## Publish free on GitHub Pages

1. Create a **public** repo (e.g. `tv-uis`) and push this folder to it.
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `root` → Save.
3. Live at `https://<your-username>.github.io/tv-uis/` in a minute or two. (Custom domain: same Pages screen.)

Public repos are read-only for everyone except you and collaborators you invite — viewers can view, clone and download, but can't change anything. For extra safety turn on **Settings → Branches → branch protection** for `main`.

Vercel / Netlify / Cloudflare Pages also work: import the repo, no build command, output directory = root.

## How the setup prompt works (so you can support viewers)

Two ways in:

- **Easiest:** one button copies a prompt the viewer pastes into *any* AI chat (ChatGPT, Claude, Gemini…). The AI asks which TV and computer they have, then hands them one command at a time to paste into their terminal. No picks, no paid plan needed. The "Copy + open" buttons copy the prompt and open the chat site (links live in `CHAT_APPS` in `setup-data.js`).
- **Exact setup:** viewer picks their device → Mac/Windows/Linux → Any AI chat, Claude Code or Codex. The site generates:

- **Directions** for the parts only a human can do: developer mode, finding the TV's IP, installing the AI tool, opening it in a folder, accepting the "Allow debugging?" popup.
- **A prompt** that has the AI: install adb if needed → `adb connect` (falls back to wireless-debugging pairing) → record device info → download the release APK and verify its SHA-256 → install → **launch it and wait for the viewer to confirm it works** → try `set-home-activity` → only with the viewer's OK, *disable* (never uninstall) the stock launcher after confirming the new one is registered as a home app → reboot test → write an undo script.

Device notes live in `setup-data.js`:
- Google TV devices disable `com.google.android.apps.tv.launcherx` + `com.google.android.tungsten.setupwraith` (the second is the fallback that otherwise brings the stock home screen back).
- On TVs with Google TV built in, the on-screen input switcher can go away — the remote's Input button still works.
- Fire TV: installs, but Amazon keeps the Home button; the prompt is told not to touch `com.amazon.*`.
- Codex on Windows routes through WSL (OpenAI's recommended setup).

If a device's menus change, edit its `devSteps` / `ipPath` in `setup-data.js`.
