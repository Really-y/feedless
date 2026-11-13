#!/usr/bin/env bash
# extension/quota.js + content.js + content.css → userscript/dm-only.user.js (iPhone Safari "Userscripts" tətbiqi üçün)
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
// @description  Instagram və TikTok-da yalnız mesajlar: Reels, For You, Explore və feed bloklanır.
// @version      ${version}
// @author       Azedev — Yusif Ezizov
// @homepageURL  https://github.com/Really-y/social-media-blocker
// @license      AGPL-3.0-or-later
// @match        *://*.instagram.com/*
// @match        *://*.tiktok.com/*
// @run-at       document-start
// @inject-into  content
// @grant        none
// ==/UserScript==
// AVTOMATİK YARADILIB — redaktə etmə. Mənbə: extension/quota.js, extension/content.js, extension/content.css
// (Userscript-də storage yoxdur → həmişə yalnız-DM rejimi)

(() => {
  const css = $(node -e 'process.stdout.write(JSON.stringify(require("fs").readFileSync("extension/content.css","utf8")))');
  const style = document.createElement("style");
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);
})();

EOF
  cat extension/quota.js extension/content.js
} > "$out"

echo "Yaradıldı: $out"
