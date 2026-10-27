/// <reference types="cypress" />

// Matched against the parsed host, not the raw URL: a substring check also skips
// `https://evil.test/?u=qase.io` and `https://qase.io.evil.test`.
function hostMatchesDomain(rawUrl: string, domain: string): boolean {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }
  const normalized = domain.toLowerCase();
  const hostname = url.hostname.toLowerCase();
  return hostname === normalized
    || hostname.endsWith(`.${normalized}`)
    || url.host.toLowerCase() === normalized;
}

beforeEach(() => {
  if (Cypress.env('QASE_PROFILER_ENABLED') !== 'true') {
    return;
  }

  let skipDomains: string[] = [];
  try {
    const raw = Cypress.env('QASE_PROFILER_SKIP_DOMAINS') as string | undefined;
    if (raw) {
      skipDomains = JSON.parse(raw) as string[];
    }
  } catch {
    skipDomains = [];
  }

  cy.intercept('**', (req) => {
    const url: string = req.url;

    if (url.includes('/__cypress/')) {
      return;
    }

    if (['qase.io', ...skipDomains].some((domain) => hostMatchesDomain(url, domain))) {
      return;
    }

    const startTime = Date.now();

    req.continue((res) => {
      const duration = Date.now() - startTime;
      const statusCode: number = res.statusCode;

      let responseBody: string | null = null;
      if (statusCode >= 400) {
        const body = res.body as unknown;
        if (typeof body === 'string') {
          responseBody = body.slice(0, 10000);
        } else if (body !== null && body !== undefined) {
          try {
            responseBody = JSON.stringify(body).slice(0, 10000);
          } catch {
            responseBody = null;
          }
        }
      }

      cy.task(
        'qaseNetworkRequest',
        {
          method: req.method,
          url,
          statusCode,
          duration,
          responseBody,
          startTime,
        },
        { log: false },
      );
    });
  });
});
