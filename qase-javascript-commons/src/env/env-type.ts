import {
  EnvEnum,
  EnvTestOpsEnum,
  EnvApiEnum,
  EnvRunEnum,
  EnvLocalEnum,
  EnvPlanEnum,
} from './env-enum';

import { ModeEnum } from '../options';
import { FormatEnum } from '../writer';

export type EnvType = {
  [EnvEnum.mode]?: `${ModeEnum}`;
  [EnvEnum.fallback]?: `${ModeEnum}`;
  [EnvEnum.debug]?: boolean;
  [EnvEnum.environment]?: string | number;
  [EnvEnum.captureLogs]?: boolean;

  [EnvTestOpsEnum.project]?: string;
  [EnvTestOpsEnum.uploadAttachments]?: boolean;
  [EnvTestOpsEnum.chunk]?: number;
  [EnvTestOpsEnum.defect]?: boolean;

  [EnvApiEnum.token]?: string;
  [EnvApiEnum.baseUrl]?: string;

  [EnvRunEnum.id]?: number;
  [EnvRunEnum.title]?: string;
  [EnvRunEnum.description]?: string;
  [EnvRunEnum.complete]?: boolean;

  [EnvPlanEnum.id]?: number;

  [EnvLocalEnum.path]?: string;
  [EnvLocalEnum.format]?: `${FormatEnum}`;
};
