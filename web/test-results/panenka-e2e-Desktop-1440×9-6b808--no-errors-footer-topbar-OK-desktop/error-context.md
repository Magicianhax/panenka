# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: panenka-e2e.spec.ts >> Desktop (1440×900) >> /lobby — loads, no errors, footer/topbar OK
- Location: tests\panenka-e2e.spec.ts:87:9

# Error details

```
Error: Footer missing required elements on /lobby

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - link "PANENKA X CUP · WC26" [ref=e7] [cursor=pointer]:
            - /url: /
            - img "PANENKA" [ref=e8]
            - generic [ref=e9]: X CUP · WC26
          - navigation [ref=e10]:
            - link "home" [ref=e11] [cursor=pointer]:
              - /url: /
            - link "lobby" [ref=e12] [cursor=pointer]:
              - /url: /lobby
            - link "deploy" [ref=e13] [cursor=pointer]:
              - /url: /create
            - link "ranked" [ref=e14] [cursor=pointer]:
              - /url: /leaderboard
            - link "profile" [ref=e15] [cursor=pointer]:
              - /url: /profile
            - link "how to play" [ref=e16] [cursor=pointer]:
              - /url: /faq
            - link "about" [ref=e17] [cursor=pointer]:
              - /url: /about
        - generic [ref=e18]:
          - button "Sound settings" [ref=e20] [cursor=pointer]:
            - img [ref=e21]
          - button "Connect Wallet" [ref=e26] [cursor=pointer]
      - generic [ref=e27]:
        - generic [ref=e28]:
          - generic [ref=e29]:
            - generic [ref=e30]: ◆ live battle feed
            - generic [ref=e31]: THE FLOOR.
          - link "+ DEPLOY CHALLENGE" [ref=e32] [cursor=pointer]:
            - /url: /create
        - generic [ref=e33]:
          - generic [ref=e34]:
            - generic [ref=e35]: LIVE
            - generic [ref=e37]: open challenges
            - generic [ref=e38]: "0"
          - generic [ref=e39]:
            - generic [ref=e40]: okb at stake
            - generic [ref=e41]: "0.00"
          - generic [ref=e42]:
            - generic [ref=e43]: biggest pot
            - generic [ref=e44]: "0.00"
      - generic [ref=e46]:
        - generic [ref=e47]:
          - generic [ref=e48]: filter
          - button "ALL" [ref=e49] [cursor=pointer]
          - button "≤ 1" [ref=e50] [cursor=pointer]
          - button "1–10" [ref=e51] [cursor=pointer]
          - button "≥ 10" [ref=e52] [cursor=pointer]
        - generic [ref=e53]:
          - generic [ref=e54]: sort
          - button "★ BIGGEST POT" [ref=e55] [cursor=pointer]
          - button "↓ NEWEST" [ref=e56] [cursor=pointer]
      - generic [ref=e58]:
        - generic [ref=e59]: NO OPEN CHALLENGES.
        - link "DEPLOY THE FIRST →" [ref=e60] [cursor=pointer]:
          - /url: /create
    - contentinfo [ref=e61]:
      - generic [ref=e62]:
        - generic [ref=e63]:
          - generic [ref=e64]:
            - link "PANENKA" [ref=e65] [cursor=pointer]:
              - /url: /
              - img "PANENKA" [ref=e66]
            - paragraph [ref=e67]: 1v1 on-chain penalty shootouts. Read your rival, stake OKB, winner takes the pot.
            - link "contract 0x51F6…5110 ↗" [ref=e68] [cursor=pointer]:
              - /url: https://www.oklink.com/xlayer/address/0x51F6DbeFCeE8ad9B491f08615211E09027f45110
              - generic [ref=e69]: contract
              - text: 0x51F6…5110 ↗
          - generic [ref=e70]:
            - generic [ref=e71]: Play
            - link "Lobby" [ref=e72] [cursor=pointer]:
              - /url: /lobby
            - link "Create a Match" [ref=e73] [cursor=pointer]:
              - /url: /create
            - link "Leaderboard" [ref=e74] [cursor=pointer]:
              - /url: /leaderboard
            - link "Profile" [ref=e75] [cursor=pointer]:
              - /url: /profile
          - generic [ref=e76]:
            - generic [ref=e77]: Learn
            - link "How to Play" [ref=e78] [cursor=pointer]:
              - /url: /faq
            - link "About" [ref=e79] [cursor=pointer]:
              - /url: /about
          - generic [ref=e80]:
            - generic [ref=e81]: Connect
            - link "@play_panenka ↗" [ref=e82] [cursor=pointer]:
              - /url: https://x.com/play_panenka
            - link "GitHub ↗" [ref=e83] [cursor=pointer]:
              - /url: https://github.com/Magicianhax/panenka
            - link "X Layer ↗" [ref=e84] [cursor=pointer]:
              - /url: https://www.okx.com/xlayer
        - generic [ref=e85]:
          - generic [ref=e86]: © 2026 PANENKA · built on X Layer
          - generic [ref=e87]: not affiliated with FIFA or any football association
  - alert [ref=e88]
```

