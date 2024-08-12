import { QaseReporter } from 'qase-javascript-commons';


const options = JSON.parse(process.env?.reporterConfig);
const results = JSON.parse(process.env?.results);


const runChild = async () => {
  const reporter = QaseReporter.getInstance(options);
  reporter.setTestResults(results);

  await reporter.sendResults();
};

runChild();
