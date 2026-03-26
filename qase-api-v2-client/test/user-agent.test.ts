import { expect } from '@jest/globals';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { Configuration, ResultsApi } from '../src';

const packageJson = require('../../package.json');

describe('User-Agent header', () => {
  describe('Configuration', () => {
    it('should set User-Agent header by default', () => {
      const config = new Configuration({ apiKey: 'test-token' });

      expect(config.baseOptions).toBeDefined();
      expect(config.baseOptions.headers).toBeDefined();
      expect(config.baseOptions.headers['User-Agent']).toBe(
        `qase-api-client-js/${packageJson.version}`
      );
    });

    it('should contain qase-api-client substring in User-Agent', () => {
      const config = new Configuration({ apiKey: 'test-token' });

      const userAgent: string = config.baseOptions.headers['User-Agent'];
      expect(userAgent).toMatch(/qase-api-client/i);
    });

    it('should match format qase-api-client-<language>/<version>', () => {
      const config = new Configuration({ apiKey: 'test-token' });

      const userAgent: string = config.baseOptions.headers['User-Agent'];
      expect(userAgent).toMatch(/^qase-api-client-js\/\d+\.\d+\.\d+$/);
    });

    it('should not override custom User-Agent from baseOptions', () => {
      const config = new Configuration({
        apiKey: 'test-token',
        baseOptions: {
          headers: {
            'User-Agent': 'custom-agent/1.0.0',
          },
        },
      });

      expect(config.baseOptions.headers['User-Agent']).toBe('custom-agent/1.0.0');
    });

    it('should preserve other headers from baseOptions', () => {
      const config = new Configuration({
        apiKey: 'test-token',
        baseOptions: {
          headers: {
            'X-Custom': 'value',
          },
        },
      });

      expect(config.baseOptions.headers['X-Custom']).toBe('value');
      expect(config.baseOptions.headers['User-Agent']).toBe(
        `qase-api-client-js/${packageJson.version}`
      );
    });
  });

  describe('HTTP request', () => {
    let mock: MockAdapter;
    const axiosInstance = axios.create();

    beforeEach(() => {
      mock = new MockAdapter(axiosInstance);
    });

    afterEach(() => {
      mock.restore();
    });

    it('should send User-Agent header in API requests', async () => {
      const config = new Configuration({
        apiKey: 'test-token',
        basePath: 'https://api.qase.io/v2',
      });

      const resultsApi = new ResultsApi(config, undefined, axiosInstance);

      mock.onPost(/\/result/).reply((reqConfig) => {
        expect(reqConfig.headers?.['User-Agent']).toBe(
          `qase-api-client-js/${packageJson.version}`
        );
        return [200, { status: true, result: { hash: 'abc123' } }];
      });

      await resultsApi.createResultV2('TEST', 1, {
        title: 'Test result',
        execution: { status: 'passed', start_time: 0, end_time: 1, duration: 1 },
      });

      expect(mock.history.post.length).toBe(1);
    });
  });
});
