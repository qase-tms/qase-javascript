Feature: Advanced Qase Features
  Demonstrates advanced CucumberJS-Qase integration patterns
  including parameters, suite hierarchy, group parameters, and ignore

  Background:
    Given the API is available at "https://jsonplaceholder.typicode.com"

  @QaseID=12
  @QaseTitle=Fetch_user_and_their_posts_relationship
  @QaseFields={"severity":"normal","priority":"medium","layer":"api"}
  @QaseSuite=API\tAdvanced\tRelationships
  @QaseParameters={"testScope":"user_posts_relationship"}
  Scenario: Fetch user and their posts
    When I send a GET request to "/users/1"
    Then the response status should be 200
    And the response "name" should be "Leanne Graham"
    When I send a GET request to "/posts?userId=1"
    Then the response status should be 200
    And the response should contain 10 items

  @QaseID=13
  @QaseFields={"severity":"normal","layer":"api"}
  @QaseSuite=API\tAdvanced\tData_Validation
  @QaseGroupParameters={"environment":"production","region":"us-east"}
  Scenario: Suite hierarchy and group parameters demonstration
    When I send a GET request to "/todos/1"
    Then the response status should be 200
    And the response should have a "completed" field

  @QaseID=14
  @QaseFields={"severity":"normal","layer":"api"}
  @QaseSuite=API\tAdvanced\tParameterized
  @QaseParameters={"testType":"override_demo"}
  Scenario Outline: Parameters tag with Scenario Outline
    When I send a GET request to "/comments?postId=<postId>"
    Then the response status should be 200
    And the response should contain 5 items

    Examples:
      | postId |
      | 1      |
      | 2      |

  @QaseIgnore
  Scenario: Ignored test - not reported to Qase
    When I send a GET request to "/users/1"
    Then the response status should be 200
