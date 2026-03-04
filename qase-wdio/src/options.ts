export class QaseReporterOptions {
  useCucumber?: boolean;
  disableWebdriverStepsReporting?: boolean;
  disableWebdriverScreenshotsReporting?: boolean;

  constructor() {
    this.useCucumber = false;
    this.disableWebdriverStepsReporting = false;
    this.disableWebdriverScreenshotsReporting = false;
  }
}
