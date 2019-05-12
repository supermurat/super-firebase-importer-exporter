import { config } from './config';
import { writeResultToFile } from './helper';
import { db } from './initialize-app';

const dataFirestore = {};
const downloadFromFirestore = async (): Promise<any> => {
    const mainCollectionSnapshot = await db.listCollections();
    for (const mainCollection of mainCollectionSnapshot) {

        if (config.download.collectionList.length > 0 &&
            config.download.collectionList.indexOf(mainCollection.id) === -1) {
            continue;
        }
        dataFirestore[mainCollection.id] = {};
        const mainDocsSnapshot = await db.collection(mainCollection.id).get();
        for (const mainDoc of mainDocsSnapshot.docs) {
            dataFirestore[mainCollection.id][mainDoc.id] = mainDoc.data();

            if (config.download.collectionListToCheckForSubCollections.length > 0 &&
                config.download.collectionListToCheckForSubCollections.indexOf(mainCollection.id) === -1) {
                console.log(mainCollection.id, mainDoc.id);
                continue;
            }
            const subCollectionSnapshot = await db.collection(mainCollection.id)
                .doc(mainDoc.id)
                .listCollections();
            for (const subCollection of subCollectionSnapshot) {
                dataFirestore[mainCollection.id][mainDoc.id][`__collection__${subCollection.id}`] = {};

                const subDocsSnapshot = await db.collection(mainCollection.id)
                    .doc(mainDoc.id)
                    .collection(subCollection.id)
                    .get();
                for (const subDoc of subDocsSnapshot.docs) {
                    dataFirestore[mainCollection.id][mainDoc.id]
                        [`__collection__${subCollection.id}`][subDoc.id] = subDoc.data();

                    // console.log(mainCollection.id, mainDoc.id, subCollection.id, subDoc.id);
                }
                console.log(mainCollection.id, mainDoc.id, subCollection.id);
            }
            console.log(mainCollection.id, mainDoc.id);
        }
        console.log(mainCollection.id);
    }
};

downloadFromFirestore()
    .then(() => {
        writeResultToFile(config.pathOfDataJson, dataFirestore);
    })
    .catch((error) => {
        console.error(error);
    });
