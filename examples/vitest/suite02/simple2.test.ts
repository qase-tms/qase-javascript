import { describe, it, test, expect } from 'vitest';
import { addQaseId, withQase } from 'vitest-qase-reporter/vitest';

describe('Suite 02 - Advanced Test Examples', () => {
  test(addQaseId('should demonstrate withQase annotations', [10]), withQase(async ({ qase }) => {
    await qase.title('Advanced test with annotations');
    await qase.comment('This test demonstrates advanced Qase features');
    await qase.suite('Advanced Test Suite from annotations');
    await qase.fields({ 'description': 'This is a comprehensive test example' });
    await qase.parameters({ 'environment': 'staging', 'browser': 'chrome' });
    
    await qase.step('Step 1: Initialize test', () => {
      expect(true).toBe(true);
    });

    await qase.step('Step 2: Perform calculation', () => {
      expect(1 + 1).toBe(2);
    });

    await qase.step('Step 3: Verify result', () => {
      expect(2 * 2).toBe(4);
    });
  }));

  it(addQaseId('should demonstrate priority field', [11]), withQase(async ({ qase }) => {
    await qase.fields({ priority: 'high' });
    expect(1 + 1).toBe(2);
  }));

  it(addQaseId('should demonstrate severity field', [12]), withQase(async ({ qase }) => {
    await qase.fields({ severity: 'critical' });
    expect(1 + 1).toBe(2);
  }));

  it(addQaseId('should demonstrate layer field', [13]), withQase(async ({ qase }) => {
    await qase.fields({ layer: 'e2e' });
    expect(1 + 1).toBe(2);
  }));

  it('should fail to demonstrate failure reporting', () => {
    expect(1 + 1).toBe(3);
  });

  it.skip('should be skipped to demonstrate skip reporting', () => {
    expect(true).toBe(true);
  });
});

describe('Suite 02 - Parameterized Tests', () => {
  const testCases = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 },
    { name: 'Charlie', age: 35 }
  ];

  testCases.forEach(({ name, age }) => {
    it(`should process user ${name}`, withQase(async ({ qase }) => {
      await qase.title(`Process user data for ${name}`);
      await qase.parameters({ Name: name, Age: age.toString() });
      
      expect(name).toBeDefined();
      expect(age).toBeGreaterThan(0);
    }));
  });
});
