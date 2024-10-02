export const version: string;
export const size: string;
export const ping: { read: string, write: string, average: string };

interface QuickDB {
    target?: string | null;
    table?: string;
}

interface MongoOptions {
    url: string;
    seperator?: string
    schema?: string | null;
}

type data = boolean | string | number | object | any[];

/**
 * Sets the language for the database.
 * @param {('tr' | 'en')} language - The language code.
 * @returns {string} The set language code.
 * @example db.setLanguage('en');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function setLanguage(language: 'tr' | 'en'): string;

/**
 * Sets whether the database is readable or not.
 * @param {boolean} readable - Indicates whether the database should be readable.
 * @returns {boolean} The set value for readability.
 * @example db.setReadable(false);
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, ~~mongodb~~
*/
export function setReadable(readable: boolean): boolean;

/**
 * Sets whether to allow blank data in the database.
 * @param {boolean} noBlankData - Indicates whether blank data is allowed.
 * @returns {boolean} The set value for allowing blank data.
 * @example db.setNoBlankData(false);
 * @supportedAdapters jsondb, bsondb, ~~yamldb~~, ~~mongodb~~
*/
export function setNoBlankData(noBlankData: boolean): boolean;

/**
 * Sets whether to check for updates.
 * @param {boolean} checkUpdates - Indicates whether to check for updates.
 * @returns {boolean} The set value for checking updates.
 * @example db.setCheckUpdates(true);
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function setCheckUpdates(checkUpdates: boolean): boolean;

/**
 * Sets the adapter for the database.
 * @param {('jsondb' | 'mongodb' | 'bsondb' | 'yamldb')} adapter - The database adapter.
 * @returns {true} Always returns true.
 * @example db.setAdapter('jsondb');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function setAdapter(adapter: 'jsondb' | 'mongodb' | 'bsondb' | 'yamldb', options?: MongoOptions): true;

/**
 * Sets the folder name for the database.
 * @param {string} folderName - The name of the folder.
 * @returns {true} Always returns true.
 * @example db.setFolder('mzrdb');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function setFolder(folderName: string): true;

/**
 * Sets the file name for the database.
 * @param {string} fileName - The name of the file.
 * @returns {true} Always returns true.
 * @example db.setFile('mzrdb');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function setFile(fileName: string): true;

/**
 * Change the seperator for making nested objects.
 * @param {string} seperator - Separator symbol.
 * @returns {true} Always returns true.
 * @example db.setSeperator('-');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function setSeperator(seperator: string): true;

/**
 * Sets a key-value pair in the database.
 * @param {string} key - The key for the data.
 * @param {any} value - The value to be stored.
 * @returns {data} The stored data.
 * @example db.set('key', 'value');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function set(key: string, value: any): data;

/**
 * Deletes a key from the database.
 * @param {string} key - The key to be deleted.
 * @returns {boolean} Indicates whether the key was successfully deleted.
 * @example db.delete('key');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function del(key: string): boolean;

/**
 * Retrieves the value associated with a key from the database.
 * @param {string} key - The key to retrieve the value.
 * @returns {data} The value associated with the key.
 * @example db.get('key');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function get(key: string): data;

/**
 * Fetches the value associated with a key from the database.
 * @param {string} key - The key to fetch the value.
 * @returns {data} The fetched value.
 * @example db.fetch('key');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function fetch(key: string): data;

/**
 * Checks if a key exists in the database.
 * @param {string} key - The key to check.
 * @returns {boolean} Indicates whether the key exists.
 * @example db.has('key');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function has(key: string): boolean;

/**
 * Checks if a key exists in the database.
 * @param {string} key - The key to check.
 * @returns {boolean} Indicates whether the key exists.
 * @example db.check('key');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function check(key: string): boolean;

/**
 * Retrieves the data type of a key in the database.
 * @param {string} key - The key to check.
 * @returns {string} The data type of the key.
 * @example db.type('key');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function type(key: string): string;

/**
 * Pushes a value to an array associated with a key in the database.
 * @param {string} key - The key for the array.
 * @param {any} value - The value to push.
 * @returns {any[]} The updated array.
 * @example db.push('key', 'value');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function push(key: string, value: any): any[];

/**
 * Removes a value from an array associated with a key in the database.
 * @param {string} key - The key for the array.
 * @param {any} value - The value to remove.
 * @returns {any[]} The updated array.
 * @example db.unpush('key', 'value');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function unpush(key: string, value: any): any[];

/**
 * Adds a numerical value to the existing value associated with a key.
 * @param {string} key - The key for the numeric value.
 * @param {number} value - The value to add.
 * @returns {number} The updated numeric value.
 * @example db.add('key', 1);
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function add(key: string, value: number): number;

/**
 * Subtracts a numerical value from the existing value associated with a key.
 * @param {string} key - The key for the numeric value.
 * @param {number} value - The value to subtract.
 * @returns {number} The updated numeric value.
 * @example db.subtract('key', 1);
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function subtract(key: string, value: number): number;

/**
 * Subtracts a numerical value from the existing value associated with a key.
 * @param {string} key - The key for the numeric value.
 * @param {number} value - The value to subtract.
 * @returns {number} The updated numeric value.
 * @example db.sub('key', 1);
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function sub(key: string, value: number): number;

/**
 * Sets a value at a specific index in an array associated with a key in the database.
 * @param {string} key - The key for the array.
 * @param {any} value - The value to set.
 * @param {number} index - The index to set the value.
 * @returns {data} The updated data.
 * @example db.setByPriority('key', 'value', 0);
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function setByPriority(key: string, value: any, index: number): data;

/**
 * Deletes a value at a specific index in an array associated with a key in the database.
 * @param {string} key - The key for the array.
 * @param {any} value - The value to delete.
 * @param {number} index - The index to delete the value.
 * @returns {data} The updated data.
 * @example db.delByPriority('key', 'value', 0);
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function delByPriority(key: string, value: any, index: number): data;

/**
 * Retrieves all data from the database.
 * @param {('all' | 'object' | 'keys' | 'values')} key - The type of data to retrieve.
 * @returns {{ [key: string]: data }} The requested data.
 * @example db.all('object');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function all(key?: 'all' | 'object' | 'keys' | 'values'): { [key: string]: data };

/**
 * Retrieves all data from the database.
 * @returns {{ [key: string]: data }} All data in the database.
 * @example db.getAll();
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function getAll(): { [key: string]: data };

/**
 * Fetches all data from the database.
 * @returns {{ [key: string]: data }} All fetched data.
 * @example db.fetchAll();
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function fetchAll(): { [key: string]: data };

/**
 * Deletes all data from the database.
 * @returns {true} Always returns true.
 * @example db.deleteAll();
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function deleteAll(): true;

/**
 * Clears the entire database.
 * @returns {true} Always returns true.
 * @example db.clear();
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function clear(): true;

/**
 * Creates a backup of the database.
 * @param {string} fileName - The name of the backup file.
 * @returns {true} Always returns true.
 * @example db.backup('mzrdb-backup');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function backup(fileName: string): true;

/**
 * Moves data from another QuickDB instance to the current database.
 * @param {QuickDB} QuickDB - The QuickDB instance to move data from.
 * @returns {true} Always returns true.
 * @example const quickdb = require('quick.db');
 * await db.move(quickdb);
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, ~~mongodb~~
*/
export function move(QuickDB: QuickDB): true;

