import * as mysql from 'mysql';

import { config } from './config';
import { writeResultToFile } from './helper';

const connection = mysql.createConnection(config.mysql);

connection.connect();

connection.query(
    "SELECT 'random1' AS 'id', CURRENT_TIMESTAMP() AS 'testDate'", // TODO: set your own mysql query
    (error, results, fields) => {
        if (error) { throw error; }

        const collectionName = 'myCollection'; // TODO: set collection name for firestore
        const dataFirestore = {};
        dataFirestore[collectionName] = {};
        results.forEach((element) => {
            const docID = element.id; // TODO: set document ID for firestore
            dataFirestore[collectionName][docID] = element;
        });

        writeResultToFile(config.pathOfDataJson, dataFirestore);
});

connection.end();
