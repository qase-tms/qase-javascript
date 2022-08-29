/* eslint-disable */
const { QaseApi } = require('qaseio');
const { QaseCoreReporter } = require('qase-core-reporter');
const FormData = require('form-data');
const chalk = require('chalk');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(process.env?.reporting_config);
const attachmentsConfig = JSON.parse(process.env?.attachments_config);

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

const publishBulkResult = async () => {
    if (config) {
        const { body } = config;
        const results = body.results;

        QaseCoreReporter.logger('Publishing bulk result/s...');

        const api = new QaseApi(config.apiToken, config.basePath, config.headers, CustomBoundaryFormData);

        // upload attachments from screenshot directory
        if (attachmentsConfig.screenshotFolder && attachmentsConfig.uploadAttachments) {
            QaseCoreReporter.logger('Uploading screenshots to Qase...');
            try {
                const filePathesByCaseIdMap = parseAttachmentDirectory(attachmentsConfig.screenshotFolder);

                if (filePathesByCaseIdMap) {
                    const filesMap = Object.values(filePathesByCaseIdMap);
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
                const filePathesByCaseIdMap = parseAttachmentDirectory(attachmentsConfig.videoFolder);

                if (filePathesByCaseIdMap) {
                    const filesMap = Object.values(filePathesByCaseIdMap);
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
                QaseCoreReporter.logger(chalk`{red Error during sending screenshots ${error}}`);
            }
        }

        // upload attachments from attachment map
        if (attachmentsConfig.attachmentsMap
            && attachmentsConfig.uploadAttachments
            && Object.keys(attachmentsConfig.attachmentsMap).length > 0) {
            const attachmentsMap = attachmentsConfig.attachmentsMap;

            QaseCoreReporter.logger(chalk`{yellow Uploading attachments to Qase}`);

            const attachmentKeys = Object.keys(attachmentsMap);

            const attachmentsToUpload = attachmentKeys.map(async (key) => {
                const attachment = attachmentsMap[key];
                const attachmentsHash = await QaseCoreReporter.uploadAttachments(attachment);
                return {
                    testCaseId: key,
                    attachmentsHash,
                };
            });

            const attachmentsToUploadResult = await Promise.all(attachmentsToUpload);
            body.results = results.map((result) => {
                const attachmentMapping = attachmentsToUploadResult
                    .find((data) => data.testCaseId === result.id);
                if (attachmentMapping) {
                    result.attachments = attachmentMapping.attachmentsHash;
                }
                return result;
            });
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
                await api.runs.completeRun(config.code, config.runId);
                QaseCoreReporter.logger(chalk`{green Run completed}`);
            }
        } catch (error) {
            console.log('Error while publishing', error);
        }
    }
};

publishBulkResult();
