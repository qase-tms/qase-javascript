/* eslint-disable */
const { QaseApi } = require('qaseio');
const { QaseCoreReporter } = require('qase-core-reporter');
const FormData = require('form-data');
const chalk = require('chalk');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

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

        if (fs.lstatSync(fullPath).isDirectory()) {
            getFiles(fullPath).forEach((x) => files.push(`${file}/${x}`));
        } else {
            files.push(file);
        }
    }
    return files;
};

const parseAttachmentDirectory = (folder) => {
    const pathToAttachmentDir = path.join(process.cwd(), folder);
    const files = getFiles(pathToAttachmentDir);
    const filePathByCaseIdMap = {};

    files.forEach((file) => {

        if (file.includes('Qase ID')) {
            const caseIds = getCaseId(file);

            if (caseIds) {
                caseIds.forEach((caseId) => {
                    const attachmentObject = {
                        caseId,
                        file: [file],
                    };

                    filePathByCaseIdMap[caseId] = attachmentObject;
                });
            }
        }
    });

    return filePathByCaseIdMap;
};

const uploadMappedAttachments = async (attachmentsMap, api, code, results) => {
    const attachmentKeys = Object.keys(attachmentsMap);

    const attachmentsToUpload = attachmentKeys.map(async (key) => {
        const attachments = attachmentsMap[key];

        const pathToFile = attachments[0].path;

        const data = fs.createReadStream(pathToFile);

        const options = {
            headers: {
                'Content-Type':
                    'multipart/form-data; boundary=' + customBoundary,
            },
        };

        if (data) {
            const resp = await api.uploadAttachment(
                code,
                [data],
                options
            );

            return {
                hash: resp.data.result?.[0].hash,
                testCaseId: key
            };
        }
    });

    const attachmentsToUploadResult = await Promise.all(attachmentsToUpload);

    return results.map((result) => {
        const attachmentMapping = attachmentsToUploadResult
            .find((data) => data.testCaseId === result.id);
        if (attachmentMapping) {
            result.attachments = [attachmentMapping.hash];
        }
        return result;
    });
};

const publishBulkResult = async () => {
    const config = JSON.parse(process.env?.reporting_config);
    const attachmentsConfig = JSON.parse(process.env?.attachments_config);

    if (config.isDisabled) {
        return;
    }

    if (config.body && config.body.results.length === 0) {
        config.isDisabled = true;
        QaseCoreReporter.logger(
            'No test cases were matched. Ensure that your tests are declared correctly.'
        );
        return;
    }

    let hashesMap = {};

    if (config) {
        const { body } = config;
        const results = body.results;

        QaseCoreReporter.logger('Publishing bulk result/s...');

        const api = new QaseApi(config.apiToken, config.basePath, config.headers, CustomBoundaryFormData);

        // upload attachments from screenshot directory
        if (attachmentsConfig.screenshotFolder && attachmentsConfig.uploadAttachments) {
            QaseCoreReporter.logger('Uploading screenshots to Qase...');
            try {
                const filePathsByCaseIdMap = parseAttachmentDirectory(attachmentsConfig.screenshotFolder);

                if (filePathsByCaseIdMap) {
                    const filesMap = Object.values(filePathsByCaseIdMap);
                    const uploadAttachmentsPromisesArray = filesMap.map(async (failedCase) => {
                        const caseId = failedCase.caseId;

                        const pathToFile = `./${attachmentsConfig.screenshotFolder}/${failedCase.file[0]}`;

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
                    }, hashesMap);
                }
            } catch (error) {
                QaseCoreReporter.logger(chalk`{red Error during sending screenshots ${error}}`);
            }
        }

        // upload attachments from video directory
        if (attachmentsConfig.videoFolder && attachmentsConfig.uploadAttachments) {
            QaseCoreReporter.logger('Uploading videos to Qase...');
            try {
                const filePathsByCaseIdMap = parseAttachmentDirectory(attachmentsConfig.videoFolder);

                if (filePathsByCaseIdMap) {
                    const filesMap = Object.values(filePathsByCaseIdMap);
                    const uploadAttachmentsPromisesArray = filesMap.map(async (failedCase) => {
                        const caseId = failedCase.caseId;

                        const pathToFile = `./${attachmentsConfig.videoFolder}/${failedCase.file[0]}`;

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
                    }, hashesMap);
                }
            } catch (error) {
                QaseCoreReporter.logger(chalk`{red Error during sending videos ${error}}`);
            }
        }

        // upload attachments from attachment map
        if (attachmentsConfig.attachmentsMap
            && attachmentsConfig.uploadAttachments
            && Object.keys(attachmentsConfig.attachmentsMap).length > 0) {
            const attachmentsMap = attachmentsConfig.attachmentsMap;

            QaseCoreReporter.logger('Uploading mapped attachments to Qase');

            try {
                const results = await uploadMappedAttachments(attachmentsMap, api.attachments, config.code, body.results);
                body.results = results;
            } catch (error) {
                QaseCoreReporter.logger(chalk`{red Error during sending mapped attachments ${error}}`);
            }

        }

        try {
            if (hashesMap) {
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
                QaseCoreReporter.logger(chalk`{green Results sent}`);
            }

            if (config.runComplete) {
                try {
                    await api.runs.completeRun(config.code, config.runId);
                    QaseCoreReporter.logger(chalk`{green Run ${config.runId} completed}`);
                } catch (error) {
                    QaseCoreReporter.logger(chalk`{red Error on completing run}`);
                }
            }

            QaseCoreReporter.logger(chalk`{blue Test run link: ${config.runUrl}}`);
        } catch (error) {
            QaseCoreReporter.logger(chalk`{red Error while publishing ${error}}`);
        }
    }
};

module.exports = {
    publishBulkResult,
}