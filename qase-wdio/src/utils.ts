import { CommandArgs } from '@wdio/reporter';

/**
 * Check is object is empty
 * @param object {Object}
 * @private
 */
export const isEmpty = (object: any) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  !object || Object.keys(object).length === 0;


export const isScreenshotCommand = (command: CommandArgs): boolean => {
  const isScreenshotEndpoint = /\/session\/[^/]*(\/element\/[^/]*)?\/screenshot/

  return (
    // WebDriver protocol
    (command.endpoint && isScreenshotEndpoint.test(command.endpoint)) ||
    // DevTools protocol
    command.command === 'takeScreenshot'
  )
}
