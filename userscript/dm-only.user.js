// ==UserScript==
// @name         DM Only (Instagram + TikTok)
// @description  Messages only on Instagram and TikTok. Blocks Reels, For You, Explore and the feed.
// @version      1.3.0
// @author       Azedev — Yusif Ezizov (https://www.azedev.com)
// @homepageURL  https://github.com/Really-y/social-media-blocker
// @license      AGPL-3.0-or-later
// @match        *://*.instagram.com/*
// @match        *://*.tiktok.com/*
// @run-at       document-start
// @inject-into  content
// @grant        none
// ==/UserScript==
// AUTO-GENERATED — do not edit. Source: extension/quota.js, extension/content.js, extension/content.css
// (The userscript has no storage → always messages-only mode)

(() => {
  const css = "/* DM Only — in-page styles.\n   Copyright (C) 2026 Azedev — Yusif Ezizov. AGPL-3.0-or-later. */\n\n/* Messages-only mode: hide feed / Explore / Reels links in navigation\n   (Instagram: Home/Explore/Reels/Stories; TikTok: For You/Following/Explore/Live/Friends) */\nhtml.igdm-dm a[href=\"/\"],\nhtml.igdm-dm a[href^=\"/explore\"],\nhtml.igdm-dm a[href^=\"/reels\"],\nhtml.igdm-dm a[href^=\"/stories\"],\nhtml.igdm-dm a[href^=\"/foryou\"],\nhtml.igdm-dm a[href^=\"/following\"],\nhtml.igdm-dm a[href^=\"/friends\"],\nhtml.igdm-dm a[href^=\"/live\"],\nhtml.igdm-dm a[href=\"https://www.tiktok.com/\"],\nhtml.igdm-dm a[href^=\"https://www.tiktok.com/foryou\"],\nhtml.igdm-dm a[href^=\"https://www.tiktok.com/explore\"],\nhtml.igdm-dm a[href^=\"https://www.tiktok.com/following\"],\nhtml.igdm-dm a[href^=\"https://www.tiktok.com/live\"] {\n  display: none !important;\n}\n\n/* Keep content hidden until the mode is read or the redirect completes */\nhtml.igdm-blocked body {\n  visibility: hidden !important;\n}\n\n/* ---- Quiet card in place of hidden content ---- */\n.igdm-placeholder {\n  --igdm-ink: #2f3437;\n  --igdm-muted: #787774;\n  --igdm-line: #eaeaea;\n  --igdm-surface: #fbfbfa;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  max-width: 280px;\n  padding: 10px 14px;\n  border: 1px solid var(--igdm-line);\n  border-radius: 12px;\n  background: var(--igdm-surface);\n  color: var(--igdm-ink);\n  font: 500 13px/1.35 -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Helvetica Neue\", system-ui, sans-serif;\n  letter-spacing: -0.005em;\n  user-select: none;\n  animation: igdm-in 420ms cubic-bezier(0.16, 1, 0.3, 1);\n}\n.igdm-placeholder svg {\n  flex: none;\n  width: 16px;\n  height: 16px;\n  color: var(--igdm-muted);\n}\n.igdm-placeholder small {\n  display: block;\n  color: var(--igdm-muted);\n  font: 10px/1.4 \"SF Mono\", ui-monospace, monospace;\n  letter-spacing: 0.06em;\n  text-transform: uppercase;\n}\n@media (prefers-color-scheme: dark) {\n  .igdm-placeholder {\n    --igdm-ink: #ededec;\n    --igdm-muted: #9b9a97;\n    --igdm-line: rgba(255, 255, 255, 0.1);\n    --igdm-surface: #202020;\n  }\n}\n\n/* ---- Toast: glass material that enters and exits along the same path ---- */\n#igdm-toast {\n  position: fixed;\n  left: 50%;\n  bottom: 28px;\n  z-index: 2147483647;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 10px 16px;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 12px;\n  background: rgba(24, 24, 23, 0.82);\n  -webkit-backdrop-filter: blur(20px) saturate(180%);\n  backdrop-filter: blur(20px) saturate(180%);\n  color: #f5f5f4;\n  font: 500 13px/1.3 -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Helvetica Neue\", system-ui, sans-serif;\n  letter-spacing: -0.005em;\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);\n  pointer-events: none;\n  opacity: 0;\n  transform: translate(-50%, 12px) scale(0.98);\n  transition: opacity 260ms cubic-bezier(0.16, 1, 0.3, 1), transform 360ms cubic-bezier(0.16, 1, 0.3, 1);\n}\n#igdm-toast.show {\n  opacity: 1;\n  transform: translate(-50%, 0) scale(1);\n}\n#igdm-toast svg { width: 15px; height: 15px; opacity: 0.8; }\n\n@keyframes igdm-in {\n  from { opacity: 0; transform: translateY(4px); }\n  to { opacity: 1; transform: none; }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .igdm-placeholder { animation: none; }\n  #igdm-toast { transform: translate(-50%, 0); transition: opacity 160ms ease; }\n}\n@media (prefers-reduced-transparency: reduce) {\n  #igdm-toast { background: #181817; -webkit-backdrop-filter: none; backdrop-filter: none; }\n}\n";
  const style = document.createElement("style");
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);
})();

