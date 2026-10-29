/* ==========================================================================
   SETUP DATA — devices, computers and AI tools the setup wizard offers.
   Edit if menus move on a device or install commands change.
   ========================================================================== */

const GOOGLE_TV_LAUNCHERS = [
  "com.google.android.apps.tv.launcherx", // Google TV home screen
  "com.google.android.tungsten.setupwraith", // fallback that brings the stock home back if left enabled
];

const GOOGLE_TV_DEV_STEPS = [
  "On the TV open <b>Settings → System → About</b>.",
  "Scroll down to <b>Android TV OS build</b> and press OK on it <b>7 times</b> until it says you're a developer.",
  "Go back to <b>Settings → System → Developer options</b> and turn on <b>USB debugging</b>.",
];

const GOOGLE_TV_IP = "Settings → Network & Internet → (your Wi-Fi network) → IP address";

const WIRELESS_PAIRING_HELP =
  "Newer Google TV software sometimes blocks the classic port. If that happens, have me open Settings → System → Developer options → Wireless debugging, turn it on, choose \"Pair device with pairing code\", and read you the IP:port and 6-digit code. Run `adb pair <IP:PORT> <CODE>`, then `adb connect` using the IP:port shown on the main Wireless debugging screen (it's a different port than the pairing one).";

window.DEVICES = [
  {
    id: "onn-4k-pro",
    name: "Onn 4K Pro",
    family: "Google TV",
    osName: "Google TV",
    debugLabel: "USB debugging",
    devSteps: GOOGLE_TV_DEV_STEPS,
    ipPath: GOOGLE_TV_IP,
    connectHelp: WIRELESS_PAIRING_HELP,
    stockLaunchers: GOOGLE_TV_LAUNCHERS,
    home: "full",
    isTv: false,
  },
  {
    id: "onn-4k",
    name: "Onn 4K box / 4K Plus",
    family: "Google TV",
    osName: "Google TV",
    debugLabel: "USB debugging",
    devSteps: GOOGLE_TV_DEV_STEPS,
    ipPath: GOOGLE_TV_IP,
    connectHelp: WIRELESS_PAIRING_HELP,
    stockLaunchers: GOOGLE_TV_LAUNCHERS,
    home: "full",
    isTv: false,
  },
  {
    id: "chromecast-gtv",
    name: "Chromecast with Google TV",
    family: "Google TV",
    osName: "Google TV",
    debugLabel: "USB debugging",
    devSteps: GOOGLE_TV_DEV_STEPS,
    ipPath: GOOGLE_TV_IP,
    connectHelp: WIRELESS_PAIRING_HELP,
    stockLaunchers: GOOGLE_TV_LAUNCHERS,
    home: "full",
    isTv: false,
  },
  {
    id: "google-tv-streamer",
    name: "Google TV Streamer",
    family: "Google TV",
    osName: "Google TV",
    debugLabel: "USB debugging / Wireless debugging",
    devSteps: [
      ...GOOGLE_TV_DEV_STEPS,
      "If you also see <b>Wireless debugging</b> in Developer options, turn that on too — the AI may ask you for a pairing code from that screen.",
    ],
    ipPath: GOOGLE_TV_IP,
    connectHelp: WIRELESS_PAIRING_HELP,
    stockLaunchers: GOOGLE_TV_LAUNCHERS,
    home: "full",
    isTv: false,
  },
  {
    id: "gtv-smart-tv",
    name: "TV with Google TV built in",
    family: "Hisense · TCL · Sony · etc.",
    osName: "Google TV",
    debugLabel: "USB debugging",
    devSteps: [
      "On the TV open <b>Settings → System → About</b> (Sony: <b>Settings → System → About</b> or <b>Device Preferences → About</b>).",
      "Find <b>Android TV OS build</b> (or <b>Build</b>) and press OK on it <b>7 times</b> until it says you're a developer.",
      "Go to <b>Settings → System → Developer options</b> and turn on <b>USB debugging</b>.",
    ],
    ipPath: GOOGLE_TV_IP,
    connectHelp: WIRELESS_PAIRING_HELP,
    stockLaunchers: GOOGLE_TV_LAUNCHERS,
    home: "full",
    isTv: true,
  },
  {
    id: "shield",
    name: "NVIDIA Shield TV",
    family: "Android TV",
    osName: "Android TV",
    debugLabel: "Network debugging",
    devSteps: [
      "Open <b>Settings → Device Preferences → About</b>.",
      "Press OK on <b>Build</b> <b>7 times</b> until it says you're a developer.",
      "Go to <b>Settings → Device Preferences → Developer options</b> and turn on <b>USB debugging</b> and <b>Network debugging</b>. The IP shown under Network debugging is the one you'll need.",
    ],
    ipPath: "Settings → Device Preferences → Developer options → Network debugging (shows IP:port)",
    connectHelp:
      "Make sure Network debugging is on in Developer options — Shield shows the exact IP:port under it. Use that port if it isn't 5555.",
    stockLaunchers: ["com.google.android.tvlauncher", "com.google.android.leanbacklauncher"],
    home: "full",
    isTv: false,
  },
  {
    id: "android-tv-other",
    name: "Other Android / Google TV box",
    family: "Generic",
    osName: "Android TV / Google TV",
    debugLabel: "USB debugging",
    devSteps: [
      "Open <b>Settings</b> and find <b>About</b> (usually under <b>System</b> or <b>Device Preferences</b>).",
      "Press OK on <b>Build</b> / <b>Android TV OS build</b> <b>7 times</b> until it says you're a developer.",
      "Open <b>Developer options</b> and turn on <b>USB debugging</b> (and <b>Network debugging</b> if you see it).",
    ],
    ipPath: "Settings → Network & Internet → (your Wi-Fi network) → IP address",
    connectHelp: WIRELESS_PAIRING_HELP,
    stockLaunchers: [], // unknown — the AI detects it
    home: "full",
    isTv: false,
  },
  {
    id: "fire-tv",
    name: "Amazon Fire TV",
    family: "Limited support",
    osName: "Fire OS",
    debugLabel: "ADB debugging",
    devSteps: [
      "Open <b>Settings → My Fire TV → About</b>.",
      "Press OK on your device's name (e.g. \"Fire TV Stick 4K\") <b>7 times</b> until it says you're a developer.",
      "Go back to <b>My Fire TV → Developer Options</b> and turn on <b>ADB debugging</b>.",
    ],
    ipPath: "Settings → My Fire TV → About → Network",
    connectHelp:
      "Make sure ADB debugging is on and the Fire TV is awake (not on the screensaver). Double-check the IP on Settings → My Fire TV → About → Network.",
    stockLaunchers: [],
    home: "limited",
    isTv: false,
  },
];

