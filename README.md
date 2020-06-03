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
