Feature: Simple tests with @badeball/cypress-cucumber-preprocessor

  Scenario: test without metadata
    Given I am on the homepage
    When I click on the first link
    Then I should see the first link

  Scenario: test without metadata failed
    Given I am on the homepage
    When I should see the first link failed
    Then I should see the first link
