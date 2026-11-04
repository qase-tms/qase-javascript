/* eslint-disable */
import { describe, expect, it } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('metadata tasks', () => {
  it('registers only qase-prefixed tasks, so user tasks such as log are not overridden', () => {
    const source = fs.readFileSync(path.join(__dirname, '../src/metadata.js'), 'utf8');
    const tasks = [...source.matchAll(/on\('task', \{\s*(\w+)\(/g)].map((match) => match[1]);

    expect(tasks).toHaveLength(source.split("on('task'").length - 1);
    expect(tasks).toContain('qaseLog');
    expect(tasks.filter((name) => !name!.startsWith('qase'))).toEqual([]);
  });
});