/**
 * Checks if a key starts with a specific string in the database.
 * @param {string} key - The key to check.
 * @returns {data} The matching data.
 * @example db.startsWith('ke');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, ~~mongodb~~
*/
export function startsWith(key: string): data;

/**
 * Checks if a key includes a specific string in the database.
 * @param {string} key - The key to check.
 * @returns {data} The matching data.
 * @example db.includes('e');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, ~~mongodb~~
*/
export function includes(key: string): data;

/**
 * Checks if a key ends with a specific string in the database.
 * @param {string} key - The key to check.
 * @returns {string[]} The matching strings.
 * @example db.endsWith('ey');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, ~~mongodb~~
*/
export function endsWith(key: string): string[];

/**
 * Destroys the entire database.
 * @returns {true} Always returns true.
 * @example db.destroy();
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function destroy(): true;

/**
 * Loads data from a backup file into the database.
 * @param {string} filePath - The path to the backup file.
 * @returns {true} Always returns true.
 * @example db.loadBackup('./mzrdb-backup');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, ~~mongodb~~
*/
export function loadBackup(filePath: string): true;

/**
 * Moves data from a JSON database file to a MongoDB database.
 * @param {string} jsondb - The path to the JSON database file.
 * @returns {true} Always returns true.
 * @example const jsondb = require('../yourFile.json');
 * db.moveToMongo(jsondb);
 * @supportedAdapters **jsondb**, ~~bsondb~~, ~~yamldb~~, ~~mongodb~~
*/
export function moveToMongo(jsondb: string): true;

