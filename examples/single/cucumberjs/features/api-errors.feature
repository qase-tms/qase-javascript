Feature: Error Handling
  As an API consumer
  I want the API to handle errors gracefully
  So that error responses are predictable

  Background:
    Given the API is available at "https://jsonplaceholder.typicode.com"

  @QaseID=8
  @QaseFields={"severity":"normal","layer":"api"}
  @QaseSuite=API\tErrors\tNot_Found
  Scenario: Non-existent user returns empty object
    When I send a GET request to "/users/999"
    Then the response status should be 200
    And the response should be an empty object

  @QaseID=9
  @QaseFields={"severity":"normal","layer":"api"}
  @QaseSuite=API\tErrors\tNot_Found
  Scenario: Non-existent post returns empty object
    When I send a GET request to "/posts/999"
    Then the response status should be 200
    And the response should be an empty object

  @QaseID=10
  @QaseFields={"severity":"low","layer":"api"}
  @QaseSuite=API\tErrors\tInvalid_Endpoint
  Scenario: Invalid endpoint returns 404
    When I send a GET request to "/invalid-endpoint"
    Then the response status should be 404

  @QaseID=11
  @QaseFields={"severity":"normal","layer":"api"}
  @QaseSuite=API\tErrors\tValidation
  Scenario: POST with empty body is handled gracefully
    When I send a POST request to "/posts" with body:
      """
      {}
      """
    Then the response status should be 201
    And the response should have an "id" field
