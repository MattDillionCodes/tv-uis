/* ==========================================================================
   SITE + UI CONFIG — this is the only file you need to edit day to day.
   Add photos/videos to /assets/<ui-id>/ and point to them below.
   Every UI entry here becomes a card, a showcase page, and a setup prompt.
   ========================================================================== */

window.SITE = {
  title: "MDS TV UIs",
  creator: "Matt Dillion Shoots",
  tagline: "Clean, ad-free home screens for Android TV & Google TV.",
  intro:
    "Seven TV home screens I designed, inspired by the best, with the ads, sponsored rows and bloat stripped out. Pick one, copy one prompt, and hand it to any AI chat. It walks you through the whole setup, step by step.",
  // "Hey, I'm Matt." card on the home page
  about:
    "I make tech, videography and lifestyle videos as Matt Dillion Shoots. I built these home screens to get the ads and clutter off the TV, and all seven are free. If you set one up, tag me. I want to see it on your screen.",
  // Ideas & feedback: paste your Google Form's share link (Send → link icon) into url.
  // While it's empty the section shows but the button says "coming soon".
  ideas: {
    url: "https://docs.google.com/forms/d/e/1FAIpQLScwc1_kdBDr08bjKL2DA7Yq00vqewbmFftrBAlMDDQyK9gh5g/viewform",
    label: "Share an idea",
  },
  // Tip jar — shows in the top bar, after a viewer generates their prompt, in the FAQ and footer.
  // Delete the url to hide it everywhere.
  support: {
    label: "Buy me a coffee",
    url: "https://buymeacoffee.com/mattdillionshoots",
  },
  // Your GitHub profile/org (shown in the footer + FAQ)
  github: "https://github.com/MattDillionCodes",
  links: {
    youtube: "https://www.youtube.com/@mattdillionshoots",
    instagram: "",
    tiktok: "",
  },
};

/*
  FIELD GUIDE
  id            short url-safe id, also used for the folder name in /assets
  status        "available" | "coming-soon"
  accent        main color for the card + placeholder mockup
  layout        placeholder mockup style until you add real photos:
                "hero" | "tiles" | "rows" | "minimal" | "sidebar"
  cover         16:9 image for the card (e.g. "assets/slate/cover.jpg"). Empty = mockup.
  gallery       extra screenshots, shown as thumbnails on the UI's page
  youtubeId     YouTube video id for the showcase video (the part after v=)
  video         OR a self-hosted mp4 (e.g. "assets/slate/demo.mp4") — plays muted on loop
  poster        still frame shown before the video loads
  repo          public GitHub repo for this UI (one repo per UI keeps "latest release" simple)
  apkName       EXACT file name of the APK attached to every GitHub Release
                → the setup prompt downloads  <repo>/releases/latest/download/<apkName>
                → publish "<apkName>.sha256" next to it and the prompt verifies it
  packageName   Android applicationId
  homeActivity  component that handles the HOME intent, "package/.ActivityName"
  minAndroid    lowest Android version you support
  extraSetup    optional post-install steps the AI should run, e.g.
                { title: "Allow usage access (recent apps row)",
                  command: "adb shell appops set com.example GET_USAGE_STATS allow" }
*/

