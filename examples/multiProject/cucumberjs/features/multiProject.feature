Feature: Multi-project example
  Scenarios for testops_multi mode. Use @qaseid.PROJ(ids) tags for multi-project.

  Scenario: Scenario without Qase ID
    Given I have a step

  @qaseid.PROJ1(1)
  @qaseid.PROJ2(2)
  Scenario: Scenario reported to two projects
    Given I have a step

  @QaseID=3
  Scenario: Scenario with legacy single-project tag
    Given I have a step
