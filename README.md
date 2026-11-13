<p align="center">
  <img src="docs/banner.svg" alt="DM Only — messages only on social media" width="100%">
</p>

<p align="center">
  <a href="LICENSE"><img alt="License: AGPL-3.0" src="https://img.shields.io/badge/license-AGPL--3.0-191918?style=flat-square"></a>
  <img alt="Version" src="https://img.shields.io/badge/version-1.3.0-191918?style=flat-square">
  <img alt="Chrome" src="https://img.shields.io/badge/Chrome-MV3-efeeeb?style=flat-square&logo=googlechrome&logoColor=191918">
  <img alt="Firefox" src="https://img.shields.io/badge/Firefox-desktop%20%2B%20Android-efeeeb?style=flat-square&logo=firefoxbrowser&logoColor=191918">
  <img alt="iPhone" src="https://img.shields.io/badge/iPhone-Safari-efeeeb?style=flat-square&logo=safari&logoColor=191918">
  <a href="https://www.azedev.com"><img alt="Azedev" src="https://img.shields.io/badge/by-Azedev-191918?style=flat-square"></a>
</p>

<p align="center">
  <b>Stay in touch with your friends. Step out of the infinite scroll.</b><br>
  <sub>Built by <a href="https://www.azedev.com">Azedev</a> — Yusif Ezizov</sub>
</p>

---

## Goal & Purpose

Quitting social media entirely is rarely realistic: friends, family and work conversations all live there.
The problem isn't the messages. It's that **messages are a doorway**. You open the app to reply to one text,
a friend has sent you a reel, you tap it, and forty minutes later you're deep in the For You feed.

**DM Only** closes that doorway and keeps the conversation open.

| | |
|---|---|
| **Goal** | Turn Instagram and TikTok into messaging tools: chats keep working, the attention-harvesting feed doesn't. |
| **Purpose** | Make impulsive scrolling technically harder. Rely on your environment, not your willpower. |
| **Principle** | No total ban. **A deliberate limit** instead: a set amount of full access per day, messages only the rest of the time. |
| **Privacy** | No passwords, no tokens, no server. Everything runs in your browser and no data leaves it. |

---

## Preview

<p align="center">
  <img src="docs/popup-dm.png" alt="Messages-only mode" width="260">
  &nbsp;
  <img src="docs/popup-full.png" alt="Full mode, time is counting" width="260">
  &nbsp;
  <img src="docs/popup-dark.png" alt="Dark theme" width="260">
</p>

<p align="center"><sub>Messages only &nbsp;·&nbsp; Full mode (time counting) &nbsp;·&nbsp; Dark theme</sub></p>

A calm, warm-monochrome interface: serif numerals, minimal color, and Apple's fluid-interface principles.
It follows your system's light or dark theme and respects `prefers-reduced-motion` and `prefers-contrast`.

---

## What it does

| Platform | Stays open | Blocked |
|---|---|---|
| **Instagram** | `/direct/` (all DMs), login, 2FA, account settings | Feed, Reels, Explore, Stories, profiles, posts |
| **TikTok** | `/messages`, login, settings | For You, Following, Explore, Live, profiles, videos |

- **Redirects.** Any link to a blocked page sends you back to your inbox. This also works with Instagram's and TikTok's in-app (SPA) navigation.
- **Shared videos in chats.** A reel or TikTok a friend sends you is replaced with a quiet card, so there's nothing to fall into.
- **Clean navigation.** Home, Reels, Explore and For You buttons are hidden.
- **Daily allowance.** Full mode defaults to **120 minutes a day**, shared across both platforms.
- **VPN-proof.** The extension runs inside the browser, so a VPN doesn't bypass it.

### Daily limit rules

```text
Default mode ............. Messages only
Full mode ................ Turned on from the popup; time counts only while the tab is active
When time runs out ....... Switches back to messages only automatically
At midnight .............. Counter resets, mode returns to messages only
Lowering the limit ....... Takes effect immediately
Raising the limit ........ Takes effect tomorrow (stops impulsive increases)
```

---

## Installation

### Chrome / Brave / Edge

1. Clone the repo: `git clone https://github.com/Really-y/social-media-blocker.git`
2. Open `chrome://extensions` and enable **Developer mode**
3. Click **Load unpacked** and select the `extension/` folder
4. Pin the extension to your toolbar

### Firefox (desktop + Android)

**Quick test:** `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on** → `extension/manifest.json`

**Permanent install:** Firefox only installs signed extensions permanently. Signing is free:

```bash
npx web-ext sign --source-dir extension --channel unlisted \
  --api-key "$AMO_JWT_ISSUER" --api-secret "$AMO_JWT_SECRET"
```

Get your API keys at [addons.mozilla.org](https://addons.mozilla.org/developers/addon/api/key/).
On Android: Firefox → Settings → About Firefox → tap the logo 5 times → **Install extension from file**.

### iPhone (Safari)

1. Install the free **Userscripts** app from the App Store
2. Copy [`userscript/dm-only.user.js`](userscript/dm-only.user.js) into your Userscripts folder
3. Settings → Apps → Safari → Extensions → **Userscripts** → enable it and allow the sites
4. Delete the Instagram and TikTok apps and add the sites from Safari via **Add to Home Screen**
5. Screen Time → Content & Privacy → **Installing Apps: Don't Allow**. Have someone else set the passcode.

> The iPhone version has no daily limit: it is always messages only.

---

## How it works

```text
                   ┌──────────────────────────────┐
  URL changes  →   │  content.js (document_start) │
                   └──────────────┬───────────────┘
                                  │
                   quota.js → is full mode active?
                          │                 │
                         yes                no
                          │                 │
                    leave as is     is the path allowed? ── no → /direct/inbox or /messages
                                            │
                                           yes → hide videos inside chats
```

| File | Role |
|---|---|
| `extension/manifest.json` | Manifest V3, shared by Chrome and Firefox |
| `extension/content.js` | Redirects, click blocking, hiding videos in chats |
| `extension/quota.js` | Daily limit logic (`chrome.storage.local`) |
| `extension/popup.*` | The popup interface |
| `build-userscript.sh` | Generates the iPhone userscript from the extension |

Single source of truth: edit `content.js`, run `./build-userscript.sh`, and the iPhone version is updated too.

---

## Roadmap

- [x] Instagram: DMs only
- [x] TikTok: messages only
- [x] Daily full-mode allowance
- [x] iPhone Safari support
- [x] English UI
- [ ] Browser-policy lock (extension can't be removed without admin rights)
- [ ] YouTube Shorts and Facebook Reels
- [ ] Weekly statistics

## Limitations

- Instagram and TikTok change their HTML often. If something starts showing up again, [open an issue](https://github.com/Really-y/social-media-blocker/issues).
- It works at the browser level, so it needs to be installed in every browser you use.
- It can currently be disabled from `chrome://extensions`. A lock feature is on the roadmap.

## Contributing

Pull requests are welcome. For larger changes, please open an issue first so we can discuss it.

## License

**GNU Affero General Public License v3.0**. See [LICENSE](LICENSE).

You may use, modify and share this code, including commercially. But if you distribute a modified version
**or offer it as a network service (SaaS)**, you must release its source code under the same license
and keep the copyright notice.

```text
Copyright (C) 2026 Azedev — Yusif Ezizov
https://www.azedev.com
```

<p align="center">
  <sub>Built by <a href="https://www.azedev.com"><b>Azedev</b></a> — Yusif Ezizov</sub>
</p>
