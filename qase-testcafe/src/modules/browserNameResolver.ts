import { TestRunInfoType } from '../types';

export class BrowserNameResolver {
  static resolve(testRunInfo: TestRunInfoType, userAgents: string[]): string | null {
    const userAgent =
      testRunInfo.screenshots[0]?.userAgent ??
      testRunInfo.errs[0]?.userAgent ??
      null;

    if (userAgent) {
      return BrowserNameResolver.parseBrowserName(userAgent);
    }

    if (userAgents.length === 1 && userAgents[0]) {
      return BrowserNameResolver.parseBrowserName(userAgents[0]);
    }

    return null;
  }

  static parseBrowserName(userAgent: string): string {
    const browserPart = userAgent.split(' / ')[0] ?? userAgent;
    const name = browserPart.split(/[\s_]/)[0];
    return (name ?? browserPart).toLowerCase();
  }
}
