import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

/**
 * Remote chromium binary URL used by @sparticuz/chromium-min.
 * The binary is downloaded once per cold start and cached in /tmp.
 */
const CHROMIUM_PACK_URL =
  "https://github.com/nichochar/chromium-binaries/releases/download/chromium-v131.0.0/chromium-v131.0.0-pack.tar";

/**
 * Launch a serverless-friendly headless Chromium browser.
 * Use this everywhere instead of calling puppeteer.launch() directly.
 */
export async function launchBrowser() {
  chromium.setGraphicsMode = false;

  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1280, height: 800 },
    executablePath: await chromium.executablePath(CHROMIUM_PACK_URL),
    headless: true,
  });
}
