import {
  EnvEnum,
  EnvTestOpsEnum,
  EnvApiEnum,
  EnvRunEnum,
  EnvLocalEnum,
} from './env-enum';

import { ModeEnum } from '../options';

export type EnvType = {
  [EnvEnum.mode]?: `${ModeEnum}`;
  [EnvEnum.debug]?: boolean;

  [EnvTestOpsEnum.projectCode]?: string;
  [EnvTestOpsEnum.baseUrl]?: string;
  [EnvTestOpsEnum.uploadAttachments]?: boolean;

  [EnvApiEnum.token]?: string;
  [EnvApiEnum.baseUrl]?: string;

  [EnvRunEnum.id]?: number;
  [EnvRunEnum.title]?: string;
  [EnvRunEnum.description]?: string;
  [EnvRunEnum.complete]?: boolean;
  [EnvRunEnum.environment]?: number;

  [EnvLocalEnum.path]?: string;
  [EnvLocalEnum.ext]?: string;
};