# Test source

```ts
  1   | import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';
  2   | import * as fs from 'fs';
  3   | import * as path from 'path';
  4   | 
  5   | const BASE = 'https://www.playpanenka.fun';
  6   | const PAGES = ['/', '/lobby', '/create', '/leaderboard', '/profile', '/faq', '/about'];
  7   | const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots');
  8   | 
  9   | type PageResult = {
  10  |   page: string;
  11  |   status: number | null;
  12  |   consoleErrors: string[];
  13  |   networkFailures: string[];
  14  |   multipartLeak: boolean;
  15  |   footerOk: boolean;
  16  |   topBarOk: boolean;
  17  |   mobileMenuOk?: boolean;
  18  | };
  19  | 
  20  | function ensureDir(dir: string) {
  21  |   if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  22  | }
  23  | 
  24  | async function collectPageData(page: Page, url: string, viewportName: string): Promise<Omit<PageResult, 'mobileMenuOk'>> {
  25  |   const consoleErrors: string[] = [];
  26  |   const networkFailures: string[] = [];
  27  |   let status: number | null = null;
  28  | 
  29  |   page.on('console', (msg: ConsoleMessage) => {
  30  |     if (msg.type() === 'error') {
  31  |       const text = msg.text();
  32  |       // Filter out known noise
  33  |       if (!text.includes('favicon') && !text.includes('ERR_ABORTED')) {
  34  |         consoleErrors.push(text);
  35  |       }
  36  |     }
  37  |   });
  38  | 
  39  |   page.on('response', (resp) => {
  40  |     const s = resp.status();
  41  |     if (s >= 400 && !resp.url().includes('favicon')) {
  42  |       networkFailures.push(`${s} ${resp.url()}`);
  43  |     }
  44  |   });
  45  | 
  46  |   const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  47  |   status = response?.status() ?? null;
  48  | 
  49  |   // Wait for page to settle
  50  |   await page.waitForTimeout(2500);
  51  | 
  52  |   // Check for multipart/prerender leak: raw --<hex> or x-nextjs-* header text visible on screen
  53  |   const bodyText = await page.evaluate(() => document.body.innerText);
  54  |   const multipartLeak = /--[0-9a-f]{8,}/i.test(bodyText) || /x-nextjs-/i.test(bodyText);
  55  | 
  56  |   // Check footer
  57  |   const footerOk = await page.evaluate(() => {
  58  |     const body = document.body.innerText;
  59  |     return (
  60  |       body.includes('@play_panenka') &&
  61  |       (body.includes('0x51F6') || body.includes('5110')) &&
  62  |       body.includes('not affiliated')
  63  |     );
  64  |   });
  65  | 
  66  |   // Check TopBar
  67  |   const topBarOk = await page.evaluate(() => {
  68  |     const body = document.body.innerText;
  69  |     return body.includes('PANENKA');
  70  |   });
  71  | 
  72  |   // Screenshot
  73  |   const slug = url === '/' ? 'home' : url.replace(/\//g, '');
  74  |   ensureDir(SCREENSHOT_DIR);
  75  |   await page.screenshot({
  76  |     path: path.join(SCREENSHOT_DIR, `${slug}-${viewportName}.png`),
  77  |     fullPage: false,
  78  |   });
  79  | 
  80  |   return { page: url, status, consoleErrors, networkFailures, multipartLeak, footerOk, topBarOk };
  81  | }
  82  | 
  83  | // ─── Desktop tests ────────────────────────────────────────────────────────────
  84  | 
  85  | test.describe('Desktop (1440×900)', () => {
  86  |   for (const route of PAGES) {
  87  |     test(`${route} — loads, no errors, footer/topbar OK`, async ({ page, browserName }) => {
  88  |       test.skip(browserName !== 'chromium', 'chromium only');
  89  |       const result = await collectPageData(page, `${BASE}${route}`, 'desktop');
  90  | 
  91  |       // HTTP status
  92  |       expect(result.status, `Expected 200 on ${route}, got ${result.status}`).toBe(200);
  93  | 
  94  |       // No multipart leak
  95  |       expect(result.multipartLeak, `Multipart prerender leak detected on ${route}`).toBe(false);
  96  | 
  97  |       // Footer
> 98  |       expect(result.footerOk, `Footer missing required elements on ${route}`).toBe(true);
      |                                                                               ^ Error: Footer missing required elements on /lobby
  99  | 
  100 |       // TopBar
  101 |       expect(result.topBarOk, `TopBar PANENKA brand missing on ${route}`).toBe(true);
  102 | 
  103 |       // Console errors — report count but allow test to pass with warnings
  104 |       if (result.consoleErrors.length > 0) {
  105 |         console.log(`[CONSOLE ERRORS on ${route}]: ${result.consoleErrors.join(' | ')}`);
  106 |       }
  107 |       // Hard fail only on truly critical JS errors
  108 |       const criticalErrors = result.consoleErrors.filter(
  109 |         (e) =>
  110 |           e.includes('TypeError') ||
  111 |           e.includes('ReferenceError') ||
  112 |           e.includes('SyntaxError') ||
  113 |           e.includes('Cannot read') ||
  114 |           e.includes('is not defined')
  115 |       );
  116 |       expect(criticalErrors.length, `Critical JS errors on ${route}: ${criticalErrors.join('; ')}`).toBe(0);
  117 | 
  118 |       // Network failures
  119 |       if (result.networkFailures.length > 0) {
  120 |         console.log(`[NETWORK FAILURES on ${route}]: ${result.networkFailures.join(' | ')}`);
  121 |       }
  122 |     });
  123 |   }
  124 | 
  125 |   // Footer link attributes
  126 |   test('footer external links have target=_blank', async ({ page }) => {
  127 |     await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  128 |     await page.waitForTimeout(2000);
  129 | 
  130 |     const externalLinks = await page.evaluate(() => {
  131 |       const links = Array.from(document.querySelectorAll('footer a[href]'));
  132 |       return links.map((a) => ({
  133 |         href: (a as HTMLAnchorElement).href,
  134 |         target: (a as HTMLAnchorElement).target,
  135 |         text: (a as HTMLElement).innerText.trim(),
  136 |       }));
  137 |     });
  138 | 
  139 |     console.log('Footer links found:', JSON.stringify(externalLinks));
  140 | 
  141 |     const externalWithoutBlank = externalLinks.filter(
  142 |       (l) => (l.href.startsWith('http') || l.href.startsWith('https')) && l.target !== '_blank'
  143 |     );
  144 |     expect(
  145 |       externalWithoutBlank.length,
  146 |       `Footer external links missing target=_blank: ${JSON.stringify(externalWithoutBlank)}`
  147 |     ).toBe(0);
  148 |   });
  149 | 
  150 |   // Internal SPA nav (no full reloads)
  151 |   test('internal nav does not cause full page reloads', async ({ page }) => {
  152 |     await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  153 |     await page.waitForTimeout(2000);
  154 | 
  155 |     // Find a nav link to /lobby or /leaderboard
  156 |     const navLink = page.locator('nav a[href="/lobby"], header a[href="/lobby"], a[href="/lobby"]').first();
  157 |     const count = await navLink.count();
  158 |     if (count === 0) {
  159 |       console.log('No /lobby nav link found — skipping SPA nav test');
  160 |       return;
  161 |     }
  162 | 
  163 |     let fullReload = false;
  164 |     page.on('response', (r) => {
  165 |       if (r.url() === `${BASE}/lobby` && r.status() === 200) {
  166 |         // A 200 for the HTML page itself indicates a full reload
  167 |         const ct = r.headers()['content-type'] || '';
  168 |         if (ct.includes('text/html')) fullReload = true;
  169 |       }
  170 |     });
  171 | 
  172 |     await navLink.click();
  173 |     await page.waitForURL(/lobby/, { timeout: 5000 });
  174 |     await page.waitForTimeout(1000);
  175 | 
  176 |     // SPA navigation: if content-type html response happened it's a full reload
  177 |     // Next.js RSC fetches json, not HTML — so html response = full reload
  178 |     expect(fullReload, 'Internal nav triggered a full HTML reload').toBe(false);
  179 |   });
  180 | 
  181 |   // /profile without wallet should not crash
  182 |   test('/profile without wallet shows connect prompt, not crash', async ({ page }) => {
  183 |     const errors: string[] = [];
  184 |     page.on('console', (m) => {
  185 |       if (m.type() === 'error') errors.push(m.text());
  186 |     });
  187 |     page.on('pageerror', (e) => errors.push(`PAGE ERROR: ${e.message}`));
  188 | 
  189 |     const resp = await page.goto(`${BASE}/profile`, { waitUntil: 'domcontentloaded' });
  190 |     await page.waitForTimeout(2000);
  191 | 
  192 |     expect(resp?.status()).toBe(200);
  193 | 
  194 |     // Should not be a blank white page
  195 |     const bodyText = await page.evaluate(() => document.body.innerText.trim());
  196 |     expect(bodyText.length, 'Profile page appears blank').toBeGreaterThan(10);
  197 | 
  198 |     const pageErrors = errors.filter(
```