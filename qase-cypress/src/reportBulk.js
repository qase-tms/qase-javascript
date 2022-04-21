/* eslint-disable no-console */
/* eslint-disable camelcase */
const { QaseApi } = require('qaseio');
const chalk = require('chalk');

const config = JSON.parse(process.env?.reporting_config);

const publishBulkResult = async () => {
    if (config) {
        console.log('Publication is started');

        const api = new QaseApi(config.apiToken, config.basePath, config.headers);

        try {
            const res = await api.results.createResultBulk(
                config.code,
                config.runId,
                config.body
            );

            if (res.status === 200) {
                console.log(chalk`{green Results sent}`);
            }
        } catch (error) {
            console.log('Error till publishing', error);
        }
    }
};

publishBulkResult();
