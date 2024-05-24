Feature: Table feature
  It is a table feature

  Scenario Outline: Table scenario
    Given I have a table with <rows> rows
    Then the table should have <rows> rows

    Examples:
      | rows |
      | 1    |
      | 2    |
      | 3    |
