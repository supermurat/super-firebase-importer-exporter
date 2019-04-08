# super-firebase-importer-exporter
Import and export tools for Cloud Firestore, Storage (Google Firebase)

- Import your data directly to Cloud Firestore

- Upload your files directly to Firebase Storage

- Fix file/image paths on your json data
(in html, just before import) for web projects

## Install dependencies
```sh
npm run install
```

## Setup of Firebase
### Create Service Account
Service Account Name: data-transfer  
User Role: Editor  
[`https://console.cloud.google.com/iam-admin/serviceaccounts?authuser=0&project=supermurat-com`](https://console.cloud.google.com/iam-admin/serviceaccounts?authuser=0&project=supermurat-com)
### Create a new private key
Key Type: JSON  
**DO NOT SHARE your private key!**

### Download private key file and copy to current directory
File Name: supermurat-com-service-key.json  
Relative Path: 
(project root)/supermurat-com-service-key.json  
**DO NOT COMMIT your key file to GIT!**

### Create Your Own Data
Make a copy of "data-sample.json" file and rename it as "data.json"  
Clean and Edit "data.json" file and save (in "data" directory)  
Check out "data/data-sample.json"  
Data types : [`https://firebase.google.com/docs/firestore/manage-data/data-types`](https://firebase.google.com/docs/firestore/manage-data/data-types)  
JSON Mapping : 
[`https://developers.google.com/protocol-buffers/docs/proto3#json`](https://developers.google.com/protocol-buffers/docs/proto3#json)

## Run
**DO NOT RUN unless you are very sure about "data.json"!**  
**!!! Matched collections/documents/fields will be OVERWRITTEN !!!**
```sh
npm run migrate-to-firebase
```

## Setup of MySQL
### Edit MySQL Configuration file
Make a copy of "mysql-config-sample.json" file and 
rename it as "mysql-config.json"  
Edit "mysql-config.json" file and save 

### Edit export-from-mysql.ts file 
Edit "export-from-mysql.ts" file and save  
Check out "TODO:" items in the file  

## Run export-from-mysql
**!!! "data" directory and it`s content 
will be OVERWRITTEN, 
you may want to make a copy of it !!!**
```sh
npm run export-from-mysql
```

### Edit export-from-drupal-7.ts file 
Edit "export-from-drupal-7.ts" file and save  
Check out "TODO:" items in the file  

## Run export-from-drupal-7
**!!! "data" directory and it`s content 
will be OVERWRITTEN, 
you may want to make a copy of it !!!**
```sh
npm run export-from-drupal-7
```

## Thanks

[`https://hackernoon.com/filling-cloud-firestore-with-data-3f67d26bd66e`](https://hackernoon.com/filling-cloud-firestore-with-data-3f67d26bd66e)
