import { afterRunHook, beforeRunHook } from './hooks';

module.exports = function (on, config) {
  on('before:run', async () => {
    await beforeRunHook(config);
  });

  on('after:run', async () => {
    await afterRunHook(config);
  });
};
