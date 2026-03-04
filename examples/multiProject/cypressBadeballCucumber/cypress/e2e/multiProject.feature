Feature: Multi-project tests with @badeball/cypress-cucumber-preprocessor

  @qaseid.PROJ1(1)
  @qaseid.PROJ2(2)
  Scenario: Homepage navigation reported to two projects
    Given I am on the homepage
    When I click on the first link
    Then I should see the first link

  @qaseid.PROJ1(3)
  @qaseid.PROJ2(4)
  Scenario: Homepage navigation with expected failure
    Given I am on the homepage
    When I should see the first link failed
    Then I should see the first link

  @qaseid.PROJ1(5,6)
  @qaseid.PROJ2(7)
  Scenario: Multiple case IDs across projects
    Given I am on the homepage
    When I click on the first link
    Then I should see the first link
