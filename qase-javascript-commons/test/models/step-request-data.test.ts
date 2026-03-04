import { expect } from '@jest/globals';
import { StepType, TestStepType } from '../../src/models/test-step';
import { StepRequestData } from '../../src/models/step-data';
import { StepRequestData as StepRequestDataFromIndex } from '../../src/models';

describe('StepType.REQUEST and StepRequestData', () => {
  it('should equal the string "request"', () => {
    expect(StepType.REQUEST).toBe('request');
  });

  it('should create a step with step_type === StepType.REQUEST', () => {
    const step = new TestStepType(StepType.REQUEST);
    expect(step.step_type).toBe(StepType.REQUEST);
  });

  it('should initialize data with all 7 StepRequestData fields when type is REQUEST', () => {
    const step = new TestStepType(StepType.REQUEST);
    const data = step.data as StepRequestData;

    expect(data.request_method).toBe('');
    expect(data.request_url).toBe('');
    expect(data.request_headers).toBeNull();
    expect(data.request_body).toBeNull();
    expect(data.status_code).toBeNull();
    expect(data.response_body).toBeNull();
    expect(data.response_headers).toBeNull();
  });

  it('should allow assigning a StepRequestData object to a TestStepType data field', () => {
    const step = new TestStepType(StepType.REQUEST);
    const requestData: StepRequestData = {
      request_method: 'GET',
      request_url: 'https://example.com/api',
      request_headers: { 'Content-Type': 'application/json' },
      request_body: null,
      status_code: 200,
      response_body: '{"ok":true}',
      response_headers: { 'Content-Type': 'application/json' },
    };

    step.data = requestData;

    const assigned = step.data;
    expect(assigned.request_method).toBe('GET');
    expect(assigned.request_url).toBe('https://example.com/api');
    expect(assigned.request_headers).toEqual({ 'Content-Type': 'application/json' });
    expect(assigned.request_body).toBeNull();
    expect(assigned.status_code).toBe(200);
    expect(assigned.response_body).toBe('{"ok":true}');
    expect(assigned.response_headers).toEqual({ 'Content-Type': 'application/json' });
  });

  it('should export StepRequestData from src/models (barrel index)', () => {
    // Verify the type is importable from the barrel export
    const requestData: StepRequestDataFromIndex = {
      request_method: 'POST',
      request_url: 'https://example.com/api/data',
      request_headers: null,
      request_body: '{"key":"value"}',
      status_code: 201,
      response_body: null,
      response_headers: null,
    };

    expect(requestData.request_method).toBe('POST');
    expect(requestData.status_code).toBe(201);
  });
});
