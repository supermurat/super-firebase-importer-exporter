import * as path from 'path';

import { checkDirectory } from './helper';

export const config = {
  /*
  * use require or copy and paste your firebase service account details
  * samples;
  * serviceAccount: require('../firebase-project-id-service-account.json'),
  * or
  * serviceAccount: { "type": "service_account", "project_id": ... },
  */
  // tslint:disable-next-line:no-var-requires no-require-imports
  serviceAccount: require('../firebase-project-id-service-account.json'),
  /* usually it is 'firebase-project-id.appspot.com' */
  bucketName: 'firebase-project-id.appspot.com',
  pathOfData: `${path.dirname(__dirname) + path.sep}data`,
  pathOfDataJson: `${path.dirname(__dirname) + path.sep}data${path.sep}data.json`,
  pathOfFiles: `${path.dirname(__dirname) + path.sep}data${path.sep}files`,
  download: {
    /* keep empty to download all of them */
    collectionList: [],
    /* keep empty to download all of them */
    collectionIgnoreList: ['firstResponses'],
    /* keep empty to check for sub collections on all of collections */
    collectionListToCheckForSubCollections: ['pages_en-US', 'pages_tr-TR', 'taxonomy_en-US', 'taxonomy_tr-TR'],
    /* keep empty to download all of them */
    storageIgnoreList: ['backups']
  },
  upload: {
    /* make uploaded files public */
    makePublic: true
  },
  /* If you want to use export from mysql/drupal, you need to configure mysql, otherwise keep it as it is */
  mysql: {
    host: 'localhost',
    user: 'db_user',
    password: 'db_password',
    database: 'db_name'
  }
};

checkDirectory(config.pathOfData);
