import { expect } from '@jest/globals';
import { StateManager, StateModel } from '../../src/state/state';
import { ModeEnum } from '../../src/options/mode-enum';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

// Mock path module
jest.mock('path', () => ({
  resolve: jest.fn(),
}));

// Mock console.error
// eslint-disable-next-line @typescript-eslint/no-empty-function
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('StateManager', () => {
  const mockExistsSync = jest.mocked(fs.existsSync);
  const mockReadFileSync = jest.mocked(fs.readFileSync);
  const mockWriteFileSync = jest.mocked(fs.writeFileSync);
  const mockUnlinkSync = jest.mocked(fs.unlinkSync);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const mockResolve = jest.mocked(path.resolve);

  const mockStatePath = '/mock/path/reporterState.json';

  beforeEach(() => {
    jest.clearAllMocks();
    mockResolve.mockReturnValue(mockStatePath);
    StateManager.statePath = mockStatePath;
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('getState', () => {
    it('should return default state when state file does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      const state = StateManager.getState();

      expect(state).toEqual({
        RunId: undefined,
        Mode: undefined,
        IsModeChanged: undefined,
      });
    });

    it('should return parsed state when state file exists', () => {
      const mockState: StateModel = {
        RunId: 123,
        Mode: ModeEnum.report,
        IsModeChanged: true,
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockState));

      const state = StateManager.getState();

      expect(state).toEqual(mockState);
    });

    it('should handle JSON parse errors gracefully', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('invalid json');

      const state = StateManager.getState();

      expect(state).toEqual({
        RunId: undefined,
        Mode: undefined,
        IsModeChanged: undefined,
      });
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should handle file read errors gracefully', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation(() => {
        throw new Error('Read error');
      });

      const state = StateManager.getState();

      expect(state).toEqual({
        RunId: undefined,
        Mode: undefined,
        IsModeChanged: undefined,
      });
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe('setRunId', () => {
    it('should set RunId and save state', () => {
      const mockState: StateModel = {
        RunId: undefined,
        Mode: ModeEnum.testops,
        IsModeChanged: false,
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockState));

      StateManager.setRunId(456);

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        mockStatePath,
        expect.stringContaining('"RunId":456')
      );
    });
  });

  describe('setMode', () => {
    it('should set Mode and IsModeChanged to true', () => {
      const mockState: StateModel = {
        RunId: 123,
        Mode: undefined,
        IsModeChanged: false,
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockState));

      StateManager.setMode(ModeEnum.report);

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        mockStatePath,
        expect.stringContaining('"Mode":"report"')
      );
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        mockStatePath,
        expect.stringContaining('"IsModeChanged":true')
      );
    });
  });

  describe('setIsModeChanged', () => {
    it('should set IsModeChanged flag', () => {
      const mockState: StateModel = {
        RunId: 123,
        Mode: ModeEnum.report,
        IsModeChanged: false,
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockState));

      StateManager.setIsModeChanged(true);

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        mockStatePath,
        expect.stringContaining('"IsModeChanged":true')
      );
    });
  });

  describe('setState', () => {
    it('should write state to file', () => {
      const newState: StateModel = {
        RunId: 789,
        Mode: ModeEnum.testops,
        IsModeChanged: true,
      };

      StateManager.setState(newState);

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        mockStatePath,
        JSON.stringify(newState)
      );
    });

    it('should handle write errors gracefully', () => {
      mockWriteFileSync.mockImplementation(() => {
        throw new Error('Write error');
      });

      const newState: StateModel = {
        RunId: 789,
        Mode: ModeEnum.testops,
        IsModeChanged: true,
      };

      expect(() => StateManager.setState(newState)).not.toThrow();
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe('clearState', () => {
    it('should delete state file when it exists', () => {
      mockExistsSync.mockReturnValue(true);

      StateManager.clearState();

      expect(mockUnlinkSync).toHaveBeenCalledWith(mockStatePath);
    });

    it('should not delete state file when it does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      StateManager.clearState();

      expect(mockUnlinkSync).not.toHaveBeenCalled();
    });

    it('should handle delete errors gracefully', () => {
      mockExistsSync.mockReturnValue(true);
      mockUnlinkSync.mockImplementation(() => {
        throw new Error('Delete error');
      });

      expect(() => StateManager.clearState()).not.toThrow();
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe('isStateExists', () => {
    it('should return true when state file exists', () => {
      mockExistsSync.mockReturnValue(true);

      const exists = StateManager.isStateExists();

      expect(exists).toBe(true);
    });

    it('should return false when state file does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      const exists = StateManager.isStateExists();

      expect(exists).toBe(false);
    });
  });
}); 
