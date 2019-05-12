import { config } from './config';
import { writeResultToFile } from './helper';

// tslint:disable-next-line:no-var-requires no-require-imports
const data = require(config.pathOfDataJson);
const dataFirestore = {};

const cleanData = (): void => {
    Object.keys(data).forEach((key) => {
        console.log(`Cleaning: ${key}`);
        const nestedContent = data[key];
        const subData = {};

        if (typeof nestedContent === 'object') {
            Object.keys(nestedContent).forEach((docID) => {
                const docData = nestedContent[docID];
                if (docData.hasOwnProperty('code') &&
                    (docData.code === 404 || docData.code === 200)) {
                    // skip to add cleaned data file
                } else {
                    subData[docID] = docData;
                }
            });
        }
        dataFirestore[key] = subData;
        console.log(`Cleaned: ${key}`);
    });
};

cleanData();
writeResultToFile(config.pathOfDataJson.replace('.json', '-clean.json'), dataFirestore);
