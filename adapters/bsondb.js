const fs = require('fs');
const functions = require('../functions/bsondb.js');
let bson;

class BsonDB {
    constructor(options) {
        this.dbName = options['dbName'];
        this.dbFolder = options['dbFolder'];
        this.noBlankData = options['noBlankData'] ? (typeof options['noBlankData'] === 'boolean' ? options['noBlankData'] : false) : false;
        this.readable = options['readable'] ? (typeof options['readable'] === 'boolean' ? true : false) : false;
        this.seperator = options['seperator'];
        this.message = options['message'];

        try {
            bson = require('bson');
        } catch (error) {
            throw new TypeError('You must install \'bson\' module for use this adapter. (npm i bson)');
        }

        functions.fetchFiles(this.dbFolder, this.dbName);
        this.content = this.readBSONFile();
    }

    readBSONFile() {
        const content = fs.readFileSync(`./${this.dbFolder}/${this.dbName}.bson`);

        return bson.deserialize(content);
    }

    writeBSONFile() {
        const serializedContent = bson.serialize(this.content);

        fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.bson`, serializedContent);
    }

    set(key, data) {
        functions.set(key, data, this.content, this.seperator);
        this.writeBSONFile();

        return this.get(key);
    }

    get(key) {
        return functions.get(this.content, this.seperator, ...key.split(this.seperator));
    }

    fetch(key) {
        return functions.get(this.content, this.seperator, ...key.split(this.seperator));
    }

    has(key) {
        return functions.get(this.content, this.seperator, ...key.split(this.seperator)) ? true : false;
    }

    type(key) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);

        try {
            const value = functions.get(this.content, this.seperator, ...key.split(this.seperator));

            if (value === null) return 'null';
            else if (Array.isArray(value)) return 'array';

            return value !== undefined ? typeof value : 'null';
        } catch (err) {
            return null;
        }
    }

    delete(key) {
        if (!this.get(key)) return false;
        functions.remove(this.content, key, this.seperator);
        if (this.noBlankData === true) functions.removeEmptyData(this.content);
        this.writeBSONFile();

        return true;
    }

    del(key) {
        if (!this.get(key)) return false;
        functions.remove(this.content, key, this.seperator);
        if (this.noBlankData === true) functions.removeEmptyData(this.content);
        this.writeBSONFile();

        return true;
    }

    add(key, value) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (!value) throw new TypeError(this.message['errors']['blankData']);
        if (isNaN(value)) throw new TypeError(this.message['errors']['blankNumber']);

        this.set(key, Number(this.get(key) ? (isNaN(this.get(key)) ? Number(value) : this.get(key) + Number(value)) : Number(value)));

        return this.get(key);
    }

    subtract(key, value) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (!value) throw new TypeError(this.message['errors']['blankData']);
        if (isNaN(value)) throw new TypeError(this.message['errors']['blankNumber']);

        if (this.get(key) - value < 1) {
            this.delete(key);

            return (this.get(key) || 0);
        };

        if (!this.get(key)) {
            this.delete(key);

            return (this.get(key) || 0);
        };

        this.set(key, this.get(key) ? (this.get(key) - Number(value) <= 1 ? 1 : (isNaN(this.get(key)) ? 1 : this.get(key) - Number(value)) || 1) : 1);
        return this.get(key);
    }

    sub(key, value) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (!value) throw new TypeError(this.message['errors']['blankData']);
        if (isNaN(value)) throw new TypeError(this.message['errors']['blankNumber']);

        if (this.get(key) - value < 1) {
            this.delete(key);

            return (this.get(key) || 0);
        };

        if (!this.get(key)) {
            this.delete(key);

            return (this.get(key) || 0);
        };

        this.set(key, this.get(key) ? (this.get(key) - Number(value) <= 1 ? 1 : (isNaN(this.get(key)) ? 1 : this.get(key) - Number(value)) || 1) : 1);
        return this.get(key);
    }

    push(key, data) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (!data) throw new TypeError(this.message['errors']['blankData']);

        var arr = [];
        if (this.get(key)) {
            if (typeof this.get(key) !== 'object') arr = [];
            else arr = this.get(key);
        };

        arr.push(data);

        this.set(key, arr);

        return this.get(key);
    }

    unpush(key, data) {
        if (!key) throw new TypeError(this.message['errors']['blankName']);
        if (!data) throw new TypeError(this.message['errors']['blankData']);

        var arr = [];
        if (this.get(key)) arr = this.get(key);
        arr = arr.filter((x) => x !== data);

        this.set(key, arr);
        return this.get(key);
    }

    delByPriority(key, value) {
        if (!key) throw new TypeError(this.message['errors']['blankData']);
        if (!value) throw new TypeError(this.message['errors']['blankNumber']);
        if (isNaN(value)) throw new TypeError(this.message['errors']['blankNumber']);
        if (!this.get(key) || this.get(key).length < 1) return false;

        let content = this.get(key);
        let neW = [];

        if (typeof content !== 'object') return false;

        for (let a = 0; a < content.length; a++) {
            if (a !== (value - 1)) neW.push(content[`${a}`]);
        }

        this.set(key, neW);
        return this.get(key);
    }

    setByPriority(key, data, value) {
        if (!key) throw new TypeError(this.message['errors']['blankData']);
        if (!data) throw new TypeError(this.message['errors']['blankData']);
        if (!value) throw new TypeError(this.message['errors']['blankNumber']);
        if (isNaN(value)) throw new TypeError(this.message['errors']['blankNumber']);
        if (!this.get(key) || this.get(key).length < 1) return false;

        let content = this.get(key);
        let neW = [];

        if (typeof content !== 'object') return false;

        for (let a = 0; a < content.length; a++) {
            let val = content[`${a}`];

            if (a === (value - 1)) neW.push(data);
            else neW.push(val);
        }

        this.set(key, neW);
        return this.get(key);
    }

    all(key = 'all') {
        key = key.toLowerCase();

        if (key === 'all') return this.content;
        else if (key === 'object') return Object.entries(this.content);
        else if (key === 'keys') return Object.keys(this.content);
        else if (key === 'values') return Object.values(this.content);
        else return this.content;
    }

    getAll() {
        return this.content;
    }

    fetchAll() {
        return this.content;
    }

    deleteAll() {
        fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.bson`, bson.serialize({}));

