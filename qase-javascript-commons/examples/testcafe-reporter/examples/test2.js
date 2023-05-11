import { Selector } from 'testcafe';

fixture `Another page`
    .page `http://devexpress.github.io/testcafe/example/`;

test('Check property of element without case id', async (t) => {
    const developerNameInput = Selector('#developer-name');

    await t
        .expect(developerNameInput.value).eql('', 'input is empty')
        .typeText(developerNameInput, 'Miles Morales')
        .expect(developerNameInput.value)
        .contains('Morales', 'input contains text "Morales"')
    ;
});

test.meta('CID', [1])('Check property of element without case id 2', async (t) => {
    const developerNameInput = Selector('#developer-name');

    await t
        .expect(developerNameInput.value).eql('', 'input is empty')
        .typeText(developerNameInput, 'Peter Parker')
        .expect(developerNameInput.value)
        .contains('Peter', 'input contains text "Peter"')
    ;
});

