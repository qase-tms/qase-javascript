import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Set by the process that starts the run and inherited by the processes it spawns, such as
// WebdriverIO workers, so a failure in one of them reaches the process that completes the run.
const SESSION_ENV = 'QASE_RUN_SESSION';

const markerPath = (): string | null => {
  const session = process.env[SESSION_ENV];
  return session ? path.join(tmpdir(), `qase-run-${session}.failed`) : null;
};

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RunFailures {
  static begin(): void {
    if (!process.env[SESSION_ENV]) {
      process.env[SESSION_ENV] = uuidv4();
    }
  }

  static record(): void {
    const marker = markerPath();
    if (!marker) return;
    try {
      writeFileSync(marker, '');
    } catch {
      // Without the marker the run is completed as before.
    }
  }

  /** Whether any process of the run recorded a failure; clears the record. */
  static consume(): boolean {
    const marker = markerPath();
    if (!marker || !existsSync(marker)) return false;
    try {
      unlinkSync(marker);
    } catch {
      // Already removed.
    }
    return true;
  }
}