        return true;
    }

    clear() {
        fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.bson`, bson.serialize({}));

        return true;
    }

    backup(file) {
        if (!file) throw new Error('Please provide a name for the backup file.');
        if (file.endsWith('.bson')) throw new Error('File extensions should be omitted from the filename.');
        if (file === this.dbName) throw new Error('Backup database name cannot be identical to the original database name.');

        fs.writeFileSync(`${file}.bson`, bson.serialize(this.content), 'utf8');

        return true;
    }

    startsWith(key) {
        if (!key) throw new Error('Key not specified.');
        if (typeof key !== 'string') throw new TypeError('Key must be a string.');

        functions.fetchFiles(this.dbFolder, this.dbName);

        const array = [];
        for (const key in this.content) {
            array.push({ key, data: this.content[key] });
        }

        return array.filter(x => x.key.startsWith(key));
    }

    endsWith(key) {
        if (!key) throw new Error('Key not specified.');
        if (typeof key !== 'string') throw new TypeError('Key must be a string.');

        functions.fetchFiles(this.dbFolder, this.dbName);

        const array = [];
        for (const key in this.content) {
            array.push({ key, data: this.content[key] });
        }

        return array.filter(x => x.key.endsWith(key));
    }

    includes(key) {
        if (!key) throw new Error('Key not specified.');
        if (typeof key !== 'string') throw new TypeError('Key must be a string.');

        functions.fetchFiles(this.dbFolder, this.dbName);

        const array = [];
        for (const key in this.content) {
            array.push({ key, data: this.content[key] });
        }

        return array.filter(x => x.key.includes(key));
    }

    destroy() {
        fs.unlink(`${this.dbFolder}/${this.dbName}.bson`, () => {
            fs.rmdir(this.dbName, { recursive: false }, () => { });
        });

        return true;
    }

    ping() {
        functions.fetchFiles(this.dbFolder, this.dbName);

        const getStart = Date.now();
        this.get('mzrdb');
        const readPing = Date.now() - getStart;

        const setStart = Date.now();
        this.set('mzrdb', 'mzrdb');
        const writePing = Date.now() - setStart;

        const average = (readPing + writePing) / 2;
        this.delete('mzrdb');

        return { read: `${readPing}ms`, write: `${writePing}ms`, average: `${average}ms` };
    }

    loadBackup(path) {
        if (!path.includes('.bson')) throw new TypeError('File in the path you show is not a bson file.');
        if (fs.existsSync(`${path}`) === false) throw new Error('Please enter a correct file path.');
        functions.fetchFiles(this.dbFolder, this.dbName);

        const filePath = fs.realpathSync(`${path}`);
        const dbPath = fs.realpathSync(`./${this.dbFolder}/${this.dbName}.bson`);

        fs.writeFile(dbPath, fs.readFileSync(filePath, 'utf8'), (err) => {
            if (err) throw new Error(err);
        });

        return true;
    }

    async uptime() {
        throw new Error('Uptime feature is not applicable for Bson database.');
    }

    async connecetion() {
        throw new Error('Connecetion feature is not applicable for Bson database.');
    }

    async disconnect() {
        throw new Error('Disconnect feature is not applicable for Bson database.');
    }

    async exports() {
        throw new Error('Exports feature is not applicable for Bson database.');
    }

    async export() {
        throw new Error('Export feature is not applicable for Bson database.');
    }

    moveToMongo() {
        throw new Error('Move to Mongo feature is not applicable for Bson database.');
    }

    length(key = 'all') {
        if (key === 'all') key = 'all';
        else if (key.includes('word')) key = 'all';
        else if (key.includes('char')) key = 'all';
        else if (key.includes('object')) key = 'object';
        else key = 'all';

        try {
            if (key === 'object') {
                const allData = Object.entries(JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.bson`, 'utf8')));

                return allData.length;
            } else {
                const allData = fs.readFileSync(`./${this.dbFolder}/${this.dbName}.bson`, 'utf8');

                return allData.length;
            };
        } catch {
            if (error.errno == -4058) throw new Error("mzrdb module is not installed! You can type 'npm i mzrdb@latest' to install it.")
            else throw new Error('An error occurred! Here is the error that occurred: ' + error.message);
        };
    }

    find(key, query) {
        if (typeof key !== 'string' || key.trim() === '') {
            throw new TypeError(this.message['errors']['nonEmptyString']);
        };

        if (typeof query !== 'object' || query === null) {
            throw new TypeError(this.message['errors']['queryMustObjects']);
        };

        const data = this.get(key) || [];
        if (!Array.isArray(data)) throw new Error(this.message['errors']['dataMustArray']);

        return data.filter(doc => Object.keys(query).every(queryKey => queryKey in doc && doc[queryKey] === query[queryKey])) || [];
    }

    findAndUpdate(key, query, update) {
        if (typeof key !== 'string' || key.trim() === '') {
            throw new TypeError(this.message['errors']['nonEmptyString']);
        };

        if (typeof query !== 'object' || query === null) {
            throw new TypeError(this.message['errors']['queryMustObjects']);
        };

        if (typeof update !== 'object' || update === null) {
            throw new TypeError(this.message['errors']['updateMustObjects']);
        };

        const data = this.get(key) || [];
        if (!Array.isArray(data)) throw new Error(this.message['errors']['dataMustArray']);

        const updatedDocs = data.map(doc => {
            const matches = Object.keys(query).every(queryKey => queryKey in doc && doc[queryKey] === query[queryKey]);
            if (matches) {
                const oldDoc = { ...doc };
                const newDoc = { ...oldDoc, ...update };

                return { old: oldDoc, new: newDoc };
            };

            return null;
        }).filter(doc => doc !== null);

        if (updatedDocs.length > 0) {
            this.set(key, data.map(doc => {
                const matchingUpdate = updatedDocs.find(updatedDoc =>
                    Object.keys(query).every(queryKey => queryKey in doc && doc[queryKey] === query[queryKey])
                );

                return matchingUpdate ? matchingUpdate.new : doc;
            }));
        };

        return updatedDocs;
    }

    findAndDelete(key, query) {
        if (typeof key !== 'string' || key.trim() === '') {
            throw new TypeError(this.message['errors']['nonEmptyString']);
        };

        if (typeof query !== 'object' || query === null) {
            throw new TypeError(this.message['errors']['queryMustObjects']);
        };

        const data = this.get(key) || [];
        if (!Array.isArray(data)) throw new Error(this.message['errors']['dataMustArray']);

        const deletedDocs = data.filter(doc =>
            Object.keys(query).every(queryKey => queryKey in doc && doc[queryKey] === query[queryKey])
        );

        const updatedData = data.filter(doc => !deletedDocs.includes(doc));

        this.set(key, updatedData);

        return deletedDocs;
    }

    findOneAndUpdate(key, query, update) {
        if (typeof key !== 'string' || key.trim() === '') {
            throw new TypeError(this.message['errors']['nonEmptyString']);
        };

        if (typeof query !== 'object' || query === null) {
            throw new TypeError(this.message['errors']['queryMustObjects']);
        };

        if (typeof update !== 'object' || update === null) {
            throw new TypeError(this.message['errors']['updateMustObjects']);
        };

        const data = this.get(key) || [];
        if (!Array.isArray(data)) throw new Error(this.message['errors']['dataMustArray']);

        let oldDoc = null;
        let newDoc = null;

        const updatedData = data.map(doc => {
            const matches = Object.keys(query).every(queryKey => queryKey in doc && doc[queryKey] === query[queryKey]);

            if (matches) {
                oldDoc = { ...doc };
                newDoc = { ...doc, ...update };

                return newDoc;
            };

            return doc;
        });

        if (oldDoc && newDoc) {
            this.set(key, updatedData);
            return { old: oldDoc, new: newDoc };
        } else {
            throw new Error(this.message['errors']['noDocMatchedQuery']);
        };
    }

    findOneAndDelete(key, query) {
        if (typeof key !== 'string' || key.trim() === '') {
            throw new TypeError(this.message['errors']['nonEmptyString']);
        };

        if (typeof query !== 'object' || query === null) {
            throw new TypeError(this.message['errors']['queryMustObjects']);
        };

        const data = this.get(key) || [];
        if (!Array.isArray(data)) throw new Error(this.message['errors']['dataMustArray']);

        let deletedDoc = null;

        const updatedData = data.filter(doc => {
            const matches = Object.keys(query).every(queryKey => queryKey in doc && doc[queryKey] === query[queryKey]);
            if (matches) {
                deletedDoc = { ...doc };

                return false;
            };

            return true;
        });

        if (deletedDoc) {
            this.set(key, updatedData);
            return deletedDoc;
        } else {
            throw new Error(this.message['errors']['noDocMatchedQuery']);
        };
    }

    findOne(key, query) {
        if (typeof key !== 'string' || key.trim() === '') {
            throw new TypeError(this.message['errors']['nonEmptyString']);
        };

        if (typeof query !== 'object' || query === null) {
            throw new TypeError(this.message['errors']['queryMustObjects']);
        };

        const data = this.get(key) || [];
        if (!Array.isArray(data)) throw new Error(this.message['errors']['dataMustArray']);

        return data.find(doc => Object.keys(query).every(queryKey => queryKey in doc && doc[queryKey] === query[queryKey])) || null;
    }
}

module.exports = BsonDB;