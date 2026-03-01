import axios from "axios";

/** Timeout (ms) for fetching robots.txt — must be fast. */
const ROBOTS_TIMEOUT = 5000;

export interface RobotsCheckResult {
  allowed: boolean;
  /** Present only when scraping is blocked. */
  reason?: string;
}

/**
 * Fetch and parse a domain's robots.txt to determine whether our
 * generic user-agent is allowed to scrape.
 *
 * Rules:
 *  - If robots.txt is unreachable / 404 / malformed → allow (fail-open).
 *  - If `User-agent: *` section contains `Disallow: /` → block.
 *  - Otherwise → allow.
 *
 * Lightweight, serverless-safe, 3 s timeout.
 */
export async function checkRobotsTxt(url: string): Promise<RobotsCheckResult> {
  try {
    const { origin } = new URL(url);
    const robotsUrl = `${origin}/robots.txt`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ROBOTS_TIMEOUT);

    try {
      const res = await axios.get(robotsUrl, {
        timeout: ROBOTS_TIMEOUT,
        signal: controller.signal,
        headers: { "User-Agent": "WebScopePro/1.0" },
        validateStatus: () => true, // don't throw on 4xx/5xx
        maxRedirects: 3,
        responseType: "text",
      });

      clearTimeout(timeout);

      // robots.txt not found or server error → allow
      if (res.status >= 400) {
        return { allowed: true };
      }

      const body: string =
        typeof res.data === "string" ? res.data : String(res.data);

      return parseRobotsTxt(body);
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    // Network error, timeout, malformed URL → fail-open
    return { allowed: true };
  }
}

// ── Parser ──────────────────────────────────────────────────────────

/**
 * Minimal robots.txt parser.
 *
 * We only care about the `User-agent: *` block.
 * Within that block, `Disallow: /` (root path) means "block everything".
 * Any more specific Disallow is ignored — we only block full-site bans.
 */
function parseRobotsTxt(raw: string): RobotsCheckResult {
  const lines = raw.split(/\r?\n/);

  let inWildcardBlock = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // skip empty / comment lines
    if (!line || line.startsWith("#")) continue;

    // Detect User-agent directives
    const uaMatch = line.match(/^User-agent:\s*(.+)/i);
    if (uaMatch) {
      const agent = uaMatch[1].trim();
      inWildcardBlock = agent === "*";
      continue;
    }

    // Inside the * block, check for blanket disallow
    if (inWildcardBlock) {
      const disallowMatch = line.match(/^Disallow:\s*(.*)/i);
      if (disallowMatch) {
        const path = disallowMatch[1].trim();
        if (path === "/") {
          return {
            allowed: false,
            reason: "Scraping disallowed by robots.txt",
          };
        }
      }

      // An Allow directive in the same block — keep scanning
      // A new User-agent line will flip inWildcardBlock off via the check above
    }
  }

  return { allowed: true };
}
