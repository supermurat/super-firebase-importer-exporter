import { Storage } from '@google-cloud/storage';
import * as admin from 'firebase-admin';

import { config } from './config';

admin.initializeApp({
    credential: admin.credential.cert(config.serviceAccount),
    databaseURL: `https://${config.serviceAccount.project_id}.firebaseio.com`
});
const db = admin.firestore();
const bucket = admin.storage().bucket(config.bucketName);

const storage = new Storage();

export { admin, bucket, db, storage };
