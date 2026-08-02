import { NextResponse } from 'next/server';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import fs from 'fs';
import path from 'path';

// Define structures for request and response
interface AutomateRequest {
  app: string;          // Target app (e.g. "instagram", "github", etc.)
  action: string;       // Action to perform (e.g. "check-auth", "scrape", "custom")
  credentials?: {
    username?: string;
    password?: string;
    [key: string]: any;
  };
  sessionState?: any;   // Playwright storageState (cookies + localStorage)
  userDataDir?: string; // Path to Chrome user data directory for persistent profile
  config?: {
    headless?: boolean;
    timeout?: number;
    [key: string]: any;
  };
  actionParams?: any;   // Parameters specific to the target action
}

interface StructuredLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

// Action Handlers Registry
// You can easily extend this map for other applications!
const APP_HANDLERS: Record<
  string,
  (page: Page, context: BrowserContext, params: any, log: (msg: string, level?: 'info' | 'warn' | 'error') => void) => Promise<{ status: string; data?: any }>
> = {
  'instagram': async (page, context, params, log) => {
    log('Running Instagram Automation Handler...');
    const action = params.action || 'check-auth';

    // 1. Navigate to Instagram homepage
    log('Navigating to Instagram homepage...');
    await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle', timeout: 30000 });

    // 2. Check if we are already logged in
    log('Verifying authentication status...');
    const isLoggedIn = await checkInstagramAuth(page);

    if (isLoggedIn) {
      log('User is successfully authenticated.', 'info');
      if (action === 'check-auth') {
        return { status: 'success', data: { authenticated: true, message: 'Already authenticated' } };
      }
      
      // Perform further actions here (e.g. scrape posts, post story, etc.)
      log(`Executing action: ${action}`);
      return { status: 'success', data: { authenticated: true, actionExecuted: action } };
    }

    log('User is NOT authenticated. Attempting login...', 'warn');

    // 3. Detect if we are on a login form or if there is a challenge
    const isLoginPage = await page.locator('input[name="username"]').count() > 0;
    if (!isLoginPage) {
      // Check if we hit an unexpected page or security challenge page directly
      const text = await page.innerText('body');
      if (text.includes('checkpoint') || text.includes('Confirm your identity') || text.includes('suspicious login')) {
        log('Security challenge / checkpoint detected on initial page load!', 'error');
        return { status: 'challenge', data: { challengeType: 'initial-checkpoint', text: text.slice(0, 500) } };
      }
      log('Unexpected page structure loaded.', 'error');
      return { status: 'error', data: { message: 'Unexpected page loaded. Could not locate login form.' } };
    }

    // 4. Attempt login with credentials if provided
    const { username, password } = params.credentials || {};
    if (!username || !password) {
      log('No credentials provided to perform login.', 'error');
      return { status: 'error', data: { message: 'Authentication required but no credentials provided.' } };
    }

    log(`Filling username: ${username}`);
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    
    log('Clicking login button...');
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() => {})
    ]);

    // 5. Verify post-login state
    log('Checking authentication state after login attempt...');
    const postLoginLoggedIn = await checkInstagramAuth(page);
    if (postLoginLoggedIn) {
      log('Login successful!', 'info');
      return { status: 'success', data: { authenticated: true, message: 'Authenticated via credentials' } };
    }

    // 6. Detect 2FA or Challenge
    const currentUrl = page.url();
    log(`Post-login URL: ${currentUrl}`);
    const pageText = await page.innerText('body');

    if (currentUrl.includes('checkpoint') || pageText.includes('security code') || pageText.includes('2-Factor') || pageText.includes('Enter the code')) {
      log('Two-factor authentication (2FA) or identity verification checkpoint detected!', 'error');
      return { status: 'challenge', data: { challengeType: '2fa', url: currentUrl } };
    }

    if (pageText.includes('incorrect') || pageText.includes('wrong password')) {
      log('Invalid credentials specified.', 'error');
      return { status: 'error', data: { message: 'Invalid credentials. Login failed.' } };
    }

    log('Unknown login failure occurred.', 'error');
    return { status: 'error', data: { message: 'Login failed with unknown error.', url: currentUrl } };
  },
  
  // Generic fallback handler for any web app
  'generic': async (page, context, params, log) => {
    const targetUrl = params.actionParams?.targetUrl;
    if (!targetUrl) {
      return { status: 'error', data: { message: 'No targetUrl specified in actionParams' } };
    }
    log(`Navigating to generic target: ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    const title = await page.title();
    log(`Loaded page title: ${title}`);
    return { status: 'success', data: { title, url: page.url() } };
  }
};

// Helper to check Instagram authentication
async function checkInstagramAuth(page: Page): Promise<boolean> {
  // Check for presence of common authenticated selectors (search icon, profile link, direct inbox, etc.)
  const authenticatedSelectors = [
    'svg[aria-label="New post"]',
    'svg[aria-label="Direct"]',
    'svg[aria-label="Messenger"]',
    'svg[aria-label="Home"]',
    'a[href*="/direct/inbox/"]',
    'img[alt*="profile picture"]'
  ];

  for (const selector of authenticatedSelectors) {
    if (await page.locator(selector).count() > 0) {
      return true;
    }
  }
  return false;
}

export async function POST(request: Request) {
  const logs: StructuredLog[] = [];
  const log = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
    const timestamp = new Date().toISOString();
    logs.push({ timestamp, level, message });
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  };

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let tempStatePath: string | null = null;

  try {
    const body: AutomateRequest = await request.json();
    const app = (body.app || 'generic').toLowerCase();
    const action = body.action || 'check-auth';
    const config = body.config || {};
    const headless = config.headless !== false; // default true
    const timeout = config.timeout || 30000;

    log(`Initializing automation for app: ${app}, action: ${action}`);

    // Resolve state payload
    let statePayload = body.sessionState;
    if (typeof statePayload === 'string') {
      try {
        statePayload = JSON.parse(statePayload);
      } catch (e) {
        log('Failed to parse sessionState string as JSON, ignoring.', 'warn');
        statePayload = null;
      }
    }

    // Set up launch options
    const launchOptions = {
      headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled' // Helps bypass bot detection
      ]
    };

    // Launch Chromium browser
    if (body.userDataDir) {
      // Option A: Use a local persistent Chromium context (e.g. existing Chrome profile)
      const profilePath = path.resolve(body.userDataDir);
      log(`Launching persistent Chromium context with profile: ${profilePath}`);
      context = await chromium.launchPersistentContext(profilePath, {
        ...launchOptions,
        viewport: { width: 1280, height: 800 }
      });
    } else {
      // Option B: Standard headless launch, optional state injection
      log('Launching new stateless Chromium instance...');
      browser = await chromium.launch(launchOptions);
      
      if (statePayload) {
        log('Injecting sessionState cookies/localStorage into context...');
        // Write temporary file for Playwright's format
        tempStatePath = path.join(process.cwd(), `temp-state-${Date.now()}.json`);
        fs.writeFileSync(tempStatePath, JSON.stringify(statePayload));
        context = await browser.newContext({
          storageState: tempStatePath,
          viewport: { width: 1280, height: 800 }
        });
      } else {
        log('Creating fresh browser context (no state injected).');
        context = await browser.newContext({
          viewport: { width: 1280, height: 800 }
        });
      }
    }

    // Configure default timeouts
    context.setDefaultTimeout(timeout);
    const page = await context.newPage();

    // Emulate human-like traits
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    // Execute app handler
    const handler = APP_HANDLERS[app] || APP_HANDLERS['generic'];
    const handlerParams = {
      action,
      credentials: body.credentials,
      actionParams: body.actionParams
    };

    log('Triggering application handler...');
    const result = await handler(page, context, handlerParams, log);

    // Save final session state to return to n8n
    log('Extracting final browser storage state...');
    const finalState = await context.storageState();

    log('Automation run completed successfully.', 'info');
    return NextResponse.json({
      success: result.status === 'success',
      status: result.status,
      data: result.data,
      sessionState: finalState,
      logs
    });

  } catch (error: any) {
    log(`Critical automation error: ${error.message}`, 'error');
    if (error.stack) {
      console.error(error.stack);
    }
    return NextResponse.json({
      success: false,
      status: 'error',
      error: error.message,
      logs
    }, { status: 500 });

  } finally {
    // Cleanup browser instances
    if (context && !browser) {
      // If we launched a persistent context, we must close it
      log('Closing persistent context...');
      await context.close().catch(() => {});
    }
    if (browser) {
      log('Closing browser...');
      await browser.close().catch(() => {});
    }
    // Cleanup temp state file
    if (tempStatePath && fs.existsSync(tempStatePath)) {
      log('Cleaning up temporary state file...');
      fs.unlinkSync(tempStatePath);
    }
  }
}
