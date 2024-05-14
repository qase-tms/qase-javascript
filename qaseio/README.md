# [Qase TMS](https://qase.io) API JavaScript Client

[![License](https://lxgaming.github.io/badges/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

The `qaseio` package implements a JavaScript client for Qase API.
It should be used for building integrations with [Qase API](https://developers.qase.io/reference/introduction-to-the-qase-api)
or writing test reporters for special-purpose frameworks.

To report results from tests using a popular framework or test runner,
use the corresponding package instead:

* [CucumberJS](https://github.com/qase-tms/qase-javascript/tree/main/qase-cucumberjs#readme)
* [Cypress](https://github.com/qase-tms/qase-javascript/tree/main/qase-cypress#readme)
* [Jest](https://github.com/qase-tms/qase-javascript/tree/main/qase-jest#readme)
* [Newman](https://github.com/qase-tms/qase-javascript/tree/main/qase-newman#readme)
* [Playwright](https://github.com/qase-tms/qase-javascript/tree/main/qase-playwright#readme)
* [TestCafe](https://github.com/qase-tms/qase-javascript/tree/main/qase-testcafe#readme)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

# Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Projects](#projects)
  - [Test cases](#test-cases)
  - [Test Suites](#test-suites)
  - [Milestones](#milestones)
  - [Shared steps](#shared-steps)
  - [Test plans](#test-plans)
  - [Test runs](#test-runs)
  - [Test run results](#test-run-results)
  - [Defects](#defects)
  - [Custom fields](#custom-fields)
  - [Attachments](#attachments)
  - [Team](#team)
- [Requirements](#requirements)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Installation

```
npm install qaseio
```

## Usage

Qase.io uses API tokens to authenticate requests.
API keys can be issued on the [personal API tokens page](https://app.qase.io/user/api/token)
or on the [app integrations page](https://app.qase.io/apps).

Pure JavaScript:

```javascript
var qaseio = require('qaseio');

const qase = new QaseApi({
    token: 'api_token',
});
```

ES5:

```typescript
import { QaseApi } from 'qaseio';

const qase = new QaseApi({
    token: 'api_token',
});
```

### Projects

#### Get All Projects

This method allows to retrieve all projects available for your account. You can you limit and offset params to paginate.

```typescript
qase.projects.getAll().then((res) => {
  console.log(res.data); // ProjectList{...}
});
```

#### Get a specific project

This method allows to retrieve a specific project.

```typescript
qase.projects.get('PRJCODE').then((res) => {
  console.log(res.data); // ProjectInfo{...}
});
```

#### Check project exists

```typescript
qase.projects.get('PRJCODE').then((exists) => {
  console.log(exists); // boolean
});
```

#### Create a new project

This method is used to create a new project through API.

```typescript
import { ProjectCreate } from 'qaseio.models';

const prj = new ProjectCreate('Project title', 'CODE');
qase.projects.create(prj).then((res) => {
  console.log(res.data); // ProjectCreated{...}
});
```

### Test cases

#### Get all test cases

This method allows to retrieve all test cases stored in selected project. You can you limit and offset params to paginate.

```typescript
qase.cases.getAll('PRJCODE', { limit: 10, offset: 20 }).then((res) => {
  console.log(res.data); // TestCaseList{...}
});
```

#### Get a specific test case

This method allows to retrieve a specific test case.

```typescript
qase.cases.get('PRJCODE', 4).then((res) => {
  console.log(res.data); // TestCaseInfo{...}
});
```

#### Check test case exists

```typescript
qase.cases.exists('PRJCODE', 4).then((exists) => {
  console.log(exists); // boolean
});
```

#### Delete test case

This method completely deletes a test case from repository.

```typescript
qase.cases.delete('PRJCODE', 4).then((res) => {
  console.log(res); // AxiosResponse
});
```

### Test Suites

#### Get all test suites

This method allows to retrieve all test suites stored in selected project. You can you limit and offset params to paginate.

```typescript
import { SuiteFilters } from 'qaseio.models';

qase.suites
  .getAll('PRJCODE', { filters: new SuiteFilters({ search: 'query' }) })
  .then((res) => {
    console.log(res.data); // SuiteList{...}
  });
```

#### Get a specific test suite

This method allows to retrieve a specific test suite.

```typescript
qase.suites.get('PRJCODE', 123).then((res) => {
  console.log(res.data); // SuiteInfo{...}
});
```

#### Check test suite exists

```typescript
qase.suites.exists('PRJCODE', 123).then((exists) => {
  console.log(exists); // boolean
});
```

#### Create a new test suite

This method is used to create a new test plan through API.

```typescript
import { SuiteCreate } from 'qaseio.models';

qase.suites.create('PRJCODE', SuiteCreate('New test suite')).then((res) => {
  console.log(res.data); // SuiteCreated{...}
});
```

#### Update test suite

This method is used to update existing test suite through API.

```typescript
import { SuiteUpdate } from 'qaseio.models';

qase.suites.update('PRJCODE', 123, SuiteUpdate('Updated suite')).then((res) => {
  console.log(res.data); // SuiteCreated{...}
});
```

#### Delete test suite

This method completely deletes a test suite from repository.

```typescript
qase.suites.delete('PRJCODE', 123).then((res) => {
  console.log(res); // AxiosResponse
});
```

### Milestones

#### Get all milestones

This method allows to retrieve all milestones stored in selected project. You can you limit and offset params to paginate.

```typescript
import { MilestoneFilters } from 'qaseio.models';

qase.milestones
  .getAll('PRJCODE', { filters: new MilestoneFilters({ search: 'query' }) })
  .then((res) => {
    console.log(res.data); // MilestoneList{...}
  });
```

#### Get a specific milestone

This method allows to retrieve a specific milestone.

```typescript
qase.milestones.get('PRJCODE', 123).then((res) => {
  console.log(res.data); // MilestoneInfo{...}
});
```

#### Check milestone exists

```typescript
qase.milestones.exists('PRJCODE', 123).then((exists) => {
  console.log(exists); // boolean
});
```

#### Create a new milestone

This method is used to create a new test plan through API.

```typescript
import { MilestoneCreate } from 'qaseio.models';

qase.milestones
  .create('PRJCODE', new MilestoneCreate('New milestone'))
  .then((res) => {
    console.log(res.data); // MilestoneCreated{...}
  });
```

#### Update milestone

This method is used to update existing milestone through API.

```typescript
import { MilestoneUpdate } from 'qaseio.models';

test_suite = qase.milestones
  .update('PRJCODE', 123, new MilestoneUpdate('Updated suite'))
  .then((res) => {
    console.log(res.data); // MilestoneCreated{...}
  });
```

#### Delete milestone

This method completely deletes a milestone from repository.

```typescript
qase.milestones.delete('PRJCODE', 123).then((res) => {
  console.log(res); // AxiosResponse
});
```

### Shared steps

#### Get all shared steps

This method allows to retrieve all shared steps stored in selected project. You can you limit and offset params to paginate.

```typescript
import { SharedStepFilters } from 'qaseio.models';

qase.sharedSteps
  .getAll('PRJCODE', { filters: new SharedStepFilters({ search: 'query' }) })
  .then((res) => {
    console.log(res.data); // SharedStepList{...}
  });
```

#### Get a specific shared step

This method allows to retrieve a specific shared step.

```typescript
qase.sharedSteps.get('PRJCODE', 'hash').then((res) => {
  console.log(res.data); // SharedStepInfo{...}
});
```

#### Check shared step exists

```typescript
qase.sharedSteps.exists('PRJCODE', 'hash').then((exists) => {
  console.log(exists); // boolean
});
```

#### Create a new shared step

This method is used to create a new shared step through API.

```typescript
import { SharedStepCreate } from 'qaseio.models';

qase.sharedSteps
  .create('PRJCODE', new SharedStepCreate('New step', 'action'))
  .then((res) => {
    console.log(res.data); // SharedCreated{...}
  });
```

#### Update shared step

This method is used to update existing shared step through API.

```typescript
import { SharedStepUpdate } from 'qaseio.models';

qase.sharedSteps
  .update('PRJCODE', 'hash', new SharedStepUpdate('Updated step'))
  .then((res) => {
    console.log(res.data); // SharedCreated{...}
  });
```

#### Delete shared step

This method completely deletes a shared step from repository.

```typescript
qase.sharedSteps.delete('PRJCODE', 'hash').then((res) => {
  console.log(res); // AxiosResponse
});
```

### Test plans

#### Get all test plans

This method allows to retrieve all test plans stored in selected project. You can you limit and offset params to paginate.

```typescript
qase.plans.getAll('PRJCODE').then((res) => {
  console.log(res.data); // PlanList{...}
});
```

#### Get a specific test plan

This method allows to retrieve a specific test plan.

```typescript
qase.plans.get('PRJCODE', 123).then((res) => {
  console.log(res.data); // PlanInfo{...}
});
```

#### Check test plan exists

```typescript
qase.plans.exists('PRJCODE', 123).then((exists) => {
  console.log(exists); // boolean
});
```

#### Create a new test plan

This method is used to create a new test plan through API.

```typescript
import { PlanCreate } from 'qaseio.models';

qase.plans
  .create('PRJCODE', new PlanCreate('New test plan', [1, 2, 3]))
  .then((res) => {
    console.log(res.data); // PlanCreated{...}
  });
```

#### Update test plan

This method is used to update existing test plan through API.

```typescript
import { PlanUpdate } from 'qaseio.models';

qase.plans
  .update('PRJCODE', 123, new PlanUpdate('New test plan', [1, 2, 3]))
  .then((res) => {
    console.log(res.data); // PlanCreated{...}
  });
```

#### Delete test plan

This method completely deletes a test plan from repository.

```typescript
qase.plans.delete('PRJCODE', 123).then((res) => {
  console.log(res); // AxiosResponse
});
```

### Test runs

#### Get all test runs

This method allows to retrieve all test runs stored in selected project. You can you limit and offset params to paginate.

```typescript
qase.runs.getAll('PRJCODE', { include: 'cases' }).then((res) => {
  console.log(res.data); // RunList{...}
});
```

#### Get a specific test run

This method allows to retrieve a specific test run.

```typescript
qase.runs.get('PRJCODE', 4).then((res) => {
  console.log(res.data); // RunInfo{...}
});
```

#### Check test run exists

```typescript
qase.runs.exists('PRJCODE', 4).then((exists) => {
  console.log(exists); // boolean
});
```

#### Create a new test run

This method is used to create a new test run through API.

```typescript
import { RunCreate } from 'qaseio.models';

const run = new RunCreate('Test run', [1, 2, 3], { description: 'some desc' });
qase.runs.create(run).then((res) => {
  console.log(res.data); // RunCreated{...}
});
```

#### Delete test run

This method completely deletes a test run from repository.

```typescript
qase.runs.delete('PRJCODE', 4).then((res) => {
  console.log(res); // AxiosResponse
});
```

### Test run results

#### Get all test run results

This method allows to retrieve all test run results stored in selected project. You can you limit and offset params to paginate.

```typescript
qase.results.getAll('PRJCODE').then((res) => {
  console.log(res.data); // ResultList{...}
});
```

#### Get a specific test run result

This method allows to retrieve a specific test run result.

```typescript
qase.results
  .get('PRJCODE', '2898ba7f3b4d857cec8bee4a852cdc85f8b33132')
  .then((res) => {
    console.log(res.data); // ResultInfo{...}
  });
```

#### Create a new test run result

This method is used to create a new test run result through API.

```typescript
import { ResultCreate, ResultStatus, ResultStepCreate } from 'qaseio.models';

const result = new ResultCreate(123, ResultStatus.PASSED, {
  comment: 'some comment',
  steps: [new ResultStepCreate(1, ResultStatus.PASSED)],
});
qase.results.create('PRJCODE', 4, result).then((res) => {
  console.log(res.data); // ResultCreated{...}
});
```

#### Update test run result

This method is used to update existing test run result through API.

```typescript
import { ResultUpdate, ResultStatus, ResultStepCreate } from 'qaseio.models';

const result = new ResultUpdate(ResultStatus.PASSED, {
  comment: 'some comment',
  steps: [new ResultStepCreate(2, ResultStatus.PASSED)],
});
qase.results
  .update('PRJCODE', 4, '2898ba7f3b4d857cec8bee4a852cdc85f8b33132', result)
  .then((res) => {
    console.log(res.data); // ResultCreated{...}
  });
```

#### Delete test run result

This method completely deletes a test run result from repository.

```typescript
qase.results
  .delete('PRJCODE', 4, '2898ba7f3b4d857cec8bee4a852cdc85f8b33132')
  .then((res) => {
    console.log(res); // AxiosResponse
  });
```

### Defects

#### Get all defects

This method allows to retrieve all defects stored in selected project. You can you limit and offset params to paginate.

```typescript
import { DefectStatus, DefectFilters } from 'qaseio.models';

qase.defects
  .getAll('PRJCODE', {
    filter: new DefectFilters({ status: DefectStatus.OPEN }),
  })
  .then((res) => {
    console.log(res.data); // DefectList{...}
  });
```

#### Get a specific defect

This method allows to retrieve a specific defect.

```typescript
qase.defects.get('PRJCODE', 4).then((res) => {
  console.log(res.data); // DefectInfo{...}
});
```

#### Check defect exists

```typescript
qase.defects.exists('PRJCODE', 4).then((exists) => {
  console.log(exists); // boolean
});
```

#### Resolve defect

This method is used to resolve defect through API.

```typescript
qase.defects.resolve('PRJCODE', 4).then((res) => {
  console.log(res.data); // DefectUpdated{...}
});
```

#### Delete defect

This method completely deletes a defect from repository.

```typescript
qase.defects.delete('PRJCODE', 4).then((res) => {
  console.log(res); // AxiosResponse
});
```

### Custom fields

#### Get all custom fields

This method allows to retrieve all custom fields stored in selected project. You can you limit and offset params to paginate.

```typescript
qase.customFields.getAll('PRJCODE').then((res) => {
  console.log(res.data); // CustomFieldList{...}
});
```

#### Get a specific custom field

This method allows to retrieve a specific custom field.

```typescript
qase.customFields.get('PRJCODE', 123).then((res) => {
  console.log(res.data); // CustomFieldInfo{...}
});
```

#### Check custom field exists

```typescript
qase.customFields.exists('PRJCODE', 123).then((exists) => {
  console.log(exists); // boolean
});
```

### Attachments

#### Get all attachments

This method allows to retrieve all attachments stored in team. You can you limit and offset params to paginate.

```typescript
qase.attachments.getAll().then((res) => {
  console.log(res.data); // AttachmentList{...}
});
```

#### Get a specific attachment

This method allows to retrieve a specific attachment.

```typescript
qase.attachments.get('<hash>').then((res) => {
  console.log(res.data); // AttachmentInfo{...}
});
```

#### Check attachment exists

```typescript
qase.attachments.exists('<hash>').then((exists) => {
  console.log(exists); // boolean
});
```

#### Upload new attachments

This method is used to upload new attachments through API. It supports different
input formats

```typescript
qase.attachments
  .create('PRJCODE', { value: '{"test": true}', filename: 'data.json' })
  .then((res) => {
    console.log(res.data); // AttachmentCreated{...}
  });
```

To upload binary attachment you should use `fs`:

```typescript
var fs = require('fs');
const data = fs.createReadStream('/path/to/file.png');
qase.attachments
  .create('PRJCODE', { value: data, filename: 'data.png' })
  .then((res) => {
    console.log(res.data); // AttachmentCreated{...}
  });
```

You can specify as much files to upload as you need, according to API
[limits](https://developers.qase.io/#upload-attachmeent).

#### Delete attachment

This method completely deletes a attachment from repository.

```typescript
qase.attachments.delete('<hash>').then((res) => {
  console.log(res); // AxiosResponse
});
```

### Team

#### Get all team members

This method allows to retrieve all users in your team. You can you limit and offset params to paginate.

```typescript
qase.users.getAll().then((res) => {
  console.log(res.data); // UserList{...}
});
```

#### Get a specific team member

This method allows to retrieve a specific user in your team.

```typescript
qase.users.get(123).then((res) => {
  console.log(res.data); // UserInfo{...}
});
```

#### Check user exists

```typescript
qase.users.exists(123).then((exists) => {
  console.log(exists); // boolean
});
```

## Requirements

The reporter is maintained on the [LTS versions of Node.js](https://nodejs.org/en/about/releases/).
