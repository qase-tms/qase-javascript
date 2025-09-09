import {
  EnvEnum,
  EnvTestOpsEnum,
  EnvApiEnum,
  EnvRunEnum,
  EnvLocalEnum,
  EnvPlanEnum, 
  EnvBatchEnum, 
  EnvConfigurationsEnum,
} from './env-enum';

import { ModeEnum } from '../options';
import { FormatEnum } from '../writer';

export interface EnvType {
  [EnvEnum.mode]?: `${ModeEnum}`;
  [EnvEnum.fallback]?: `${ModeEnum}`;
  [EnvEnum.debug]?: boolean;
  [EnvEnum.environment]?: string;
  [EnvEnum.captureLogs]?: boolean;
  [EnvEnum.rootSuite]?: string;

  [EnvTestOpsEnum.project]?: string;
  [EnvTestOpsEnum.uploadAttachments]?: boolean;
  [EnvTestOpsEnum.defect]?: boolean;
  [EnvTestOpsEnum.statusFilter]?: string;

  [EnvApiEnum.token]?: string;
  [EnvApiEnum.host]?: string;

  [EnvRunEnum.id]?: number;
  [EnvRunEnum.title]?: string;
  [EnvRunEnum.description]?: string;
  [EnvRunEnum.complete]?: boolean;
  [EnvRunEnum.tags]?: string;
  [EnvRunEnum.externalLink]?: string;

  [EnvPlanEnum.id]?: number;

  [EnvBatchEnum.size]?: number;

  [EnvConfigurationsEnum.values]?: string;
  [EnvConfigurationsEnum.createIfNotExists]?: boolean;

  [EnvLocalEnum.path]?: string;
  [EnvLocalEnum.format]?: `${FormatEnum}`;
}
