import * as colors from 'colors';
import * as fs from 'fs';
import * as path from 'path';

import { config } from './config';
import { checkDirectory } from './helper';
import { bucket } from './initialize-app';

const downloadFromStorage = async (): Promise<any> => {
    const allFiles = await bucket.getFiles({
        autoPaginate: false
    });
    const files = allFiles[0];
    for (const file of files) {
        const filePath = config.pathOfFiles + path.sep + file.name.replace(/\//gi, path.sep);
        if (config.download.storageIgnoreList.length > 0 && config.download.storageIgnoreList.indexOf(file.name.split(/\//gi)[0]) > -1) {
            continue;
        }
        checkDirectory(path.dirname(filePath));
        if (file.name.endsWith('/')) {
            continue;
        }
        if (!fs.existsSync(filePath)) {
            file.createReadStream()
                .on('error', (err) => {
                    console.error(err);
                })
                .on('response', (response) => {
                    // Server connected and responded with the specified status and headers.
                })
                .on('end', () => {
                    // The file is fully downloaded.
                })
                .pipe(fs.createWriteStream(filePath));
            console.log('File Downloaded:', file.name);
        } else {
            console.log('File is Already Downloaded:', file.name);
        }
    }
};

downloadFromStorage()
    .then(() => {
        console.log(colors.bold(colors.green('Files Downloaded Successfully!')));
    })
    .catch((error) => {
        console.error(error);
    });