/**
 * Retrieves the uptime of the MongoDB database.
 * @returns {number} The uptime in milliseconds.
 * @example await db.uptime();
 * @supportedAdapters ~~jsondb~~, ~~bsondb~~, ~~yamldb~~, **mongodb**
*/
export function uptime(): number;

/**
 * Checks the MongoDB database connection status.
 * @returns {true} Always returns true.
 * @example await db.connecetion();
 * @supportedAdapters ~~jsondb~~, ~~bsondb~~, ~~yamldb~~, **mongodb**
*/
export function connecetion(): true;

/**
 * Disconnects from the MongoDB database.
 * @returns {true} Always returns true.
 * @example await db.disconnect();
 * @supportedAdapters ~~jsondb~~, ~~bsondb~~, ~~yamldb~~, **mongodb**
*/
export function disconnect(): true;

/**
 * Exports data from the MongoDB database to a file.
 * @param {string} fileName - The name of the file to export data.
 * @returns {string} Always returns true.
 * @example await db.export('yourFileName');
 * @supportedAdapters ~~jsondb~~, ~~bsondb~~, ~~yamldb~~, **mongodb**
*/
export function exports(fileName: string): true;

/**
 * Closes the MongoDB database and switches to the jsondb database system.
 * @returns {true} Always returns true.
 * @example db.deleteMongo();
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function deleteMongo(): true;

/**
 * Gets the length of the database.
 * @param {('all' | 'char' | 'object')} [type='all'] - Optional. Specifies the type of length to retrieve.
 *   - 'all': Total length of the database.
 *   - 'char': Total character length of all values in the database.
 *   - 'object': Number of key-value pairs in the database.
 * @returns {number} The length of the database based on the specified type.
 * @example await db.length();
 * @example await db.length('char');
 * @example await db.length('object');
 * @supportedAdapters **jsondb**, **bsondb**, **yamldb**, **mongodb**
*/
export function length(type?: 'all' | 'char' | 'object'): number;

/**
 * Finds documents in the database based on a key and query.
 * @param {string} key - The key of the document to search.
 * @param {object} query - The query object to filter the documents.
 * @returns {Array<object>} An array of matching documents.
 * @throws {TypeError} Throws an error if the key is not a non-empty string or if the query is not an object.
 * @example db.find('users', { age: 17 });
*/
export function find(key: string, query: object): Array<object>;

/**
 * Finds and updates documents in the database.
 * @param {string} key - The key to identify the dataset.
 * @param {object} query - The query to match documents.
 * @param {object} update - The update to apply to the matched documents.
 * @returns {Array<{ old: object, new: object }>} An array of objects containing old and new versions of the updated documents.
 * @example db.findAndUpdate('users', { name: 'Kaan' }, { age: 17 });
*/
export function findAndUpdate(key: string, query: object, update: object): Array<{ old: object, new: object }>;

/**
 * Finds and deletes documents in the database.
 * @param {string} key - The key to identify the dataset.
 * @param {object} query - The query to match documents.
 * @returns {Array<object>} An array of objects representing the deleted documents.
 * @example db.findAndDelete('users', { name: 'Kaan' });
*/
export function findAndDelete(key: string, query: object): Array<object>;

/**
 * Finds a single document and updates it in the database.
 * @param {string} key - The key to identify the dataset.
 * @param {object} query - The query to match a document.
 * @param {object} update - The update to apply to the matched document.
 * @returns {{ old: object, new: object }} An object containing the old and new version of the updated document.
 * @example db.findOneAndUpdate('users', { name: 'Kaan' }, { age: 17 });
*/
export function findOneAndUpdate(key: string, query: object, update: object): { old: object, new: object };

/**
 * Finds a single document and deletes it from the database.
 * @param {string} key - The key to identify the dataset.
 * @param {object} query - The query to match a document.
 * @returns {object} The deleted document.
 * @example db.findOneAndDelete('users', { name: 'Kaan' });
*/
export function findOneAndDelete(key: string, query: object): object;

/**
 * Finds the first document that matches the query from the specified key.
 * @param {string} key - The key for the collection.
 * @param {Object} query - The query object to match documents.
 * @returns {Object | null} The first document that matches the query, or null if no document matches.
 * @throws {TypeError} If the key is not a non-empty string or if the query is not an object.
 * @throws {Error} If the data retrieved from the key is not an array.
 * @example db.findOne('users', { name: 'Kaan' });
*/
export function findOne(key: string, query: Record<string, any>): Record<string, any> | null;


export { del as delete };
export { exports as export };