/// <reference types="cypress" />

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

    if (url.includes('qase.io')) {
      return;
    }

    for (const domain of skipDomains) {
      if (url.includes(domain)) {
        return;
      }
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
