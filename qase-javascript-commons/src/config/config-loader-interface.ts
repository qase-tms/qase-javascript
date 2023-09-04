import { ConfigType } from './config-type'

export interface ConfigLoaderInterface<T extends Partial<ConfigType>> {
  load(files: string[]): (T & ConfigType) | null;
}
