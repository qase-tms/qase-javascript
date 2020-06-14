# [Qase TMS](https://qase.io) JavaScript Api Client

[![License](https://lxgaming.github.io/badges/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

## Installation

```
npm install qaseio
```

## Usage ##
Qase.io uses API tokens to authenticate requests. You can view an manage your API keys in [API tokens pages](https://app.qase.io/user/api/token).

You must replace api_token with your personal API key.

Pure JavaScript:

```javascript
var qaseio = require("qaseio");

var qase = new qaseio.QaseApi("api_token");
```


ES5:

```typescript
import { QaseApi } from 'qaseio';

const qase = new QaseApi("api_token");
```

### Projects ###

#### Get All Projects ####
This method allows to retrieve all projects available for your account. You can you limit and offset params to paginate.

```typescript
qase.projects.getAll().then((res) => {
    console.log(res.data)  // ProjectList{...}
})
```

#### Get a specific project ####
This method allows to retrieve a specific project.

```typescript
qase.projects.get("PRJCODE").then((res) => {
    console.log(res.data)  // ProjectInfo{...}
})
```

#### Check project exists ####

```typescript
qase.projects.get("PRJCODE").then((exists) => {
    console.log(exists)  // boolean
})
```

#### Create a new project ####
This method is used to create a new project through API.

```typescript
import { ProjectCreate } from 'qaseio.models';

const prj = new ProjectCreate("Project title", "CODE")
qase.projects.create(prj).then((res) => {
    console.log(res.data)  // ProjectCreated{...}
})
```

### Test cases ###

#### Get all test cases ####
This method allows to retrieve all test cases stored in selected project. You can you limit and offset params to paginate.

```typescript
qase.cases.getAll("PRJCODE", { limit: 10, offset: 20 }).then((res) => {
    console.log(res.data)  // TestCaseList{...}
})
```

#### Get a specific test case ####
This method allows to retrieve a specific test case.

```typescript
qase.cases.get("PRJCODE", 4).then((res) => {
    console.log(res.data)  // TestCaseInfo{...}
})
```

#### Check test case exists ####

```typescript
qase.cases.exists("PRJCODE", 4).then((exists) => {
    console.log(exists)  // boolean
})
```

#### Delete test case ####
This method completely deletes a test case from repository.

```typescript
qase.cases.delete("PRJCODE", 4).then((res) => {
    console.log(res)  // AxiosResponse
})
```

### Test runs ###

#### Get all test runs ####
This method allows to retrieve all test runs stored in selected project. You can you limit and offset params to paginate.

```typescript
qase.runs.getAll("PRJCODE", {include: 'cases'}).then((res) => {
    console.log(res.data)  // RunList{...}
})
```

#### Get a specific test run ####
This method allows to retrieve a specific test run.

```typescript
qase.runs.get("PRJCODE", 4).then((res) => {
    console.log(res.data)  // RunInfo{...}
})
```

#### Check test run exists ####

```typescript
qase.runs.exists("PRJCODE", 4).then((exists) => {
    console.log(exists)  // boolean
})
```

#### Create a new test run ####
This method is used to create a new test run through API.

```typescript
import { RunCreate } from 'qaseio.models';

const run = new RunCreate("Test run", [1, 2, 3], { description: "some desc" })
qase.runs.create(run).then((res) => {
    console.log(res.data)  // RunCreated{...}
})
```

#### Delete test run ####
This method completely deletes a test run from repository.

```typescript
qase.runs.delete("PRJCODE", 4).then((res) => {
    console.log(res)  // AxiosResponse
})
```

### Test run results ###

#### Get all test run results ####
This method allows to retrieve all test run results stored in selected project. You can you limit and offset params to paginate.

```typescript
qase.results.getAll("PRJCODE").then((res) => {
    console.log(res.data)  // ResultList{...}
})
```

#### Get a specific test run result ####
This method allows to retrieve a specific test run result.

```typescript
qase.results.get("PRJCODE", "2898ba7f3b4d857cec8bee4a852cdc85f8b33132").then((res) => {
    console.log(res.data)  // ResultInfo{...}
})
```

#### Create a new test run result ####
This method is used to create a new test run result through API.

```typescript
import { ResultCreate, ResultStatus, ResultStepCreate } from 'qaseio.models';

const result = new ResultCreate(123, ResultStatus.PASSED, {
    comment: "some comment",
    steps: [new ResultStepCreate(1, ResultStatus.PASSED)]
})
qase.results.create("PRJCODE", 4, result).then((res) => {
    console.log(res.data)  // ResultCreated{...}
})
```

#### Update test run result ####
This method is used to update existing test run result through API.

```typescript
import { ResultUpdate, ResultStatus, ResultStepCreate } from 'qaseio.models';

const result = new ResultUpdate(ResultStatus.PASSED, {
    comment: "some comment",
    steps: [new ResultStepCreate(2, ResultStatus.PASSED)]
})
qase.results.update("PRJCODE", 4, "2898ba7f3b4d857cec8bee4a852cdc85f8b33132", result).then((res) => {
    console.log(res.data)  // ResultCreated{...}
})
```

#### Delete test run result ####
This method completely deletes a test run result from repository.

```typescript
qase.results.delete("PRJCODE", 4, "2898ba7f3b4d857cec8bee4a852cdc85f8b33132").then((res) => {
    console.log(res)  // AxiosResponse
})
```
