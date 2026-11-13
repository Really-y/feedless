// Gündəlik "tam rejim" limiti. content.js və popup.js tərəfindən istifadə olunur.
// Storage yoxdursa (məs. iPhone userscript) Quota.storage === null olur və həmişə DM rejimi işləyir.
const Quota = (() => {
  "use strict";

  const DEFAULTS = {
    mode: "dm", // "dm" | "full"
    dailyLimitMin: 120, // tam rejim üçün gündəlik limit (dəqiqə)
    pendingLimitMin: null, // artırılmış limit — yalnız sabahdan qüvvəyə minir
    usageDate: "", // "YYYY-MM-DD" (yerli vaxt)
    usedSec: 0, // bu gün tam rejimdə keçirilən vaxt
  };

  const storage = globalThis.chrome?.storage?.local ?? null;

  function today() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  // Yeni gün: sərf olunan vaxtı sıfırla, DM rejiminə qayıt, gözləyən limiti tətbiq et
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

  // Azaltmaq dərhal, artırmaq yalnız sabahdan
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