window.UIS = [
  {
    id: "slate-home",
    name: "Slate Home",
    inspiredBy: "iPadOS",
    tagline: "Widgets, a dock, and a real Control Center. Your TV, iPad-style.",
    description:
      "A widget-first home screen: analog clock, calendar and a 5-day forecast up top, your favorite apps in a dock, and everything else one click away in the App Library. Control Center handles Wi-Fi, Bluetooth, volume, inputs and StandBy without digging through Settings.",
    status: "coming-soon",
    version: "1.0",
    accent: "#c45bd8",
    layout: "hero",
    cover: "assets/slate-home/1.jpg",
    gallery: ["assets/slate-home/2.jpg", "assets/slate-home/3.jpg"],
    youtubeId: "",
    video: "assets/slate-home/demo.mp4",
    poster: "assets/slate-home/poster.jpg",
    features: ["Clock, calendar & weather widgets", "Dock + App Library", "Control Center (Wi-Fi, Bluetooth, volume, inputs)", "StandBy mode", "Wallpaper collections", "Add your own photos from your phone"],
    removed: ["Sponsored rows", "\"For you\" recommendations", "Autoplay trailers", "Ads"],
    repo: "https://github.com/MattDillionCodes/slate-home",
    apkName: "slate-home.apk",
    packageName: "com.slatehome.tv",
    homeActivity: "com.slatehome.tv/.MainActivity",
    minAndroid: "8",
    extraSetup: [],
  },
  {
    id: "glass",
    name: "Glass",
    inspiredBy: "Apple TV (tvOS)",
    tagline: "A frosted-glass dock over big, calm wallpapers.",
    description:
      "Your apps sit in a translucent glass dock with a top shelf that names what you're on. A glass Control Center handles volume, sleep timer, light/dark mode and how see-through the glass is. Leave it idle and it drifts into an ambient clock screen.",
    status: "coming-soon",
    version: "1.1.0",
    accent: "#7fb2ff",
    layout: "hero",
    cover: "assets/glass/1.jpg",
    gallery: ["assets/glass/2.jpg", "assets/glass/3.jpg"],
    youtubeId: "",
    video: "assets/glass/demo.mp4",
    poster: "assets/glass/poster.jpg",
    features: ["Frosted-glass app dock", "Live clock & weather", "Control Center with sleep timer", "Adjustable glass transparency", "Ambient clock screensaver", "Long-press to pin apps"],
    removed: ["Sponsored rows", "\"For you\" recommendations", "Autoplay trailers", "Ads"],
    repo: "https://github.com/MattDillionCodes/glass-tv",
    apkName: "glass-tv.apk",
    packageName: "io.github.mattdillioncodes.glass",
    homeActivity: "io.github.mattdillioncodes.glass/.HomeActivity",
    minAndroid: "9",
    extraSetup: [],
  },
  {
    id: "play-home",
    name: "Play Home",
    inspiredBy: "PlayStation 5",
    tagline: "Console-style home with big app art and a quick menu.",
    description:
      "A row of recent apps up top, the selected app's art filling the screen, and a big Open button. Hit the quick menu for time, weather, volume and shortcuts. Pick from animated wallpapers like Waves, Particles, Flow and Glow.",
    status: "coming-soon",
    version: "1.0.0",
    accent: "#3b6ff5",
    layout: "tiles",
    cover: "assets/play-home/1.jpg",
    gallery: ["assets/play-home/2.jpg", "assets/play-home/3.jpg"],
    youtubeId: "",
    video: "assets/play-home/demo.mp4",
    poster: "assets/play-home/poster.jpg",
    features: ["Full-screen app art", "Recent apps with \"opened\" times", "Quick menu: time, weather, volume", "8 animated wallpapers", "Search & profile", "Hold OK for app options"],
    removed: ["Store promos", "Sponsored tiles", "Ads", "Autoplay trailers"],
    repo: "https://github.com/MattDillionCodes/play-home",
    apkName: "play-home.apk",
    packageName: "com.matthew.playhome",
    homeActivity: "com.matthew.playhome/.HomeActivity",
    minAndroid: "12",
    extraSetup: [],
  },
  {
    id: "orb",
    name: "ORB",
    inspiredBy: "the original Xbox dashboard",
    tagline: "The glowing green orb is back, and now it runs your TV.",
    description:
      "A pulsing green orb with a blade menu wired into it. Resume jumps back into your last app, Music plays with a full-screen light show, and the screensaver dims everything down to a floating orb and clock.",
    status: "coming-soon",
    version: "1.0",
    accent: "#8ee63c",
    layout: "sidebar",
    cover: "assets/orb/1.jpg",
    gallery: ["assets/orb/2.jpg", "assets/orb/3.jpg"],
    youtubeId: "",
    video: "assets/orb/demo.mp4",
    poster: "assets/orb/poster.jpg",
    features: ["Animated orb + blade menu", "Resume your last app", "Music light-show visualizer", "Orb clock screensaver", "Network & clock status bar"],
    removed: ["Ads", "Sponsored rows", "Recommendations"],
    repo: "https://github.com/MattDillionCodes/orb",
    apkName: "orb.apk",
    packageName: "com.orbdash",
    homeActivity: "com.orbdash/.MainActivity",
    minAndroid: "8",
    extraSetup: [],
  },
  {
    id: "matrix-home",
    name: "Matrix Home",
    inspiredBy: "The Matrix & Unix terminals",
    tagline: "Run your TV from a green-on-black terminal.",
    description:
      "Your TV boots to a shell prompt. Favorites sit on the command line, apps/ opens everything, and system/ handles weather, wallpaper, color and your name. Go idle and digital rain takes over with a big clock. A built-in man page teaches the remote in 30 seconds.",
    status: "coming-soon",
    version: "0.1.0",
    accent: "#3cff7a",
    layout: "minimal",
    cover: "assets/matrix-home/1.jpg",
    gallery: ["assets/matrix-home/2.jpg", "assets/matrix-home/3.jpg"],
    youtubeId: "",
    video: "assets/matrix-home/demo.mp4",
    poster: "assets/matrix-home/poster.jpg",
    features: ["Terminal-style navigation", "Up to 5 favorites on the command line", "Digital-rain ambient clock", "Custom name, weather city & color", "Built-in help page", "Button hints always on screen"],
    removed: ["Icons & artwork clutter", "Recommendations", "Ads"],
    repo: "https://github.com/MattDillionCodes/matrix-home",
    apkName: "matrix-home.apk",
    packageName: "com.matthew.matrixhome",
    homeActivity: "com.matthew.matrixhome/.HomeActivity",
    minAndroid: "10",
    extraSetup: [],
  },
  {
    id: "arcade",
    name: "Arcade",
    inspiredBy: "Windows Phone & Xbox 360 Metro",
    tagline: "Big Live Tiles, a greeting, and your accent color everywhere.",
    description:
      "A Start screen made of Live Tiles: weather, clock and your apps update right on the tile. Swipe up for the Action Center with quick toggles, volume, screensaver timer and 20 accent colors. Go idle and it drops into a lock-screen clock.",
    status: "coming-soon",
    version: "1.0.0",
    accent: "#e0245e",
    layout: "tiles",
    cover: "assets/arcade/1.jpg",
    gallery: ["assets/arcade/2.jpg", "assets/arcade/3.jpg"],
    youtubeId: "",
    video: "assets/arcade/demo.mp4",
    poster: "assets/arcade/poster.jpg",
    features: ["Live Tiles (weather, clock, apps)", "\"Good afternoon\" greeting", "Action Center quick toggles", "20 accent colors", "Solid or photo tiles", "Lock-screen clock screensaver"],
    removed: ["Sponsored rows", "Ads", "Store promos", "Autoplay trailers"],
    repo: "https://github.com/MattDillionCodes/arcade-tv",
    apkName: "arcade-tv.apk",
    packageName: "com.matthew.arcade",
    homeActivity: "com.matthew.arcade/.HomeActivity",
    minAndroid: "9",
    extraSetup: [],
  },
  {
    id: "zen",
    name: "Zen",
    inspiredBy: "minimal phone launchers",
    tagline: "A big clock, a short list, and a tiny pixel pet.",
    description:
      "Calm, text-only home screen: a huge clock, the date and weather, and just the apps you use. A little pixel cat or dog hangs out next to the weather. Scan a QR code to send a wallpaper from your phone, then dim it to taste.",
    status: "coming-soon",
    version: "0.1.0",
    accent: "#d8c3a0",
    layout: "minimal",
    cover: "assets/zen/1.jpg",
    gallery: ["assets/zen/2.jpg", "assets/zen/3.jpg"],
    youtubeId: "",
    video: "assets/zen/demo.mp4",
    poster: "assets/zen/poster.jpg",
    features: ["Huge clock + weather", "Text-only app list", "Pixel pet (cat or dog)", "Send a wallpaper from your phone (QR)", "Calm animated wallpapers", "Hide apps you never use"],
    removed: ["Icons & artwork clutter", "Recommendations", "Ads"],
    repo: "https://github.com/MattDillionCodes/zen-tv",
    apkName: "zen-tv.apk",
    packageName: "com.zen.tv",
    homeActivity: "com.zen.tv/.MainActivity",
    minAndroid: "9",
    extraSetup: [],
  },
];
