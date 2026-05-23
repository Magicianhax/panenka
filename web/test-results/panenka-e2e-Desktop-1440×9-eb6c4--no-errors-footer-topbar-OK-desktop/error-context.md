# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: panenka-e2e.spec.ts >> Desktop (1440×900) >> /create — loads, no errors, footer/topbar OK
- Location: tests\panenka-e2e.spec.ts:87:9

# Error details

```
Error: Footer missing required elements on /create

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
        - generic [ref=e28]: ◆ loadout
        - generic [ref=e29]: DEPLOY CHALLENGE.
        - generic [ref=e30]:
          - generic [ref=e31]:
            - generic [ref=e32]:
              - img [ref=e35]:
                - img "Argentina" [ref=e38]
              - generic [ref=e42]:
                - generic [ref=e43]: your nation
                - generic [ref=e44]: ARGENTINA
                - generic [ref=e45]: code ARG · best of 5 · winner takes pot
            - generic [ref=e46]:
              - generic [ref=e47]: ¶ choose your nation · 48
              - generic [ref=e48]:
                - button "ARG" [pressed] [ref=e49] [cursor=pointer]:
                  - img [ref=e52]:
                    - img "Argentina" [ref=e55]
                  - generic [ref=e59]: ARG
                - button "BRA" [ref=e60] [cursor=pointer]:
                  - img [ref=e63]:
                    - img "Brasil" [ref=e66]
                  - generic [ref=e70]: BRA
                - button "FRA" [ref=e71] [cursor=pointer]:
                  - img [ref=e74]:
                    - img "France" [ref=e77]
                  - generic [ref=e81]: FRA
                - button "ENG" [ref=e82] [cursor=pointer]:
                  - img [ref=e85]:
                    - img "England" [ref=e88]
                  - generic [ref=e92]: ENG
                - button "ESP" [ref=e93] [cursor=pointer]:
                  - img [ref=e96]:
                    - img "España" [ref=e99]
                  - generic [ref=e103]: ESP
                - button "GER" [ref=e104] [cursor=pointer]:
                  - img [ref=e107]:
                    - img "Germany" [ref=e110]
                  - generic [ref=e114]: GER
                - button "POR" [ref=e115] [cursor=pointer]:
                  - img [ref=e118]:
                    - img "Portugal" [ref=e121]
                  - generic [ref=e125]: POR
                - button "NED" [ref=e126] [cursor=pointer]:
                  - img [ref=e129]:
                    - img "Nederland" [ref=e132]
                  - generic [ref=e136]: NED
                - button "ITA" [ref=e137] [cursor=pointer]:
                  - img [ref=e140]:
                    - img "Italia" [ref=e143]
                  - generic [ref=e147]: ITA
                - button "BEL" [ref=e148] [cursor=pointer]:
                  - img [ref=e151]:
                    - img "België" [ref=e154]
                  - generic [ref=e158]: BEL
                - button "CRO" [ref=e159] [cursor=pointer]:
                  - img [ref=e162]:
                    - img "Hrvatska" [ref=e165]
                  - generic [ref=e169]: CRO
                - button "URU" [ref=e170] [cursor=pointer]:
                  - img [ref=e173]:
                    - img "Uruguay" [ref=e176]
                  - generic [ref=e180]: URU
                - button "MEX" [ref=e181] [cursor=pointer]:
                  - img [ref=e184]:
                    - img "México" [ref=e187]
                  - generic [ref=e191]: MEX
                - button "USA" [ref=e192] [cursor=pointer]:
                  - img [ref=e195]:
                    - img "United States" [ref=e198]
                  - generic [ref=e202]: USA
                - button "JPN" [ref=e203] [cursor=pointer]:
                  - img [ref=e206]:
                    - img "Nippon" [ref=e209]
                  - generic [ref=e213]: JPN
                - button "KOR" [ref=e214] [cursor=pointer]:
                  - img [ref=e217]:
                    - img "Daehan" [ref=e220]
                  - generic [ref=e224]: KOR
                - button "MAR" [ref=e225] [cursor=pointer]:
                  - img [ref=e228]:
                    - img "Maroc" [ref=e231]
                  - generic [ref=e235]: MAR
                - button "SEN" [ref=e236] [cursor=pointer]:
                  - img [ref=e239]:
                    - img "Sénégal" [ref=e242]
                  - generic [ref=e246]: SEN
                - button "CAN" [ref=e247] [cursor=pointer]:
                  - img [ref=e250]:
                    - img "Canada" [ref=e253]
                  - generic [ref=e257]: CAN
                - button "AUS" [ref=e258] [cursor=pointer]:
                  - img [ref=e261]:
                    - img "Australia" [ref=e264]
                  - generic [ref=e268]: AUS
                - button "SUI" [ref=e269] [cursor=pointer]:
                  - img [ref=e272]:
                    - img "Suisse" [ref=e275]
                  - generic [ref=e279]: SUI
                - button "DEN" [ref=e280] [cursor=pointer]:
                  - img [ref=e283]:
                    - img "Danmark" [ref=e286]
                  - generic [ref=e290]: DEN
                - button "POL" [ref=e291] [cursor=pointer]:
                  - img [ref=e294]:
                    - img "Polska" [ref=e297]
                  - generic [ref=e301]: POL
                - button "SRB" [ref=e302] [cursor=pointer]:
                  - img [ref=e305]:
                    - img "Srbija" [ref=e308]
                  - generic [ref=e312]: SRB
                - button "WAL" [ref=e313] [cursor=pointer]:
                  - img [ref=e316]:
                    - img "Cymru" [ref=e319]
                  - generic [ref=e323]: WAL
                - button "COL" [ref=e324] [cursor=pointer]:
                  - img [ref=e327]:
                    - img "Colombia" [ref=e330]
                  - generic [ref=e334]: COL
                - button "ECU" [ref=e335] [cursor=pointer]:
                  - img [ref=e338]:
                    - img "Ecuador" [ref=e341]
                  - generic [ref=e345]: ECU
                - button "GHA" [ref=e346] [cursor=pointer]:
                  - img [ref=e349]:
                    - img "Ghana" [ref=e352]
                  - generic [ref=e356]: GHA
                - button "NGA" [ref=e357] [cursor=pointer]:
                  - img [ref=e360]:
                    - img "Nigeria" [ref=e363]
                  - generic [ref=e367]: NGA
                - button "EGY" [ref=e368] [cursor=pointer]:
                  - img [ref=e371]:
                    - img "Misr" [ref=e374]
                  - generic [ref=e378]: EGY
                - button "CMR" [ref=e379] [cursor=pointer]:
                  - img [ref=e382]:
                    - img "Cameroun" [ref=e385]
                  - generic [ref=e389]: CMR
                - button "CIV" [ref=e390] [cursor=pointer]:
                  - img [ref=e393]:
                    - img "Côte d'Ivoire" [ref=e396]
                  - generic [ref=e400]: CIV
                - button "TUN" [ref=e401] [cursor=pointer]:
                  - img [ref=e404]:
                    - img "Tounes" [ref=e407]
                  - generic [ref=e411]: TUN
                - button "DZA" [ref=e412] [cursor=pointer]:
                  - img [ref=e415]:
                    - img "Al-Jaza'ir" [ref=e418]
                  - generic [ref=e422]: DZA
                - button "KSA" [ref=e423] [cursor=pointer]:
                  - img [ref=e426]:
                    - img "As-Su'udiyya" [ref=e429]
                  - generic [ref=e433]: KSA
                - button "QAT" [ref=e434] [cursor=pointer]:
                  - img [ref=e437]:
                    - img "Qatar" [ref=e440]
                  - generic [ref=e444]: QAT
                - button "IRN" [ref=e445] [cursor=pointer]:
                  - img [ref=e448]:
                    - img "Iran" [ref=e451]
                  - generic [ref=e455]: IRN
                - button "CRC" [ref=e456] [cursor=pointer]:
                  - img [ref=e459]:
                    - img "Costa Rica" [ref=e462]
                  - generic [ref=e466]: CRC
                - button "PER" [ref=e467] [cursor=pointer]:
                  - img [ref=e470]:
                    - img "Perú" [ref=e473]
                  - generic [ref=e477]: PER
                - button "CHI" [ref=e478] [cursor=pointer]:
                  - img [ref=e481]:
                    - img "Chile" [ref=e484]
                  - generic [ref=e488]: CHI
                - button "PAR" [ref=e489] [cursor=pointer]:
                  - img [ref=e492]:
                    - img "Paraguay" [ref=e495]
                  - generic [ref=e499]: PAR
                - button "NOR" [ref=e500] [cursor=pointer]:
                  - img [ref=e503]:
                    - img "Norge" [ref=e506]
                  - generic [ref=e510]: NOR
                - button "SWE" [ref=e511] [cursor=pointer]:
                  - img [ref=e514]:
                    - img "Sverige" [ref=e517]
                  - generic [ref=e521]: SWE
                - button "AUT" [ref=e522] [cursor=pointer]:
                  - img [ref=e525]:
                    - img "Österreich" [ref=e528]
                  - generic [ref=e532]: AUT
                - button "TUR" [ref=e533] [cursor=pointer]:
                  - img [ref=e536]:
                    - img "Türkiye" [ref=e539]
                  - generic [ref=e543]: TUR
                - button "GRE" [ref=e544] [cursor=pointer]:
                  - img [ref=e547]:
                    - img "Hellas" [ref=e550]
                  - generic [ref=e554]: GRE
                - button "SCO" [ref=e555] [cursor=pointer]:
                  - img [ref=e558]:
                    - img "Scotland" [ref=e561]
                  - generic [ref=e565]: SCO
                - button "UKR" [ref=e566] [cursor=pointer]:
                  - img [ref=e569]:
                    - img "Ukraïna" [ref=e572]
                  - generic [ref=e576]: UKR
            - generic [ref=e577]:
              - generic [ref=e578]: ¶ set your stake · OKB
              - generic [ref=e579]:
                - button "0.01 OKB" [ref=e580] [cursor=pointer]:
                  - generic [ref=e581]: "0.01"
                  - generic [ref=e582]: OKB
                - button "0.05 OKB" [ref=e583] [cursor=pointer]:
                  - generic [ref=e584]: "0.05"
                  - generic [ref=e585]: OKB
                - button "0.1 OKB" [ref=e586] [cursor=pointer]:
                  - generic [ref=e587]: "0.1"
                  - generic [ref=e588]: OKB
                - button "0.5 OKB" [ref=e589] [cursor=pointer]:
                  - generic [ref=e590]: "0.5"
                  - generic [ref=e591]: OKB
                - button "1 OKB" [ref=e592] [cursor=pointer]:
                  - generic [ref=e593]: "1"
                  - generic [ref=e594]: OKB
                - button "5 OKB" [ref=e595] [cursor=pointer]:
                  - generic [ref=e596]: "5"
                  - generic [ref=e597]: OKB
              - slider "Stake" [ref=e598]: "0.05"
          - generic [ref=e600]:
            - generic [ref=e601]:
              - generic [ref=e602]: ★ NEW WAGER
              - generic [ref=e603]: best of 5
            - generic [ref=e604]:
              - generic [ref=e605]:
                - img [ref=e609]:
                  - img "Argentina" [ref=e612]
                - generic [ref=e616]: ARGENTINA
                - generic [ref=e617]: you
              - generic [ref=e618]: VS
              - generic [ref=e619]:
                - img [ref=e622]:
                  - generic [ref=e624]: "?"
                - generic [ref=e625]: AWAITING
                - generic [ref=e626]: open
            - generic [ref=e627]:
              - generic [ref=e628]: ↗ if you win
              - generic [ref=e629]: 0.098OKB
              - generic [ref=e630]:
                - text: pot 0.100 · fee 0.0025 · net
                - generic [ref=e631]: "+0.048"
            - generic [ref=e632]: CONNECT WALLET ↑
            - generic [ref=e633]: escrows 0.050 OKB into the x cup contract · cancel any time before match starts
    - contentinfo [ref=e634]:
      - generic [ref=e635]:
        - generic [ref=e636]:
          - generic [ref=e637]:
            - link "PANENKA" [ref=e638] [cursor=pointer]:
              - /url: /
              - img "PANENKA" [ref=e639]
            - paragraph [ref=e640]: 1v1 on-chain penalty shootouts. Read your rival, stake OKB, winner takes the pot.
            - link "contract 0x51F6…5110 ↗" [ref=e641] [cursor=pointer]:
              - /url: https://www.oklink.com/xlayer/address/0x51F6DbeFCeE8ad9B491f08615211E09027f45110
              - generic [ref=e642]: contract
              - text: 0x51F6…5110 ↗
          - generic [ref=e643]:
            - generic [ref=e644]: Play
            - link "Lobby" [ref=e645] [cursor=pointer]:
              - /url: /lobby
            - link "Create a Match" [ref=e646] [cursor=pointer]:
              - /url: /create
            - link "Leaderboard" [ref=e647] [cursor=pointer]:
              - /url: /leaderboard
            - link "Profile" [ref=e648] [cursor=pointer]:
              - /url: /profile
          - generic [ref=e649]:
            - generic [ref=e650]: Learn
            - link "How to Play" [ref=e651] [cursor=pointer]:
              - /url: /faq
            - link "About" [ref=e652] [cursor=pointer]:
              - /url: /about
          - generic [ref=e653]:
            - generic [ref=e654]: Connect
            - link "@play_panenka ↗" [ref=e655] [cursor=pointer]:
              - /url: https://x.com/play_panenka
            - link "GitHub ↗" [ref=e656] [cursor=pointer]:
              - /url: https://github.com/Magicianhax/panenka
            - link "X Layer ↗" [ref=e657] [cursor=pointer]:
              - /url: https://www.okx.com/xlayer
        - generic [ref=e658]:
          - generic [ref=e659]: © 2026 PANENKA · built on X Layer
          - generic [ref=e660]: not affiliated with FIFA or any football association
  - alert [ref=e661]
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
      |                                                                               ^ Error: Footer missing required elements on /create
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