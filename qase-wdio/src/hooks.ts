import { ConfigLoader, QaseReporter } from 'qase-javascript-commons';

export async function beforeRunHook() {
  const configLoader = new ConfigLoader();
  const config = configLoader.load();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const reporter = QaseReporter.getInstance({
    ...config,
    frameworkPackage: 'wdio',
    frameworkName: 'wdio',
    reporterName: 'wdio-qase-reporter',
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await reporter.startTestRunAsync();
}

export async function afterRunHook() {
  const configLoader = new ConfigLoader();
  const config = configLoader.load();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const reporter = QaseReporter.getInstance({
    ...config,
    frameworkPackage: 'wdio',
    frameworkName: 'wdio',
    reporterName: 'wdio-qase-reporter',
  });

  await reporter.complete();
}
