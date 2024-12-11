interface CypressLogEntry {
  attributes: {
    name: string;
    message: string;
    displayName?: string;
    event: boolean;
    instrument: string;
  };
}

const CUCUMBER_TASK_NAME = 'qaseCucumberStepStart';

export const enableCucumberSupport = () => {
  registerCypressEventListeners();
};

const registerCypressEventListeners = () => {
  Cypress.on('log:added', handleLogAdded);
};

const handleLogAdded = (_: Cypress.ObjectLike, entry: CypressLogEntry) => {
  if (isCucumberStep(entry)) {
    processCucumberStep(entry);
  }
};

const isCucumberStep = ({ attributes: { name, event, instrument } }: CypressLogEntry): boolean => {
  return instrument === 'command' && !event && name === 'step';
};

const processCucumberStep = ({ attributes: { displayName, message } }: CypressLogEntry) => {
  sendTaskMessage(`${displayName ?? ''} ${message}`);
};

const sendTaskMessage = (message: string) => {
  cy.task(CUCUMBER_TASK_NAME, message, { log: false });
};
