import { expect } from '@jest/globals';
import { AbstractProfiler } from '../../src/profilers/abstract-profiler';

class ConcreteProfiler extends AbstractProfiler {
  enable(): void {
    // no-op
  }

  disable(): void {
    // no-op
  }

  restore(): void {
    // no-op
  }
}

describe('AbstractProfiler', () => {
  let profiler: ConcreteProfiler;

  beforeEach(() => {
    profiler = new ConcreteProfiler();
  });

  it('should instantiate a concrete subclass without throwing', () => {
    expect(profiler).toBeInstanceOf(ConcreteProfiler);
    expect(profiler).toBeInstanceOf(AbstractProfiler);
  });

  it('should call enable() without throwing', () => {
    expect(() => profiler.enable()).not.toThrow();
  });

  it('should call disable() without throwing', () => {
    expect(() => profiler.disable()).not.toThrow();
  });

  it('should call restore() without throwing', () => {
    expect(() => profiler.restore()).not.toThrow();
  });

  it('should call all lifecycle methods in sequence without throwing', () => {
    expect(() => {
      profiler.enable();
      profiler.disable();
      profiler.restore();
    }).not.toThrow();
  });
});
