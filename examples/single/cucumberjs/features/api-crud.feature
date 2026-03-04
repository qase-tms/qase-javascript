Feature: User CRUD Operations
  As an API consumer
  I want to manage users via REST API
  So that I can verify CRUD operations work correctly

  Background:
    Given the API is available at "https://jsonplaceholder.typicode.com"

  @QaseID=1
  @QaseTitle=Get_all_users_returns_10_users
  @QaseFields={"severity":"normal","priority":"high","layer":"api"}
  @QaseSuite=API\tUsers\tRead
  Scenario: Get all users
    When I send a GET request to "/users"
    Then the response status should be 200
    And the response should contain 10 items
    And each item should have an "id" field
    And each item should have an "email" field

  @QaseID=2
  @QaseFields={"severity":"normal","layer":"api"}
  @QaseSuite=API\tUsers\tRead
  Scenario: Get single user by ID
    When I send a GET request to "/users/1"
    Then the response status should be 200
    And the response "name" should be "Leanne Graham"
    And the response "email" should be "Sincere@april.biz"

  @QaseID=3
  @QaseFields={"severity":"critical","priority":"high","layer":"api"}
  @QaseSuite=API\tUsers\tCreate
  Scenario: Create new user
    When I send a POST request to "/users" with body:
      """
      {
        "name": "Test User",
        "username": "testuser",
        "email": "test@example.com"
      }
      """
    Then the response status should be 201
    And the response should have an "id" field

  @QaseID=4
  @QaseFields={"severity":"normal","layer":"api"}
  @QaseSuite=API\tUsers\tDelete
  Scenario: Delete user
    When I send a DELETE request to "/users/1"
    Then the response status should be 200
