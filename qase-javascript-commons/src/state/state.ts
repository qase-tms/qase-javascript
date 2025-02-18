import { ModeEnum } from '../options';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';

export interface StateModel {
  RunId: number | undefined;
  Mode: ModeEnum | undefined;
  IsModeChanged: boolean | undefined;
}

export class StateManager {
  static statePath = path.resolve(process.cwd(), 'reporterState.json');

  static getState(): StateModel {
    let state: StateModel = {
      RunId: undefined,
      Mode: undefined,
      IsModeChanged: undefined,
    };

    try {
      const data = readFileSync(this.statePath, 'utf8');
      state = JSON.parse(data) as StateModel;
    } catch (err) {
      console.error('Error reading state file:', err);
    }
    return state;
  }

  static setRunId(runId: number): void {
    const state = this.getState();
    state.RunId = runId;
    this.setState(state);
  }

  static setMode(mode: ModeEnum): void {
    const state = this.getState();
    state.Mode = mode;
    state.IsModeChanged = true;
    this.setState(state);
  }

  static setIsModeChanged(isModeChanged: boolean): void {
    const state = this.getState();
    state.IsModeChanged = isModeChanged;
    this.setState(state);
  }

  static setState(state: StateModel): void {
    try {
      const data = JSON.stringify(state);
      writeFileSync(this.statePath, data);
    } catch (err) {
      console.error('Error writing state file:', err);
    }
  }

  static clearState(): void {
    try {
      unlinkSync(this.statePath);
    } catch (err) {
      console.error('Error clearing state file:', err);
    }
  }

  static isStateExists(): boolean {
    return existsSync(this.statePath);
  }
}
