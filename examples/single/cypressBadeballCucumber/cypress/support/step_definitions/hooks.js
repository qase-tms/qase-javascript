import { Before, After, BeforeStep, AfterStep } from '@badeball/cypress-cucumber-preprocessor';
import { addCucumberStep } from 'cypress-qase-reporter/cucumber';

// Automatically add each step to Qase report
BeforeStep(function({ pickleStep }) {
  // pickleStep.text contains the step text (e.g., "I am on the homepage")
  // pickleStep.keyword contains the keyword (e.g., "Given ", "When ", "Then ")
  // Note: keyword might be undefined in some cases, so we handle it
  const keyword = pickleStep.keyword || '';
  const stepText = `${keyword}${pickleStep.text}`;
  addCucumberStep(stepText);
});
