Feature: Multi-project API - User Operations
  API CRUD operations reported to multiple Qase projects.
  Use @qaseid.PROJ(ids) tags for multi-project reporting.

  Background:
    Given the API is available at "https://jsonplaceholder.typicode.com"

  @qaseid.PROJ1(1)
  @qaseid.PROJ2(2)
  Scenario: Get all users returns 10 users
    When I send a GET request to "/users"
    Then the response status should be 200
    And the response should contain 10 items
    And each item should have an "id" field
    And each item should have an "email" field

  @qaseid.PROJ1(3)
  @qaseid.PROJ2(4)
  Scenario: Get single user by ID returns correct user
    When I send a GET request to "/users/1"
    Then the response status should be 200
    And the response "name" should be "Leanne Graham"
    And the response "email" should be "Sincere@april.biz"

  @qaseid.PROJ1(5)
  @qaseid.PROJ2(6)
  Scenario: Create new user returns 201 with ID
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

  @qaseid.PROJ1(7)
  @qaseid.PROJ2(8)
  Scenario: Delete user returns 200 status
    When I send a DELETE request to "/users/1"
    Then the response status should be 200
