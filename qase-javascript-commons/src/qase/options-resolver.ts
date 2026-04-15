import envSchema from 'env-schema';
import {
  EnvEnum,
  EnvRunEnum,
  envToConfig,
  envValidationSchema,
} from '../env';
import { composeOptions, ModeEnum, OptionsType } from '../options';
import { ConfigType } from '../config';
import { StateManager } from '../state/state';

export interface ResolvedOptions {
  effectiveMode: ModeEnum;
  effectiveFallback: ModeEnum;
  composed: ConfigType & OptionsType;
  withState: boolean;
}

/**
 * Composes the final options used by QaseReporter:
 * - restores mode / runId from state (when withState is active)
 * - merges env-derived config with user options
 * - determines effective mode / fallback values
 */
export class OptionsResolver {
  resolve(options: OptionsType): ResolvedOptions {
    const withState = this.detectWithState(options);
    if (withState) {
      this.restoreFromState();
    }

    const env = envToConfig(envSchema({ schema: envValidationSchema }));
    const composed = composeOptions(options, env);

    return {
      effectiveMode: (composed.mode as ModeEnum) ?? ModeEnum.off,
      effectiveFallback: (composed.fallback as ModeEnum) ?? ModeEnum.off,
      composed,
      withState,
    };
  }

  private detectWithState(options: OptionsType): boolean {
    return options.frameworkName === 'cypress' || !options.frameworkName;
  }

  private restoreFromState(): void {
    if (!StateManager.isStateExists()) return;
    const state = StateManager.getState();
    if (state.IsModeChanged && state.Mode) {
      process.env[EnvEnum.mode] = state.Mode.toString();
    }
    if (state.RunId) {
      process.env[EnvRunEnum.id] = state.RunId.toString();
    }
  }
}
