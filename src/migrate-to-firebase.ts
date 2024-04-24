import * as fs from 'fs';
import * as mime from 'mime-types';
import * as path from 'path';

import { config } from './config';
import { admin, bucket, storage } from './initialize-app';

// tslint:disable-next-line:no-var-requires no-require-imports
let data = require(config.pathOfDataJson);

// File
const getFiles = (dir: string, files: Array<string>): Array<string> => {
    const filesWithBefore = files || [];
    const currentFiles = fs.readdirSync(dir);
    for (const currentFile of currentFiles) {
        const name = String(dir + path.sep + currentFile);
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, filesWithBefore);
        } else {
            filesWithBefore.push(name);
        }
    }

    return filesWithBefore;
};

const uploadImageToStorage = async (fileContent: any, fileName: string): Promise<any> =>
    new Promise<any>((resolve, reject): void => {
        const fileUpload = bucket.file(fileName);
        // https://cloud.google.com/nodejs/docs/reference/storage/1.3.x/File#createWriteStream
        const blobStream = fileUpload.createWriteStream({
            metadata: {
                // https://cloud.google.com/storage/docs/json_api/v1/objects/insert#request_properties_JSON
                contentType: mime.lookup(fileName),
                cacheControl: `public, max-age=${60 * 60 * 24 * 365}`
            },
            public: config.upload.makePublic
        });
        blobStream.on('error', (error) => {
            reject(error);
        });
        blobStream.on('finish', () => {
            resolve(`https://storage.googleapis.com/${bucket.name}/${fileName}`);
        });
        blobStream.end(fileContent);
    });

const uploadFileAndGetURL = async (pathOfFile: string, filePath: string): Promise<any> =>
    new Promise<any>((resolve, reject): void => {
        let destinationPath = filePath
            .replace(pathOfFile, '')
            .replace(/\\/g, '/');
        if (destinationPath.startsWith('/')) {
            destinationPath = destinationPath.slice(1);
        }

        bucket.file(destinationPath).exists()
            .then((info) => {
                if (info[0]) {
                    const url = `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
                    console.log('Already Uploaded File : ', url);
                    resolve({destinationPath, url});
                } else {
                    const fileContent = fs.readFileSync(filePath);
                    uploadImageToStorage(fileContent, destinationPath)
                        .then((url) => {
                            console.log('Newly Uploaded File : ', url);
                            resolve({destinationPath, url});
                        })
                        .catch((error) => {
                            reject(error);
                        });
                }
            })
            .catch((error) => {
                reject(error);
            });
    });

const uploadFilesAndFixFilePaths = async (): Promise<any> =>
    new Promise<any>((resolve, reject): void => {
        let dataString = JSON.stringify(data);
        if (!fs.existsSync(config.pathOfFiles)) {
            console.log('There is no file to upload!');
            resolve();
        } // There is no directory (pathOfFiles) to upload, so let's skip to import only data.json
        const files = getFiles(config.pathOfFiles, undefined);
        if (files.length > 0) {
            const promises = [];
            files.forEach((filePath) => {
                promises.push(uploadFileAndGetURL(config.pathOfFiles, filePath));
            });
            Promise.all(promises)
                .then((results) => {
                    console.log(`Files upload successfully: ${files.length} files`);
                    if (config.migrate.fixMediaPaths) {
                        results.forEach((pru) => {
                            dataString = dataString.replace(new RegExp(`${config.migrate.oldMediaPathPrefix}/${pru.destinationPath}`, 'gi'), pru.url);
                            // console.log(pru.destinationPath, '>>', pru.url);
                        });
                        data = JSON.parse(dataString);
                        console.log(`Fixed uploaded file paths in data.`);
                    }
                    resolve();
                })
                .catch((e) => {
                    console.error(e);
                });
        } else {
            console.log('There is no file to upload!');
            resolve();
        }
    });
// End OF File

const fixTimestamps = (nestedData: any): any => {
    if (typeof nestedData === 'string') {
        // tslint:disable-next-line: max-line-length
        if (nestedData.match(/^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])[ T](00|[0-9]|0[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])\.\d\d\d[Z]?$/gi)
        ) {
            return new Date(nestedData);
        }
    } else if (typeof nestedData === 'object' && nestedData !== undefined && nestedData !== null) {
        if (nestedData.hasOwnProperty('_seconds') && nestedData.hasOwnProperty('_nanoseconds') &&
            Object.keys(nestedData).length === 2) {
            return new Date((nestedData._seconds * 1000) + Number(nestedData._nanoseconds));
        }
        Object.keys(nestedData).forEach((key) => {
            nestedData[key] = fixTimestamps(nestedData[key]);
        });
    }

    return nestedData;
};

const importIntoFirestore = (): void => {
    if (data) {
        Object.keys(data).forEach((key) => {
            const nestedContent = data[key];

            if (typeof nestedContent === 'object') {
                Object.keys(nestedContent).forEach((docID) => {
                    const nestedData = fixTimestamps(nestedContent[docID]);
                    const docData = {...nestedData};
                    Object.keys(nestedData).forEach((subKey) => {
                        if (subKey.startsWith('__collection__')) {
                            // tslint:disable-next-line:no-dynamic-delete
                            delete docData[subKey];
                        }
                    });

                    admin.firestore()
                        .collection(key)
                        .doc(docID)
                        .set(docData)
                        .then((res) => {
                            Object.keys(nestedData).forEach((subKey) => {
                                if (subKey.startsWith('__collection__')) {
                                    console.log('Importing sub collections:', key, docID, subKey);
                                    const subNestedContent = nestedData[subKey];
                                    Object.keys(subNestedContent).forEach((subDocID) => {
                                        const subDocData = {...subNestedContent[subDocID]};
                                        admin.firestore()
                                            .collection(key)
                                            .doc(docID)
                                            .collection(subKey.replace('__collection__', ''))
                                            .doc(subDocID)
                                            .set(subDocData)
                                            .then((subRes) => {
                                                console.log('Imported:', key, docID, subKey, subDocID);
                                            })
                                            .catch((error) => {
                                                console.error('Error:', key, docID, subKey, subDocID, error);
                                            });
                                    });
                                }
                            });
                            console.log('Imported:', key, docID);
                        })
                        .catch((error) => {
                            console.error('Error:', key, docID, error);
                        });

                });
            }
        });
    }
};

uploadFilesAndFixFilePaths()
    .then(() => {
        importIntoFirestore();
    })
    .catch((error) => {
        console.error(error);
    });
