#!/usr/bin/env bash
# Builds userscript/dm-only.user.js (for the iPhone Safari "Userscripts" app)
# from extension/quota.js + content.js + content.css.
# Copyright (C) 2026 Azedev — Yusif Ezizov. AGPL-3.0-or-later.
set -euo pipefail
cd "$(dirname "$0")"

version=$(node -p 'require("./extension/manifest.json").version')
out=userscript/dm-only.user.js
mkdir -p userscript

{
  cat <<EOF
// ==UserScript==
// @name         DM Only (Instagram + TikTok)
// @description  Messages only on Instagram and TikTok. Blocks Reels, For You, Explore and the feed.
// @version      ${version}
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
  const css = $(node -e 'process.stdout.write(JSON.stringify(require("fs").readFileSync("extension/content.css","utf8")))');
  const style = document.createElement("style");
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);
})();

EOF
  cat extension/quota.js extension/content.js
} > "$out"

echo "Built: $out"
