import { describe, it, expect } from 'vitest';
import { QaseCoreReporter } from '../../src';

describe('getSuitePath', () => {
  it('should return suite title', () => {
    const suiteWithoutParent = {
      title: 'My First Test',
      parent: '',
    };

    const suitePath = QaseCoreReporter['getSuitePath'](suiteWithoutParent);
    expect(suitePath).toBe(suiteWithoutParent.title);
  });

  it('should return suite path with parent', () => {
    const suiteWithParent = {
      title: 'My First Test',
      parent: {
        title: 'Describe 1',
        parent: '',
      },
    };
    const suitePath = QaseCoreReporter['getSuitePath'](suiteWithParent);
    expect(suitePath).toBe('Describe 1\tMy First Test');
  });

  it('should return suite path with parent and grand parent', () => {
    const suiteWithParentAndGrandParent = {
      title: 'My First Test',
      parent: {
        title: 'Describe 2',
        parent: {
          title: 'Describe 1',
          parent: '',
        },
      },
    };
    const suitePath = QaseCoreReporter['getSuitePath'](
      suiteWithParentAndGrandParent,
    );
    expect(suitePath).toBe('Describe 1\tDescribe 2\tMy First Test');
  });
});
