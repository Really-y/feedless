// Feedless — keeps Instagram and TikTok to messages only.
// Copyright (C) 2026 Azedev — Yusif Ezizov. AGPL-3.0-or-later.
(() => {
  "use strict";

  // ---- Settings ----
  const CONFIG = {
    // Replace reel/post links shared in chats with a placeholder card
    hideSharedReels: true,
    // Hide every video inside chats (shared reel previews sometimes arrive as a bare <video>).
    // Personal videos from friends are hidden too — set to false if you don't want that.
    hideDmVideos: true,
  };

  const TICK_SEC = 5;

  // Per site: in messages-only mode, only chats plus login/security flows are allowed
  const SITES = [
    {
      host: /(^|\.)instagram\.com$/,
      inbox: "/direct/inbox/",
      dmPrefix: "/direct/",
      allowed: [
        /^\/direct(\/|$)/,
        /^\/accounts\//,
        /^\/challenge\//,
        /^\/two_factor/,
        /^\/auth_platform\//,
        /^\/legal\//,
        /^\/privacy\//,
      ],
      sharedLinks: 'a[href*="/reel/"], a[href*="/reels/"], a[href*="/p/"]',
    },
    {
      host: /(^|\.)tiktok\.com$/,
      inbox: "/messages",
      dmPrefix: "/messages",
      allowed: [
        /^\/messages(\/|$)/,
        /^\/login(\/|$)/,
        /^\/signup(\/|$)/,
        /^\/passport\//,
        /^\/auth(\/|$)/,
        /^\/setting(s)?(\/|$)/,
        /^\/legal\//,
        /^\/privacy/,
      ],
      sharedLinks: 'a[href*="/video/"], a[href*="/photo/"]',
    },
  ];

  const site = SITES.find((s) => s.host.test(location.hostname));
  if (!site) return;

  const INBOX = site.inbox;
  const isAllowed = (path) => site.allowed.some((re) => re.test(path));
  const root = document.documentElement;

  // full = full mode is on and there is time left today
  let full = false;
  let ready = !Quota.storage; // no storage (userscript) → messages-only right away

  // ---- Redirect (with loop protection) ----
  const LOOP_KEY = "igdm-redirects";

  function tooManyRedirects() {
    try {
      const now = Date.now();
      const list = JSON.parse(sessionStorage.getItem(LOOP_KEY) || "[]").filter(
        (t) => now - t < 10000
      );
      list.push(now);
      sessionStorage.setItem(LOOP_KEY, JSON.stringify(list));
      return list.length > 4;
    } catch {
      return false;
    }
  }

  function enforce() {
    root.classList.toggle("igdm-dm", !full);
    if (!ready) return; // mode not read yet — keep the page hidden
    if (full || isAllowed(location.pathname)) {
      root.classList.remove("igdm-blocked");
      return;
    }
    root.classList.add("igdm-blocked");
    if (tooManyRedirects()) return; // don't get stuck in a loop; page stays hidden
    location.replace(INBOX);
  }

  async function refresh() {
    const s = await Quota.load();
    const wasFull = full;
    full = Quota.isFull(s);
    ready = true;
    // Full mode was just turned on — reload to restore hidden elements
    if (!wasFull && full && placeholdersInserted) {
      location.reload();
      return;
    }
    if (wasFull && !full) toast("Time's up. Back to messages only.");
    enforce();
    scrub();
  }

  if (Quota.storage) {
    root.classList.add("igdm-dm", "igdm-blocked");
    refresh();
    chrome.storage.onChanged.addListener((_changes, area) => {
      if (area === "local") refresh();
    });
  } else {
    enforce();
  }

  // Both sites are SPAs: watch for URL changes
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      enforce();
    }
  }, 200);

  // ---- Count full-mode time (only the visible, focused tab) ----
  if (Quota.storage) {
    setInterval(() => {
      if (full && document.visibilityState === "visible" && document.hasFocus()) {
        Quota.addUsage(TICK_SEC);
      }
    }, TICK_SEC * 1000);
  }

  // ---- Intercept clicks on blocked links ----
  function blockedTarget(el) {
    const a = el && el.closest ? el.closest("a[href]") : null;
    if (!a) return null;
    let url;
    try {
      url = new URL(a.getAttribute("href"), location.href);
    } catch {
      return null;
    }
    if (!site.host.test(url.hostname)) return null;
    return isAllowed(url.pathname) ? null : a;
  }

  function onClick(e) {
    if (full) return;
    if (blockedTarget(e.target)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      toast("Blocked in messages-only mode");
    }
  }
  for (const type of ["click", "auxclick"]) {
    document.addEventListener(type, onClick, true);
  }

  // Simple SVG icons (built with the DOM API — no innerHTML)
  const SVG_NS = "http://www.w3.org/2000/svg";
  const ICONS = {
    lock: [["rect", { x: 4, y: 11, width: 16, height: 10, rx: 2 }], ["path", { d: "M8 11V7a4 4 0 0 1 8 0v4" }]],
    eyeOff: [
      ["path", { d: "M3 3l18 18" }],
      ["path", { d: "M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 9 4.5 10 6-.4.7-1.4 2-2.8 3.2M6.6 6.6C4.4 8 2.8 10.2 2 12c1 1.5 5 6 10 6 1.6 0 3-.4 4.3-1" }],
    ],
  };

  function icon(name) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    for (const [tag, attrs] of ICONS[name]) {
      const el = document.createElementNS(SVG_NS, tag);
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      svg.appendChild(el);
    }
    return svg;
  }

  let toastTimer;
  function toast(text) {
    let el = document.getElementById("igdm-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "igdm-toast";
      el.setAttribute("role", "status");
      el.append(icon("lock"), document.createElement("span"));
      (document.body || root).appendChild(el);
    }
    el.querySelector("span").textContent = text;
    requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  // ---- Hide shared reels and videos inside chats ----
  let placeholdersInserted = false;

  function placeholder(text) {
    placeholdersInserted = true;
    const div = document.createElement("div");
    div.className = "igdm-placeholder";
    const body = document.createElement("div");
    const meta = document.createElement("small");
    meta.textContent = "Feedless";
    body.append(meta, document.createTextNode(text));
    div.append(icon("eyeOff"), body);
    return div;
  }

  function scrub() {
    if (full || !ready || !location.pathname.startsWith(site.dmPrefix)) return;

    if (CONFIG.hideSharedReels) {
      for (const a of document.querySelectorAll(site.sharedLinks)) {
        if (a.dataset.igdm) continue;
        a.dataset.igdm = "1";
        a.style.display = "none";
        a.parentNode?.insertBefore(placeholder("Shared video hidden"), a);
      }
    }

    if (CONFIG.hideDmVideos) {
      for (const v of document.querySelectorAll("video:not([data-igdm])")) {
        v.dataset.igdm = "1";
        try {
          v.pause();
          v.muted = true;
          v.removeAttribute("autoplay");
        } catch {}
        v.style.display = "none";
        v.parentNode?.insertBefore(placeholder("Video hidden"), v);
      }
    }
  }

  // Videos can be play()-ed later — pause hidden ones again
  document.addEventListener(
    "play",
    (e) => {
      const t = e.target;
      if (!full && t instanceof HTMLVideoElement && t.dataset.igdm) t.pause();
    },
    true
  );

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scrub();
    });
  });

  observer.observe(root, { childList: true, subtree: true });
  scrub();
})();
