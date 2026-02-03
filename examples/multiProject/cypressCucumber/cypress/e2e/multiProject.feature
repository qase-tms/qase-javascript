Feature: Multi-project tests with cypress-cucumber-preprocessor

  @qaseid.PROJ1(1)
  @qaseid.PROJ2(2)
  Scenario: test reported to two projects
    Given I am on the homepage
    When I click on the first link
    Then I should see the first link

  @qaseid.PROJ1(10,11)
  @qaseid.PROJ2(20)
  Scenario: test with multiple cases per project
    Given I am on the homepage
    When I click on the first link
    Then I should see the first link
