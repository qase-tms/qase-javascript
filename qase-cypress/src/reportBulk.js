/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */

const { QaseApi } = require('qaseio');
const FormData = require('form-data');
const chalk = require('chalk');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(process.env?.reporting_config);
const screenshotsConfig = JSON.parse(process.env?.screenshots_config);

let hashesMap = {};

let customBoundary = '----------------------------';
crypto.randomBytes(24).forEach((value) => {
    customBoundary += Math.floor(value * 10).toString(16);
});

class CustomBoundaryFormData extends FormData {
    constructor() {
        super();
    }

    getBoundary() {
        return customBoundary;
    }
}

const getCaseId = (str) => {
    const regexp = /(\(Qase ID ([\d,]+)\))/;
    const results = regexp.exec(str);
    if (results && results.length === 3) {
        return results[2].split(',').map((value) => Number.parseInt(value, 10));
    }
    return [];
};

const getFiles = (pathToFile) => {
    const files = [];
    for (const file of fs.readdirSync(pathToFile)) {
        const fullPath = `${pathToFile}/${file}`;

        if(fs.lstatSync(fullPath).isDirectory()) {
            getFiles(fullPath).forEach((x) => files.push(`${file}/${x}`));
        } else {
            files.push(file);
        }
    }
    return files;
};

const parseScreenshotDirectory = () => {
    const pathToScreenshotDir = path.join(process.cwd(), `cypress/${screenshotsConfig.screenshotFolder}`);
    const files = getFiles(pathToScreenshotDir);
    const filePathesByCaseIdMap = {};

    files.forEach((file) => {
        if(file.includes('Qase ID')) {
            const caseIds = getCaseId(file);

            if (caseIds) {
                caseIds.forEach((caseId) => {
                    const attachmentObject = {
                        caseId,
                        file: [file],
                    };

                    filePathesByCaseIdMap[caseId] = attachmentObject;
                });
            }
        }
    });

    return filePathesByCaseIdMap;
};

const publishBulkResult = async () => {
    if (config) {
        console.log('Publication is started');

        const api = new QaseApi(config.apiToken, config.basePath, config.headers, CustomBoundaryFormData);

        if (screenshotsConfig.screenshotFolder && screenshotsConfig.sendScreenshot) {
            try {
                const filePathesByCaseIdMap = parseScreenshotDirectory();

                if (filePathesByCaseIdMap) {
                    const filesMap = Object.values(filePathesByCaseIdMap);
                    const uploadAttachmentsPromisesArray = filesMap.map(async (failedCase) => {
                        const caseId = failedCase.caseId;

                        const pathToFile = `./cypress/${screenshotsConfig.screenshotFolder}/${failedCase.file[0]}`;

                        const data = fs.createReadStream(pathToFile);

                        const options = {
                            headers: {
                                'Content-Type':
                                'multipart/form-data; boundary=' + customBoundary,
                            },
                        };

                        if (data) {
                            const resp = await api.attachments.uploadAttachment(
                                config.code,
                                [data],
                                options
                            );

                            return {
                                hash: resp.data.result?.[0].hash,
                                caseId,
                            };
                        }
                    });

                    const responses = await Promise.all(uploadAttachmentsPromisesArray);

                    hashesMap = responses.reduce((accum, value) => {
                        accum[value.caseId] = value.hash;
                        return accum;
                    }, {});
                }
            } catch (error) {
                console.log(chalk`{red Error during sending screenshots ${error}}`);
            }
        }

        try {
            const { body } = config;

            if (hashesMap) {
                const results = body.results;

                const resultsWithAttachmentHashes = results.map(((result) => {
                    if (hashesMap[result.case_id]) {
                        return {
                            ...result,
                            attachments: [hashesMap[result.case_id]],
                        };
                    }

                    return result;
                }));

                body.results = resultsWithAttachmentHashes;
            }

            const res = await api.results.createResultBulk(
                config.code,
                config.runId,
                body
            );

            if (res.status === 200) {
                console.log(chalk`{green Results sent}`);
            }

            if(config.runComplete) {
                await api.runs.completeRun(config.code, config.runId);
                console.log(chalk`{green Run compleated}`);
            }
        } catch (error) {
            console.log('Error till publishing', error);
        }
    }
};

publishBulkResult();
