Feature: Cucumber documentation
    As a user of cucumber.js
    I want to have documentation on cucumber
    So I can write better applications

    @sections @Q-2
    Scenario: Usage documentation
        Given I am on the cucumber.js GitHub repository
        When I go to the README file
#        Then I should see a "Cool" section
#        When I go to the README file

    @badges
    Scenario: Status badges
        Given I am on the cucumber.js GitHub repository
        When I go to the README file
        Then I should see a "12412412" badge
            And I should see a "Dependencies" badge

    @ignore @q4
    Scenario: Status badges 2
        Given I am on the cucumber.js GitHub repository
        When I go to the README file
        Then I should see a "Build Status" badge
        And I should see a "Dependencies" badge

    @sections @Q-5
    Scenario: Usage documentation 2
        Given I am on the cucumber.js GitHub repository
        When I go to the README file
        Then I should see a "Cool" section
        When I go to the README file

    @sections @Q-6
    Scenario: Usage documentation 3
        Given I am on the cucumber.js GitHub repository
        When I go to the README file
        Then I should see a "Cool" section
        When I go to the README file

    @sections @Q-7
    Scenario: Usage documentation 4
        Given I am on the cucumber.js GitHub repository
        When I go to the README file
        Then I should see a "Cool" section
        When I go to the README file
