import { expect } from '@jest/globals';
import { ExternalLinkType, TestOpsExternalLinkType } from '../../../src/models/config/TestOpsOptionsType';

describe('ExternalLinkType', () => {
  it('should have correct enum values', () => {
    expect(ExternalLinkType.JIRA_CLOUD).toEqual('jiraCloud');
    expect(ExternalLinkType.JIRA_SERVER).toEqual('jiraServer');
  });

  it('should have only two values', () => {
    const values = Object.values(ExternalLinkType);
    expect(values).toHaveLength(2);
    expect(values).toContain('jiraCloud');
    expect(values).toContain('jiraServer');
  });
});

describe('TestOpsExternalLinkType', () => {
  it('should accept valid ExternalLinkType values', () => {
    const jiraCloudLink: TestOpsExternalLinkType = {
      type: ExternalLinkType.JIRA_CLOUD,
      link: 'https://jira.atlassian.com/browse/PROJ-123',
    };

    const jiraServerLink: TestOpsExternalLinkType = {
      type: ExternalLinkType.JIRA_SERVER,
      link: 'https://jira.company.com/browse/PROJ-456',
    };

    expect(jiraCloudLink.type).toEqual(ExternalLinkType.JIRA_CLOUD);
    expect(jiraServerLink.type).toEqual(ExternalLinkType.JIRA_SERVER);
  });

  it('should have correct structure', () => {
    const link: TestOpsExternalLinkType = {
      type: ExternalLinkType.JIRA_CLOUD,
      link: 'https://example.com',
    };

    expect(link).toHaveProperty('type');
    expect(link).toHaveProperty('link');
    expect(typeof link.type).toEqual('string');
    expect(typeof link.link).toEqual('string');
  });
});
