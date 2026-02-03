import { test } from 'testcafe';
import { qase } from 'testcafe-reporter-qase/qase';

fixture`Simple tests`
  .page`http://devexpress.github.io/testcafe/example/`;

test('Test without metadata success', async (t) => {
  await t.expect(true).ok();
});

test('Test without metadata failed', async (t) => {
  await t.expect(false).ok();
});

test.meta(qase.id(1).create())('Test with QaseID success', async t => {
  await t.expect(true).ok();
});

test.meta(qase.id(2).create())('Test with QaseID failed', async t => {
  await t.expect(false).ok();
});

test.meta(qase.title('Test with title success').create())('Test with title success', async t => {
  await t.expect(true).ok();
});

test.meta(qase.title('Test with title failed').create())('Test with title failed', async t => {
  await t.expect(false).ok();
});

test.meta(qase.fields({
  'description': 'Test description',
  'preconditions': 'Some text',
}).create())('Test with fields success', async t => {
  await t.expect(true).ok();
});

test.meta(qase.fields({
  'description': 'Test description',
  'preconditions': 'Some text',
}).create())('Test with fields failed', async t => {
  await t.expect(false).ok();
});

test.meta(qase.ignore().create())('Test with ignore success', async t => {
  await t.expect(true).ok();
});

test.meta(qase.ignore().create())('Test with ignore failed', async t => {
  await t.expect(false).ok();
});