// Daily "full mode" allowance. Used by content.js and popup.js.
// Copyright (C) 2026 Azedev — Yusif Ezizov. AGPL-3.0-or-later.
//
// When storage is unavailable (e.g. the iPhone userscript), Quota.storage is null
// and the content script always stays in messages-only mode.
const Quota = (() => {
  "use strict";

  const DEFAULTS = {
    mode: "dm", // "dm" | "full"
    dailyLimitMin: 120, // daily full-mode allowance in minutes
    pendingLimitMin: null, // a raised limit; only takes effect tomorrow
    usageDate: "", // "YYYY-MM-DD" (local time)
    usedSec: 0, // seconds spent in full mode today
  };

  const storage = globalThis.chrome?.storage?.local ?? null;

  function today() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  // New day: reset usage, return to messages-only, apply any pending limit
  function rollover(s) {
    const t = today();
    if (s.usageDate === t) return s;
    const next = { ...s, usageDate: t, usedSec: 0, mode: "dm" };
    if (s.pendingLimitMin != null) {
      next.dailyLimitMin = s.pendingLimitMin;
      next.pendingLimitMin = null;
    }
    return next;
  }

  async function load() {
    if (!storage) return null;
    const raw = await storage.get(DEFAULTS);
    const s = rollover(raw);
    if (s !== raw) await storage.set(s);
    return s;
  }

  const remainingSec = (s) => Math.max(0, s.dailyLimitMin * 60 - s.usedSec);
  const isFull = (s) => !!s && s.mode === "full" && remainingSec(s) > 0;

  async function setMode(mode) {
    const s = await load();
    if (mode === "full" && remainingSec(s) <= 0) return s;
    await storage.set({ mode });
    return load();
  }

  // Lowering applies immediately; raising only from tomorrow
  async function setLimit(min) {
    const s = await load();
    min = Math.max(0, Math.min(24 * 60, Math.round(min)));
    if (min <= s.dailyLimitMin) {
      const patch = { dailyLimitMin: min, pendingLimitMin: null };
      if (min * 60 <= s.usedSec) patch.mode = "dm";
      await storage.set(patch);
    } else {
      await storage.set({ pendingLimitMin: min });
    }
    return load();
  }

  async function addUsage(sec) {
    const s = await load();
    const usedSec = s.usedSec + sec;
    const patch = { usedSec };
    if (s.dailyLimitMin * 60 - usedSec <= 0) patch.mode = "dm";
    await storage.set(patch);
  }

  return { storage, load, remainingSec, isFull, setMode, setLimit, addUsage };
})();
// DM Only — keeps Instagram and TikTok to messages only.
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
    meta.textContent = "DM Only";
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
