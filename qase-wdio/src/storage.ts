import { TestResultType, TestStepType } from 'qase-javascript-commons';

export class Storage {
  currentFile?: string | undefined;
  suites: string[] = [];
  ignore = false;
  items: (TestResultType | TestStepType)[] = [];


  clear() {
    this.currentFile = undefined;
    this.items = [];
    this.ignore = false;

    if (this.suites.length > 0) {
      this.suites.pop();
    } else {
      this.suites = [];
    }
  }

  push(item: TestResultType | TestStepType) {
    this.items.push(item);
  }

  pop(): TestResultType | TestStepType | undefined {
    return this.items.pop();
  }

  getCurrentTest(): TestResultType | undefined {
    return findLast(this.items, (item) => item instanceof TestResultType) as TestResultType | undefined;
  }

  getCurrentStep(): TestStepType | undefined {
    return findLast(this.items, (item) => item instanceof TestStepType) as TestStepType | undefined;
  }

  getLastItem(): TestResultType | TestStepType | undefined {
    return this.items[this.items.length - 1];
  }
}

export const findLast = <T>(
  arr: T[],
  predicate: (el: T) => boolean,
): T | undefined => {
  let result: T | undefined;

  for (let i = arr.length - 1; i >= 0; i--) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (predicate(arr[i])) {
      result = arr[i];
      break;
    }
  }

  return result;
};
