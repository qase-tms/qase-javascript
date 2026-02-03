Feature: Simple feature
  It is a simple feature with simple scenarios

  Scenario: Scenario without steps

  Scenario: Scenario with one step
    Given I have a step

  Scenario: Scenario with multiple steps
    Given I have a step
    And I have another step
    When I do something
    Then I expect something to happen

  @Q-1
  Scenario: Scenario with old Qase ID tag
    Given I have a step

  @QaseID=2
  Scenario: Scenario with new Qase ID tag
    Given I have a step

  @QaseTitle=Scenario_with_Qase_title_tag
  Scenario: Scenario with Qase title tag
    Given I have a step

  @QaseFields={"description":"Description","severity":"major"}
  Scenario: Scenario with Qase fields tag
    Given I have a step

  Scenario: Scenario with filed last step
    Given I have a step
    And I have another step
    When I do something
    Then I fail

  Scenario: Scenario with filed step
    Given I have a step
    And I have another step
    When I fail
    Then I expect something to happen
