Feature: Post Validation
  As an API consumer
  I want to filter and validate posts
  So that post data integrity is verified

  Background:
    Given the API is available at "https://jsonplaceholder.typicode.com"

  @QaseID=5
  @QaseFields={"severity":"normal","priority":"high","layer":"api"}
  @QaseSuite=API\tPosts\tRead
  Scenario: Get all posts
    When I send a GET request to "/posts"
    Then the response status should be 200
    And the response should contain 100 items

  @QaseID=6
  @QaseFields={"severity":"normal","layer":"api"}
  @QaseSuite=API\tPosts\tFiltering
  Scenario Outline: Filter posts by user ID
    When I send a GET request to "/posts?userId=<userId>"
    Then the response status should be 200
    And all items should have "userId" equal to <userId>

    Examples:
      | userId |
      | 1      |
      | 2      |
      | 3      |

  @QaseID=7
  @QaseFields={"severity":"normal","layer":"api"}
  @QaseSuite=API\tPosts\tRead
  Scenario: Get post with comments
    When I send a GET request to "/posts/1/comments"
    Then the response status should be 200
    And the response should contain 5 items
    And each item should have an "email" field
