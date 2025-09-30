Feature: Tests with QaseID using @badeball/cypress-cucumber-preprocessor

  @QaseID(1)
  Scenario: test with single Qase ID
    Given I am on the homepage
    When I click on the first link
    Then I should see the first link

  @QaseID(2)
  Scenario: test with single Qase ID failed
    Given I am on the homepage
    When I should see the first link failed
    Then I should see the first link

  @QaseID(3,4)
  Scenario: test with multiple Qase ID
    Given I am on the homepage
    When I click on the first link
    Then I should see the first link

  @QaseID(5,6)
  Scenario: test with multiple Qase ID failed
    Given I am on the homepage
    When I should see the first link failed
    Then I should see the first link
