# How to Use Parameters from Data Files in Newman

Newman allows you to leverage parameters from data files to make your API tests more dynamic and efficient. By utilizing
the `--data` or `-d` option when running a collection, you can feed your tests with various input sets. The data files
can be formatted as either JSON or CSV.

### Example Data File

Consider the following `data.json` file, which contains user data structured as complex objects:

```json
[
  {
    "userid": 1,
    "user": {
      "name": "John",
      "age": 30
    }
  },
  {
    "userid": 2,
    "user": {
      "name": "Jane",
      "age": 25
    }
  }
]
```

### Example Tests

Below are example tests that utilize the data parameters defined in the data file:

```javascript
// qase.parameters: userId, user.name
pm.test("Status code is 201", function() {
  pm.response.to.have.status(201);
});

// qase.parameters: userId
pm.test("Response has correct userId", function() {
  var jsonData = pm.response.json();
  pm.expect(jsonData.userId).to.eql(pm.iterationData.get("userid"));
});

pm.test("Response has correct name", function() {
  var jsonData = pm.response.json();
  pm.expect(jsonData.user.name).to.eql(pm.iterationData.get("user.name"));
});
```

You also can specify parameters on collection or folder level. In this case, all tests in collection or folder will have
these parameters. If test has own parameters, they will be merged with collection or folder parameters.

```json
{
  "info": {
    "_postman_id": "collection_id",
    "name": "Collection Name",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Folder Name",
      "item": [
        {
          "name": "Test Name",
          "event": [
            {
              "listen": "test",
              "script": {
                "type": "text/javascript",
                "exec": [
                  "pm.test('Status code is 200', function () {",
                  "    pm.response.to.have.status(200);",
                  "})"
                ]
              }
            }
          ],
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "https://api.example.com",
              "host": [
                "api",
                "example",
                "com"
              ]
            }
          },
          "response": []
        }
      ],
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "// qase.parameters: userId, user.name"
            ],
            "type": "text/javascript"
          }
        }
      ]
    }
  ]
}
```

### Expected Behavior

When you run the tests, the following behavior is expected:

- In the **`Status code is 201`** test, both `userId` and `user.name` will be passed as parameters.
- In the **`Response has correct userId`** test, only the `userId` parameter will be passed.
- In the **`Response has correct name`** test, by default, test will not have any parameters passed. But you can enable
  specific option in config file to pass all parameters from data file if test have not commented `qase.parameters`
  line.

  ```json
  {
    "debug": true,
    "testops": {
      "api": {
        "token": "api_key"
      },
      "project": "project_code",
      "run": {
        "complete": true
      }
    },
    "framework": {
      "newman": {
        "autoCollectParams": true
      }   
    }
  }
  ```
