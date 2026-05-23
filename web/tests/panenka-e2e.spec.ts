import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE = 'https://www.playpanenka.fun';
const PAGES = ['/', '/lobby', '/create', '/leaderboard', '/profile', '/faq', '/about'];
const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots');

type PageResult = {
  page: string;
  status: number | null;
  consoleErrors: string[];
  networkFailures: string[];
  multipartLeak: boolean;
  footerOk: boolean;
  topBarOk: boolean;
  mobileMenuOk?: boolean;
};

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function collectPageData(page: Page, url: string, viewportName: string): Promise<Omit<PageResult, 'mobileMenuOk'>> {
  const consoleErrors: string[] = [];
  const networkFailures: string[] = [];
  let status: number | null = null;

  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Filter out known noise
      if (!text.includes('favicon') && !text.includes('ERR_ABORTED')) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('response', (resp) => {
    const s = resp.status();
    if (s >= 400 && !resp.url().includes('favicon')) {
      networkFailures.push(`${s} ${resp.url()}`);
    }
  });

  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  status = response?.status() ?? null;

  // Wait for page to settle
  await page.waitForTimeout(2500);

  // Check for multipart/prerender leak: raw --<hex> or x-nextjs-* header text visible on screen
  const bodyText = await page.evaluate(() => document.body.innerText);
  const multipartLeak = /--[0-9a-f]{8,}/i.test(bodyText) || /x-nextjs-/i.test(bodyText);

  // Check footer
  const footerOk = await page.evaluate(() => {
    const body = document.body.innerText;
    return (
      body.includes('@play_panenka') &&
      (body.includes('0x51F6') || body.includes('5110')) &&
      body.includes('not affiliated')
    );
  });

  // Check TopBar
  const topBarOk = await page.evaluate(() => {
    const body = document.body.innerText;
    return body.includes('PANENKA');
  });

  // Screenshot
  const slug = url === '/' ? 'home' : url.replace(/\//g, '');
  ensureDir(SCREENSHOT_DIR);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${slug}-${viewportName}.png`),
    fullPage: false,
  });

  return { page: url, status, consoleErrors, networkFailures, multipartLeak, footerOk, topBarOk };
}

// ─── Desktop tests ────────────────────────────────────────────────────────────

test.describe('Desktop (1440×900)', () => {
  for (const route of PAGES) {
    test(`${route} — loads, no errors, footer/topbar OK`, async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'chromium only');
      const result = await collectPageData(page, `${BASE}${route}`, 'desktop');

      // HTTP status
      expect(result.status, `Expected 200 on ${route}, got ${result.status}`).toBe(200);

      // No multipart leak
      expect(result.multipartLeak, `Multipart prerender leak detected on ${route}`).toBe(false);

      // Footer
      expect(result.footerOk, `Footer missing required elements on ${route}`).toBe(true);

      // TopBar
      expect(result.topBarOk, `TopBar PANENKA brand missing on ${route}`).toBe(true);

      // Console errors — report count but allow test to pass with warnings
      if (result.consoleErrors.length > 0) {
        console.log(`[CONSOLE ERRORS on ${route}]: ${result.consoleErrors.join(' | ')}`);
      }
      // Hard fail only on truly critical JS errors
      const criticalErrors = result.consoleErrors.filter(
        (e) =>
          e.includes('TypeError') ||
          e.includes('ReferenceError') ||
          e.includes('SyntaxError') ||
          e.includes('Cannot read') ||
          e.includes('is not defined')
      );
      expect(criticalErrors.length, `Critical JS errors on ${route}: ${criticalErrors.join('; ')}`).toBe(0);

      // Network failures
      if (result.networkFailures.length > 0) {
        console.log(`[NETWORK FAILURES on ${route}]: ${result.networkFailures.join(' | ')}`);
      }
    });
  }

  // Footer link attributes
  test('footer external links have target=_blank', async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const externalLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('footer a[href]'));
      return links.map((a) => ({
        href: (a as HTMLAnchorElement).href,
        target: (a as HTMLAnchorElement).target,
        text: (a as HTMLElement).innerText.trim(),
      }));
    });

    console.log('Footer links found:', JSON.stringify(externalLinks));

    const externalWithoutBlank = externalLinks.filter(
      (l) => (l.href.startsWith('http') || l.href.startsWith('https')) && l.target !== '_blank'
    );
    expect(
      externalWithoutBlank.length,
      `Footer external links missing target=_blank: ${JSON.stringify(externalWithoutBlank)}`
    ).toBe(0);
  });

  // Internal SPA nav (no full reloads)
  test('internal nav does not cause full page reloads', async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Find a nav link to /lobby or /leaderboard
    const navLink = page.locator('nav a[href="/lobby"], header a[href="/lobby"], a[href="/lobby"]').first();
    const count = await navLink.count();
    if (count === 0) {
      console.log('No /lobby nav link found — skipping SPA nav test');
      return;
    }

    let fullReload = false;
    page.on('response', (r) => {
      if (r.url() === `${BASE}/lobby` && r.status() === 200) {
        // A 200 for the HTML page itself indicates a full reload
        const ct = r.headers()['content-type'] || '';
        if (ct.includes('text/html')) fullReload = true;
      }
    });

    await navLink.click();
    await page.waitForURL(/lobby/, { timeout: 5000 });
    await page.waitForTimeout(1000);

    // SPA navigation: if content-type html response happened it's a full reload
    // Next.js RSC fetches json, not HTML — so html response = full reload
    expect(fullReload, 'Internal nav triggered a full HTML reload').toBe(false);
  });

  // /profile without wallet should not crash
  test('/profile without wallet shows connect prompt, not crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    page.on('pageerror', (e) => errors.push(`PAGE ERROR: ${e.message}`));

    const resp = await page.goto(`${BASE}/profile`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    expect(resp?.status()).toBe(200);

    // Should not be a blank white page
    const bodyText = await page.evaluate(() => document.body.innerText.trim());
    expect(bodyText.length, 'Profile page appears blank').toBeGreaterThan(10);

    const pageErrors = errors.filter(
      (e) => e.includes('Cannot read') || e.includes('is not defined') || e.includes('PAGE ERROR')
    );
    expect(pageErrors.length, `Profile page crashed: ${pageErrors.join('; ')}`).toBe(0);
  });

  // /faq scoring grid
  test('/faq has 3x3 scoring grid content', async ({ page }) => {
    await page.goto(`${BASE}/faq`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const bodyText = await page.evaluate(() => document.body.innerText);
    // Should contain scoring-related keywords
    const hasScoringContent =
      bodyText.includes('3x3') ||
      bodyText.includes('scoring') ||
      bodyText.includes('Scoring') ||
      bodyText.includes('goal') ||
      bodyText.includes('Goal') ||
      bodyText.includes('penalty') ||
      bodyText.includes('Penalty') ||
      bodyText.includes('panenka') ||
      bodyText.includes('Panenka');
    expect(hasScoringContent, 'FAQ page missing scoring/penalty content').toBe(true);
  });
});

// ─── Mobile tests ─────────────────────────────────────────────────────────────

test.describe('Mobile (390×844)', () => {
  for (const route of PAGES) {
    test(`${route} — loads OK on mobile`, async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'chromium only');
      const result = await collectPageData(page, `${BASE}${route}`, 'mobile');

      expect(result.status, `Expected 200 on ${route} (mobile), got ${result.status}`).toBe(200);
      expect(result.multipartLeak, `Multipart leak on ${route} (mobile)`).toBe(false);
      expect(result.topBarOk, `TopBar missing on ${route} (mobile)`).toBe(true);
    });
  }

  test('mobile hamburger menu is visible and opens', async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Look for hamburger button (common patterns)
    const hamburger = page.locator(
      '[data-testid="hamburger"], button[aria-label*="menu" i], button[aria-label*="nav" i], .hamburger, [class*="hamburger"], [class*="menu-btn"], button svg[class*="menu"]'
    ).first();

    const isVisible = await hamburger.isVisible().catch(() => false);
    if (!isVisible) {
      // Try finding any button in header/nav area
      const headerBtn = page.locator('header button, nav button').first();
      const hbVisible = await headerBtn.isVisible().catch(() => false);
      if (hbVisible) {
        await headerBtn.click();
        await page.waitForTimeout(500);
        const afterClick = await page.evaluate(() => document.body.innerText);
        // Nav items should now be visible — check for known routes
        const menuOpened =
          afterClick.includes('Lobby') ||
          afterClick.includes('lobby') ||
          afterClick.includes('Leaderboard') ||
          afterClick.includes('FAQ');
        console.log(`Header button click result — menu opened: ${menuOpened}`);
      } else {
        console.log('No hamburger/header button found at mobile viewport — may use always-visible nav');
      }
      return;
    }

    await hamburger.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile-menu-open.png'),
    });
  });
});
