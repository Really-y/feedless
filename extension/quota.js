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
