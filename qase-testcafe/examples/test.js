import { Selector } from 'testcafe';

fixture `Example page`
    .page `http://devexpress.github.io/testcafe/example/`;


test.meta('CID', [2])('Check property of element', async (t) => {
    const developerNameInput = Selector('#developer-name');

    await t
        .expect(developerNameInput.value).eql('', 'input is empty')
        .typeText(developerNameInput, 'Peter Parker')
        .expect(developerNameInput.value)
        .contains('Peter', 'input contains text "Peter"')
    ;
});

test('Check property of element 2', async (t) => {
    const developerNameInput = Selector('#developer-name');

    await t
        .expect(developerNameInput.value).eql('', 'input is empty')
        .typeText(developerNameInput, 'Peter Porker')
        .expect(developerNameInput.value)
        .contains('Parker', 'input contains text "Parker"')
    ;
});

test.skip('Check property of element 3', async (t) => {
    const developerNameInput = Selector('#developer-name');

    await t
        .expect(developerNameInput.value).eql('', 'input is empty')
        .typeText(developerNameInput, 'Peter Parker')
        .expect(developerNameInput.value)
        .contains('Peter', 'input contains text "Peter"')
    ;
});