window.COMPUTERS = {
  mac: {
    label: "Mac",
    shell: "zsh in Terminal",
    openTerminal: "Press <b>⌘ + Space</b>, type <b>Terminal</b>, press Enter.",
    adbInstall: "`brew install --cask android-platform-tools` (only if Homebrew is already installed — check with `brew --version`)",
    adbZip: "https://dl.google.com/android/repository/platform-tools-latest-darwin.zip",
    workdir: "~/tv-ui-setup",
    mkcd: "mkdir -p ~/tv-ui-setup && cd ~/tv-ui-setup",
    undoExt: "sh",
  },
  windows: {
    label: "Windows",
    shell: "PowerShell",
    openTerminal: "Press <b>Start</b>, type <b>PowerShell</b>, open it.",
    adbInstall: "`winget install Google.PlatformTools`",
    adbZip: "https://dl.google.com/android/repository/platform-tools-latest-windows.zip",
    workdir: "$HOME\\tv-ui-setup",
    mkcd: "mkdir $HOME\\tv-ui-setup -Force; cd $HOME\\tv-ui-setup",
    undoExt: "ps1",
  },
  // Codex on Windows runs best inside WSL, which behaves like Linux.
  wsl: {
    label: "Windows (WSL / Ubuntu)",
    shell: "bash",
    openTerminal: "Press <b>Start</b>, type <b>Ubuntu</b>, open it.",
    adbInstall: "`sudo apt update && sudo apt install -y adb`",
    adbZip: "https://dl.google.com/android/repository/platform-tools-latest-linux.zip",
    workdir: "~/tv-ui-setup",
    mkcd: "mkdir -p ~/tv-ui-setup && cd ~/tv-ui-setup",
    undoExt: "sh",
  },
  linux: {
    label: "Linux",
    shell: "bash",
    openTerminal: "Open your terminal app.",
    adbInstall: "`sudo apt install -y adb` on Debian/Ubuntu (or your distro's package manager)",
    adbZip: "https://dl.google.com/android/repository/platform-tools-latest-linux.zip",
    workdir: "~/tv-ui-setup",
    mkcd: "mkdir -p ~/tv-ui-setup && cd ~/tv-ui-setup",
    undoExt: "sh",
  },
};

