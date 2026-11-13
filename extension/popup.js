// Feedless — popup.
// Copyright (C) 2026 Azedev — Yusif Ezizov. AGPL-3.0-or-later.
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const STEP_MIN = 15;

  const ICON_UNLOCK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.8-1.2"/></svg>';
  const ICON_LOCK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

  // 7260 s → "2:01 hrs" ; 600 → "10 min"
  function renderTime(sec) {
    const totalMin = Math.ceil(sec / 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}<small>hrs</small>`
      : `${m}<small>min</small>`;
  }

  let state = null;

  async function render() {
    const s = (state = await Quota.load());
    const rem = Quota.remainingSec(s);
    const full = Quota.isFull(s);
    const total = s.dailyLimitMin * 60;

    // Status pill
    const pill = $("pill");
    pill.className = "pill " + (full ? "full" : rem <= 0 ? "out" : "dm");
    pill.textContent = full ? "Full mode" : rem <= 0 ? "Time's up" : "Messages only";

    // Hero
    $("time").innerHTML = renderTime(rem);
    $("meta").textContent = full
      ? "Counts only while the tab is active"
      : "Full mode left today";
    $("progress").style.transform = `scaleX(${total > 0 ? rem / total : 0})`;

    // Primary action
    const btn = $("toggle");
    btn.disabled = !full && rem <= 0;
    btn.classList.toggle("ghost", full);
    btn.innerHTML = full
      ? `${ICON_LOCK}<span>Back to messages only</span>`
      : rem > 0
        ? `${ICON_UNLOCK}<span>Turn on full mode</span>`
        : `<span>Available again tomorrow</span>`;

    // Site statuses
    $("s-ig").textContent = full ? "All pages open" : "Feed, Reels and Explore blocked";
    $("s-tt").textContent = full ? "All pages open" : "For You, Live and Explore blocked";

    // Limit stepper
    $("limit").textContent = `${s.dailyLimitMin} min`;
    $("minus").disabled = s.dailyLimitMin <= 0;
    const target = s.pendingLimitMin ?? s.dailyLimitMin;
    $("plus").disabled = target >= 24 * 60;

    const note = $("note");
    if (s.pendingLimitMin != null) {
      note.className = "note pending";
      note.textContent = `Tomorrow's limit: ${s.pendingLimitMin} min`;
    } else {
      note.className = "note";
      note.textContent = "A higher limit starts tomorrow.";
    }
  }

  $("toggle").addEventListener("click", async () => {
    const s = await Quota.load();
    await Quota.setMode(Quota.isFull(s) ? "dm" : "full");
    render();
  });

  $("minus").addEventListener("click", async () => {
    if (!state) return;
    await Quota.setLimit(Math.max(0, state.dailyLimitMin - STEP_MIN));
    render();
  });

  $("plus").addEventListener("click", async () => {
    if (!state) return;
    const base = state.pendingLimitMin ?? state.dailyLimitMin;
    await Quota.setLimit(base + STEP_MIN);
    render();
  });

  $("version").textContent = "v" + chrome.runtime.getManifest().version;

  chrome.storage.onChanged.addListener(render);
  render();
  setInterval(render, 1000);
})();
