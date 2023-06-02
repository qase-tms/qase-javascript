import { OptionsType } from '../options';

export type ConfigType = Omit<OptionsType, 'frameworkName' | 'reporterName'>;
