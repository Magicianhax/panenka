# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: panenka-e2e.spec.ts >> Desktop (1440×900) >> /leaderboard — loads, no errors, footer/topbar OK
- Location: tests\panenka-e2e.spec.ts:87:9

# Error details

```
Error: Footer missing required elements on /leaderboard

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
        - generic [ref=e28]: ◆ season 01 · records
        - generic [ref=e29]: LEADERBOARD.
        - generic [ref=e30]:
          - generic [ref=e31]:
            - generic [ref=e32]: settled matches
            - generic [ref=e33]: "2"
          - generic [ref=e34]:
            - generic [ref=e35]: total volume
            - generic [ref=e36]: 0.04OKB
          - generic [ref=e37]:
            - generic [ref=e38]: ranked players
            - generic [ref=e39]: "2"
      - generic [ref=e40]:
        - generic [ref=e41]:
          - generic [ref=e42]: ★ top players
          - generic [ref=e43]:
            - generic [ref=e44]:
              - generic [ref=e45]: "#"
              - generic [ref=e46]: player
              - generic [ref=e47]: w-l-d
              - generic [ref=e48]: win %
              - generic [ref=e49]: net okb
            - generic [ref=e50]:
              - generic [ref=e51]: "01"
              - generic [ref=e52]:
                - text: "@c6d770"
                - generic [ref=e53]: · 0xc6D7…b4C7
              - generic [ref=e54]: 1-0-1
              - generic [ref=e55]: 50%
              - generic [ref=e56]: "+0.009"
            - generic [ref=e57]:
              - generic [ref=e58]: "02"
              - generic [ref=e59]:
                - text: "@ffd310"
                - generic [ref=e60]: · 0xFfd3…17fb
              - generic [ref=e61]: 0-1-1
              - generic [ref=e62]: 0%
              - generic [ref=e63]: "-0.010"
        - generic [ref=e64]:
          - generic [ref=e65]: ● recent results
          - generic [ref=e66]:
            - link "BRA 4–2 0.02 OKB AUS" [ref=e67] [cursor=pointer]:
              - /url: /match/2
              - generic [ref=e68]:
                - img [ref=e71]:
                  - img "Brasil" [ref=e74]
                - generic [ref=e78]: BRA
              - generic [ref=e79]:
                - generic [ref=e80]: 4–2
                - generic [ref=e81]: 0.02 OKB
              - generic [ref=e82]:
                - generic [ref=e83]: AUS
                - img [ref=e86]:
                  - img "Australia" [ref=e89]
            - link "BRA 5–5 0.02 OKB ARG" [ref=e93] [cursor=pointer]:
              - /url: /match/1
              - generic [ref=e94]:
                - img [ref=e97]:
                  - img "Brasil" [ref=e100]
                - generic [ref=e104]: BRA
              - generic [ref=e105]:
                - generic [ref=e106]: 5–5
                - generic [ref=e107]: 0.02 OKB
              - generic [ref=e108]:
                - generic [ref=e109]: ARG
                - img [ref=e112]:
                  - img "Argentina" [ref=e115]
    - contentinfo [ref=e119]:
      - generic [ref=e120]:
        - generic [ref=e121]:
          - generic [ref=e122]:
            - link "PANENKA" [ref=e123] [cursor=pointer]:
              - /url: /
              - img "PANENKA" [ref=e124]
            - paragraph [ref=e125]: 1v1 on-chain penalty shootouts. Read your rival, stake OKB, winner takes the pot.
            - link "contract 0x51F6…5110 ↗" [ref=e126] [cursor=pointer]:
              - /url: https://www.oklink.com/xlayer/address/0x51F6DbeFCeE8ad9B491f08615211E09027f45110
              - generic [ref=e127]: contract
              - text: 0x51F6…5110 ↗
          - generic [ref=e128]:
            - generic [ref=e129]: Play
            - link "Lobby" [ref=e130] [cursor=pointer]:
              - /url: /lobby
            - link "Create a Match" [ref=e131] [cursor=pointer]:
              - /url: /create
            - link "Leaderboard" [ref=e132] [cursor=pointer]:
              - /url: /leaderboard
            - link "Profile" [ref=e133] [cursor=pointer]:
              - /url: /profile
          - generic [ref=e134]:
            - generic [ref=e135]: Learn
            - link "How to Play" [ref=e136] [cursor=pointer]:
              - /url: /faq
            - link "About" [ref=e137] [cursor=pointer]:
              - /url: /about
          - generic [ref=e138]:
            - generic [ref=e139]: Connect
            - link "@play_panenka ↗" [ref=e140] [cursor=pointer]:
              - /url: https://x.com/play_panenka
            - link "GitHub ↗" [ref=e141] [cursor=pointer]:
              - /url: https://github.com/Magicianhax/panenka
            - link "X Layer ↗" [ref=e142] [cursor=pointer]:
              - /url: https://www.okx.com/xlayer
        - generic [ref=e143]:
          - generic [ref=e144]: © 2026 PANENKA · built on X Layer
          - generic [ref=e145]: not affiliated with FIFA or any football association
  - alert [ref=e146]
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
      |                                                                               ^ Error: Footer missing required elements on /leaderboard
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