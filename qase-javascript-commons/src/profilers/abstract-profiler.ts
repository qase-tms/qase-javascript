export abstract class AbstractProfiler {
  abstract enable(): void;
  abstract disable(): void;
  abstract restore(): void;
}
