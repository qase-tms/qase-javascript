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

interface ProfilerConfig {
  enabled: boolean;
  skipDomains: string[];
}

interface RecordedRequest {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  responseBody: string | null;
  startTime: number;
}

let recorded: RecordedRequest[] = [];

beforeEach(() => {
  recorded = [];

  // The plugin cannot pass this through `config.env`: Cypress drops changes to the config
  // unless `setupNodeEvents` returns it, and the documented setup does not.
  cy.task<ProfilerConfig | null>('qaseProfilerConfig', null, { log: false }).then((config) => {
    if (!config?.enabled) {
      return;
    }

    cy.intercept('**', (req) => {
      const url: string = req.url;

      if (url.includes('/__cypress/')) {
        return;
      }

      if (['qase.io', ...config.skipDomains].some((domain) => hostMatchesDomain(url, domain))) {
        return;
      }

      const startTime = Date.now();

      req.continue((res) => {
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

        // cy commands cannot run inside an intercept handler; the requests are sent after the test.
        recorded.push({ method: req.method, url, statusCode, duration: Date.now() - startTime, responseBody, startTime });
      });
    });
  });
});

afterEach(() => {
  const requests = recorded;
  recorded = [];
  for (const request of requests) {
    cy.task('qaseNetworkRequest', request, { log: false });
  }
});
