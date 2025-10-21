import type * as Mocha from 'mocha';

export interface ExtraReporterConfig {
  name: string;
  options?: Record<string, unknown>;
}

export type ExtraReportersConfig = string | ExtraReporterConfig | (string | ExtraReporterConfig)[];

/**
 * Parses extraReporters configuration from Mocha options
 * Supports both string format and object format
 */
export function parseExtraReporters(options: Mocha.MochaOptions, config?: Record<string, unknown>): ExtraReportersConfig | undefined {
  // First, try to get extraReporters from Mocha reporterOptions
  const reporterOptions = options.reporterOptions as Record<string, unknown> | undefined;
  
  if (reporterOptions) {
    // Handle different formats of extraReporters from Mocha options
    if (typeof reporterOptions['extraReporters'] === 'string') {
      return reporterOptions['extraReporters'];
    }
    
    if (Array.isArray(reporterOptions['extraReporters'])) {
      return reporterOptions['extraReporters'] as (string | ExtraReporterConfig)[];
    }
    
    if (typeof reporterOptions['extraReporters'] === 'object' && reporterOptions['extraReporters'] !== null) {
      return reporterOptions['extraReporters'] as ExtraReporterConfig;
    }
  }

  // If not found in Mocha options, try to get from qase.config.json
  if (config && config['extraReporters']) {
    if (typeof config['extraReporters'] === 'string') {
      return config['extraReporters'];
    }
    
    if (Array.isArray(config['extraReporters'])) {
      return config['extraReporters'] as (string | ExtraReporterConfig)[];
    }
    
    if (typeof config['extraReporters'] === 'object' && config['extraReporters'] !== null) {
      return config['extraReporters'] as ExtraReporterConfig;
    }
  }

  return undefined;
}

/**
 * Creates and configures additional reporters based on extraReporters config
 */
export function createExtraReporters(
  runner: Mocha.Runner,
  options: Mocha.MochaOptions,
  extraReportersConfig: ExtraReportersConfig
): Mocha.reporters.Base[] {
  const reporters: Mocha.reporters.Base[] = [];
  
  if (!extraReportersConfig) {
    return reporters;
  }

  const configs = Array.isArray(extraReportersConfig) ? extraReportersConfig : [extraReportersConfig];

  for (const config of configs) {
    try {
      let reporterName: string;
      let reporterOptions: Record<string, unknown> = {};

      if (typeof config === 'string') {
        reporterName = config;
      } else if (typeof config === 'object' && config.name) {
        reporterName = config.name;
        reporterOptions = config.options ?? {};
      } else {
        console.warn('Invalid extraReporter configuration:', config);
        continue;
      }

      // Load the reporter
      let ReporterClass: new (runner: Mocha.Runner, options: Mocha.MochaOptions) => Mocha.reporters.Base;
      
      try {
        // Try to load built-in reporter first
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ReporterClass = require(`mocha/lib/reporters/${reporterName}`);
      } catch {
        try {
          // Try to load as external package
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          ReporterClass = require(reporterName);
        } catch {
          console.warn(`Failed to load reporter: ${reporterName}`);
          continue;
        }
      }

      if (ReporterClass && typeof ReporterClass === 'function') {
        // Create reporter instance with clean options (without main reporter options)
        const cleanOptions = {
          ...options,
          // Remove main reporter specific options
          reporter: undefined,
          reporterOptions: undefined,
          'reporter-option': undefined,
          reporterOption: undefined,
          // Add extra reporter specific options
          ...reporterOptions
        };
        
        // Special handling for JSON reporter
        if (reporterName === 'json' && reporterOptions['output']) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (cleanOptions as any).reporterOption = { output: reporterOptions['output'] };
        }
        
        const reporter = new ReporterClass(runner, cleanOptions);
        reporters.push(reporter);
      }
    } catch (error) {
      console.warn(`Failed to create reporter:`, error);
    }
  }

  return reporters;
}

/**
 * Checks if a reporter is compatible with parallel mode
 * Some reporters are known to be incompatible with parallel execution
 */
export function isReporterCompatibleWithParallel(reporterName: string): boolean {
  const incompatibleReporters = [
    'markdown',
    'progress', 
    'json-stream',
    'mocha-multi-reporters', // This is the main culprit
    'mocha-jenkins-reporter',
    'mocha-junit-reporter'
  ];

  return !incompatibleReporters.includes(reporterName);
}

/**
 * Validates extraReporters configuration for parallel mode
 */
export function validateExtraReportersForParallel(extraReportersConfig: ExtraReportersConfig): {
  valid: boolean;
  incompatibleReporters: string[];
} {
  const incompatibleReporters: string[] = [];
  
  if (!extraReportersConfig) {
    return { valid: true, incompatibleReporters: [] };
  }

  const configs = Array.isArray(extraReportersConfig) ? extraReportersConfig : [extraReportersConfig];

  for (const config of configs) {
    let reporterName: string;

    if (typeof config === 'string') {
      reporterName = config;
    } else if (typeof config === 'object' && config.name) {
      reporterName = config.name;
    } else {
      continue;
    }

    if (!isReporterCompatibleWithParallel(reporterName)) {
      incompatibleReporters.push(reporterName);
    }
  }

  return {
    valid: incompatibleReporters.length === 0,
    incompatibleReporters
  };
}
