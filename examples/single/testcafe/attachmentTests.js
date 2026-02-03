import { test } from 'testcafe';
import { qase } from 'testcafe-reporter-qase/qase';

fixture`Attachment tests`
  .page`http://devexpress.github.io/testcafe/example/`;

test('Test with file attachment success', async (t) => {
  qase.attach({ paths: ['examples/testcafe/attachmentTests.js'] });
  await t.expect(true).ok();
});

test('Test with file attachment failed', async (t) => {
  qase.attach({ paths: ['examples/testcafe/attachmentTests.js'] });
  await t.expect(false).ok();
});

test('Test with content attachment success', async (t) => {
  qase.attach({ name: 'log.txt', content: 'Hello, World!', type: 'text/plain' });
  await t.expect(true).ok();
});

test('Test with content attachment failed', async (t) => {
  qase.attach({ name: 'log.txt', content: 'Hello, World!', type: 'text/plain' });
  await t.expect(false).ok();
});

test('Test with step attachment success', async (t) => {
  await qase.step('Step with attachment', async (s) => {
    s.attach({ name: 'log.txt', content: 'Hello, World!', type: 'text/plain' });
  });
  await t.expect(true).ok();
});

test('Test with step attachment failed', async (t) => {
  await qase.step('Step with attachment', async (s) => {
    s.attach({ name: 'log.txt', content: 'Hello, World!', type: 'text/plain' });
  });
  await t.expect(false).ok();
});
