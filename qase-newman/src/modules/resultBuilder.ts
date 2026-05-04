import { Item } from 'postman-collection';
import {
  Relation,
  SuiteData,
  TestopsProjectMapping,
  TestResultType,
  TestStatusEnum,
} from 'qase-javascript-commons';

export interface BuildPendingArgs {
  item: Item;
  suites: string[];
  ids: number[];
  projectMapping: TestopsProjectMapping;
  signature: string;
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ResultBuilder {
  static buildPending(args: BuildPendingArgs): TestResultType {
    const { item, suites, ids, projectMapping, signature } = args;

    let relation: Relation | null = null;
    if (suites.length > 0) {
      const data: SuiteData[] = suites.map((title) => ({ title, public_id: null }));
      relation = { suite: { data } };
    }

    return {
      attachments: [],
      author: null,
      execution: {
        status: TestStatusEnum.passed,
        start_time: null,
        end_time: null,
        duration: 0,
        stacktrace: null,
        thread: null,
      },
      fields: {},
      message: null,
      muted: false,
      params: {},
      group_params: {},
      relations: relation,
      run_id: null,
      signature,
      steps: [],
      testops_id: ids.length > 0 ? ids : null,
      id: item.id,
      title: item.name,
      testops_project_mapping: Object.keys(projectMapping).length > 0 ? projectMapping : null,
    } as unknown as TestResultType;
  }
}