// Chat apps the "hand it to any AI chat" buttons open (prompt is copied first).
window.CHAT_APPS = [
  { name: "ChatGPT", url: "https://chatgpt.com/" },
  { name: "Claude", url: "https://claude.ai/new" },
  { name: "Gemini", url: "https://gemini.google.com/app" },
];

window.TOOLS = {
  chat: {
    label: "Any AI chat",
    sub: "ChatGPT, Claude, Gemini…",
    cmd: "",
    plan: "any AI chat app (free plans work)",
    install: {},
    after: "",
    approve:
      "The AI gives you one command at a time. Paste it into your terminal, press Enter, then copy what the terminal shows back into the chat.",
    chat: true,
  },
  claude: {
    label: "Claude Code",
    sub: "Runs the commands for you",
    cmd: "claude",
    plan: "a Claude Pro or Max plan (or an Anthropic Console account)",
    docs: "https://code.claude.com/docs/en/setup",
    install: {
      mac: [{ note: "Paste this into Terminal:", code: "curl -fsSL https://claude.ai/install.sh | bash" }],
      linux: [{ note: "Paste this into your terminal:", code: "curl -fsSL https://claude.ai/install.sh | bash" }],
      windows: [{ note: "Paste this into PowerShell:", code: "irm https://claude.ai/install.ps1 | iex" }],
    },
    after: "Close and reopen the terminal, then run <code>claude --version</code> to check it worked. The first time you run <code>claude</code> it opens your browser to log in.",
    approve:
      "Claude Code asks before running commands. Read each one and approve it — it'll explain what each does.",
    promptRules:
      "- Before each command that changes the TV, say in one line what it does (your normal permission prompt is fine for the rest).",
  },
  codex: {
    label: "Codex",
    sub: "Runs the commands for you",
    cmd: "codex",
    plan: "a ChatGPT plan that includes Codex (or an OpenAI API key)",
    docs: "https://developers.openai.com/codex/cli",
    install: {
      mac: [
        { note: "With Homebrew:", code: "brew install --cask codex" },
        { note: "Or with Node.js 22+:", code: "npm install -g @openai/codex" },
      ],
      linux: [{ note: "With Node.js 22+:", code: "npm install -g @openai/codex" }],
      wsl: [
        { note: "1. In PowerShell (as Administrator), install WSL, then restart your PC:", code: "wsl --install" },
        { note: "2. Open Ubuntu from the Start menu and install Node.js 22:", code: "curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs" },
        { note: "3. Install Codex:", code: "npm install -g @openai/codex" },
      ],
    },
    after: "Run <code>codex</code> once and sign in with your ChatGPT account.",
    approve:
      "Codex runs commands in a sandbox that blocks network access by default. Talking to your TV is network access, so when Codex asks to run <code>adb</code> or a download outside the sandbox, approve it.",
    promptRules:
      "- You're running in Codex. If a command fails because the sandbox blocks network or device access (adb talks to the TV over Wi-Fi), ask me to approve running it with escalated permissions — don't hunt for workarounds.",
  },
};
