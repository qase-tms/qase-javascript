import { OptionsType } from '../options';

export type ConfigType = Omit<OptionsType, 'frameworkPackage' | 'frameworkName' | 'reporterName'>;
