/* eslint-disable */
import { expect } from '@jest/globals';
import { configSchema } from '../src/configSchema';

describe('configSchema', () => {
  it('should have correct schema structure', () => {
    expect(configSchema).toBeDefined();
    expect(typeof configSchema).toBe('object');
  });

  it('should have required properties', () => {
    expect(configSchema).toHaveProperty('type');
    expect(configSchema).toHaveProperty('properties');
    expect(configSchema).toHaveProperty('nullable');
  });

  it('should have correct type', () => {
    expect(configSchema.type).toBe('object');
  });

  it('should be nullable', () => {
    expect(configSchema['nullable']).toBe(true);
  });

  it('should have framework property', () => {
    expect(configSchema.properties).toHaveProperty('framework');
    expect(configSchema.properties.framework).toHaveProperty('type');
    expect(configSchema.properties.framework.type).toBe('object');
  });

  it('should have cypress property in framework', () => {
    const framework = configSchema.properties.framework;
    expect(framework.properties).toHaveProperty('cypress');
    expect(framework.properties.cypress).toHaveProperty('type');
    expect(framework.properties.cypress.type).toBe('object');
  });

  it('should have screenshotsFolder property in cypress', () => {
    const cypress = configSchema.properties.framework.properties.cypress;
    expect(cypress.properties).toHaveProperty('screenshotsFolder');
    expect(cypress.properties.screenshotsFolder).toHaveProperty('type');
    expect(cypress.properties.screenshotsFolder.type).toBe('string');
  });

  it('should have nullable properties', () => {
    expect(configSchema.properties.framework['nullable']).toBe(true);
    expect(configSchema.properties.framework.properties.cypress['nullable']).toBe(true);
    expect(configSchema.properties.framework.properties.cypress.properties.screenshotsFolder['nullable']).toBe(true);
  });
}); 
