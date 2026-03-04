/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from '@jest/globals';
import { enableCucumberSupport } from '../src/cucumber';

// Mock Cypress
const mockCypress = {
  on: jest.fn(),
};

// Mock cy.task
const mockCyTask = jest.fn();

// Setup mocks
beforeEach(() => {
  jest.clearAllMocks();
  
  // Mock global Cypress
  (global as any).Cypress = mockCypress;
  
  // Mock cy.task
  (global as any).cy = {
    task: mockCyTask,
  };
});

describe('Cucumber Support Functions', () => {
  describe('enableCucumberSupport', () => {
    it('should register log:added event listener', () => {
      enableCucumberSupport();
      
      expect(mockCypress.on).toHaveBeenCalledWith('log:added', expect.any(Function));
    });
  });
});

describe('Cucumber Step Detection', () => {
  let logHandler: (obj: any, entry: any) => void;

  beforeEach(() => {
    // Get the log handler function
    enableCucumberSupport();
    const call = mockCypress.on.mock.calls.find(call => call[0] === 'log:added');
    logHandler = call[1];
  });

  it('should detect cucumber steps', () => {
    const logEntry = {
      attributes: {
        name: 'step',
        event: false,
        instrument: 'command',
        message: 'Given I am on the homepage',
        displayName: 'Given I am on the homepage'
      }
    };

    logHandler(null, logEntry);

    expect(mockCyTask).toHaveBeenCalledWith('qaseCucumberStepStart', 'Given I am on the homepage Given I am on the homepage', { log: false });
  });

  it('should not detect non-cucumber steps', () => {
    const logEntry = {
      attributes: {
        name: 'visit',
        event: false,
        instrument: 'command',
        message: 'Visit homepage',
        displayName: 'Visit homepage'
      }
    };

    logHandler(null, logEntry);

    expect(mockCyTask).not.toHaveBeenCalled();
  });

  it('should handle steps with empty displayName', () => {
    const logEntry = {
      attributes: {
        name: 'step',
        event: false,
        instrument: 'command',
        message: 'Given I am on the homepage',
        displayName: undefined
      }
    };

    logHandler(null, logEntry);

    expect(mockCyTask).toHaveBeenCalledWith('qaseCucumberStepStart', ' Given I am on the homepage', { log: false });
  });
});
