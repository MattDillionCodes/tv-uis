/* MDS TV UIs — static showcase + setup prompt generator. No build step. */
(() => {
  "use strict";

  const SITE = window.SITE || {};
  const UIS = window.UIS || [];
  const DEVICES = window.DEVICES || [];
  const COMPUTERS = window.COMPUTERS || {};
  const TOOLS = window.TOOLS || {};

  const app = document.getElementById("app");
  const toastEl = document.getElementById("toast");

  /* ---------- helpers ---------- */
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // escape, then turn `code` into <code>
  const md = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
  const stripTags = (s) => String(s ?? "").replace(/<[^>]+>/g, "");

  const store = {
    get(k) { try { return localStorage.getItem("mds." + k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem("mds." + k, v); } catch { /* private mode etc. */ } },
  };

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  async function copyText(text, label = "Copied") {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch { /* ignore */ }
      ta.remove();
    }
    toast(label);
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function detectOS() {
    const ua = navigator.userAgent || "";
    if (/Windows/i.test(ua)) return "windows";
    if (/Linux/i.test(ua) && !/Android/i.test(ua)) return "linux";
    return "mac";
  }
  const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const isPhone = () => /iPhone|iPad|Android.+Mobile/i.test(navigator.userAgent || "");

  const ownerRepo = (url) => {
    const m = String(url || "").match(/github\.com\/([^/]+\/[^/#?]+)/i);
    return m ? m[1].replace(/\.git$/, "") : "OWNER/REPO";
  };

  /* ---------- placeholder TV mockups ---------- */
  function mock(ui) {
    const tiles = (n, cls = "t") => Array.from({ length: n }, (_, i) => `<i class="${cls}" style="--i:${i}"></i>`).join("");
    const inner = {
      hero: `<div class="m-shelf"></div><div class="m-row">${tiles(6)}</div>`,
      tiles: `<div class="m-grid"><i class="t big"></i>${tiles(5)}</div>`,
      rows: `<div class="m-nav"><i></i><i></i><i></i><i></i></div>
             <div class="m-row posters">${tiles(6)}</div>
             <div class="m-row posters">${tiles(6)}</div>
             <div class="m-row posters dim">${tiles(6)}</div>`,
      minimal: `<div class="m-clock">9:41</div><ul class="m-list"><li>Watch</li><li class="on">Music</li><li>Games</li><li>Inputs</li><li>Settings</li></ul>`,
      sidebar: `<div class="m-rail">${tiles(5, "r")}</div><div class="m-apps">${tiles(12)}</div>`,
    }[ui.layout] || `<div class="m-row">${tiles(6)}</div>`;
    return `<div class="screen mock layout-${esc(ui.layout || "hero")}" style="--accent:${esc(ui.accent || "#5b8cff")}" aria-hidden="true">${inner}</div>`;
  }

  function coverHTML(ui) {
    if (ui.cover) {
      return `<div class="screen" style="--accent:${esc(ui.accent)}"><img src="${esc(ui.cover)}" alt="${esc(ui.name)} home screen" loading="lazy"></div>`;
    }
    return mock(ui);
  }

  const support = SITE.support && SITE.support.url ? SITE.support : null;
  const cupSVG = `<svg class="cup" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h13v5a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V8Z" fill="currentColor"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 3.5c0 1 1 1 1 2M11.5 3.5c0 1 1 1 1 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  const coffeeLink = (cls, text) =>
    support ? `<a class="${cls}" href="${esc(support.url)}" target="_blank" rel="noopener">${cupSVG}<span>${esc(text || support.label || "Buy me a coffee")}</span></a>` : "";

  /* MDS logo (assets/brand). The big version is used on the "Hey, I'm Matt" card. */
  function logoSVG(cls = "mds-logo") {
    const big = /\bbig\b/.test(cls);
    return `<img class="${cls}" src="assets/brand/${big ? "mds-logo.png" : "mds-logo-sm.png"}" alt="MDS" ${big ? 'width="425" height="480"' : 'width="106" height="120"'}>`;
  }

  const statusBadge = (ui) =>
    ui.status === "available"
      ? `<span class="badge ok">Available${ui.version ? " · v" + esc(ui.version) : ""}</span>`
      : `<span class="badge soon">Coming soon</span>`;

  // Grid rows of 2 big + 3 small cards; leftovers become big so no row has a gap.
  function cardSize(i, n) {
    if (i < 2) return " wide";
    const rem = (n - 2) % 3;
    if (rem === 2 && i >= n - 2) return " wide";
    if (rem === 1 && i === n - 1) return " wide solo";
    return "";
  }

  /* ---------- HOME ---------- */
  function renderHome(scrollTo) {
    document.title = SITE.title || "TV UIs";
    app.innerHTML = `
      <section class="hero wrap">
        <div class="hero-copy">
          <p class="eyebrow"><span class="dot"></span>Built in LA by ${esc(SITE.creator || "")}</p>
          <h1>Your TV home screen, <span class="grad">minus the ads.</span></h1>
          <p class="lede">${esc(SITE.intro || SITE.tagline || "")}</p>
          <div class="hero-cta">
            <a class="btn primary" href="#uis" data-scroll="uis">Browse the UIs</a>
            <a class="btn ghost" href="#faq">Will it work on my TV?</a>
          </div>
        </div>
        <div class="hero-tv">
          <div class="tv-bezel">
            <div class="tv-screen" id="tv-screen">
              ${UIS.filter((u) => u.cover).map((u, i) => `<img src="${esc(u.cover)}" alt="${esc(u.name)} home screen" class="${i === 0 ? "on" : ""}" data-id="${esc(u.id)}" data-name="${esc(u.name)}">`).join("")}
            </div>
            <a class="tv-chip" id="tv-chip" href="#ui-${esc(UIS[0]?.id || "")}"><span class="live"></span><span class="chip-label">Now showing</span><span id="tv-name">${esc(UIS[0]?.name || "")}</span><span class="arrow">→</span></a>
          </div>
          <div class="tv-stand" aria-hidden="true"></div>
          <i class="brk tl" aria-hidden="true"></i><i class="brk tr" aria-hidden="true"></i><i class="brk bl" aria-hidden="true"></i><i class="brk br" aria-hidden="true"></i>
        </div>
      </section>

      <section class="wrap how" aria-label="How it works">
        <ol class="steps3">
          <li><span>1</span><div><b>Pick a UI</b><p>Watch the demo, check the screenshots.</p></div></li>
          <li><span>2</span><div><b>Copy one prompt</b><p>Paste it into ChatGPT, Claude, Gemini, or any AI chat.</p></div></li>
          <li><span>3</span><div><b>Follow along</b><p>The AI walks you through it one step at a time, and can undo it later.</p></div></li>
        </ol>
      </section>

      <section class="wrap" id="uis">
        <div class="section-head">
          <h2>The lineup</h2>
          <p>${UIS.length} home screens · Android TV & Google TV</p>
        </div>
        <div class="grid">
          ${UIS.map((ui, i) => `
            <a class="card${cardSize(i, UIS.length)}" href="#ui-${esc(ui.id)}" style="--accent:${esc(ui.accent)}" ${ui.video ? `data-video="${esc(ui.video)}"` : ""}>
              ${coverHTML(ui)}
              <div class="card-body">
                <div class="card-top"><h3>${esc(ui.name)}</h3>${statusBadge(ui)}</div>
                <p class="inspired">Inspired by ${esc(ui.inspiredBy)}</p>
                <p class="tag">${esc(ui.tagline)}</p>
              </div>
            </a>`).join("")}
        </div>
      </section>

      ${creatorHTML()}

      ${ideasHTML()}

      ${faqHTML()}
    `;
    startHeroTV();
    wireCardPreviews();
    if (scrollTo) {
      requestAnimationFrame(() => document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } else {
      window.scrollTo(0, 0);
    }
  }

  function creatorHTML() {
    const l = SITE.links || {};
    const socials = [
      l.youtube && `<a class="pill" href="${esc(l.youtube)}" target="_blank" rel="noopener">YouTube</a>`,
      l.instagram && `<a class="pill" href="${esc(l.instagram)}" target="_blank" rel="noopener">Instagram</a>`,
      l.tiktok && `<a class="pill" href="${esc(l.tiktok)}" target="_blank" rel="noopener">TikTok</a>`,
    ].filter(Boolean).join("");
    return `
      <section class="wrap creator" aria-label="About the creator">
        <div class="creator-card">
          ${logoSVG("mds-logo big")}
          <div class="creator-copy">
            <h2>Hey, I'm Matt.</h2>
            <p>${esc(SITE.about || "")}</p>
            <div class="creator-links">${socials}${coffeeLink("coffee-btn", support?.label)}</div>
          </div>
        </div>
      </section>`;
  }

  const ideas = SITE.ideas || {};
  const ideaButton = (cls = "btn primary") => ideas.url
    ? `<a class="${cls}" href="${esc(ideas.url)}" target="_blank" rel="noopener">${esc(ideas.label || "Share an idea")} ↗</a>`
    : `<span class="${cls} is-disabled" aria-disabled="true">Form coming soon</span>`;

  function ideasHTML() {
    const kinds = [
      ["New UI idea", "A home screen you want to see, or one that inspired you."],
      ["Feature request", "Something you'd add to one of these UIs."],
      ["Setup problem", "Stuck installing? Tell me your TV and where it broke."],
      ["Anything else", "Feedback, shoutouts, video ideas."],
    ];
    return `
      <section class="wrap ideas" id="ideas">
        <div class="section-head">
          <h2>Ideas & feedback</h2>
          <p>No account needed</p>
        </div>
        <div class="ideas-grid">
          <div class="ideas-copy">
            <p class="lede">Got a concept for the next UI, a feature you want, or something that didn't work? Send it over. I read every one, and the best ideas end up in a build.</p>
            <div class="hero-cta">${ideaButton()}</div>
          </div>
          <ul class="idea-kinds">
            ${kinds.map(([t, d]) => `<li><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join("")}
          </ul>
        </div>
      </section>`;
  }

  let tvTimer = null;
  function startHeroTV() {
    clearInterval(tvTimer);
    const imgs = [...document.querySelectorAll("#tv-screen img")];
    if (imgs.length < 2 || reducedMotion()) return;
    let i = 0;
    tvTimer = setInterval(() => {
      if (!document.body.contains(imgs[0])) return clearInterval(tvTimer);
      imgs[i].classList.remove("on");
      i = (i + 1) % imgs.length;
      imgs[i].classList.add("on");
      const chip = document.getElementById("tv-chip");
      chip.href = "#ui-" + imgs[i].dataset.id;
      document.getElementById("tv-name").textContent = imgs[i].dataset.name;
    }, 3200);
  }

  function wireCardPreviews() {
    if (reducedMotion() || !window.matchMedia?.("(hover: hover)").matches) return;
    document.querySelectorAll(".card[data-video]").forEach((card) => {
      const screen = card.querySelector(".screen");
      let v = null;
      card.addEventListener("mouseenter", () => {
        if (v) return;
        v = document.createElement("video");
        Object.assign(v, { src: card.dataset.video, muted: true, loop: true, playsInline: true, autoplay: true });
        v.className = "preview";
        screen.appendChild(v);
        v.play?.().catch(() => {});
        requestAnimationFrame(() => v && v.classList.add("on"));
      });
      card.addEventListener("mouseleave", () => { v?.remove(); v = null; });
    });
  }

  function faqHTML() {
    const faqs = [
      ["What is this?",
        "Custom home screens (\"launchers\") for Android TV and Google TV. Same apps you already have — just a cleaner screen to launch them from, with no sponsored rows or ads."],
      ["Will it work on my TV?",
        "Yes on Android TV and Google TV: Onn 4K / 4K Pro, Chromecast with Google TV, Google TV Streamer, NVIDIA Shield, and TVs with Google TV built in (Hisense, TCL, Sony…). Fire TV: the app installs, but Amazon keeps control of the Home button. Apple TV, Roku, Samsung (Tizen) and LG (webOS) don't allow custom home screens."],
      ["Do I need to know how to code?",
        "No. You need a computer on the same Wi-Fi as your TV, your remote, and any AI chat (free ChatGPT, Claude or Gemini all work). The AI hands you one command at a time and tells you what to expect. Claude Code or Codex can run the commands for you if you have them. Most setups take 15 to 20 minutes."],
      ["Why use AI to install it?",
        "Every TV is a little different. The prompt tells the AI exactly what to install, what it's allowed to touch, and to check with you before changing anything — so it can adapt to your device instead of you following a brittle guide."],
      ["Is it safe? Can I undo it?",
        "Nothing gets deleted. The stock home screen is disabled, not uninstalled, and the AI saves an undo script on your computer that brings it back in one command. Worst case, a factory reset always restores the original. Modifying your device is at your own risk."],
      ["Can I see the code?",
        `Yes — every UI's source is public on <a href="${esc(SITE.github || "#")}" target="_blank" rel="noopener">GitHub</a>. You can view and download it; only I can make changes.`],
      ...(support ? [["Is it free?",
        `Yes, all of them. If one of these cleaned up your TV and you want to support more builds like this, you can <a href="${esc(support.url)}" target="_blank" rel="noopener">buy me a coffee</a>.`]] : []),
    ];
    return `
      <section class="wrap faq" id="faq">
        <div class="section-head"><h2>FAQ</h2></div>
        <div class="faq-list">
          ${faqs.map(([q, a], i) => `
            <details${i < 2 ? " open" : ""}>
              <summary>${esc(q)}</summary>
              <p>${a}</p>
            </details>`).join("")}
        </div>
      </section>`;
  }

  /* ---------- DETAIL ---------- */
  function mediaItems(ui) {
    const items = [];
    if (ui.youtubeId) items.push({ type: "yt", id: ui.youtubeId });
    else if (ui.video) items.push({ type: "video", src: ui.video });
    if (ui.cover) items.push({ type: "img", src: ui.cover });
    (ui.gallery || []).forEach((src) => items.push({ type: "img", src }));
    return items;
  }

  function stageHTML(ui, item) {
    if (!item) return mock(ui);
    if (item.type === "yt")
      return `<div class="screen video"><iframe src="https://www.youtube-nocookie.com/embed/${esc(item.id)}?rel=0&modestbranding=1" title="${esc(ui.name)} demo video" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>`;
    if (item.type === "video")
      return `<div class="screen video"><video src="${esc(item.src)}" ${ui.poster || ui.cover ? `poster="${esc(ui.poster || ui.cover)}"` : ""} ${reducedMotion() ? "" : "autoplay"} muted loop controls playsinline preload="metadata"></video></div>`;
    return `<div class="screen"><img src="${esc(item.src)}" alt="${esc(ui.name)} screenshot"></div>`;
  }

  function thumbHTML(ui, item, i) {
    const inner =
      item.type === "yt" ? `<img src="https://i.ytimg.com/vi/${esc(item.id)}/mqdefault.jpg" alt=""><span class="play" aria-hidden="true"></span>`
      : item.type === "video" ? (ui.poster || ui.cover ? `<img src="${esc(ui.poster || ui.cover)}" alt="">` : "") + `<span class="play" aria-hidden="true"></span>`
      : `<img src="${esc(item.src)}" alt="">`;
    return `<button class="thumb${i === 0 ? " on" : ""}" data-media="${i}" aria-label="Show ${item.type === "img" ? "screenshot" : "video"} ${i + 1}">${inner}</button>`;
  }

  function renderDetail(ui, params) {
    document.title = `${ui.name} · ${SITE.title || "TV UIs"}`;
    const media = mediaItems(ui);

    const state = {
      tool: params.get("tool") || store.get("tool") || "chat",
      os: params.get("os") || store.get("os") || detectOS(),
      device: params.get("device") || store.get("device") || "",
    };
    if (!TOOLS[state.tool]) state.tool = "chat";
    if (!["mac", "windows", "linux"].includes(state.os)) state.os = "mac";
    if (!DEVICES.some((d) => d.id === state.device)) state.device = "";

    app.innerHTML = `
      <div class="wrap detail" style="--accent:${esc(ui.accent)}">
        <a class="back" href="#home">← All UIs</a>

        <section class="detail-top">
          <div class="media">
            <div class="stage" id="stage">${stageHTML(ui, media[0])}</div>
            ${media.length > 1 ? `<div class="thumbs">${media.map((m, i) => thumbHTML(ui, m, i)).join("")}</div>` : ""}
            ${media.length === 0 ? `<p class="muted small center">Screenshots & demo video coming soon.</p>` : ""}
          </div>

          <div class="info">
            ${statusBadge(ui)}
            <h1>${esc(ui.name)}</h1>
            <p class="inspired">Inspired by ${esc(ui.inspiredBy)}</p>
            <p class="lede">${esc(ui.description || ui.tagline)}</p>

            ${ui.features?.length ? `<h4>What you get</h4><ul class="chips">${ui.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
            ${ui.removed?.length ? `<h4>What's gone</h4><ul class="chips removed">${ui.removed.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}

            <dl class="specs">
              <div><dt>Works on</dt><dd>Android TV & Google TV ${esc(ui.minAndroid || "9")}+</dd></div>
              ${ui.version && ui.status === "available" ? `<div><dt>Version</dt><dd>${esc(ui.version)}</dd></div>` : ""}
              <div><dt>Source</dt><dd><a href="${esc(ui.repo)}" target="_blank" rel="noopener">${esc(ownerRepo(ui.repo))}</a></dd></div>
            </dl>
            <a class="btn primary" href="#setup" data-scroll="setup">Put it on my TV ↓</a>
          </div>
        </section>

        <section class="setup" id="setup">
          <div class="section-head">
            <h2>Put ${esc(ui.name)} on your TV</h2>
            <p>No tech skills needed. Your AI does the hard part.</p>
          </div>

          ${ui.status !== "available" ? `<div class="note warn"><b>Heads up:</b> ${esc(ui.name)} isn't released yet. You can preview the setup, but the download link won't work until launch day.</div>` : ""}
          ${isPhone() ? `<div class="note">You'll need a <b>computer</b> on the same Wi-Fi as your TV. Copy the prompt here, or use <b>Copy link</b> to open this page on your computer.</div>` : ""}

          <div class="handoff">
            <div class="handoff-copy">
              <span class="handoff-tag">Easiest</span>
              <h3>Hand it to any AI chat</h3>
              <p>Copy one prompt and paste it into ChatGPT, Claude, Gemini, or whatever AI you use. It asks what TV and computer you have, then walks you through every step, one command at a time.</p>
            </div>
            <div class="handoff-actions">
              <button type="button" class="btn primary" id="handoff-copy">Copy the prompt</button>
              <div class="chat-links">${chatLinksHTML()}</div>
            </div>
          </div>

          <div class="or-divider"><span>or get steps for your exact setup</span></div>

          <div class="picker">
            <fieldset>
              <legend><span class="n">1</span> Your TV device</legend>
              <div class="opts devices" role="radiogroup" aria-label="TV device">
                ${DEVICES.map((d) => `
                  <button type="button" class="opt" role="radio" data-k="device" data-v="${esc(d.id)}" aria-checked="${state.device === d.id}">
                    <b>${esc(d.name)}</b><small>${esc(d.family)}</small>
                  </button>`).join("")}
              </div>
            </fieldset>

            <fieldset>
              <legend><span class="n">2</span> Your computer</legend>
              <div class="opts seg" role="radiogroup" aria-label="Computer">
                ${["mac", "windows", "linux"].map((k) => `
                  <button type="button" class="opt" role="radio" data-k="os" data-v="${k}" aria-checked="${state.os === k}"><b>${esc(COMPUTERS[k].label)}</b></button>`).join("")}
              </div>
            </fieldset>

            <fieldset>
              <legend><span class="n">3</span> Your AI</legend>
              <div class="opts seg" role="radiogroup" aria-label="AI tool">
                ${Object.entries(TOOLS).map(([k, t]) => `
                  <button type="button" class="opt" role="radio" data-k="tool" data-v="${k}" aria-checked="${state.tool === k}"><b>${esc(t.label)}</b>${t.sub ? `<small>${esc(t.sub)}</small>` : ""}</button>`).join("")}
              </div>
            </fieldset>
          </div>

          <div id="output" class="output" aria-live="polite"></div>
        </section>
      </div>
    `;

    // media switching
    app.querySelectorAll(".thumb").forEach((btn) =>
      btn.addEventListener("click", () => {
        app.querySelectorAll(".thumb").forEach((b) => b.classList.remove("on"));
        btn.classList.add("on");
        document.getElementById("stage").innerHTML = stageHTML(ui, media[+btn.dataset.media]);
      })
    );

    // picker
    app.querySelectorAll(".opt").forEach((btn) =>
      btn.addEventListener("click", () => {
        const { k, v } = btn.dataset;
        state[k] = v;
        store.set(k, v);
        app.querySelectorAll(`.opt[data-k="${k}"]`).forEach((b) => b.setAttribute("aria-checked", String(b === btn)));
        syncURL(ui, state);
        renderOutput(ui, state);
        if (k === "device") document.getElementById("output").scrollIntoView({ behavior: "smooth", block: "start" });
      })
    );

    const handoff = () => buildPrompt(ui, GENERIC_DEV, state.os, "chat");
    document.getElementById("handoff-copy").addEventListener("click", () => copyText(handoff(), "Prompt copied. Paste it into your AI chat"));
    wireChatLinks(document.querySelector(".handoff"), handoff);

    renderOutput(ui, state);
    if (params.get("device")) {
      requestAnimationFrame(() => document.getElementById("setup")?.scrollIntoView({ block: "start" }));
    } else {
      window.scrollTo(0, 0);
    }
  }

  function chatLinksHTML(short) {
    return (window.CHAT_APPS || []).map((c) =>
      `<a class="btn ghost sm" href="${esc(c.url)}" target="_blank" rel="noopener" data-chat="${esc(c.name)}">${short ? "" : "Copy + open "}${esc(c.name)} ↗</a>`).join("");
  }
  function wireChatLinks(root, getPrompt) {
    root?.querySelectorAll("[data-chat]").forEach((a) =>
      a.addEventListener("click", () => copyText(getPrompt(), `Prompt copied. Paste it into ${a.dataset.chat}`)));
  }

  function syncURL(ui, state) {
    const q = new URLSearchParams();
    if (state.device) q.set("device", state.device);
    q.set("os", state.os);
    q.set("tool", state.tool);
    try { history.replaceState(null, "", `#ui-${ui.id}${window.ARTIFACT_MODE ? "" : "?" + q}`); } catch { /* file:// in some browsers */ }
  }

  /* ---------- setup generation ---------- */
  function envFor(os, tool) {
    return os === "windows" && tool === "codex" ? "wsl" : os;
  }

  function undoScript(ui, dev, comp) {
    const lines = [];
    const isPs = comp.undoExt === "ps1";
    lines.push(isPs ? `# Undo ${ui.name}: brings back the stock home screen` : `#!/usr/bin/env bash\n# Undo ${ui.name}: brings back the stock home screen`);
    if (dev.home === "full") {
      if (dev.stockLaunchers.length) dev.stockLaunchers.forEach((p) => lines.push(`adb shell pm enable ${p}`));
      else lines.push(`adb shell pm enable <stock launcher package from changes.log>`);
    }
    lines.push(`adb uninstall ${ui.packageName}`);
    return lines.join("\n");
  }

  const plain = (html) => stripTags(String(html)).replace(/&amp;/g, "&");

  // Stand-ins used when the viewer skips the picks and the AI asks instead.
  const GENERIC_DEV = {
    generic: true, name: "TV", osName: "Android TV / Google TV",
    debugLabel: "USB debugging (ADB debugging on Fire TV)",
    ipPath: "the IP spot listed for my device below", connectHelp: "use the connection tips listed for my device below",
    stockLaunchers: [], home: "full", isTv: false, devSteps: [],
  };
  const GENERIC_COMP = {
    generic: true, label: "my computer", shell: "ask me: Mac, Windows or Linux",
    adbInstall: "the install command for my computer listed below", adbZip: "the zip for my computer listed below",
    workdir: "a folder called tv-ui-setup in my home folder", mkcd: "", undoExt: "sh (Mac/Linux) or ps1 (Windows)",
  };

  function deviceNotes() {
    // The most common connection tip is printed once instead of under every device.
    const counts = {};
    DEVICES.forEach((d) => (counts[d.connectHelp] = (counts[d.connectHelp] || 0) + 1));
    const shared = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    return `Shared connection tip (used by most devices below): ${shared}

` + DEVICES.map((d) => `- **${d.name}** (${d.family})
  - Developer mode: ${d.devSteps.map(plain).join(" Then: ")}
  - IP address: ${d.ipPath}
  - If adb can't connect: ${d.connectHelp === shared ? "use the shared connection tip above" : d.connectHelp}
  - ${d.home === "full"
      ? `Stock home packages to disable in step 8: ${d.stockLaunchers.length ? d.stockLaunchers.map((p) => `\`${p}\``).join(", ") : "unknown, detect them in step 3"}${d.isTv ? ". On a TV, warn me the on-screen input switcher may go away (the remote's Input button still works)." : ""}`
      : "Home button can't be replaced on this device. Install only, never touch `com.amazon.*` packages, and show me how to move the app to the front of my Apps row."}`).join("\n");
  }

  function computerNotes() {
    return ["mac", "windows", "linux"].map((k) => {
      const c = COMPUTERS[k];
      return `- **${c.label}**: open a terminal (${plain(c.openTerminal)}). Install adb with ${c.adbInstall}, or Google's zip: ${c.adbZip}. Working folder: \`${c.mkcd}\``;
    }).join("\n");
  }

  function buildPrompt(ui, dev, osKey, toolKey) {
    const tool = TOOLS[toolKey];
    const isChat = !!tool.chat;
    const generic = !!dev.generic;
    const comp = generic ? GENERIC_COMP : COMPUTERS[envFor(osKey, toolKey)];
    const repo = ui.repo.replace(/\/$/, "");
    const apkUrl = `${repo}/releases/latest/download/${ui.apkName}`;
    const undoFile = generic ? `undo-${ui.id}.sh (or .ps1 on Windows)` : `undo-${ui.id}.${comp.undoExt}`;
    const stock = dev.stockLaunchers;
    const stockList = generic
      ? "the stock home packages listed for my device below"
      : stock.length ? stock.map((p) => `\`${p}\``).join(", ") : "(unknown for this device, detect it in step 3)";

    const extra = (ui.extraSetup || []).length
      ? ui.extraSetup.map((x) => `   - ${x.title}: \`${x.command}\``).join("\n")
      : "   - None for this UI.";

    const howToRun = isChat
      ? `## How we'll work
You probably can't run commands on my computer, so be my guide:
- Give me **one command at a time** in its own code block, made for my computer's terminal. Tell me what it does and what I should see.
- Wait for me to paste back what the terminal shows before moving on. If something fails, help me fix it.
- Whenever a step below says "run", "download" or "create", turn it into a command for me to paste.
- If you *can* run commands on my computer (you're an agent with terminal access), run them yourself instead and keep me posted.
- Keep it short and friendly. No walls of text.

`
      : "";

    const intro = generic
      ? `## First, ask me two things
1. Which TV device I have. Show me this list: ${DEVICES.map((d) => d.name).join(", ")}.
2. Whether my computer is a Mac, Windows or Linux.
Then use the matching notes at the bottom of this message.
`
      : `## My setup
- Computer: ${comp.label} (${comp.shell})
- TV device: ${dev.name} (${dev.osName})
- The TV and this computer are on the same Wi-Fi network.
`;

    const before = generic
      ? `## Before step 1
Walk me through turning on developer mode and finding my TV's IP address, using the notes for my device below. Make sure my TV and computer are on the same Wi-Fi.`
      : `## Before step 1
If I haven't done these yet, walk me through them:
- Developer mode: ${dev.devSteps.map(plain).join(" Then: ")}
- Find the TV's IP address: ${dev.ipPath}`;

    const homeFull = `8. **Make it the home screen.**${generic ? " (Fire TV: skip this and follow the Fire TV note below.)" : ""}
   a. Try the gentle way first: \`adb shell cmd package set-home-activity ${ui.homeActivity}\`. Ask me to press Home on the remote and tell you what shows up. If it's ${ui.name}, skip to step 9.
   b. If the stock home screen still shows: explain that ${dev.osName} doesn't let you pick a different home app in Settings, so the fix is to *disable* (not uninstall) the stock home screen. It's fully reversible with one command. Tell me what I'll lose (the stock screen's recommendations / "For you" rows${dev.isTv ? ", and possibly the on-screen input switcher. I'd use the Input button on my remote instead" : ""}) and ask me for a clear yes.
   c. Only after I say yes, and only because step 7 proved ${ui.name} works:
      - Safety check first: \`adb shell cmd package query-activities --brief -a android.intent.action.MAIN -c android.intent.category.HOME\` must list \`${ui.packageName}\` as a home app. If it doesn't, STOP and tell me. Disabling the stock launcher without a working replacement would leave the TV with no home screen.
      - Confirm each package exists with \`adb shell pm list packages <pkg>\` and skip any that don't. Packages to disable, in this order: ${stockList}.${!generic && !stock.length ? "\n      - Use the current home app you found in step 3 (plus any setup-wizard fallback package that re-launches it). Show me the exact package names and get my OK first." : ""}
      - If the current home app from step 3 is something not on this list, show me and ask before touching it.
      - Disable them one at a time: \`adb shell pm disable-user --user 0 <pkg>\`, checking each one worked.
   d. Ask me to press Home. If ${ui.name} comes up, great. If the screen is blank or stuck, immediately run \`adb shell pm enable <pkg>\` for each package you disabled and tell me.
   e. Reboot with \`adb reboot\`, wait about a minute, reconnect, and ask me to confirm ${ui.name} comes up after the restart.`;

    const homeLimited = `8. **Home screen (Fire TV limits).** Fire OS doesn't allow replacing Amazon's home screen without risky workarounds. **Do not** disable, modify or uninstall any \`com.amazon.*\` package. Instead tell me ${ui.name} is installed and how to reach it fast: it's in the Apps row / "Your Apps", and I can move it to the front by highlighting it, pressing the ☰ menu button, and choosing "Move to front".`;

    const undoStep = isChat
      ? `9. **Undo.** Give me the undo commands in one code block (${dev.home === "full" ? "re-enable every package we disabled first, then " : ""}uninstall \`${ui.packageName}\`) and tell me to save them somewhere, like my Notes app.`
      : `9. **Undo script.** Create \`${undoFile}\` in the working folder (don't run it). It should ${dev.home === "full" ? "re-enable every package you disabled (from changes.log) first, then " : ""}uninstall \`${ui.packageName}\`. Show me the exact command to run it later.`;

    return `# Help me set up the "${ui.name}" TV home screen

You're helping me install a custom home screen (an Android TV launcher) called **${ui.name}** on my ${generic ? "TV" : `**${dev.name}**`}${dev.home === "full" ? " and make it my default home screen" : ""}. I'm not very technical, so:
- Go one step at a time and tell me in plain English what's happening and why.
- When you need me to do something on the TV or tell you something, stop, ask, and wait for my answer.
- Ask before changing anything on the TV other than installing ${ui.name}.

${howToRun}${intro}
${before}

## The launcher
- Public repo (read-only): ${repo}
- Prebuilt APK (latest release): ${apkUrl}
- Checksum file, if published: ${apkUrl}.sha256
- Package name: \`${ui.packageName}\`
- Home activity: \`${ui.homeActivity}\`
- Minimum Android version: ${ui.minAndroid || "9"}

## Ground rules
- Work inside ${generic ? comp.workdir : `\`${comp.workdir}\``}${isChat ? "" : " (create it if needed). Log every command that changes the TV to `changes.log` there"}.
- The repo is read-only: download from it, never push, fork, open issues/PRs, or edit it. Use the prebuilt APK. Don't build from source unless I ask.
- Never uninstall or clear system apps, never factory reset, and never touch packages that aren't named here. The only package you may uninstall is \`${ui.packageName}\`.
${dev.home === "full" ? "- The only packages you may disable are the stock home packages in step 8, and only after I say yes." : "- Don't disable any packages on this device."}
- Don't install anything on my computer other than adb without asking.${tool.promptRules ? "\n" + tool.promptRules : ""}

## Steps
1. **adb.** Check \`adb version\`. If it's missing, install Android platform-tools: ${comp.adbInstall}. If that doesn't work, use Google's official zip (${comp.adbZip}) unzipped into the working folder.
2. **Connect to the TV.** Ask me for the TV's IP (I can find it at: ${dev.ipPath}). Run \`adb connect <IP>:5555\`, then tell me to look at the TV and accept "Allow debugging?", ticking "Always allow from this computer". Check \`adb devices\` until it shows \`device\`.
   - \`unauthorized\` → have me accept the prompt on the TV; if no prompt appears, have me turn ${dev.debugLabel} off and on, then retry.
   - Refused / timed out → ${dev.connectHelp}
   - If more than one device is listed, add \`-s <IP:PORT>\` to every adb command.
3. **Check the TV.** Get the Android version (\`adb shell getprop ro.build.version.release\`), model (\`adb shell getprop ro.product.model\`) and current home app (\`adb shell cmd package resolve-activity --brief -a android.intent.action.MAIN -c android.intent.category.HOME\`). If Android is older than ${ui.minAndroid || "9"}, stop and tell me.
4. **Download.** Download the APK into the working folder. If the \`.sha256\` file exists, verify the hash. If it doesn't match, stop and tell me; don't install. If the download 404s, check https://api.github.com/repos/${ownerRepo(repo)}/releases/latest and tell me what's there instead of guessing.
5. **Install.** \`adb install -r ${ui.apkName}\`. If you get INSTALL_FAILED_UPDATE_INCOMPATIBLE, ask me before uninstalling the old copy of ${ui.name}.
6. **Extra setup for this UI.**
${extra}
7. **Test it first.** Open it with \`adb shell am start -n ${ui.homeActivity}\`. Ask me to confirm it's on screen and I can move around with the remote. Don't continue until I confirm.
${dev.home === "full" ? homeFull : homeLimited}
${undoStep}
10. **Wrap up.** In a few short lines tell me what got installed, what changed, how to undo it${dev.home === "full" ? ", and that a big system update can bring the stock home screen back (fix: redo step 8)" : ""}. Mention I can turn ${dev.debugLabel} off on the TV once I'm happy.
${generic ? `
## Notes for each TV device
${deviceNotes()}

## Notes for each computer
${computerNotes()}
` : ""}`;
  }

  function renderOutput(ui, state) {
    const out = document.getElementById("output");
    const dev = DEVICES.find((d) => d.id === state.device);
    if (!dev) {
      out.innerHTML = `<div class="empty"><span class="tv-ico" aria-hidden="true"></span><p>Pick your TV device above to get directions and a prompt made for your exact setup.</p></div>`;
      return;
    }
    const env = envFor(state.os, state.tool);
    const comp = COMPUTERS[env];
    const tool = TOOLS[state.tool];
    const installs = tool.install[env] || tool.install[state.os] || [];
    const prompt = buildPrompt(ui, dev, state.os, state.tool);
    const undo = undoScript(ui, dev, comp);
    const codeBlock = (code) =>
      `<div class="code"><pre><code>${esc(code)}</code></pre><button class="copy-mini" data-copy="${esc(code)}" aria-label="Copy command">Copy</button></div>`;

    const isChat = !!tool.chat;
    const toolSteps = isChat
      ? [
          {
            t: "Open a terminal on your computer",
            b: `<p>${comp.openTerminal}</p><p class="muted">Keep it open next to your AI chat. That's where you'll paste the commands the AI gives you.</p>`,
          },
          {
            t: "Paste the prompt into your AI chat",
            b: `<p>Copy the prompt and paste it into ChatGPT, Claude, Gemini or any AI chat. Then just do what it says.</p>
                <div class="chat-links">${chatLinksHTML()}</div>
                <ul class="ticks">
                  <li>${tool.approve}</li>
                  <li>When your TV asks <b>“Allow debugging?”</b>, tick <b>Always allow from this computer</b> and press OK.</li>
                </ul>`,
          },
        ]
      : [
          {
            t: `Install ${esc(tool.label)}${env === "wsl" ? " (via WSL)" : ""}`,
            b: `${env === "wsl" ? `<p class="muted">Codex works best on Windows inside WSL (a built-in Linux layer). One-time setup:</p>` : ""}
                ${installs.map((x) => `<p>${esc(x.note)}</p>${codeBlock(x.code)}`).join("")}
                <p class="muted">${tool.after} Already have it? Skip this.</p>`,
          },
          {
            t: `Open ${esc(tool.label)} in a fresh folder`,
            b: `<p>${comp.openTerminal} Then run:</p>${codeBlock(`${comp.mkcd}${env === "windows" ? "; " : " && "}${tool.cmd}`)}`,
          },
          {
            t: "Paste the prompt",
            b: `<p>Copy the prompt, paste it into ${esc(tool.label)}, press Enter, and follow along.</p>
                <ul class="ticks">
                  <li>When your TV asks <b>“Allow debugging?”</b>, tick <b>Always allow from this computer</b> and press OK.</li>
                  <li>${tool.approve}</li>
                </ul>`,
          },
        ];

    const steps = [
      {
        t: "What you need (2 min check)",
        b: `<ul class="ticks">
              <li>A computer on the <b>same Wi-Fi</b> as your TV</li>
              <li>Your TV remote</li>
              <li>${isChat ? "Any AI chat app (free plans work)" : `${esc(tool.label)} with ${esc(tool.plan)}`}</li>
              <li>About ${isChat ? "20" : "15"} minutes</li>
            </ul>
            ${dev.home === "limited" ? `<div class="note warn"><b>Fire TV heads up:</b> ${esc(ui.name)} will install and run, but Amazon doesn't let other apps take over the Home button. You'll open it from your Apps row.</div>` : ""}
            ${dev.isTv ? `<div class="note">On a TV with Google TV built in, replacing the home screen can hide the on-screen input switcher. Your remote's <b>Input</b> button still works, and undo is one command.</div>` : ""}`,
      },
      {
        t: `Turn on developer mode on your ${esc(dev.name)}`,
        b: `<ol class="sub">${dev.devSteps.map((s) => `<li>${s}</li>`).join("")}</ol>`,
      },
      {
        t: "Find your TV's IP address",
        b: `<p>${esc(dev.ipPath)}</p><p class="muted">It looks like <code>192.168.1.42</code>. Keep it handy — the AI will ask for it.</p>`,
      },
      ...toolSteps,
      {
        t: "Press Home",
        b: dev.home === "full"
          ? `<p>When it's done, press <b>Home</b> on your remote — you should land on ${esc(ui.name)}. Want the old screen back? See <b>Undo</b> below.</p>`
          : `<p>Open ${esc(ui.name)} from your Apps row. To remove it, see <b>Undo</b> below.</p>`,
      },
    ];

    out.innerHTML = `
      <div class="out-grid">
        <div class="directions">
          <h3>Directions <span class="muted small">${esc(dev.name)} · ${esc(comp.label)} · ${esc(tool.label)}</span></h3>
          <ol class="big-steps">
            ${steps.map((s) => `<li><h4>${s.t}</h4>${s.b}</li>`).join("")}
          </ol>
        </div>

        <div class="prompt-col">
          <div class="prompt-card">
            <div class="prompt-head">
              <h3>Your prompt</h3>
              <div class="btn-row">
                <button class="btn primary sm" id="copy-prompt">Copy prompt</button>
                ${window.ARTIFACT_MODE ? "" : `<button class="btn ghost sm" id="dl-prompt">Download</button>`}
                <button class="btn ghost sm" id="copy-link">Copy link</button>
              </div>
            </div>
            ${isChat ? `<div class="prompt-chats"><span class="muted small">Copy + open:</span>${chatLinksHTML(true)}</div>` : ""}
            <pre class="prompt" tabindex="0"><code>${esc(prompt)}</code></pre>
          </div>

          <details class="undo">
            <summary>Undo — get the stock home screen back</summary>
            <p>${isChat ? "Your AI gives you these at the end." : `The AI saves this as <code>undo-${esc(ui.id)}.${esc(comp.undoExt)}</code> in your setup folder.`} You can also run these lines yourself (TV connected with <code>adb connect &lt;IP&gt;</code> first):</p>
            ${codeBlock(undo.replace(/^#!.*\n/, ""))}
            <p class="muted small">Or tell ${isChat ? "your AI" : esc(tool.label)}: “Help me undo the ${esc(ui.name)} setup.”</p>
          </details>

          <div class="idea-card">
            <div>
              <b>Idea for ${esc(ui.name)}?</b>
              <p>Feature requests, bugs and setup problems all help.</p>
            </div>
            ${ideaButton("btn ghost sm")}
          </div>

          ${support ? `<div class="support-card">
            <div>
              <b>Got it running?</b>
              <p>These UIs are free. If ${esc(ui.name)} cleaned up your TV, a coffee helps me keep building more.</p>
            </div>
            ${coffeeLink("coffee-btn", support.label)}
          </div>` : ""}
        </div>
      </div>`;

    out.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", () => copyText(b.dataset.copy, "Command copied")));
    document.getElementById("copy-prompt").addEventListener("click", () => copyText(prompt, isChat ? "Prompt copied. Paste it into your AI chat" : "Prompt copied. Paste it into " + tool.label));
    wireChatLinks(out, () => prompt);
    document.getElementById("dl-prompt")?.addEventListener("click", () => download(`${ui.id}-setup-prompt.md`, prompt));
    document.getElementById("copy-link").addEventListener("click", () => copyText(location.href, "Link copied"));
  }

  /* ---------- footer ---------- */
  function renderFooter() {
    const l = SITE.links || {};
    const links = [
      l.youtube && `<a href="${esc(l.youtube)}" target="_blank" rel="noopener">YouTube</a>`,
      l.instagram && `<a href="${esc(l.instagram)}" target="_blank" rel="noopener">Instagram</a>`,
      l.tiktok && `<a href="${esc(l.tiktok)}" target="_blank" rel="noopener">TikTok</a>`,
      SITE.github && `<a href="${esc(SITE.github)}" target="_blank" rel="noopener">GitHub</a>`,
      support && `<a href="${esc(support.url)}" target="_blank" rel="noopener">${esc(support.label || "Buy me a coffee")}</a>`,
    ].filter(Boolean).join("");
    document.getElementById("footer").innerHTML = `
      <div class="wrap foot">
        <div class="foot-brand">${logoSVG("mds-logo")}<div><b>${esc(SITE.title)}</b><span class="muted"> by ${esc(SITE.creator)}</span></div></div>
        <nav>${links}</nav>
        <p class="muted small">Independent project. Not affiliated with or endorsed by Google, Amazon, NVIDIA, Walmart, Apple, or the products that inspired these designs. All trademarks belong to their owners. Modifying your device is at your own risk.</p>
      </div>`;
    document.getElementById("brand-logo").innerHTML = logoSVG("mds-logo");
    const nav = document.getElementById("nav-coffee");
    if (nav && support) {
      nav.href = support.url;
      nav.innerHTML = `${cupSVG}<span>${esc(support.label || "Buy me a coffee")}</span>`;
      nav.setAttribute("aria-label", support.label || "Buy me a coffee");
      nav.hidden = false;
    }
  }

  /* ---------- router ---------- */
  function route() {
    // Routes: #home, #faq, #ui-<id> (optionally ?device=..&os=..&tool=..). Old #/ui/<id> links still work.
    const raw = location.hash.replace(/^#\/?/, "") || "home";
    const [path, query = ""] = raw.split("?");
    const params = new URLSearchParams(query);
    const m = path.match(/^ui[-/]([\w-]+)/);
    if (m) {
      const ui = UIS.find((u) => u.id === m[1]);
      if (ui) return renderDetail(ui, params);
    }
    if (path === "faq") return renderHome("faq");
    if (path === "ideas") return renderHome("ideas");
    if (path === "uis") return renderHome("uis");
    renderHome();
  }

  // in-page smooth scroll links that shouldn't change the route
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-scroll]");
    if (!a) return;
    e.preventDefault();
    document.getElementById(a.dataset.scroll)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  window.addEventListener("hashchange", route);
  renderFooter();
  route();
})();
